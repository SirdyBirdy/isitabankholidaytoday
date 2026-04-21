/* ============================================
   IS IT A BANK HOLIDAY TODAY? — APP
   ============================================ */

// ---- STATE ----
let currentCountryCode = '';
let currentIsHoliday = false;
let currentResult = null;
let activeGame = null;

// ---- COUNTRY CODE MAP (from timezone/reverse-geo) ----
const TIMEZONE_COUNTRY_MAP = {
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Europe/London': 'GB',
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Los_Angeles': 'US',
  'America/Phoenix': 'US',
  'Europe/Berlin': 'DE',
  'Europe/Amsterdam': 'DE',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Montreal': 'CA',
  'Asia/Tokyo': 'JP',
  'Asia/Dubai': 'AE',
  'Asia/Singapore': 'SG',
};

const COUNTRY_NAME_MAP = {
  'india': 'IN', 'in': 'IN',
  'uk': 'GB', 'united kingdom': 'GB', 'britain': 'GB', 'england': 'GB', 'gb': 'GB',
  'usa': 'US', 'us': 'US', 'united states': 'US', 'america': 'US',
  'germany': 'DE', 'deutschland': 'DE', 'de': 'DE',
  'australia': 'AU', 'au': 'AU',
  'canada': 'CA', 'ca': 'CA',
  'japan': 'JP', 'jp': 'JP',
  'uae': 'AE', 'united arab emirates': 'AE', 'dubai': 'AE', 'ae': 'AE',
  'singapore': 'SG', 'sg': 'SG',
};

// ---- HELPERS ----
function showState(id) {
  document.querySelectorAll('.state').forEach(el => el.classList.add('hidden'));
  document.getElementById(id)?.classList.remove('hidden');
}
function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), duration);
}
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function formatDate(date) {
  return date.toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// ---- THEME ----
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const saved = localStorage.getItem('theme');
if (saved) html.setAttribute('data-theme', saved);
themeToggle.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ---- DATE PILL ----
const today = new Date();
document.getElementById('datePill').textContent = formatDate(today);
document.getElementById('footerYear').textContent = today.getFullYear();

// ---- DETECT COUNTRY ----
function detectCountryFromTimezone() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return TIMEZONE_COUNTRY_MAP[tz] || null;
  } catch {
    return null;
  }
}

function lookupCountryCode(input) {
  return COUNTRY_NAME_MAP[input.trim().toLowerCase()] || null;
}

// ---- CHECK HOLIDAY ----
function checkHoliday(countryCode, date) {
  const rule = HOLIDAY_RULES.find(r => r.country === countryCode);
  if (!rule) return null;
  const result = rule.check(date);
  return { ...result, countryLabel: rule.countryLabel, flag: rule.flag, countryCode };
}

// ---- RENDER RESULT ----
function renderResult(result, locationLabel) {
  currentCountryCode = result.countryCode;
  currentResult = result;

  const shareActions = document.getElementById('shareActions');
  shareActions.classList.remove('hidden');

  if (result.holiday) {
    currentIsHoliday = true;
    document.getElementById('locationTagHoliday').textContent = `${result.flag || ''} ${locationLabel}`.trim();
    document.getElementById('subtextHoliday').textContent = randomItem(HOLIDAY_QUIPS);
    document.getElementById('holidayNote').textContent = `📅 ${result.name}${result.note ? ' — ' + result.note : ''}`;
    showState('stateHoliday');

    // Share actions
    setupSharing(true, result.name, locationLabel);

  } else {
    currentIsHoliday = false;
    const guilt = randomItem(WORK_SHAMES);
    document.getElementById('locationTagNotHoliday').textContent = `${result.flag || ''} ${locationLabel}`.trim();
    document.getElementById('guiltMain').textContent = guilt.main;
    document.getElementById('guiltSub').textContent = guilt.sub;

    // Next holiday countdown
    const next = getNextHoliday(result.countryCode, today);
    if (next) {
      const box = document.getElementById('countdownBox');
      box.classList.remove('hidden');
      const days = next.daysFrom;
      document.getElementById('nextHolidayCountdown').textContent = `${days} day${days === 1 ? '' : 's'}`;
      document.getElementById('nextHolidayName').textContent = `↗ ${next.name}`;
    }

    showState('stateNotHoliday');
    setupSharing(false, null, locationLabel);
  }
}

