/* ============================================
   IS IT A BANK HOLIDAY TODAY? — DATA
   India + International
   ============================================ */

// ---- HOLIDAY COPY ----
const HOLIDAY_QUIPS = [
  "The bank is closed. Your excuses are open.",
  "Officially sanctioned laziness. Make the most of it.",
  "Government-approved doing absolutely nothing.",
  "Today's forecast: 0% productivity, 100% valid.",
  "The suits are off. The pajamas are on.",
  "Even money needs a day off. Why don't you?",
  "All transactions suspended. Including being a functional adult.",
  "The economy is on a break. Join it.",
  "No spreadsheets were harmed today. Legally.",
  "You woke up on the right side of the calendar.",
  "The ATM is judging you. But it's also closed. So.",
  "Your out-of-office wrote itself this morning.",
];

const WORK_SHAMES = [
  { main: "GO WORK,\nYOU LAZY ASS.", sub: "The bank is open. Your boss is watching. Put the phone down." },
  { main: "NICE TRY.\nNOW GET BACK\nTO YOUR DESK.", sub: "No holiday here. This tab will not save you from the 9am standup." },
  { main: "SIR THIS IS\nA WORK DAY.", sub: "The economy needs you. Or at least your company needs your Jira tickets updated." },
  { main: "CLOSE THIS\nTAB IMMEDIATELY.", sub: "We clocked you. Your manager didn't, yet. Move fast." },
  { main: "NOT TODAY,\nSLACKER.", sub: "It is, in fact, a regular Tuesday. You have emails. Open them." },
  { main: "THE BANKS\nAREOPEN.\nSO ARE YOURS.", sub: "No excuse today. Back to the grind, bestie." },
  { main: "YOUR\nLAPTOP\nIS WATCHING.", sub: "Close this. Open Slack. Pretend you've been there all morning." },
];

const GAME_OVER_QUIPS = {
  whackamole: [
    "Your boss would not approve of that reflexes display.",
    "Slightly more productive than a Monday morning stand-up.",
    "The bosses will return. They always return.",
    "Therapy, but faster. And with more clicking.",
  ],
  snake: [
    "You ate the wrong email. Classic.",
    "Growth mindset. Until you ran into yourself.",
    "The snake represents scope creep. It always wins.",
    "Legend has it someone once reached 50. No evidence survives.",
  ],
  typingtest: [
    "Words per minute > your report turnaround time.",
    "Fast fingers, slow TPS reports.",
    "You type faster than you reply to emails. Noted.",
    "HR has been informed of your WPM. It's impressive.",
  ],
};

// ---- COUNTRIES / HOLIDAY DATABASE ----
// Each rule: { country, countryLabel, flag, check(date) -> { holiday: bool, name?: string, note?: string } | null }

