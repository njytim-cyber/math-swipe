import type { ChalkState } from '../hooks/useGameLoop';
import type { QuestionType } from './questionTypes';

/** Context passed to the message picker so Mr. Chalk can be smart */
export interface ChalkContext {
    state: ChalkState;
    streak: number;
    totalAnswered: number;
    questionType: QuestionType;
    hardMode: boolean;
    timedMode: boolean;
}

// ── Base pools (expanded) ─────────────────────────────────────────

const BASE_IDLE = [
    'You got this! 💪', 'Take your time 🌟', 'I believe in you!',
    'Math is beautiful ✨', 'Focus mode: ON 🎯', 'Ready when you are!',
    'Let\'s gooo! 🚀', 'Deep breaths… here we go 🧘',
    'Your brain is warming up 🔥', 'Every problem is a win 🏅',
    'You\'re getting sharper! ✏️', 'Math muscles: flexed 💪',
];

const BASE_SUCCESS = [
    'AMAZING! 🎉', 'You\'re a genius! 🧠', 'Nailed it! ✅',
    'Brilliant work! ⭐', 'Unstoppable! 🔥', 'That was fast! ⚡',
    'Big brain energy! 🧠✨', 'Proud of you! 🥹',
    'Beautiful solve! 🎨', 'Like a calculator! 🖩',
    'Smooth! 🧈', 'Chef\'s kiss! 👨‍🍳', 'Math magic! 🪄',
    'Poetry in numbers! 📝', 'Textbook perfect! 📖',
];

const BASE_FAIL = [
    'Almost! Try again 💙', 'You\'ll get it! 🌈', 'Mistakes = learning! 📚',
    'Don\'t give up! 💪', 'So close! 🤏', 'Next one is yours! 🎯',
    'That\'s OK! Keep going 🌻', 'Learning moment! 💡',
    'Every mistake makes you stronger 🏋️', 'Shake it off! 🐕',
];

const BASE_STREAK = [
    'ON FIRE! 🔥🔥🔥', 'LEGENDARY! 👑', 'Can\'t be stopped! 🚀',
    'Math machine! ⚙️', 'Streeeeak! 🎸', 'Hall of fame material! 🏆',
    'You\'re INCREDIBLE! 💥', 'This is YOUR moment! 🌟',
    'The crowd goes wild! 📣', 'Unstoppable force! 🦸',
    'Making it look easy! ✨', 'On a roll! 🎳',
];

// ── Streak-scaled success messages ────────────────────────────────

const STREAK_EARLY = [  // 1–4
    'Great start! 🌱', 'Here we go! 🎯', 'Warming up! 🌤️',
    'Off to a great start! 🏃', 'Keep it coming! 🎵',
];

const STREAK_MID = [  // 5–9
    'Five strong! ✋', 'You\'re building something! 🧱',
    'Momentum! 🎢', 'Rolling! 🎲', 'Look at you go! 👀',
];

const STREAK_HIGH = [  // 10–19
    'DOUBLE DIGITS! 🔟🔥', 'You\'re on fire! 🔥',
    'Nothing can stop you! 🛡️', 'Math superstar! ⭐',
    'This is incredible! 🤩',
];

const STREAK_LEGENDARY = [  // 20+
    'Are you even human?! 🤖✨', 'TWENTY+! Absolute legend! 👑',
    'They\'ll write songs about this! 🎵', 'Historical performance! 📜',
    'This is a masterclass! 🎓',
];

// ── Topic-specific quips ──────────────────────────────────────────

const TOPIC_SUCCESS: Partial<Record<QuestionType, string[]>> = {
    add: ['Adding it up! ➕✨', 'Sum-thing special! 🌟'],
    subtract: ['Taking away the competition! ➖', 'Less is more! 🎯'],
    multiply: ['Multiplying your awesomeness! ✖️', 'Times tables champ! 🏆'],
    divide: ['Dividing and conquering! ➗', 'Fair share! 🍰'],
    square: ['Squared away! ²✨', 'Power move! 💪'],
    sqrt: ['Getting to the root of it! √', 'Radical solve! 🤙'],
    fraction: ['Fractions are your friends! ⅓', 'Piece of cake! 🍰'],
    decimal: ['Point taken! 🎯', 'Decimal dominator! 💯'],
    percent: ['100% awesome! 💯', 'Percent perfect! 📊'],
    linear: ['Solving for X like a pro! 🔍', 'X marks the spot! 🗺️'],
    'mix-basic': ['Mix master! 🎧', 'Jack of all trades! 🃏'],
    'mix-all': ['You can do EVERYTHING! 🌈', 'All-rounder! 🏅'],
};

const TOPIC_FAIL: Partial<Record<QuestionType, string[]>> = {
    add: ['Addition is sneaky sometimes! ➕', 'Those sums add up! 💙'],
    subtract: ['Subtraction can be tricky! 🤔', 'Almost had it! ➖'],
    multiply: ['Tables take practice! ✖️💪', 'You\'ll multiply your skills! 📈'],
    divide: ['Division is tough! Keep at it! ➗', 'You\'re dividing and learning! 📚'],
    square: ['Squares are powerful! You\'re getting there! ²', 'Power up next time! ⚡'],
    sqrt: ['Roots run deep! 🌱', 'You\'re growing stronger! √'],
    fraction: ['Fractions take practice! 🍕', 'One fraction at a time! 📐'],
    decimal: ['Decimals can be sneaky! 🔢', 'Keep your points sharp! ✏️'],
    percent: ['Percentages are tricky! 📊', 'Almost nailed that percent! 💪'],
    linear: ['Algebra takes patience! 🧩', 'X will reveal itself! 🔮'],
};