// ---- SHARING ----
function setupSharing(isHoliday, holidayName, location) {
  const dateStr = today.toISOString().slice(0, 10);
  const msg = isHoliday
    ? `🏦 YES — it's a bank holiday in ${location} today (${dateStr}). ${holidayName}. Check yours → isitabankholidaytoday.com`
    : `🏦 NOPE — not a bank holiday in ${location} today. Go back to work. isitabankholidaytoday.com`;

  document.getElementById('btnWhatsapp').onclick = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };
  document.getElementById('btnTwitter').onclick = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(msg)}`, '_blank');
  };
}

// ---- GEO DETECT + INIT ----
function initWithCountry(countryCode, label) {
  const result = checkHoliday(countryCode, today);
  if (!result) {
    showState('stateError');
    return;
  }
  renderResult(result, label);
}

function init() {
  // Try timezone first
  const tzCode = detectCountryFromTimezone();
  if (tzCode) {
    const rule = HOLIDAY_RULES.find(r => r.country === tzCode);
    const label = rule ? `${rule.flag} ${rule.countryLabel}` : tzCode;
    initWithCountry(tzCode, label);
    return;
  }

  // Try geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        // We use a reverse-geocoding approach via timezone fallback
        const tzCode2 = detectCountryFromTimezone();
        if (tzCode2) {
          const rule = HOLIDAY_RULES.find(r => r.country === tzCode2);
          const label = rule ? `${rule.flag} ${rule.countryLabel}` : tzCode2;
          initWithCountry(tzCode2, label);
        } else {
          showState('statePermission');
        }
      },
      () => showState('statePermission')
    );
  } else {
    showState('statePermission');
  }
}

// ---- MANUAL INPUT ----
function handleManualInput(inputId) {
  const input = document.getElementById(inputId);
  const val = input.value.trim();
  if (!val) return;
  const code = lookupCountryCode(val);
  if (!code) {
    showToast(`Hmm, "${val}" not found. Try: India, UK, USA, Germany, Australia…`);
    return;
  }
  const rule = HOLIDAY_RULES.find(r => r.country === code);
  const label = rule ? `${rule.flag} ${rule.countryLabel}` : val;
  initWithCountry(code, label);
}

document.getElementById('countrySubmit').addEventListener('click', () => handleManualInput('countryInput'));
document.getElementById('countryInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleManualInput('countryInput'); });
document.getElementById('countrySubmitError').addEventListener('click', () => handleManualInput('countryInputError'));
document.getElementById('countryInputError').addEventListener('keydown', e => { if (e.key === 'Enter') handleManualInput('countryInputError'); });

// ---- COUNTRY GRID ----
const grid = document.getElementById('countryGrid');
COUNTRY_GRID.forEach(c => {
  const chip = document.createElement('button');
  chip.className = 'state-chip';
  chip.innerHTML = `<span class="state-chip-icon">${c.flag}</span>${c.label}`;
  chip.style.cursor = 'pointer';
  chip.addEventListener('click', () => {
    const rule = HOLIDAY_RULES.find(r => r.country === c.code);
    const label = rule ? `${rule.flag} ${rule.countryLabel}` : c.label;
    initWithCountry(c.code, label);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  grid.appendChild(chip);
});

// ============================================================
// GAME ENGINE
// ============================================================

document.querySelectorAll('.game-pick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.game-pick-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    launchGame(btn.dataset.game);
  });
});

document.getElementById('gameCloseBtn').addEventListener('click', () => {
  stopActiveGame();
  document.getElementById('gameContainer').classList.add('hidden');
  document.getElementById('gameInvite').classList.remove('hidden');
  document.querySelectorAll('.game-pick-btn').forEach(b => b.classList.remove('active'));
});

function launchGame(gameId) {
  stopActiveGame();
  document.getElementById('gameInvite').classList.add('hidden');
  const container = document.getElementById('gameContainer');
  container.classList.remove('hidden');
  document.getElementById('gameCanvasWrap').innerHTML = '';
  document.getElementById('gameScore').textContent = 'Score: 0';
  document.getElementById('gameTimer').textContent = '';

  const titles = { whackamole: '🐀 Whack-a-Boss', snake: '🐍 Snake', typingtest: '⌨️ Typing Speed' };
  document.getElementById('gameTitleLabel').textContent = titles[gameId] || gameId;

  if (gameId === 'whackamole') activeGame = initWhackAMole();
  else if (gameId === 'snake') activeGame = initSnake();
  else if (gameId === 'typingtest') activeGame = initTypingTest();
}

function stopActiveGame() {
  if (activeGame && activeGame.destroy) activeGame.destroy();
  activeGame = null;
}

function setScore(n) { document.getElementById('gameScore').textContent = `Score: ${n}`; }
function setTimer(t) { document.getElementById('gameTimer').textContent = t; }

// ----------------------------------------------------------------
// GAME 1: WHACK-A-BOSS
// ----------------------------------------------------------------
function initWhackAMole() {
  const wrap = document.getElementById('gameCanvasWrap');
  const BOSSES = ['👨‍💼','👩‍💼','🤵','👔','🧑‍💼'];
  const MISS = ['😬','🙈','💨'];
  let score = 0, timeLeft = 30, interval = null, timerInterval = null, isRunning = false;

  // Build grid
  const grid = document.createElement('div');
  grid.className = 'wam-grid';
  const holes = [];
  for (let i = 0; i < 9; i++) {
    const hole = document.createElement('div');
    hole.className = 'wam-hole';
    const mole = document.createElement('div');
    mole.className = 'wam-mole';
    mole.textContent = randomItem(BOSSES);
    hole.appendChild(mole);
    hole.addEventListener('click', () => onHoleClick(i));
    holes.push({ el: hole, mole, active: false });
    grid.appendChild(hole);
  }
  wrap.appendChild(grid);

  // Start overlay
  const overlay = makeStartOverlay('Whack the bosses before they hide.\n30 seconds. Go.', start);
  wrap.appendChild(overlay);

  function start() {
    overlay.remove();
    isRunning = true;
    timeLeft = 30;
    score = 0;
    setScore(0);
    setTimer(`⏱ ${timeLeft}s`);

    interval = setInterval(spawnMole, 600);
    timerInterval = setInterval(() => {
      timeLeft--;
      setTimer(`⏱ ${timeLeft}s`);
      if (timeLeft <= 0) endGame();
    }, 1000);
  }

  function spawnMole() {
    const inactive = holes.filter(h => !h.active);
    if (!inactive.length) return;
    const h = randomItem(inactive);
    h.active = true;
    h.mole.textContent = randomItem(BOSSES);
    h.el.classList.add('active');
    setTimeout(() => {
      if (h.active) { h.active = false; h.el.classList.remove('active'); }
    }, 800 + Math.random() * 400);
  }

  function onHoleClick(i) {
    if (!isRunning) return;
    const h = holes[i];
    if (h.active) {
      h.active = false;
      h.el.classList.remove('active');
      h.el.classList.add('wam-hit-flash');
      setTimeout(() => h.el.classList.remove('wam-hit-flash'), 200);
      score++;
      setScore(score);
    }
  }

  function endGame() {
    isRunning = false;
    clearInterval(interval);
    clearInterval(timerInterval);
    setTimer('⏱ 0s');
    holes.forEach(h => { h.active = false; h.el.classList.remove('active'); });
    setTimeout(() => showGameOver(score, 'whackamole'), 300);
  }

  function destroy() { clearInterval(interval); clearInterval(timerInterval); }
  return { destroy };
}

// ----------------------------------------------------------------
// GAME 2: SNAKE
// ----------------------------------------------------------------
function initSnake() {
  const wrap = document.getElementById('gameCanvasWrap');
  const SIZE = 20, COLS = 15, ROWS = 15;
  const W = SIZE * COLS, H = SIZE * ROWS;

  const canvas = document.createElement('canvas');
  canvas.id = 'snakeCanvas';
  canvas.width = W; canvas.height = H;
  canvas.style.maxWidth = '100%';

  const controls = document.createElement('div');
  controls.className = 'snake-controls';
  controls.innerHTML = `
    <div class="snake-row"><button class="dpad-btn" data-dir="UP">▲</button></div>
    <div class="snake-row">
      <button class="dpad-btn" data-dir="LEFT">◀</button>
      <button class="dpad-btn" data-dir="DOWN">▼</button>
      <button class="dpad-btn" data-dir="RIGHT">▶</button>
    </div>`;

  wrap.appendChild(canvas);
  wrap.appendChild(controls);

  const ctx = canvas.getContext('2d');
  let snake = [{x:7, y:7}], dir = {x:1, y:0}, nextDir = {x:1, y:0};
  let food = spawnFood(), score = 0, loop = null, isRunning = false;

  // D-pad
  controls.querySelectorAll('.dpad-btn').forEach(btn => {
    const handler = () => {
      const d = btn.dataset.dir;
      if (d === 'UP' && dir.y === 0) nextDir = {x:0, y:-1};
      if (d === 'DOWN' && dir.y === 0) nextDir = {x:0, y:1};
      if (d === 'LEFT' && dir.x === 0) nextDir = {x:-1, y:0};
      if (d === 'RIGHT' && dir.x === 0) nextDir = {x:1, y:0};
    };
    btn.addEventListener('click', handler);
    btn.addEventListener('touchstart', e => { e.preventDefault(); handler(); }, {passive:false});
  });

  // Keyboard
  const keyHandler = e => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) e.preventDefault();
    if (e.key === 'ArrowUp' && dir.y === 0) nextDir = {x:0, y:-1};
    if (e.key === 'ArrowDown' && dir.y === 0) nextDir = {x:0, y:1};
    if (e.key === 'ArrowLeft' && dir.x === 0) nextDir = {x:-1, y:0};
    if (e.key === 'ArrowRight' && dir.x === 0) nextDir = {x:1, y:0};
  };
  document.addEventListener('keydown', keyHandler);

  const overlay = makeStartOverlay('Classic Snake.\nDon\'t run into yourself.\nUse arrow keys or the D-pad.', start);
  wrap.appendChild(overlay);

  function start() {
    overlay.remove();
    isRunning = true;
    loop = setInterval(tick, 150);
  }

  function spawnFood() {
    return {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  }

  function tick() {
    dir = {...nextDir};
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) return endGame();
    if (snake.some(s => s.x === head.x && s.y === head.y)) return endGame();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      setScore(score);
      food = spawnFood();
    } else {
      snake.pop();
    }
    draw();
  }

  function draw() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const bgColor = isDark ? '#0F1A0A' : '#EDE8DC';
    const gridColor = isDark ? '#1E2E1622' : '#D4C9B022';
    const snakeColor = isDark ? '#2ECC52' : '#0F5E2B';
    const foodColor = isDark ? '#E04020' : '#B52B0F';

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // Grid dots
    ctx.fillStyle = gridColor;
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      ctx.fillRect(x * SIZE + SIZE/2 - 1, y * SIZE + SIZE/2 - 1, 2, 2);
    }

    // Food
    ctx.fillStyle = foodColor;
    ctx.font = `${SIZE - 2}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText('💼', food.x * SIZE + SIZE/2, food.y * SIZE + SIZE - 2);

    // Snake
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? snakeColor : snakeColor + 'BB';
      ctx.fillRect(seg.x * SIZE + 1, seg.y * SIZE + 1, SIZE - 2, SIZE - 2);
    });
  }

  function endGame() {
    isRunning = false;
    clearInterval(loop);
    setTimeout(() => showGameOver(score, 'snake'), 200);
  }

  function destroy() {
    clearInterval(loop);
    document.removeEventListener('keydown', keyHandler);
  }

  draw();
  return { destroy };
}

