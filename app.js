/* ============================================================
   IS IT A BANK HOLIDAY TODAY? — APP
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

// Theme
const html = document.documentElement;
const saved = localStorage.getItem('bhTheme');
if (saved) html.setAttribute('data-theme', saved);
document.getElementById('themeBtn').addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next === 'dark' ? 'dark' : 'light');
  // We actually toggle by removing or setting to light
  if (next === 'light') html.setAttribute('data-theme', 'light');
  else html.removeAttribute('data-theme');
  localStorage.setItem('bhTheme', html.getAttribute('data-theme') || 'dark');
});

// Admin toggle
document.getElementById('adminToggle').addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('adminPanel').classList.toggle('hidden');
});

// ---- SHOW STATE ----
function showState(id) {
  document.querySelectorAll('.app-state').forEach(el => el.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
}

// ---- TOAST ----
function toast(msg, dur = 3000) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('on');
  setTimeout(() => el.classList.remove('on'), dur);
}

// ================================================================
// GEOLOCATION
// ================================================================
function detectStateFromTimezone() {
  // Most Indian users → IST → IN, we then refine by lat/lng
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return tz === 'Asia/Calcutta' || tz === 'Asia/Kolkata' ? 'IN' : null;
}

function nearestCity(lat, lng) {
  let best = null, bestDist = Infinity;
  for (const c of INDIA_CITIES) {
    const dist = (c.lat - lat) ** 2 + (c.lng - lng) ** 2;
    if (dist < bestDist) { bestDist = dist; best = c; }
  }
  return best;
}

function init() {
  showState('stateLoading');
  animateLoadingBar();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const city = nearestCity(pos.coords.latitude, pos.coords.longitude);
        if (city) {
          renderForCity(city);
        } else {
          // fallback to timezone
          const isIN = detectStateFromTimezone();
          isIN ? showState('statePermission') : showState('stateError');
        }
      },
      () => {
        // Permission denied or error
        const isIN = detectStateFromTimezone();
        // If likely India (timezone), show sassy permission message
        // else show error with input
        showState(isIN ? 'statePermission' : 'statePermission');
      },
      { timeout: 5000, maximumAge: 600000 }
    );
  } else {
    showState('statePermission');
  }
}

function animateLoadingBar() {
  const fill = document.getElementById('loadingFill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(() => fill.style.width = '70%', 100);
    setTimeout(() => fill.style.width = '100%', 1400);
  }
}

// ================================================================
// RENDER RESULT
// ================================================================
function renderForCity(city) {
  currentState = city.code;
  currentCity  = city.name;

  const result = checkHoliday(city.code, today);
  currentResult = result;

  // Update upcoming section
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
  document.getElementById('locYes').textContent = `${city.name}, ${STATE_LABELS[city.code] || city.state}`;
  document.getElementById('dayYes').textContent = today.toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
  document.getElementById('holidayPillName').textContent = result.name;
  document.getElementById('quipYes').textContent = randomItem(HOLIDAY_QUIPS);
  document.getElementById('noteYes').textContent = result.note || '';
  document.getElementById('noteYes').style.display = result.note ? '' : 'none';

  const dateStr = formatDateISO(today);
  const crowd = getCrowdCount(city.code, dateStr);
  if (crowd.dry > 0 || crowd.notDry > 0) {
    document.getElementById('tallyYes').textContent = `${crowd.dry} confirmed · ${crowd.notDry} disputed`;
  }

  // Share
  setupSharing(true, result.name, city);

  // Crowd confirm
  document.getElementById('confirmBtn').onclick = () => {
    const ok = submitCrowdReport(city.code, dateStr, true);
    if (ok) {
      toast('✓ Thanks! Holiday confirmed.');
      document.getElementById('tallyYes').textContent = 'Your confirmation recorded.';
    } else {
      toast('Already voted today.');
    }
  };

  showState('stateHoliday');
}

function renderNotHoliday(result, city) {
  document.getElementById('locNo').textContent = `${city.name}, ${STATE_LABELS[city.code] || city.state}`;
  document.getElementById('dayNo').textContent = today.toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric', year:'numeric' });

  const g = randomItem(GUILT_MSGS);
  document.getElementById('guiltMain').textContent = g.main;
  document.getElementById('guiltSub').textContent = g.sub;

  // Next holiday
  const upcoming = getUpcomingHolidays(city.code, today, 1);
  if (upcoming.length) {
    const u = upcoming[0];
    document.getElementById('nextDays').textContent = u.daysFrom + ' day' + (u.daysFrom === 1 ? '' : 's');
    document.getElementById('nextName').textContent = u.name + ' · ' + u.date.toLocaleDateString('en-IN', { month:'short', day:'numeric' });
  } else {
    document.getElementById('nextBox').style.display = 'none';
  }

  const dateStr = formatDateISO(today);
  const crowd = getCrowdCount(city.code, dateStr);
  if (crowd.dry > 0) {
    document.getElementById('tallyNo').textContent = `⚠ ${crowd.dry} user${crowd.dry > 1 ? 's' : ''} reported this as a holiday`;
  }

  // Report as holiday
  document.getElementById('reportBtn').onclick = () => {
    const ok = submitCrowdReport(city.code, dateStr, true);
    if (ok) {
      toast('⚠ Report submitted. Thanks!');
      document.getElementById('tallyNo').textContent = 'Your report recorded. 3+ reports will show an alert.';
    } else {
      toast('Already voted today.');
    }
  };

  setupSharing(false, null, city);
  showState('stateNotHoliday');
}

function setupSharing(isHoliday, name, city) {
  const loc = `${city.name}, ${STATE_LABELS[city.code] || city.state}`;
  const dateStr = today.toLocaleDateString('en-IN', { month:'long', day:'numeric', year:'numeric' });
  const msg = isHoliday
    ? `🏦 YES — ${name} is a bank holiday in ${loc} today (${dateStr}). Check yours → isitabankholidaytoday.com`
    : `🏦 NOPE — No bank holiday in ${loc} today. Go back to work. isitabankholidaytoday.com`;

  const waId = isHoliday ? 'waYes' : 'waNo';
  const xId  = isHoliday ? 'xYes' : 'xNo';
  document.getElementById(waId).onclick = () =>
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  document.getElementById(xId).onclick = () =>
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(msg)}`, '_blank');
}

// ================================================================
// UPCOMING HOLIDAYS
// ================================================================
function renderUpcoming(stateCode, cityName) {
  document.getElementById('upcomingCity').textContent = cityName;
  const list = getUpcomingHolidays(stateCode, today, 8);
  const container = document.getElementById('upcomingList');
  container.innerHTML = '';

  list.forEach(h => {
    const card = document.createElement('div');
    card.className = 'upcoming-card';
    card.innerHTML = `
      <div class="upcoming-card-days">${h.daysFrom}<span> days</span></div>
      <div class="upcoming-card-name">${h.name}</div>
      <div class="upcoming-card-date">${h.date.toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })}</div>
    `;
    container.appendChild(card);
  });

  if (!list.length) {
    container.innerHTML = '<span style="font-size:12px;color:var(--fg3);padding:12px 0;display:block">No upcoming non-weekend bank holidays in the next 6 months.</span>';
  }
}

// ================================================================
// STATE TABLE
// ================================================================
function renderStateTable() {
  const table = document.getElementById('stateTable');
  table.innerHTML = '';

  const stateCodes = Object.keys(STATE_LABELS);
  stateCodes.forEach(code => {
    const r = checkHoliday(code, today);
    const row = document.createElement('div');
    row.className = 'state-row';
    row.innerHTML = `
      <span class="state-row-name">${STATE_LABELS[code]}</span>
      <span class="state-row-dot ${r.holiday ? (r.category === 'national' ? 'dot-yes' : 'dot-holiday') : 'dot-no'}"
            title="${r.holiday ? r.name : 'Working day'}"></span>
    `;
    row.onclick = () => {
      const city = INDIA_CITIES.find(c => c.code === code) || { name: STATE_LABELS[code], code, state: STATE_LABELS[code] };
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
  const el = document.getElementById('quickCityList');
  if (!el) return;
  el.innerHTML = '';
  QUICK_CITIES.forEach(name => {
    const city = INDIA_CITIES.find(c => c.name === name);
    if (!city) return;
    const r = checkHoliday(city.code, today);
    const item = document.createElement('div');
    item.className = 'quick-city-item';
    item.innerHTML = `
      <div class="quick-city-name">
        <span>${city.name}</span>
        <span class="quick-city-state">${STATE_LABELS[city.code]}</span>
      </div>
      <span class="quick-city-status ${r.holiday ? 'status-yes' : 'status-no'}">
        ${r.holiday ? '✓ HOLIDAY' : '✗ OPEN'}
      </span>
    `;
    item.onclick = () => {
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
  const input    = document.getElementById(inputId);
  const dropdown = document.getElementById(dropdownId);
  const goBtn    = document.getElementById(goBtnId);
  if (!input || !dropdown) return;

  let focused = -1;

  function search(q) {
    if (!q || q.length < 2) { dropdown.classList.add('hidden'); return; }
    const ql = q.toLowerCase();

    // Score: starts-with gets priority, then contains
    const scored = INDIA_CITIES
      .map(c => {
        const nl = c.name.toLowerCase();
        const sl = c.state.toLowerCase();
        let score = 0;
        if (nl.startsWith(ql)) score = 100;
        else if (nl.includes(ql)) score = 60;
        else if (sl.startsWith(ql)) score = 40;
        else if (sl.includes(ql)) score = 20;
        return { city: c, score };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    if (!scored.length) { dropdown.classList.add('hidden'); return; }

    dropdown.innerHTML = '';
    scored.forEach(({ city }, idx) => {
      const opt = document.createElement('div');
      opt.className = 'city-option';
      opt.setAttribute('role', 'option');

      // Highlight match
      const name = city.name;
      const matchIdx = name.toLowerCase().indexOf(ql);
      let nameHtml = name;
      if (matchIdx >= 0) {
        nameHtml =
          escHtml(name.slice(0, matchIdx)) +
          `<span class="city-option-match">${escHtml(name.slice(matchIdx, matchIdx + ql.length))}</span>` +
          escHtml(name.slice(matchIdx + ql.length));
      }

      opt.innerHTML = `<span>${nameHtml}</span><span class="city-option-state">${city.state}</span>`;
      opt.addEventListener('click', () => selectCity(city, input, dropdown));
      opt.addEventListener('mouseenter', () => {
        focused = idx;
        highlightOption(dropdown, focused);
      });
      dropdown.appendChild(opt);
    });

    dropdown.classList.remove('hidden');
    focused = -1;
  }

  function highlightOption(dropdown, idx) {
    dropdown.querySelectorAll('.city-option').forEach((o, i) => {
      o.classList.toggle('focused', i === idx);
    });
  }

  input.addEventListener('input', () => search(input.value));
  input.addEventListener('focus', () => search(input.value));

  input.addEventListener('keydown', e => {
    const opts = dropdown.querySelectorAll('.city-option');
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
      } else {
        goBtn?.click();
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.add('hidden');
    }
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  });

  if (goBtn) {
    goBtn.addEventListener('click', () => {
      const q = input.value.trim();
      if (!q) return;
      const match = INDIA_CITIES.find(c =>
        c.name.toLowerCase() === q.toLowerCase() ||
        c.name.toLowerCase().startsWith(q.toLowerCase())
      );
      if (match) selectCity(match, input, dropdown);
      else toast(`"${q}" not found. Try: Mumbai, Delhi, Bangalore…`);
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
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Setup both search inputs
setupCitySearch('cityInput', 'cityDropdown', 'goBtn');
setupCitySearch('cityInputErr', 'cityDropdownErr', 'goBtnErr');

// ================================================================
// GAMES
// ================================================================
document.querySelectorAll('.gpick').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gpick').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    launchGame(btn.dataset.game);
  });
});

document.getElementById('gameExit').addEventListener('click', () => {
  if (activeGameDestroy) { activeGameDestroy(); activeGameDestroy = null; }
  document.getElementById('gameEmbed').classList.add('hidden');
  document.getElementById('gameUnlockBar').classList.remove('hidden');
  document.querySelectorAll('.gpick').forEach(b => b.classList.remove('active'));
});

function launchGame(id) {
  if (activeGameDestroy) { activeGameDestroy(); activeGameDestroy = null; }
  document.getElementById('gameUnlockBar').classList.add('hidden');
  const embed = document.getElementById('gameEmbed');
  embed.classList.remove('hidden');
  document.getElementById('gameBoard').innerHTML = '';
  setHud(0, '');

  const titles = { whackamole:'👨‍💼 WHACK-A-BOSS', snake:'🐍 OFFICE SNAKE', typing:'⌨️ TYPING TEST' };
  document.getElementById('gameHudTitle').textContent = titles[id] || id;

  if (id === 'whackamole') activeGameDestroy = initWhackAMole();
  else if (id === 'snake') activeGameDestroy = initSnake();
  else if (id === 'typing') activeGameDestroy = initTyping();
}

function setHud(score, timer) {
  document.getElementById('hudScore').textContent = `Score: ${score}`;
  document.getElementById('hudTimer').textContent = timer;
}

// ---- WHACK A MOLE ----
function initWhackAMole() {
  const board = document.getElementById('gameBoard');
  const BOSSES = ['👨‍💼','👩‍💼','🤵','👔','🧑‍💼','🙎‍♂️'];
  let score = 0, timeLeft = 30, spawnInt = null, timerInt = null, running = false;

  const grid = document.createElement('div');
  grid.className = 'wam-grid';

  const holes = Array.from({ length: 9 }, (_, i) => {
    const hole = document.createElement('div');
    hole.className = 'wam-hole';
    const mole = document.createElement('div');
    mole.className = 'wam-mole';
    mole.textContent = BOSSES[i % BOSSES.length];
    hole.appendChild(mole);
    hole.addEventListener('click', () => {
      if (!running || !hole.classList.contains('up')) return;
      hole.classList.remove('up');
      hole.classList.add('hit');
      setTimeout(() => hole.classList.remove('hit'), 150);
      score++;
      mole.textContent = BOSSES[Math.floor(Math.random() * BOSSES.length)];
      setHud(score, `⏱ ${timeLeft}s`);
    });
    grid.appendChild(hole);
    return hole;
  });

  board.appendChild(grid);

  const overlay = makeOverlay('Whack the bosses before they hide.\n30 seconds. Go.', () => {
    running = true;
    spawnInt = setInterval(() => {
      const inactive = holes.filter(h => !h.classList.contains('up'));
      if (!inactive.length) return;
      const h = inactive[Math.floor(Math.random() * inactive.length)];
      h.classList.add('up');
      setTimeout(() => h.classList.remove('up'), 900 + Math.random() * 400);
    }, 550);
    timerInt = setInterval(() => {
      timeLeft--;
      setHud(score, `⏱ ${timeLeft}s`);
      if (timeLeft <= 0) {
        running = false;
        clearInterval(spawnInt); clearInterval(timerInt);
        holes.forEach(h => h.classList.remove('up'));
        setTimeout(() => showGameOver(score, 'whackamole'), 300);
      }
    }, 1000);
  });

  board.appendChild(overlay);
  return () => { clearInterval(spawnInt); clearInterval(timerInt); };
}

// ---- SNAKE ----
function initSnake() {
  const board = document.getElementById('gameBoard');
  const CELL = 18, COLS = 16, ROWS = 16;
  const W = CELL * COLS, H = CELL * ROWS;

  const canvas = document.createElement('canvas');
  canvas.id = 'snakeCanvas';
  canvas.width = W; canvas.height = H;

  const dpad = document.createElement('div');
  dpad.className = 'dpad';
  dpad.innerHTML = `
    <div class="dpad-row"><button class="dpad-btn" data-d="U">▲</button></div>
    <div class="dpad-row">
      <button class="dpad-btn" data-d="L">◀</button>
      <button class="dpad-btn" data-d="D">▼</button>
      <button class="dpad-btn" data-d="R">▶</button>
    </div>`;

  board.appendChild(canvas);
  board.appendChild(dpad);

  const ctx = canvas.getContext('2d');
  let snake = [{x:8,y:8}], dir={x:1,y:0}, nd={x:1,y:0}, food=sf(), score=0, loop=null;

  function sf() {
    let f;
    do { f = { x:Math.floor(Math.random()*COLS), y:Math.floor(Math.random()*ROWS) }; }
    while (snake.some(s=>s.x===f.x&&s.y===f.y));
    return f;
  }

  function draw() {
    const dark = !html.getAttribute('data-theme');
    ctx.fillStyle = dark ? '#0a0a0f' : '#e8e3d8';
    ctx.fillRect(0, 0, W, H);
    // food
    ctx.font = `${CELL-2}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('💼', food.x*CELL+CELL/2, food.y*CELL+CELL-1);
    // snake
    snake.forEach((s,i) => {
      ctx.fillStyle = i===0 ? (dark?'#00ff88':'#007744') : (dark?'#00cc6688':'#00774488');
      ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
    });
  }

  function tick() {
    dir = {...nd};
    const head = { x:snake[0].x+dir.x, y:snake[0].y+dir.y };
    if (head.x<0||head.x>=COLS||head.y<0||head.y>=ROWS||snake.some(s=>s.x===head.x&&s.y===head.y)) {
      clearInterval(loop);
      setTimeout(() => showGameOver(score, 'snake'), 200);
      return;
    }
    snake.unshift(head);
    if (head.x===food.x&&head.y===food.y) {
      score++; setHud(score, ''); food = sf();
    } else { snake.pop(); }
    draw();
  }

  const keyH = e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.key==='ArrowUp'&&dir.y===0) nd={x:0,y:-1};
    if (e.key==='ArrowDown'&&dir.y===0) nd={x:0,y:1};
    if (e.key==='ArrowLeft'&&dir.x===0) nd={x:-1,y:0};
    if (e.key==='ArrowRight'&&dir.x===0) nd={x:1,y:0};
  };
  document.addEventListener('keydown', keyH);

  dpad.querySelectorAll('.dpad-btn').forEach(btn => {
    const h = () => {
      const d = btn.dataset.d;
      if (d==='U'&&dir.y===0) nd={x:0,y:-1};
      if (d==='D'&&dir.y===0) nd={x:0,y:1};
      if (d==='L'&&dir.x===0) nd={x:-1,y:0};
      if (d==='R'&&dir.x===0) nd={x:1,y:0};
    };
    btn.addEventListener('click', h);
    btn.addEventListener('touchstart', e => { e.preventDefault(); h(); }, {passive:false});
  });

  const overlay = makeOverlay('Classic Snake.\nEat the briefcases.\nDon\'t crash.', () => {
    loop = setInterval(tick, 140);
  });
  board.appendChild(overlay);
  draw();

  return () => { clearInterval(loop); document.removeEventListener('keydown', keyH); };
}

// ---- TYPING TEST ----
function initTyping() {
  const board = document.getElementById('gameBoard');
  const PASSAGES = [
    "Out of office reply activated. Notifications silenced. The world can wait until tomorrow morning.",
    "Today is a bank holiday and absolutely nothing productive needs to happen. Close the laptop and go outside.",
    "Some people check emails on bank holidays. Those people are called managers and we deeply pity them.",
    "The only deadline today is the chai getting cold. Everything else can wait until next working day.",
    "Working on a bank holiday is technically legal but morally questionable. Your therapist agrees.",
    "RBI says no banking today. The universe says no working either. Far be it from us to argue.",
  ];

  const passage = PASSAGES[Math.floor(Math.random() * PASSAGES.length)];
  let typed = '', started = false, startTime = null, finished = false, timerInt = null, timeLeft = 60;

  const wrap = document.createElement('div');
  wrap.className = 'typing-wrap';

  const passageEl = document.createElement('div');
  passageEl.className = 'typing-passage';

  const input = document.createElement('input');
  input.className = 'typing-area';
  input.placeholder = 'Start typing to begin…';
  input.autocomplete = 'off';
  input.autocorrect = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;

  const stats = document.createElement('div');
  stats.className = 'typing-stats';
  stats.innerHTML = `
    <div><span class="tstat-val" id="twpm">—</span>WPM</div>
    <div><span class="tstat-val" id="tacc">—</span>Accuracy</div>
    <div><span class="tstat-val" id="tsec">60</span>Seconds</div>
  `;

  wrap.appendChild(passageEl);
  wrap.appendChild(input);
  wrap.appendChild(stats);
  board.appendChild(wrap);

  function render() {
    passageEl.innerHTML = '';
    [...passage].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'tc';
      s.textContent = ch;
      if (i < typed.length) s.classList.add(typed[i] === ch ? 'ok' : 'bad');
      if (i === typed.length) s.classList.add('cur');
      passageEl.appendChild(s);
    });
  }

  render();
  setTimeout(() => input.focus(), 100);

  input.addEventListener('input', () => {
    if (finished) return;
    typed = input.value;
    if (!started && typed.length > 0) {
      started = true; startTime = Date.now();
      timerInt = setInterval(() => {
        timeLeft--;
        const el = document.getElementById('tsec');
        if (el) el.textContent = timeLeft;
        setHud(calcWpm(), `⏱ ${timeLeft}s`);
        if (timeLeft <= 0) end();
      }, 1000);
    }
    render();
    const wpm = calcWpm();
    const acc = calcAcc();
    setHud(wpm, `⏱ ${timeLeft}s`);
    const we = document.getElementById('twpm'); if (we) we.textContent = wpm;
    const ae = document.getElementById('tacc'); if (ae) ae.textContent = acc + '%';
    if (typed === passage) end();
  });

  function calcWpm() {
    if (!startTime) return 0;
    const mins = (Date.now() - startTime) / 60000;
    return mins > 0 ? Math.round(typed.trim().split(' ').length / mins) : 0;
  }
  function calcAcc() {
    if (!typed.length) return 100;
    const ok = [...typed].filter((c, i) => c === passage[i]).length;
    return Math.round(ok / typed.length * 100);
  }
  function end() {
    if (finished) return;
    finished = true; clearInterval(timerInt); input.disabled = true;
    const wpm = calcWpm(); const acc = calcAcc();
    setTimeout(() => showGameOver(wpm, 'typing', `${acc}% accuracy`), 300);
  }

  return () => clearInterval(timerInt);
}

// ---- GAME HELPERS ----
function makeOverlay(msg, onStart) {
  const div = document.createElement('div');
  div.className = 'game-overlay';
  const p = document.createElement('p');
  p.className = 'game-start-msg';
  p.style.whiteSpace = 'pre-line';
  p.textContent = msg;
  const btn = document.createElement('button');
  btn.className = 'game-start-btn';
  btn.textContent = 'START';
  btn.addEventListener('click', () => { div.remove(); onStart(); });
  div.appendChild(p); div.appendChild(btn);
  return div;
}

function showGameOver(score, gameId, extra) {
  const board = document.getElementById('gameBoard');
  const quip = randomItem(GAME_OVER_QUIPS[gameId] || ['Nice try.']);
  const div = document.createElement('div');
  div.className = 'game-overlay';
  div.innerHTML = `
    <div class="game-overlay-label">FINAL SCORE</div>
    <div class="game-overlay-score">${score}</div>
    ${extra ? `<div class="game-overlay-label">${extra}</div>` : ''}
    <div class="game-overlay-quip">${quip}</div>
    <button class="game-again-btn" id="againBtn">PLAY AGAIN</button>
  `;
  board.appendChild(div);
  document.getElementById('againBtn').onclick = () => {
    const active = document.querySelector('.gpick.active');
    if (active) launchGame(active.dataset.game);
  };
}

// ================================================================
// ADMIN PANEL
// ================================================================
function renderAdminList() {
  const list = document.getElementById('adminList');
  if (!list) return;
  const overrides = getAdminOverrides();
  list.innerHTML = '';
  if (!overrides.length) {
    list.innerHTML = '<div style="font-size:11px;color:var(--fg3);padding:8px 0">No overrides yet.</div>';
    return;
  }
  overrides.forEach((o, i) => {
    const row = document.createElement('div');
    row.className = 'admin-override-item';
    row.innerHTML = `
      <span>${o.date} · ${o.state} · ${o.name}</span>
      <button class="admin-del" onclick="deleteAdminOverride(${i});renderAdminList();toast('Override deleted.')">✕</button>
    `;
    list.appendChild(row);
  });
}

document.getElementById('adminSubmit').addEventListener('click', () => {
  const pwd   = document.getElementById('adminPwd').value;
  const date  = document.getElementById('adminDate').value;
  const state = document.getElementById('adminState').value.toUpperCase().trim();
  const name  = document.getElementById('adminName').value.trim();
  const note  = document.getElementById('adminNote').value.trim();
  const r = addAdminOverride(pwd, date, state, name, note);
  if (r.ok) {
    toast('✓ Override added!');
    document.getElementById('adminDate').value = '';
    document.getElementById('adminState').value = '';
    document.getElementById('adminName').value = '';
    document.getElementById('adminNote').value = '';
    renderAdminList();
    // Re-render if current date matches
    if (currentState) renderForCity(INDIA_CITIES.find(c => c.code === currentState) || { code: currentState, name: currentCity, state: STATE_LABELS[currentState] });
  } else {
    toast('✗ ' + r.msg);
  }
});

renderAdminList();

// ================================================================
// BOOT
// ================================================================
init();
