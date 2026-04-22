/* ============================================================
   IS IT A BANK HOLIDAY TODAY? — DATA (India)
   ============================================================ */

// ---- COPY BANKS ----
const HOLIDAY_QUIPS = [
  "The RBI has spoken. Your bank is hibernating.",
  "Official government-sanctioned doing absolutely nothing.",
  "Even money gets a day off. Respect the grind.",
  "Today's agenda: eat, sleep, definitely not go to the bank.",
  "The vaults are locked. The vibes are immaculate.",
  "Your EMI can wait. The government said so.",
  "Not a transaction will occur today. This is peace.",
  "Banks closed by law. Your excuse to do nothing: certified.",
  "The ATM queue you feared? Cancelled. By decree.",
  "Zero banking activity. Maximum holiday activity.",
  "Somewhere, a bank manager is weeping into their chai.",
  "NEFT, IMPS, and your productivity are all on pause.",
];

const GUILT_MSGS = [
  { main: "GO WORK,\nYOU LAZY ASS.", sub: "The bank is open. Your login credentials still work. Close this tab." },
  { main: "NICE TRY.\nNOT TODAY.", sub: "No holiday. Your Jira board is watching. Your manager is double-watching." },
  { main: "SIR THIS\nIS A WORK DAY.", sub: "Banks are open. Your excuses are not. Get back to those spreadsheets." },
  { main: "CLOSE THIS\nTAB NOW.", sub: "We saw you. HR didn't — yet. Move quickly and open your work laptop." },
  { main: "NOT A\nHOLIDAY.", sub: "It is a regular, fully functional, entirely dreadful working day. Sorry." },
  { main: "THE BANK\nIS OPEN.\nSO IS YOURS.", sub: "No official excuse today. The economy requires your presence. Reluctantly." },
  { main: "YOUR LEAVE\nWON'T APPLY.", sub: "Log in. Attend standup. Pretend you've been working since 9am." },
];

const GAME_OVER_QUIPS = {
  whackamole: [
    "Slightly more productive than a WFH Monday.",
    "The bosses always come back. They always do.",
    "Performance review material, honestly.",
    "Your holiday well spent. No notes.",
  ],
  snake: [
    "The snake represents scope creep. It always wins.",
    "Growth mindset — until you ran into yourself.",
    "You ate 3 laptops and a meeting invite. Respectable.",
    "Classic case of rapid scaling failure.",
  ],
  typing: [
    "That WPM > your quarterly report turnaround.",
    "Type fast, reply to emails: never.",
    "Fastest fingers in the bank holiday game.",
    "Your keyboard thanks you for the holiday workout.",
  ],
};