// ----------------------------------------------------------------
// GAME 3: TYPING SPEED TEST
// ----------------------------------------------------------------
function initTypingTest() {
  const wrap = document.getElementById('gameCanvasWrap');

  const PASSAGES = [
    "The quick brown fox jumps over the lazy dog while the bank remains closed on this glorious holiday.",
    "Out of office replies activated. Notifications silenced. The world can wait until tomorrow morning.",
    "Today is a bank holiday and absolutely nothing productive needs to happen. Close the laptop. Go outside.",
    "Some people check emails on bank holidays. Those people are called managers and we pity them dearly.",
    "The only deadline today is the kebab shop closing at eleven. Everything else can wait until Tuesday.",
    "Working on a bank holiday is technically legal but morally questionable. Your therapist agrees with this.",
  ];

  const passage = randomItem(PASSAGES);
  let typed = '', started = false, startTime = null, finished = false, timerInt = null;

  const div = document.createElement('div');
  div.className = 'typing-wrap';

  const passageEl = document.createElement('div');
  passageEl.className = 'typing-passage';

  const input = document.createElement('input');
  input.className = 'typing-input';
  input.placeholder = 'Start typing…';
  input.autocomplete = 'off';
  input.autocorrect = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;

  const stats = document.createElement('div');
  stats.className = 'typing-stats';
  stats.innerHTML = `
    <div><span class="typing-stat-val" id="wpmVal">—</span>WPM</div>
    <div><span class="typing-stat-val" id="accVal">—</span>Accuracy</div>
    <div><span class="typing-stat-val" id="timeVal">60</span>Seconds left</div>
  `;

  div.appendChild(passageEl);
  div.appendChild(input);
  div.appendChild(stats);
  wrap.appendChild(div);

  function renderPassage() {
    passageEl.innerHTML = '';
    passage.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'typing-char';
      span.textContent = ch;
      if (i < typed.length) span.classList.add(typed[i] === ch ? 'correct' : 'wrong');
      if (i === typed.length) span.classList.add('cursor');
      passageEl.appendChild(span);
    });
  }

  let timeLeft = 60;
  renderPassage();

  input.addEventListener('input', () => {
    if (finished) return;
    typed = input.value;

    if (!started) {
      started = true;
      startTime = Date.now();
      timerInt = setInterval(() => {
        timeLeft--;
        const tv = document.getElementById('timeVal');
        if (tv) tv.textContent = timeLeft;
        setTimer(`⏱ ${timeLeft}s`);
        if (timeLeft <= 0) endGame();
      }, 1000);
    }

    renderPassage();

    // WPM
    const elapsed = (Date.now() - startTime) / 60000;
    const words = typed.trim().split(' ').length;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;
    const el = document.getElementById('wpmVal');
    if (el) el.textContent = wpm;
    setScore(wpm);

    // Accuracy
    const correct = typed.split('').filter((c, i) => c === passage[i]).length;
    const acc = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 100;
    const ae = document.getElementById('accVal');
    if (ae) ae.textContent = acc + '%';

    // Complete?
    if (typed === passage) endGame();
  });

  input.focus();

  function endGame() {
    if (finished) return;
    finished = true;
    clearInterval(timerInt);
    input.disabled = true;
    const elapsed = startTime ? (Date.now() - startTime) / 60000 : 1;
    const words = typed.trim().split(' ').length;
    const finalWpm = Math.round(words / elapsed);
    const correct = typed.split('').filter((c, i) => c === passage[i]).length;
    const acc = typed.length > 0 ? Math.round((correct / typed.length) * 100) : 0;
    setTimeout(() => showGameOver(finalWpm, 'typingtest', `${acc}% accuracy`), 400);
  }

  function destroy() { clearInterval(timerInt); }
  return { destroy };
}