// ── Time-of-day ───────────────────────────────────────────────────

function getTimeMessages(): string[] {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return [
        'Morning math! ☀️', 'Rise and solve! 🌅', 'Brain fuel before lunch! 🧇',
    ];
    if (h >= 12 && h < 17) return [
        'Afternoon vibes! 🌤️', 'Post-lunch power! 🍱✨', 'Midday math break! ☕',
    ];
    if (h >= 17 && h < 22) return [
        'Evening practice! 🌆', 'Winding down with math! 🧘', 'Golden hour math! 🌅',
    ];
    return [
        'Late night math session! 🌙', 'Night owl vibes! 🦉', 'Burning the midnight chalk! 🕯️',
    ];
}

// ── Hard / Timed mode ──────────────────────────────────────────────

const HARD_MODE = [
    'Brave soul! 💀💪', 'Hard mode hero! 🦸', 'No fear! 🛡️',
    'Courage level: MAX! 🏔️',
];

const TIMED_MODE = [
    'Beat the clock! ⏱️', 'Speed demon! 🏎️', 'Time is ticking! ⚡',
    'Racing the stopwatch! 🏃‍♂️💨',
];

// ── Milestones ─────────────────────────────────────────────────────

const MILESTONES: Record<number, string[]> = {
    // totalAnswered milestones
    10: ['10 problems down! Just getting started! 🎬'],
    25: ['25 already! You\'re in the zone! 🎯'],
    50: ['FIFTY! Half a century of math! 🎉'],
    100: ['💯 ONE HUNDRED! You\'re a legend! 👑'],
    200: ['200!! Math marathon champion! 🏃‍♂️🏆'],
};

const STREAK_MILESTONES: Record<number, string[]> = {
    3: ['Three in a row! 🎯'],
    5: ['High five! ✋🔥'],
    10: ['TEN!! Double digits! 🔟🎉'],
    15: ['Fifteen! Halfway to greatness! 🌟'],
    20: ['TWENTY! You\'re a math legend! 👑'],
    30: ['THIRTY?! This is unreal! 🤯'],
    50: ['FIFTY STREAK?! I\'m speechless! 🏆✨'],
};

// ── Easter eggs (rare) ─────────────────────────────────────────────

const EASTER_EGGS = [
    'Fun fact: 111,111,111 × 111,111,111 = a palindrome! 🤯',
    'Did you know? A pizza has a radius "z" and height "a", so its volume is pi·z·z·a! 🍕',
    'Math tip: 6 × 9 = 42 in base 13! 🌌',
    'If math was a sport, you\'d be MVP! 🏅',
    'Mr. Chalk thinks you\'re awesome! That\'s a fact, not an opinion! 📝',
    'Your math skills are growing like compound interest! 📈',
    'I asked the calculator and it agrees: you\'re brilliant! 🖩',
    'Parallel lines have so much in common… it\'s a shame they\'ll never meet 🥲',
];

// ── Picker logic ───────────────────────────────────────────────────

let lastMessage = '';

function pick(arr: string[]): string {
    const filtered = arr.filter(m => m !== lastMessage);
    const choice = filtered[Math.floor(Math.random() * filtered.length)] || arr[0];
    lastMessage = choice;
    return choice;
}

function chance(pct: number): boolean {
    return Math.random() * 100 < pct;
}

/**
 * Context-aware message picker for Mr. Chalk.
 * Layers are evaluated in priority order — first match wins.
 */
export function pickChalkMessage(ctx: ChalkContext): string {
    const { state, streak, totalAnswered, questionType, hardMode, timedMode } = ctx;

    // 1. Easter eggs (2% chance, any state)
    if (chance(2)) return pick(EASTER_EGGS);

    // 2. Session milestones (exact thresholds, on success only)
    if (state === 'success' && MILESTONES[totalAnswered]) {
        return pick(MILESTONES[totalAnswered]);
    }

    // 3. Streak milestones (exact thresholds)
    if ((state === 'success' || state === 'streak') && STREAK_MILESTONES[streak]) {
        return pick(STREAK_MILESTONES[streak]);
    }

    // 4. Time-of-day (10% chance on idle)
    if (state === 'idle' && chance(10)) {
        return pick(getTimeMessages());
    }

    // 5. Hard/timed mode acknowledgement (15% chance)
    if (state === 'success' && hardMode && chance(15)) return pick(HARD_MODE);
    if (state === 'success' && timedMode && chance(15)) return pick(TIMED_MODE);

    // 6. Topic-specific (25% chance on success/fail)
    if (state === 'success' && chance(25)) {
        const pool = TOPIC_SUCCESS[questionType];
        if (pool) return pick(pool);
    }
    if (state === 'fail' && chance(25)) {
        const pool = TOPIC_FAIL[questionType];
        if (pool) return pick(pool);
    }

    // 7. Streak-scaled success messages
    if (state === 'success') {
        if (streak >= 20) return pick(STREAK_LEGENDARY);
        if (streak >= 10) return pick(STREAK_HIGH);
        if (streak >= 5) return pick(STREAK_MID);
        if (streak >= 1) return chance(40) ? pick(STREAK_EARLY) : pick(BASE_SUCCESS);
    }

    // 8. Base pools (fallback)
    switch (state) {
        case 'idle': return pick(BASE_IDLE);
        case 'success': return pick(BASE_SUCCESS);
        case 'fail': return pick(BASE_FAIL);
        case 'streak': return pick(BASE_STREAK);
        default: return pick(BASE_IDLE);
    }
}