// ---- INDIAN CITIES WITH AUTOCOMPLETE DATA ----
const INDIA_CITIES = [
  // Maharashtra
  { name: "Mumbai", state: "Maharashtra", code: "MH", lat: 19.076, lng: 72.877 },
  { name: "Pune", state: "Maharashtra", code: "MH", lat: 18.521, lng: 73.856 },
  { name: "Nagpur", state: "Maharashtra", code: "MH", lat: 21.145, lng: 79.088 },
  { name: "Nashik", state: "Maharashtra", code: "MH", lat: 19.998, lng: 73.789 },
  { name: "Aurangabad", state: "Maharashtra", code: "MH", lat: 19.876, lng: 75.343 },
  { name: "Thane", state: "Maharashtra", code: "MH", lat: 19.218, lng: 72.978 },
  { name: "Solapur", state: "Maharashtra", code: "MH", lat: 17.686, lng: 75.907 },
  { name: "Kolhapur", state: "Maharashtra", code: "MH", lat: 16.701, lng: 74.243 },
  // Delhi / NCR
  { name: "Delhi", state: "Delhi", code: "DL", lat: 28.613, lng: 77.209 },
  { name: "New Delhi", state: "Delhi", code: "DL", lat: 28.613, lng: 77.209 },
  { name: "Noida", state: "Uttar Pradesh", code: "UP", lat: 28.535, lng: 77.391 },
  { name: "Gurgaon", state: "Haryana", code: "HR", lat: 28.459, lng: 77.026 },
  { name: "Gurugram", state: "Haryana", code: "HR", lat: 28.459, lng: 77.026 },
  { name: "Faridabad", state: "Haryana", code: "HR", lat: 28.408, lng: 77.317 },
  // Karnataka
  { name: "Bangalore", state: "Karnataka", code: "KA", lat: 12.971, lng: 77.594 },
  { name: "Bengaluru", state: "Karnataka", code: "KA", lat: 12.971, lng: 77.594 },
  { name: "Mysore", state: "Karnataka", code: "KA", lat: 12.295, lng: 76.644 },
  { name: "Hubli", state: "Karnataka", code: "KA", lat: 15.358, lng: 75.135 },
  { name: "Mangalore", state: "Karnataka", code: "KA", lat: 12.914, lng: 74.856 },
  { name: "Bellary", state: "Karnataka", code: "KA", lat: 15.152, lng: 76.921 },
  // Tamil Nadu
  { name: "Chennai", state: "Tamil Nadu", code: "TN", lat: 13.082, lng: 80.270 },
  { name: "Coimbatore", state: "Tamil Nadu", code: "TN", lat: 11.016, lng: 76.971 },
  { name: "Madurai", state: "Tamil Nadu", code: "TN", lat: 9.925, lng: 78.120 },
  { name: "Tiruchirappalli", state: "Tamil Nadu", code: "TN", lat: 10.790, lng: 78.703 },
  { name: "Salem", state: "Tamil Nadu", code: "TN", lat: 11.664, lng: 78.146 },
  // Telangana / Andhra
  { name: "Hyderabad", state: "Telangana", code: "TG", lat: 17.385, lng: 78.487 },
  { name: "Secunderabad", state: "Telangana", code: "TG", lat: 17.444, lng: 78.499 },
  { name: "Warangal", state: "Telangana", code: "TG", lat: 17.977, lng: 79.598 },
  { name: "Visakhapatnam", state: "Andhra Pradesh", code: "AP", lat: 17.686, lng: 83.218 },
  { name: "Vijayawada", state: "Andhra Pradesh", code: "AP", lat: 16.508, lng: 80.648 },
  // West Bengal
  { name: "Kolkata", state: "West Bengal", code: "WB", lat: 22.573, lng: 88.364 },
  { name: "Howrah", state: "West Bengal", code: "WB", lat: 22.585, lng: 88.294 },
  { name: "Durgapur", state: "West Bengal", code: "WB", lat: 23.480, lng: 87.315 },
  // Gujarat
  { name: "Ahmedabad", state: "Gujarat", code: "GJ", lat: 23.022, lng: 72.572 },
  { name: "Surat", state: "Gujarat", code: "GJ", lat: 21.170, lng: 72.831 },
  { name: "Vadodara", state: "Gujarat", code: "GJ", lat: 22.307, lng: 73.181 },
  { name: "Rajkot", state: "Gujarat", code: "GJ", lat: 22.300, lng: 70.783 },
  // Rajasthan
  { name: "Jaipur", state: "Rajasthan", code: "RJ", lat: 26.912, lng: 75.787 },
  { name: "Jodhpur", state: "Rajasthan", code: "RJ", lat: 26.294, lng: 73.035 },
  { name: "Udaipur", state: "Rajasthan", code: "RJ", lat: 24.585, lng: 73.712 },
  { name: "Kota", state: "Rajasthan", code: "RJ", lat: 25.182, lng: 75.838 },
  // Madhya Pradesh
  { name: "Bhopal", state: "Madhya Pradesh", code: "MP", lat: 23.259, lng: 77.412 },
  { name: "Indore", state: "Madhya Pradesh", code: "MP", lat: 22.719, lng: 75.857 },
  { name: "Jabalpur", state: "Madhya Pradesh", code: "MP", lat: 23.181, lng: 79.987 },
  { name: "Gwalior", state: "Madhya Pradesh", code: "MP", lat: 26.218, lng: 78.182 },
  // Uttar Pradesh
  { name: "Lucknow", state: "Uttar Pradesh", code: "UP", lat: 26.847, lng: 80.947 },
  { name: "Agra", state: "Uttar Pradesh", code: "UP", lat: 27.176, lng: 78.008 },
  { name: "Kanpur", state: "Uttar Pradesh", code: "UP", lat: 26.460, lng: 80.331 },
  { name: "Varanasi", state: "Uttar Pradesh", code: "UP", lat: 25.317, lng: 82.973 },
  { name: "Allahabad", state: "Uttar Pradesh", code: "UP", lat: 25.436, lng: 81.844 },
  { name: "Prayagraj", state: "Uttar Pradesh", code: "UP", lat: 25.436, lng: 81.844 },
  { name: "Meerut", state: "Uttar Pradesh", code: "UP", lat: 28.984, lng: 77.706 },
  // Bihar
  { name: "Patna", state: "Bihar", code: "BR", lat: 25.594, lng: 85.137 },
  { name: "Gaya", state: "Bihar", code: "BR", lat: 24.796, lng: 85.009 },
  // Punjab / Haryana
  { name: "Chandigarh", state: "Chandigarh", code: "CH", lat: 30.732, lng: 76.779 },
  { name: "Ludhiana", state: "Punjab", code: "PB", lat: 30.901, lng: 75.857 },
  { name: "Amritsar", state: "Punjab", code: "PB", lat: 31.638, lng: 74.872 },
  // Kerala
  { name: "Kochi", state: "Kerala", code: "KL", lat: 9.931, lng: 76.267 },
  { name: "Thiruvananthapuram", state: "Kerala", code: "KL", lat: 8.524, lng: 76.937 },
  { name: "Kozhikode", state: "Kerala", code: "KL", lat: 11.258, lng: 75.780 },
  // Odisha
  { name: "Bhubaneswar", state: "Odisha", code: "OD", lat: 20.296, lng: 85.825 },
  { name: "Cuttack", state: "Odisha", code: "OD", lat: 20.462, lng: 85.882 },
  // Jharkhand
  { name: "Ranchi", state: "Jharkhand", code: "JH", lat: 23.344, lng: 85.309 },
  { name: "Jamshedpur", state: "Jharkhand", code: "JH", lat: 22.805, lng: 86.203 },
  // Assam / NE
  { name: "Guwahati", state: "Assam", code: "AS", lat: 26.144, lng: 91.736 },
  // Himachal / J&K
  { name: "Shimla", state: "Himachal Pradesh", code: "HP", lat: 31.104, lng: 77.173 },
  { name: "Jammu", state: "Jammu & Kashmir", code: "JK", lat: 32.733, lng: 74.873 },
  { name: "Srinagar", state: "Jammu & Kashmir", code: "JK", lat: 34.083, lng: 74.797 },
  // Uttarakhand
  { name: "Dehradun", state: "Uttarakhand", code: "UK", lat: 30.316, lng: 78.032 },
  // Goa
  { name: "Panaji", state: "Goa", code: "GA", lat: 15.499, lng: 73.828 },
  { name: "Margao", state: "Goa", code: "GA", lat: 15.274, lng: 73.957 },
  // Chhattisgarh
  { name: "Raipur", state: "Chhattisgarh", code: "CG", lat: 21.251, lng: 81.629 },
];