// ---- SHARED GAME OVER ----
function showGameOver(score, gameId, extra) {
  const wrap = document.getElementById('gameCanvasWrap');
  const quip = randomItem(GAME_OVER_QUIPS[gameId] || ['Nice try.']);
  const div = document.createElement('div');
  div.className = 'game-over-overlay';
  div.innerHTML = `
    <div class="game-over-label">FINAL SCORE</div>
    <div class="game-over-score">${score}</div>
    ${extra ? `<div class="game-over-label">${extra}</div>` : ''}
    <div class="game-over-quip">${quip}</div>
    <button class="game-start-btn" id="playAgainBtn">Play Again</button>
  `;
  wrap.appendChild(div);
  document.getElementById('playAgainBtn').addEventListener('click', () => {
    const active = document.querySelector('.game-pick-btn.active');
    if (active) launchGame(active.dataset.game);
  });
}

// ---- SHARED START OVERLAY ----
function makeStartOverlay(msg, onStart) {
  const div = document.createElement('div');
  div.className = 'game-start-overlay';
  const p = document.createElement('p');
  p.className = 'game-start-msg';
  p.textContent = msg;
  const btn = document.createElement('button');
  btn.className = 'game-start-btn';
  btn.textContent = 'START';
  btn.addEventListener('click', onStart);
  div.appendChild(p);
  div.appendChild(btn);
  return div;
}

// ---- GO ----
init();
