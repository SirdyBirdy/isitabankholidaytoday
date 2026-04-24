/* ============================================================
   IS IT A BANK HOLIDAY TODAY? - APP
   ============================================================ */

// ---- GLOBALS ----
let currentState = null;    // state code e.g. "MH"
let currentCity  = null;    // city name
let currentResult = null;   // holiday check result
let activeGameDestroy = null;
const today = new Date();

// ---- INIT ----
document.getElementById('footerYear').textContent = today.getFullYear();
document.getElementById('dateBarText').textContent = formatDateHuman(today);

// Theme toggle
const html = document.documentElement;
const savedTheme = localStorage.getItem('bhTheme');
if (savedTheme === 'light') {
  html.setAttribute('data-theme', 'light');
}

document.getElementById('themeBtn').addEventListener('click', () => {
  const isLight = html.getAttribute('data-theme') === 'light';
  if (isLight) {
    html.removeAttribute('data-theme');
    localStorage.setItem('bhTheme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
    localStorage.setItem('bhTheme', 'light');
  }
});

// Admin toggle
document.getElementById('adminToggle').addEventListener('click', function(e) {
  e.preventDefault();
  document.getElementById('adminPanel').classList.toggle('hidden');
});

// ---- SHOW STATE ----
function showState(id) {
  document.querySelectorAll('.app-state').forEach(function(el) {
    el.classList.add('hidden');
  });
  var el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

// ---- TOAST ----
function toast(msg, dur) {
  dur = dur || 3000;
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('on');
  setTimeout(function() { el.classList.remove('on'); }, dur);
}

// ================================================================
// GEOLOCATION
// ================================================================
function detectStateFromTimezone() {
  var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata') ? 'IN' : null;
}

function nearestCity(lat, lng) {
  var best = null, bestDist = Infinity;
  for (var i = 0; i < INDIA_CITIES.length; i++) {
    var c = INDIA_CITIES[i];
    var dist = Math.pow(c.lat - lat, 2) + Math.pow(c.lng - lng, 2);
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return best;
}

function init() {
  showState('stateLoading');
  animateLoadingBar();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(pos) {
        var city = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (city) {
          renderForCity(city);
        } else {
          showState('statePermission');
        }
      },
      function() {
        showState('statePermission');
      },
      { timeout: 5000, maximumAge: 600000 }
    );
  } else {
    showState('statePermission');
  }
}

function animateLoadingBar() {
  var fill = document.getElementById('loadingFill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(function() { fill.style.width = '70%'; }, 100);
    setTimeout(function() { fill.style.width = '100%'; }, 1400);
  }
}

// ================================================================
// RENDER RESULT
// ================================================================
function renderForCity(city) {
  currentState = city.code;
  currentCity  = city.name;

  var result = checkHoliday(city.code, today);
  currentResult = result;

  renderUpcoming(city.code, city.name);
  renderStateTable();
  renderQuickCities();

  if (result.holiday) {
    renderHoliday(result, city);
  } else {
    renderNotHoliday(result, city);
  }
}

function renderHoliday(result, city) {
  var stateLabel = STATE_LABELS[city.code] || city.state;
  document.getElementById('locYes').textContent = city.name + ', ' + stateLabel;
  document.getElementById('dayYes').textContent = today.toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  document.getElementById('holidayPillName').textContent = result.name;
  document.getElementById('quipYes').textContent = randomItem(HOLIDAY_QUIPS);

  var noteEl = document.getElementById('noteYes');
  noteEl.textContent = result.note || '';
  noteEl.style.display = result.note ? '' : 'none';

  var dateStr = formatDateISO(today);
  var crowd = getCrowdCount(city.code, dateStr);
  if (crowd.dry > 0 || crowd.notDry > 0) {
    document.getElementById('tallyYes').textContent = crowd.dry + ' confirmed, ' + crowd.notDry + ' disputed';
  }

  setupSharing(true, result.name, city);

  document.getElementById('confirmBtn').onclick = function() {
    var ok = submitCrowdReport(city.code, dateStr, true);
    if (ok) {
      toast('Thanks! Holiday confirmed.');
      document.getElementById('tallyYes').textContent = 'Your confirmation recorded.';
    } else {
      toast('Already voted today.');
    }
  };

  showState('stateHoliday');
}

function renderNotHoliday(result, city) {
  var stateLabel = STATE_LABELS[city.code] || city.state;
  document.getElementById('locNo').textContent = city.name + ', ' + stateLabel;
  document.getElementById('dayNo').textContent = today.toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  var g = randomItem(GUILT_MSGS);
  document.getElementById('guiltMain').textContent = g.main;
  document.getElementById('guiltSub').textContent = g.sub;

  var upcoming = getUpcomingHolidays(city.code, today, 1);
  if (upcoming.length) {
    var u = upcoming[0];
    document.getElementById('nextDays').textContent = u.daysFrom + (u.daysFrom === 1 ? ' day' : ' days');
    document.getElementById('nextName').textContent = u.name + ' on ' + u.date.toLocaleDateString('en-IN', { month:'short', day:'numeric' });
    document.getElementById('nextBox').style.display = '';
  } else {
    document.getElementById('nextBox').style.display = 'none';
  }

  var dateStr = formatDateISO(today);
  var crowd = getCrowdCount(city.code, dateStr);
  if (crowd.dry > 0) {
    document.getElementById('tallyNo').textContent = crowd.dry + ' user' + (crowd.dry > 1 ? 's' : '') + ' reported this as a holiday';
  }

  document.getElementById('reportBtn').onclick = function() {
    var ok = submitCrowdReport(city.code, dateStr, true);
    if (ok) {
      toast('Report submitted. Thanks!');
      document.getElementById('tallyNo').textContent = 'Your report recorded. Three or more reports will show an alert.';
    } else {
      toast('Already voted today.');
    }
  };

  setupSharing(false, null, city);
  showState('stateNotHoliday');
}

function setupSharing(isHoliday, name, city) {
  var stateLabel = STATE_LABELS[city.code] || city.state;
  var loc = city.name + ', ' + stateLabel;
  var dateStr = today.toLocaleDateString('en-IN', { month:'long', day:'numeric', year:'numeric' });
  var msg = isHoliday
    ? '🏦 YES - ' + name + ' is a bank holiday in ' + loc + ' today (' + dateStr + '). Check yours: isitabankholidaytoday.lol'
    : '🏦 NOPE - No bank holiday in ' + loc + ' today. Back to work. isitabankholidaytoday.lol';

  var waId = isHoliday ? 'waYes' : 'waNo';
  var xId  = isHoliday ? 'xYes' : 'xNo';

  document.getElementById(waId).onclick = function() {
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
  };
  document.getElementById(xId).onclick = function() {
    window.open('https://x.com/intent/tweet?text=' + encodeURIComponent(msg), '_blank');
  };
}

// ================================================================
// UPCOMING HOLIDAYS
// ================================================================
function renderUpcoming(stateCode, cityName) {
  document.getElementById('upcomingCity').textContent = cityName;
  var list = getUpcomingHolidays(stateCode, today, 8);
  var container = document.getElementById('upcomingList');
  container.innerHTML = '';

  list.forEach(function(h) {
    var card = document.createElement('div');
    card.className = 'upcoming-card';
    card.innerHTML =
      '<div class="upcoming-card-days">' + h.daysFrom + '<span> days</span></div>' +
      '<div class="upcoming-card-name">' + escHtml(h.name) + '</div>' +
      '<div class="upcoming-card-date">' + h.date.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' }) + '</div>';
    container.appendChild(card);
  });

  if (!list.length) {
    container.innerHTML = '<span style="font-size:12px;color:var(--fg3);padding:12px 0;display:block">No upcoming non-weekend bank holidays in the next six months.</span>';
  }
}

// ================================================================
// STATE TABLE
// ================================================================
function renderStateTable() {
  var table = document.getElementById('stateTable');
  table.innerHTML = '';

  var stateCodes = Object.keys(STATE_LABELS);
  stateCodes.forEach(function(code) {
    var r = checkHoliday(code, today);
    var row = document.createElement('div');
    row.className = 'state-row';
    var dotClass = r.holiday ? (r.category === 'national' ? 'dot-yes' : 'dot-holiday') : 'dot-no';
    var dotTitle = r.holiday ? r.name : 'Working day';
    row.innerHTML =
      '<span class="state-row-name">' + escHtml(STATE_LABELS[code]) + '</span>' +
      '<span class="state-row-dot ' + dotClass + '" title="' + escHtml(dotTitle) + '"></span>';
    row.onclick = function() {
      var city = INDIA_CITIES.find(function(c) { return c.code === code; });
      if (!city) city = { name: STATE_LABELS[code], code: code, state: STATE_LABELS[code], lat: 0, lng: 0 };
      renderForCity(city);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    table.appendChild(row);
  });
}

// ================================================================
// QUICK CITIES (sidebar)
// ================================================================
function renderQuickCities() {
  var el = document.getElementById('quickCityList');
  if (!el) return;
  el.innerHTML = '';
  QUICK_CITIES.forEach(function(name) {
    var city = INDIA_CITIES.find(function(c) { return c.name === name; });
    if (!city) return;
    var r = checkHoliday(city.code, today);
    var item = document.createElement('div');
    item.className = 'quick-city-item';
    item.innerHTML =
      '<div class="quick-city-name">' +
        '<span>' + escHtml(city.name) + '</span>' +
        '<span class="quick-city-state">' + escHtml(STATE_LABELS[city.code]) + '</span>' +
      '</div>' +
      '<span class="quick-city-status ' + (r.holiday ? 'status-yes' : 'status-no') + '">' +
        (r.holiday ? 'HOLIDAY' : 'OPEN') +
      '</span>';
    item.onclick = function() {
      renderForCity(city);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    el.appendChild(item);
  });
}

// ================================================================
// CITY AUTOCOMPLETE
// ================================================================
function setupCitySearch(inputId, dropdownId, goBtnId) {
  var input    = document.getElementById(inputId);
  var dropdown = document.getElementById(dropdownId);
  var goBtn    = document.getElementById(goBtnId);
  if (!input || !dropdown) return;

  var focused = -1;

  function search(q) {
    if (!q || q.length < 2) { dropdown.classList.add('hidden'); return; }
    var ql = q.toLowerCase();

    var scored = INDIA_CITIES
      .map(function(c) {
        var nl = c.name.toLowerCase();
        var sl = c.state.toLowerCase();
        var score = 0;
        if (nl.startsWith(ql)) score = 100;
        else if (nl.indexOf(ql) >= 0) score = 60;
        else if (sl.startsWith(ql)) score = 40;
        else if (sl.indexOf(ql) >= 0) score = 20;
        return { city: c, score: score };
      })
      .filter(function(x) { return x.score > 0; })
      .sort(function(a, b) { return b.score - a.score; })
      .slice(0, 8);

    if (!scored.length) { dropdown.classList.add('hidden'); return; }

    dropdown.innerHTML = '';
    scored.forEach(function(item, idx) {
      var city = item.city;
      var opt = document.createElement('div');
      opt.className = 'city-option';
      opt.setAttribute('role', 'option');

      var name = city.name;
      var matchIdx = name.toLowerCase().indexOf(ql);
      var nameHtml = escHtml(name);
      if (matchIdx >= 0) {
        nameHtml =
          escHtml(name.slice(0, matchIdx)) +
          '<span class="city-option-match">' + escHtml(name.slice(matchIdx, matchIdx + ql.length)) + '</span>' +
          escHtml(name.slice(matchIdx + ql.length));
      }

      opt.innerHTML = '<span>' + nameHtml + '</span><span class="city-option-state">' + escHtml(city.state) + '</span>';

      (function(c) {
        opt.addEventListener('click', function() { selectCity(c, input, dropdown); });
      })(city);

      (function(i) {
        opt.addEventListener('mouseenter', function() {
          focused = i;
          highlightOption(dropdown, focused);
        });
      })(idx);

      dropdown.appendChild(opt);
    });

    dropdown.classList.remove('hidden');
    focused = -1;
  }

  function highlightOption(dd, idx) {
    dd.querySelectorAll('.city-option').forEach(function(o, i) {
      o.classList.toggle('focused', i === idx);
    });
  }

  input.addEventListener('input', function() { search(input.value); });
  input.addEventListener('focus', function() { search(input.value); });

  input.addEventListener('keydown', function(e) {
    var opts = dropdown.querySelectorAll('.city-option');
    if (!opts.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focused = Math.min(focused + 1, opts.length - 1);
      highlightOption(dropdown, focused);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focused = Math.max(focused - 1, 0);
      highlightOption(dropdown, focused);
    } else if (e.key === 'Enter') {
      if (focused >= 0 && opts[focused]) {
        opts[focused].click();
      } else if (goBtn) {
        goBtn.click();
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.add('hidden');
    }
  });

  document.addEventListener('click', function(e) {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  if (goBtn) {
    goBtn.addEventListener('click', function() {
      var q = input.value.trim();
      if (!q) return;
      var match = INDIA_CITIES.find(function(c) {
        return c.name.toLowerCase() === q.toLowerCase() ||
               c.name.toLowerCase().indexOf(q.toLowerCase()) === 0;
      });
      if (match) {
        selectCity(match, input, dropdown);
      } else {
        toast('"' + q + '" not found. Try: Mumbai, Delhi, Bangalore...');
      }
    });
  }
}

function selectCity(city, input, dropdown) {
  input.value = city.name;
  dropdown.classList.add('hidden');
  renderForCity(city);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Setup both search inputs
setupCitySearch('cityInput', 'cityDropdown', 'goBtn');
setupCitySearch('cityInputErr', 'cityDropdownErr', 'goBtnErr');

// ================================================================
// GAMES
// ================================================================
document.querySelectorAll('.gpick').forEach(function(btn) {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.gpick').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    launchGame(btn.dataset.game);
  });
});

document.getElementById('gameExit').addEventListener('click', function() {
  if (activeGameDestroy) { activeGameDestroy(); activeGameDestroy = null; }
  document.getElementById('gameEmbed').classList.add('hidden');
  document.getElementById('gameUnlockBar').classList.remove('hidden');
  document.querySelectorAll('.gpick').forEach(function(b) { b.classList.remove('active'); });
});

function launchGame(id) {
  if (activeGameDestroy) { activeGameDestroy(); activeGameDestroy = null; }
  document.getElementById('gameUnlockBar').classList.add('hidden');
  var embed = document.getElementById('gameEmbed');
  embed.classList.remove('hidden');
  document.getElementById('gameBoard').innerHTML = '';
  setHud(0, '');

  var titles = { whackamole: 'WHACK-A-BOSS', snake: 'OFFICE SNAKE', typing: 'TYPING TEST' };
  document.getElementById('gameHudTitle').textContent = titles[id] || id;

  if (id === 'whackamole') activeGameDestroy = initWhackAMole();
  else if (id === 'snake') activeGameDestroy = initSnake();
  else if (id === 'typing') activeGameDestroy = initTyping();
}

function setHud(score, timer) {
  document.getElementById('hudScore').textContent = 'Score: ' + score;
  document.getElementById('hudTimer').textContent = timer;
}

// ---- WHACK A MOLE ----
function initWhackAMole() {
  var board = document.getElementById('gameBoard');
  var BOSSES = ['👨‍💼','👩‍💼','🤵','👔','🧑‍💼','🙎‍♂️'];
  var score = 0, timeLeft = 30;
  var spawnInt = null, timerInt = null, running = false;

  var grid = document.createElement('div');
  grid.className = 'wam-grid';

  var holes = Array.from({ length: 9 }, function(_, i) {
    var hole = document.createElement('div');
    hole.className = 'wam-hole';
    var mole = document.createElement('div');
    mole.className = 'wam-mole';
    mole.textContent = BOSSES[i % BOSSES.length];
    hole.appendChild(mole);
    hole.addEventListener('click', function() {
      if (!running || !hole.classList.contains('up')) return;
      hole.classList.remove('up');
      hole.classList.add('hit');
      setTimeout(function() { hole.classList.remove('hit'); }, 150);
      score++;
      mole.textContent = BOSSES[Math.floor(Math.random() * BOSSES.length)];
      setHud(score, '⏱ ' + timeLeft + 's');
    });
    grid.appendChild(hole);
    return hole;
  });

  board.appendChild(grid);

  var overlay = makeOverlay('Whack the bosses before they hide.\n30 seconds. Go.', function() {
    running = true;
    spawnInt = setInterval(function() {
      var inactive = holes.filter(function(h) { return !h.classList.contains('up'); });
      if (!inactive.length) return;
      var h = inactive[Math.floor(Math.random() * inactive.length)];
      h.classList.add('up');
      setTimeout(function() { h.classList.remove('up'); }, 900 + Math.random() * 400);
    }, 550);
    timerInt = setInterval(function() {
      timeLeft--;
      setHud(score, '⏱ ' + timeLeft + 's');
      if (timeLeft <= 0) {
        running = false;
        clearInterval(spawnInt); clearInterval(timerInt);
        holes.forEach(function(h) { h.classList.remove('up'); });
        setTimeout(function() { showGameOver(score, 'whackamole'); }, 300);
      }
    }, 1000);
  });

  board.appendChild(overlay);
  return function() { clearInterval(spawnInt); clearInterval(timerInt); };
}

// ---- SNAKE ----
function initSnake() {
  var board = document.getElementById('gameBoard');
  var CELL = 18, COLS = 16, ROWS = 16;
  var W = CELL * COLS, H = CELL * ROWS;

  var canvas = document.createElement('canvas');
  canvas.id = 'snakeCanvas';
  canvas.width = W; canvas.height = H;

  var dpad = document.createElement('div');
  dpad.className = 'dpad';
  dpad.innerHTML =
    '<div class="dpad-row"><button class="dpad-btn" data-d="U">&#9650;</button></div>' +
    '<div class="dpad-row">' +
      '<button class="dpad-btn" data-d="L">&#9664;</button>' +
      '<button class="dpad-btn" data-d="D">&#9660;</button>' +
      '<button class="dpad-btn" data-d="R">&#9654;</button>' +
    '</div>';

  board.appendChild(canvas);
  board.appendChild(dpad);

  var ctx = canvas.getContext('2d');
  var snake = [{x:8,y:8}];
  var dir = {x:1,y:0}, nd = {x:1,y:0};
  var food = spawnFood();
  var score = 0, loop = null;

  function spawnFood() {
    var f;
    do {
      f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (snake.some(function(s) { return s.x === f.x && s.y === f.y; }));
    return f;
  }

  function draw() {
    var isDark = !html.getAttribute('data-theme');
    ctx.fillStyle = isDark ? '#0a0a0f' : '#e8e3d8';
    ctx.fillRect(0, 0, W, H);
    ctx.font = (CELL - 2) + 'px serif';
    ctx.textAlign = 'center';
    ctx.fillText('💼', food.x * CELL + CELL / 2, food.y * CELL + CELL - 1);
    snake.forEach(function(s, i) {
      ctx.fillStyle = i === 0
        ? (isDark ? '#00ff88' : '#007744')
        : (isDark ? '#00cc6688' : '#00774488');
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }

  function tick() {
    dir = { x: nd.x, y: nd.y };
    var head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    var hitWall = head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
    var hitSelf = snake.some(function(s) { return s.x === head.x && s.y === head.y; });
    if (hitWall || hitSelf) {
      clearInterval(loop);
      setTimeout(function() { showGameOver(score, 'snake'); }, 200);
      return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      setHud(score, '');
      food = spawnFood();
    } else {
      snake.pop();
    }
    draw();
  }

  var keyH = function(e) {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.key) >= 0) {
      e.preventDefault();
    }
    if (e.key === 'ArrowUp'    && dir.y === 0) nd = {x:0,  y:-1};
    if (e.key === 'ArrowDown'  && dir.y === 0) nd = {x:0,  y:1};
    if (e.key === 'ArrowLeft'  && dir.x === 0) nd = {x:-1, y:0};
    if (e.key === 'ArrowRight' && dir.x === 0) nd = {x:1,  y:0};
  };
  document.addEventListener('keydown', keyH);

  dpad.querySelectorAll('.dpad-btn').forEach(function(btn) {
    var handler = function() {
      var d = btn.dataset.d;
      if (d === 'U' && dir.y === 0) nd = {x:0,  y:-1};
      if (d === 'D' && dir.y === 0) nd = {x:0,  y:1};
      if (d === 'L' && dir.x === 0) nd = {x:-1, y:0};
      if (d === 'R' && dir.x === 0) nd = {x:1,  y:0};
    };
    btn.addEventListener('click', handler);
    btn.addEventListener('touchstart', function(e) { e.preventDefault(); handler(); }, { passive: false });
  });

  var overlay = makeOverlay('Classic Snake.\nEat the briefcases.\nDon\'t crash.', function() {
    loop = setInterval(tick, 140);
  });
  board.appendChild(overlay);
  draw();

  return function() {
    clearInterval(loop);
    document.removeEventListener('keydown', keyH);
  };
}

// ---- TYPING TEST ----
function initTyping() {
  var board = document.getElementById('gameBoard');
  var PASSAGES = [
    "Out of office reply activated. Notifications silenced. The world can wait until tomorrow morning.",
    "Today is a bank holiday and absolutely nothing productive needs to happen. Close the laptop and go outside.",
    "Some people check emails on bank holidays. Those people are called managers and we deeply pity them.",
    "The only deadline today is the chai getting cold. Everything else can wait until next working day.",
    "Working on a bank holiday is technically legal but morally questionable. Your therapist agrees.",
    "RBI says no banking today. The universe says no working either. Far be it from us to argue.",
  ];

  var passage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
  var typed = '', started = false, startTime = null;
  var finished = false, timerInt = null, timeLeft = 60;

  var wrap = document.createElement('div');
  wrap.className = 'typing-wrap';

  var passageEl = document.createElement('div');
  passageEl.className = 'typing-passage';

  var inputEl = document.createElement('input');
  inputEl.className = 'typing-area';
  inputEl.placeholder = 'Start typing to begin...';
  inputEl.autocomplete = 'off';
  inputEl.setAttribute('autocorrect', 'off');
  inputEl.setAttribute('autocapitalize', 'off');
  inputEl.setAttribute('spellcheck', 'false');

  var stats = document.createElement('div');
  stats.className = 'typing-stats';
  stats.innerHTML =
    '<div><span class="tstat-val" id="twpm">-</span>WPM</div>' +
    '<div><span class="tstat-val" id="tacc">-</span>Accuracy</div>' +
    '<div><span class="tstat-val" id="tsec">60</span>Seconds</div>';

  wrap.appendChild(passageEl);
  wrap.appendChild(inputEl);
  wrap.appendChild(stats);
  board.appendChild(wrap);

  function render() {
    passageEl.innerHTML = '';
    passage.split('').forEach(function(ch, i) {
      var s = document.createElement('span');
      s.className = 'tc';
      s.textContent = ch;
      if (i < typed.length) s.classList.add(typed[i] === ch ? 'ok' : 'bad');
      if (i === typed.length) s.classList.add('cur');
      passageEl.appendChild(s);
    });
  }

  render();
  setTimeout(function() { inputEl.focus(); }, 100);

  inputEl.addEventListener('input', function() {
    if (finished) return;
    typed = inputEl.value;
    if (!started && typed.length > 0) {
      started = true;
      startTime = Date.now();
      timerInt = setInterval(function() {
        timeLeft--;
        var secEl = document.getElementById('tsec');
        if (secEl) secEl.textContent = timeLeft;
        setHud(calcWpm(), '⏱ ' + timeLeft + 's');
        if (timeLeft <= 0) endTyping();
      }, 1000);
    }
    render();
    var wpm = calcWpm();
    var acc = calcAcc();
    setHud(wpm, '⏱ ' + timeLeft + 's');
    var we = document.getElementById('twpm'); if (we) we.textContent = wpm;
    var ae = document.getElementById('tacc'); if (ae) ae.textContent = acc + '%';
    if (typed === passage) endTyping();
  });

  function calcWpm() {
    if (!startTime) return 0;
    var mins = (Date.now() - startTime) / 60000;
    return mins > 0 ? Math.round(typed.trim().split(' ').length / mins) : 0;
  }
  function calcAcc() {
    if (!typed.length) return 100;
    var ok = typed.split('').filter(function(c, i) { return c === passage[i]; }).length;
    return Math.round(ok / typed.length * 100);
  }
  function endTyping() {
    if (finished) return;
    finished = true;
    clearInterval(timerInt);
    inputEl.disabled = true;
    var wpm = calcWpm();
    var acc = calcAcc();
    setTimeout(function() { showGameOver(wpm, 'typing', acc + '% accuracy'); }, 300);
  }

  return function() { clearInterval(timerInt); };
}

// ---- GAME HELPERS ----
function makeOverlay(msg, onStart) {
  var div = document.createElement('div');
  div.className = 'game-overlay';
  var p = document.createElement('p');
  p.className = 'game-start-msg';
  p.style.whiteSpace = 'pre-line';
  p.textContent = msg;
  var btn = document.createElement('button');
  btn.className = 'game-start-btn';
  btn.textContent = 'START';
  btn.addEventListener('click', function() { div.remove(); onStart(); });
  div.appendChild(p);
  div.appendChild(btn);
  return div;
}

function showGameOver(score, gameId, extra) {
  var board = document.getElementById('gameBoard');
  var quips = GAME_OVER_QUIPS[gameId] || ['Nice try.'];
  var quip = randomItem(quips);
  var div = document.createElement('div');
  div.className = 'game-overlay';
  div.innerHTML =
    '<div class="game-overlay-label">FINAL SCORE</div>' +
    '<div class="game-overlay-score">' + score + '</div>' +
    (extra ? '<div class="game-overlay-label">' + escHtml(extra) + '</div>' : '') +
    '<div class="game-overlay-quip">' + escHtml(quip) + '</div>' +
    '<button class="game-again-btn" id="againBtn">PLAY AGAIN</button>';
  board.appendChild(div);
  document.getElementById('againBtn').onclick = function() {
    var active = document.querySelector('.gpick.active');
    if (active) launchGame(active.dataset.game);
  };
}

// ================================================================
// ADMIN PANEL
// ================================================================
function renderAdminList() {
  var list = document.getElementById('adminList');
  if (!list) return;
  var overrides = getAdminOverrides();
  list.innerHTML = '';
  if (!overrides.length) {
    list.innerHTML = '<div style="font-size:11px;color:var(--fg3);padding:8px 0">No overrides yet.</div>';
    return;
  }
  overrides.forEach(function(o, i) {
    var row = document.createElement('div');
    row.className = 'admin-override-item';
    row.innerHTML =
      '<span>' + escHtml(o.date) + ' · ' + escHtml(o.state) + ' · ' + escHtml(o.name) + '</span>' +
      '<button class="admin-del" data-idx="' + i + '">&#10005;</button>';
    list.appendChild(row);
  });
  list.querySelectorAll('.admin-del').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var idx = parseInt(btn.dataset.idx, 10);
      deleteAdminOverride(idx);
      renderAdminList();
      toast('Override deleted.');
    });
  });
}

document.getElementById('adminSubmit').addEventListener('click', function() {
  var pwd   = document.getElementById('adminPwd').value;
  var date  = document.getElementById('adminDate').value;
  var state = document.getElementById('adminState').value.toUpperCase().trim();
  var name  = document.getElementById('adminName').value.trim();
  var note  = document.getElementById('adminNote').value.trim();
  var r = addAdminOverride(pwd, date, state, name, note);
  if (r.ok) {
    toast('Override added!');
    document.getElementById('adminDate').value = '';
    document.getElementById('adminState').value = '';
    document.getElementById('adminName').value = '';
    document.getElementById('adminNote').value = '';
    renderAdminList();
    if (currentState) {
      var city = INDIA_CITIES.find(function(c) { return c.code === currentState; });
      if (!city) city = { code: currentState, name: currentCity, state: STATE_LABELS[currentState], lat: 0, lng: 0 };
      renderForCity(city);
    }
  } else {
    toast('Error: ' + r.msg);
  }
});

renderAdminList();

// ================================================================
// BOOT
// ================================================================
init();