// ---- QUICK CITY LIST (sidebar) ----
const QUICK_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Chennai", "Hyderabad",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow"
];

// ---- NATIONAL HOLIDAYS ----
const NATIONAL_HOLIDAYS = [
  { m:1, d:26, name:"Republic Day", note:"India's constitution came into force in 1950. Banks closed nationwide. Parades happen. Patriotism is mandatory." },
  { m:8, d:15, name:"Independence Day", note:"Independence from British rule, 1947. Flag hoisting, speeches, closed banks, and a lot of feelings." },
  { m:10, d:2, name:"Gandhi Jayanti", note:"Mahatma Gandhi's birthday. National holiday. Non-violence. Also very closed banks." },
  { m:10, d:3, name:"Gandhi Jayanti (observed)", note:"Gandhi Jayanti observed/extended holiday in some states." },
];

// ---- STATE-SPECIFIC HOLIDAYS ----
const STATE_HOLIDAYS = {
  MH: [
    { m:3, d:17, name:"Chhatrapati Shivaji Maharaj Jayanti", note:"The great Maratha warrior king's birthday. Maharashtra banks closed." },
    { m:4, d:14, name:"Dr. B.R. Ambedkar Jayanti", note:"Babasaheb's birthday. Observed across Maharashtra. Banks shut." },
    { m:4, d:22, name:"Good Friday", note:"Maharashtra observes Good Friday as a bank holiday." },
    { m:5, d:1, name:"Maharashtra Day", note:"Maharashtra Formation Day, 1960. Banks closed. Full state holiday." },
    { m:10, d:24, name:"Dussehra", note:"Dussehra holiday for Maharashtra. Banks closed." },
    { m:11, d:1, name:"Diwali (Laxmi Pujan)", note:"Banks closed for Diwali across Maharashtra." },
    { m:11, d:2, name:"Diwali (Padwa)", note:"Diwali Padwa — New Year in Maharashtra. Banks closed." },
    { m:11, d:3, name:"Diwali (Bhaubeej)", note:"Banks closed for Bhaubeej." },
  ],
  DL: [
    { m:4, d:14, name:"Dr. B.R. Ambedkar Jayanti", note:"National observance. Delhi banks closed." },
    { m:10, d:24, name:"Dussehra", note:"Delhi banks observe Dussehra." },
    { m:10, d:31, name:"Halloween / Indira Gandhi's Death Anniversary", note:"October 31 is a Delhi state holiday." },
  ],
  KA: [
    { m:4, d:14, name:"Dr. B.R. Ambedkar Jayanti", note:"Karnataka banks closed for Ambedkar Jayanti." },
    { m:11, d:1, name:"Kannada Rajyotsava", note:"Karnataka Formation Day. The proudest day in Karnataka. Banks closed, flags everywhere." },
  ],
  TN: [
    { m:1, d:14, name:"Pongal", note:"Tamil harvest festival. Banks in Tamil Nadu closed." },
    { m:1, d:15, name:"Pongal (Day 2 — Maatu Pongal)", note:"Banks in Tamil Nadu observe extended Pongal." },
    { m:4, d:14, name:"Tamil New Year (Puthandu)", note:"Tamil New Year. Banks in Tamil Nadu closed." },
  ],
  TG: [
    { m:6, d:2, name:"Telangana Formation Day", note:"Telangana's statehood day since 2014. Banks in Hyderabad closed." },
    { m:4, d:14, name:"Dr. B.R. Ambedkar Jayanti", note:"Banks closed across Telangana." },
  ],
  AP: [
    { m:4, d:14, name:"Dr. B.R. Ambedkar Jayanti", note:"Banks closed in Andhra Pradesh." },
    { m:3, d:31, name:"Ugadi", note:"Telugu New Year. Banks in Andhra Pradesh closed." },
  ],
  WB: [
    { m:10, d:4, name:"Dussehra (Vijaya Dashami)", note:"Durga Puja finale. Banks in West Bengal closed." },
    { m:10, d:5, name:"Durga Puja", note:"Mahasaptami. Banks in West Bengal observe extended Durga Puja." },
    { m:5, d:9, name:"Rabindra Jayanti", note:"Rabindranath Tagore's birthday. West Bengal state holiday." },
  ],
  GJ: [
    { m:1, d:14, name:"Uttarayan (Makar Sankranti)", note:"Kite festival day in Gujarat. Some banks observe this locally." },
    { m:5, d:1, name:"Gujarat Day", note:"Gujarat Formation Day. Banks closed across the state." },
  ],
  KL: [
    { m:8, d:23, name:"Onam (Thiruvonam)", note:"Kerala's biggest festival. Banks closed across the state." },
    { m:1, d:14, name:"Makar Vilakku / Pongal", note:"Regional holiday in Kerala." },
  ],
  PB: [
    { m:11, d:19, name:"Guru Nanak Jayanti", note:"Birthday of Guru Nanak Dev Ji. Banks in Punjab closed." },
    { m:4, d:13, name:"Baisakhi", note:"Punjabi New Year and harvest festival. Banks in Punjab closed." },
  ],
  // 2nd & 4th Saturday rule (universal)
  _WEEKENDS: true,
};