const HOLIDAY_RULES = [

  // ================================================================
  // INDIA
  // ================================================================
  {
    country: "IN", countryLabel: "India", flag: "🇮🇳",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const y = date.getFullYear();

      const fixed = [
        [1, 26, "Republic Day", "India's constitution came into force on this day in 1950. Parades, national pride, bank queues."],
        [8, 15, "Independence Day", "Independence from British rule, 1947. Flag hoisting, speeches, closed banks."],
        [10, 2, "Gandhi Jayanti", "Mahatma Gandhi's birthday. National holiday. Non-violence. Very closed banks."],
        [11, 1, "Karnataka Rajyotsava", "Karnataka formation day. State holiday in Karnataka."],
      ];

      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      // Approximate moveable feasts (simplified for demo)
      // Holi — varies, roughly March
      // Diwali — varies, roughly Oct/Nov
      // Eid — varies

      return { holiday: false };
    }
  },

  // ================================================================
  // UNITED KINGDOM
  // ================================================================
  {
    country: "GB", countryLabel: "United Kingdom", flag: "🇬🇧",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const y = date.getFullYear();
      const dow = date.getDay(); // 0=Sun, 1=Mon

      // Fixed UK bank holidays
      const fixed = [
        [1, 1, "New Year's Day", "The first hangover of the year, legally protected."],
        [12, 25, "Christmas Day", "Banks closed. Everything closed. Mince pies, however, are very much open."],
        [12, 26, "Boxing Day", "Day after Christmas. Still a holiday. Still closed. Leftovers: open."],
      ];
      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      // Easter (approximate — Good Friday & Easter Monday vary)
      // Good Friday: Friday before Easter Sunday
      // Easter Monday: Monday after Easter Sunday
      const easter = getEasterDate(y);
      const goodFriday = new Date(easter); goodFriday.setDate(goodFriday.getDate() - 2);
      const easterMonday = new Date(easter); easterMonday.setDate(easterMonday.getDate() + 1);

      if (sameDay(date, goodFriday)) return { holiday: true, name: "Good Friday", note: "No hot cross buns at the bank. The bank is closed." };
      if (sameDay(date, easterMonday)) return { holiday: true, name: "Easter Monday", note: "Easter hangover, officially recognised." };

      // Early May Bank Holiday (first Monday in May)
      if (m === 5 && dow === 1 && d <= 7) return { holiday: true, name: "Early May Bank Holiday", note: "First Monday of May. Great British weather. Closed banks." };
      // Spring Bank Holiday (last Monday in May)
      if (m === 5 && dow === 1 && d >= 25) return { holiday: true, name: "Spring Bank Holiday", note: "Last Monday of May. BBQ weather, allegedly." };
      // Summer Bank Holiday (last Monday in August)
      if (m === 8 && dow === 1 && d >= 25) return { holiday: true, name: "Summer Bank Holiday", note: "Last Monday of August. The unofficial end of summer." };

      return { holiday: false };
    }
  },

  // ================================================================
  // USA
  // ================================================================
  {
    country: "US", countryLabel: "United States", flag: "🇺🇸",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const y = date.getFullYear();
      const dow = date.getDay();

      const fixed = [
        [1, 1, "New Year's Day", "Recovering from New Year's Eve, federally."],
        [7, 4, "Independence Day", "Fireworks, BBQ, and very closed federal buildings."],
        [11, 11, "Veterans Day", "Honoring U.S. veterans. Banks respect their service by staying shut."],
        [12, 25, "Christmas Day", "Federally mandated holiday. Banks closed. Santa: open for business."],
      ];
      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      // MLK Day — 3rd Monday in January
      if (m === 1 && dow === 1 && d >= 15 && d <= 21) return { holiday: true, name: "Martin Luther King Jr. Day", note: "Honoring the civil rights leader. Banks closed nationwide." };
      // Presidents' Day — 3rd Monday in February
      if (m === 2 && dow === 1 && d >= 15 && d <= 21) return { holiday: true, name: "Presidents' Day", note: "Celebrating past presidents. Mattress sales: also open." };
      // Memorial Day — Last Monday in May
      if (m === 5 && dow === 1 && d >= 25) return { holiday: true, name: "Memorial Day", note: "Honoring fallen military. Unofficial start of summer." };
      // Juneteenth
      if (m === 6 && d === 19) return { holiday: true, name: "Juneteenth", note: "Commemorating the emancipation of enslaved Americans." };
      // Labor Day — 1st Monday in September
      if (m === 9 && dow === 1 && d <= 7) return { holiday: true, name: "Labor Day", note: "For the workers. Ironically, they usually have to work it." };
      // Columbus Day — 2nd Monday in October
      if (m === 10 && dow === 1 && d >= 8 && d <= 14) return { holiday: true, name: "Columbus Day", note: "Federal holiday. Banks closed. Debates about the holiday: very much open." };
      // Thanksgiving — 4th Thursday in November
      if (m === 11 && dow === 4 && d >= 22 && d <= 28) return { holiday: true, name: "Thanksgiving", note: "Turkey day. Family, football, awkward conversations, closed banks." };

      return { holiday: false };
    }
  },

  // ================================================================
  // GERMANY
  // ================================================================
  {
    country: "DE", countryLabel: "Germany", flag: "🇩🇪",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const y = date.getFullYear();

      const fixed = [
        [1, 1, "Neujahrstag", "New Year's Day. Recovering from Silvester."],
        [5, 1, "Tag der Arbeit", "Labour Day. Workers rest. Banks: also resting."],
        [10, 3, "Tag der Deutschen Einheit", "German Unity Day. Celebrating reunification since 1990."],
        [12, 25, "1. Weihnachtstag", "Christmas Day. Stollen, closed banks, full hearts."],
        [12, 26, "2. Weihnachtstag", "Second day of Christmas. Germany takes the full two."],
      ];
      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      const easter = getEasterDate(y);
      const goodFriday = new Date(easter); goodFriday.setDate(goodFriday.getDate() - 2);
      const easterMonday = new Date(easter); easterMonday.setDate(easterMonday.getDate() + 1);
      const ascension = new Date(easter); ascension.setDate(ascension.getDate() + 39);
      const whitsun = new Date(easter); whitsun.setDate(whitsun.getDate() + 49);
      const whitMonday = new Date(easter); whitMonday.setDate(whitMonday.getDate() + 50);

      if (sameDay(date, goodFriday)) return { holiday: true, name: "Karfreitag", note: "Good Friday. Quiet, reflective, very closed." };
      if (sameDay(date, easterMonday)) return { holiday: true, name: "Ostermontag", note: "Easter Monday. Banks remain horizontal." };
      if (sameDay(date, ascension)) return { holiday: true, name: "Christi Himmelfahrt", note: "Ascension Day. Also Father's Day in Germany. Outdoors, beer, closed banks." };
      if (sameDay(date, whitMonday)) return { holiday: true, name: "Pfingstmontag", note: "Whit Monday. The second day of Pentecost. Tranquil and cashier-free." };

      return { holiday: false };
    }
  },

  // ================================================================
  // AUSTRALIA
  // ================================================================
  {
    country: "AU", countryLabel: "Australia", flag: "🇦🇺",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const y = date.getFullYear();
      const dow = date.getDay();

      const fixed = [
        [1, 1, "New Year's Day", "Recovering from New Year's. In summer, mind you."],
        [1, 26, "Australia Day", "National Day. BBQ, beach, and closed banks."],
        [4, 25, "ANZAC Day", "Honoring Australian and New Zealand Army Corps. Dawn services, closed banks."],
        [12, 25, "Christmas Day", "Hot Christmas, Australian tradition. Prawns and closed banks."],
        [12, 26, "Boxing Day", "Rightfully a holiday everywhere. Australia agrees."],
      ];
      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      const easter = getEasterDate(y);
      const goodFriday = new Date(easter); goodFriday.setDate(goodFriday.getDate() - 2);
      const easterSaturday = new Date(easter); easterSaturday.setDate(easterSaturday.getDate() - 1);
      const easterMonday = new Date(easter); easterMonday.setDate(easterMonday.getDate() + 1);

      if (sameDay(date, goodFriday)) return { holiday: true, name: "Good Friday", note: "Easter begins. Banks: out of the office." };
      if (sameDay(date, easterSaturday)) return { holiday: true, name: "Easter Saturday", note: "Australia gives you Saturday too. Generous country." };
      if (sameDay(date, easterMonday)) return { holiday: true, name: "Easter Monday", note: "Easter ends. Banks: still out of the office." };

      // Queen's Birthday — 2nd Monday in June (most states)
      if (m === 6 && dow === 1 && d >= 8 && d <= 14) return { holiday: true, name: "King's Birthday", note: "State holiday in most Australian states. Honour the Crown. Ignore the ATM." };

      return { holiday: false };
    }
  },

  // ================================================================
  // CANADA
  // ================================================================
  {
    country: "CA", countryLabel: "Canada", flag: "🇨🇦",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      const y = date.getFullYear();
      const dow = date.getDay();

      const fixed = [
        [1, 1, "New Year's Day", "Year one. Banks zero."],
        [7, 1, "Canada Day", "Happy Birthday, Canada. Banks closed."],
        [11, 11, "Remembrance Day", "Honouring veterans. Two-minute silence. Banks: extended silence."],
        [12, 25, "Christmas Day", "Banks closed. Toques on. Poutine optional."],
        [12, 26, "Boxing Day", "Sales, and absolutely no banking."],
      ];
      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      const easter = getEasterDate(y);
      const goodFriday = new Date(easter); goodFriday.setDate(goodFriday.getDate() - 2);
      const easterMonday = new Date(easter); easterMonday.setDate(easterMonday.getDate() + 1);

      if (sameDay(date, goodFriday)) return { holiday: true, name: "Good Friday", note: "Easter long weekend begins." };
      if (sameDay(date, easterMonday)) return { holiday: true, name: "Easter Monday", note: "Easter long weekend ends. Reluctantly." };

      // Victoria Day — Last Monday before May 25
      if (m === 5 && dow === 1 && d >= 18 && d <= 24) return { holiday: true, name: "Victoria Day", note: "Unofficially the start of summer in Canada. Fireworks. Banks closed." };
      // Labour Day — 1st Monday in September
      if (m === 9 && dow === 1 && d <= 7) return { holiday: true, name: "Labour Day", note: "For the workers. Except bank workers. They just get the day off." };
      // Thanksgiving — 2nd Monday in October
      if (m === 10 && dow === 1 && d >= 8 && d <= 14) return { holiday: true, name: "Thanksgiving", note: "Canadian Thanksgiving. November is for Americans." };

      return { holiday: false };
    }
  },

  // ================================================================
  // JAPAN
  // ================================================================
  {
    country: "JP", countryLabel: "Japan", flag: "🇯🇵",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();

      const fixed = [
        [1, 1, "元日 New Year's Day", "Oshōgatsu. The most important holiday. Banks very closed. Mochi: very open."],
        [2, 11, "建国記念の日 National Foundation Day", "Commemorating the founding of Japan. Banks closed."],
        [2, 23, "天皇誕生日 Emperor's Birthday", "Birthday of Emperor Naruhito. National holiday."],
        [4, 29, "昭和の日 Shōwa Day", "Start of Golden Week. Four holidays in a row. Japanese banks hibernate."],
        [5, 3, "憲法記念日 Constitution Memorial Day", "Golden Week continues. Banks still hibernating."],
        [5, 4, "みどりの日 Greenery Day", "Golden Week. Third day. Banks: still very much asleep."],
        [5, 5, "こどもの日 Children's Day", "Golden Week finale. Even children get the day off."],
        [8, 11, "山の日 Mountain Day", "The day to appreciate mountains. Banks: taking the mountain road out."],
        [11, 3, "文化の日 Culture Day", "Celebrating culture, arts, freedom, and closed banks."],
        [11, 23, "勤労感謝の日 Labour Thanksgiving Day", "Honouring labour. By not doing any."],
        [12, 31, "大晦日 New Year's Eve", "Banks close for the year. Farewell, ATMs."],
      ];

      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      return { holiday: false };
    }
  },

  // ================================================================
  // UAE
  // ================================================================
  {
    country: "AE", countryLabel: "United Arab Emirates", flag: "🇦🇪",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();

      const fixed = [
        [1, 1, "New Year's Day", "The UAE joins the global tradition of recovering from New Year's Eve."],
        [12, 2, "UAE National Day", "Commemorating the formation of the UAE in 1971. Two days off."],
        [12, 3, "UAE National Day (Day 2)", "The UAE gives itself two days. Fair enough."],
      ];

      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      return { holiday: false };
    }
  },

  // ================================================================
  // SINGAPORE
  // ================================================================
  {
    country: "SG", countryLabel: "Singapore", flag: "🇸🇬",
    check: (date) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();

      const fixed = [
        [1, 1, "New Year's Day", "Hawker centres: open. Banks: closed."],
        [5, 1, "Labour Day", "Workers rest. Banks join them."],
        [8, 9, "National Day", "Singapore's independence. Parades, fireworks, closed banks."],
        [12, 25, "Christmas Day", "Orchard Road lit up. Banks off."],
      ];

      for (const [hm, hd, name, note] of fixed) {
        if (m === hm && d === hd) return { holiday: true, name, note };
      }

      return { holiday: false };
    }
  },
];