// ---- STATE LABELS ----
const STATE_LABELS = {
  MH: "Maharashtra", DL: "Delhi", KA: "Karnataka", TN: "Tamil Nadu",
  TG: "Telangana", AP: "Andhra Pradesh", WB: "West Bengal", GJ: "Gujarat",
  KL: "Kerala", PB: "Punjab", HR: "Haryana", UP: "Uttar Pradesh",
  RJ: "Rajasthan", MP: "Madhya Pradesh", BR: "Bihar", JH: "Jharkhand",
  OD: "Odisha", AS: "Assam", HP: "Himachal Pradesh", JK: "J&K",
  UK: "Uttarakhand", GA: "Goa", CG: "Chhattisgarh", CH: "Chandigarh",
};

// ---- MAIN HOLIDAY CHECK FUNCTION ----
function checkHoliday(stateCode, date) {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const dow = date.getDay(); // 0=Sun

  // Sunday = always holiday
  if (dow === 0) return { holiday: true, name: "Sunday", note: "Banks are always closed on Sundays in India.", category: "weekend" };

  // 2nd and 4th Saturday
  if (dow === 6) {
    const weekNum = Math.ceil(d / 7);
    if (weekNum === 2 || weekNum === 4) {
      return { holiday: true, name: `${weekNum === 2 ? '2nd' : '4th'} Saturday`, note: "RBI policy: Indian banks are closed on the 2nd and 4th Saturdays of every month.", category: "weekend" };
    }
  }

  // Check admin overrides first
  const overrides = getAdminOverrides();
  const dateStr = formatDateISO(date);
  for (const o of overrides) {
    if (o.date === dateStr && (o.state === 'ALL' || o.state === stateCode || !o.state)) {
      return { holiday: true, name: o.name, note: o.note || 'Admin-confirmed holiday.', category: 'override' };
    }
  }

  // Check crowdsourced reports
  const reports = getCrowdReports();
  const reportKey = `${stateCode}-${dateStr}`;
  if (reports[reportKey] && reports[reportKey].dry >= 3) {
    return { holiday: true, name: 'Crowdsourced Holiday', note: `${reports[reportKey].dry} users confirmed this as a bank holiday today.`, category: 'crowd' };
  }

  // National holidays
  for (const h of NATIONAL_HOLIDAYS) {
    if (h.m === m && h.d === d) return { holiday: true, name: h.name, note: h.note, category: 'national' };
  }

  // State holidays
  const stateList = STATE_HOLIDAYS[stateCode] || [];
  for (const h of stateList) {
    if (h.m === m && h.d === d) return { holiday: true, name: h.name, note: h.note, category: 'state' };
  }

  return { holiday: false };
}