// ---- NEXT HOLIDAY FINDER ----
function getNextHoliday(countryCode, fromDate) {
  const rules = HOLIDAY_RULES.find(r => r.country === countryCode);
  if (!rules) return null;

  const check = new Date(fromDate);
  for (let i = 1; i <= 365; i++) {
    check.setDate(check.getDate() + 1);
    const result = rules.check(check);
    if (result && result.holiday) {
      return {
        date: new Date(check),
        name: result.name,
        daysFrom: i,
      };
    }
  }
  return null;
}

// ---- EASTER DATE (Anonymous Gregorian algorithm) ----
function getEasterDate(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth() === b.getMonth() &&
         a.getDate() === b.getDate();
}

// ---- COUNTRY GRID DATA ----
const COUNTRY_GRID = [
  { code: "IN", label: "India", flag: "🇮🇳" },
  { code: "GB", label: "United Kingdom", flag: "🇬🇧" },
  { code: "US", label: "United States", flag: "🇺🇸" },
  { code: "DE", label: "Germany", flag: "🇩🇪" },
  { code: "AU", label: "Australia", flag: "🇦🇺" },
  { code: "CA", label: "Canada", flag: "🇨🇦" },
  { code: "JP", label: "Japan", flag: "🇯🇵" },
  { code: "AE", label: "UAE", flag: "🇦🇪" },
  { code: "SG", label: "Singapore", flag: "🇸🇬" },
];