// ---- UPCOMING HOLIDAYS ----
function getUpcomingHolidays(stateCode, fromDate, count = 8) {
  const results = [];
  const check = new Date(fromDate);
  for (let i = 1; i <= 180 && results.length < count; i++) {
    check.setDate(check.getDate() + 1);
    const r = checkHoliday(stateCode, check);
    if (r.holiday && r.category !== 'weekend') {
      results.push({ date: new Date(check), name: r.name, daysFrom: i });
    }
  }
  return results;
}

// ---- CROWD REPORTING ----
function getCrowdReports() {
  try { return JSON.parse(localStorage.getItem('bhCrowdReports') || '{}'); } catch { return {}; }
}
function submitCrowdReport(stateCode, dateStr, isHoliday) {
  const key = `${stateCode}-${dateStr}`;
  const userKey = `bhVoted-${key}`;
  if (localStorage.getItem(userKey)) return false;
  const reports = getCrowdReports();
  if (!reports[key]) reports[key] = { dry: 0, notDry: 0 };
  if (isHoliday) reports[key].dry++; else reports[key].notDry++;
  localStorage.setItem('bhCrowdReports', JSON.stringify(reports));
  localStorage.setItem(userKey, '1');
  return true;
}
function getCrowdCount(stateCode, dateStr) {
  const key = `${stateCode}-${dateStr}`;
  const r = getCrowdReports()[key];
  return r ? r : { dry: 0, notDry: 0 };
}

// ---- ADMIN OVERRIDES ----
const ADMIN_PASSWORD = 'holiday2026';
function getAdminOverrides() {
  try { return JSON.parse(localStorage.getItem('bhAdminOverrides') || '[]'); } catch { return []; }
}
function addAdminOverride(pwd, date, state, name, note) {
  if (pwd !== ADMIN_PASSWORD) return { ok: false, msg: 'Wrong password.' };
  if (!date || !name) return { ok: false, msg: 'Date and holiday name are required.' };
  const overrides = getAdminOverrides();
  overrides.push({ date, state: state || 'ALL', name, note: note || '' });
  localStorage.setItem('bhAdminOverrides', JSON.stringify(overrides));
  return { ok: true };
}
function deleteAdminOverride(idx) {
  const overrides = getAdminOverrides();
  overrides.splice(idx, 1);
  localStorage.setItem('bhAdminOverrides', JSON.stringify(overrides));
}

// ---- HELPERS ----
function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}
function formatDateHuman(date) {
  return date.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
