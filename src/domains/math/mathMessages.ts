/**
 * domains/math/mathMessages.ts
 *
 * Math-specific companion message pools.
 * Injected into the generic chalkMessages picker via the `overrides` parameter.
 */
import type { QuestionType } from './mathCategories';
import type { ChalkMessageOverrides } from '../../utils/chalkMessages';

// ── Topic-specific quips ──────────────────────────────────────────────────────

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

// ── Math-specific Easter eggs ─────────────────────────────────────────────────

const MATH_EASTER_EGGS: string[] = [
    'Fun fact: 111,111,111 × 111,111,111 = a palindrome! 🤯',
    'Did you know? A pizza has a radius "z" and height "a", so its volume is pi·z·z·a! 🍕',
    'Math tip: 6 × 9 = 42 in base 13! 🌌',
    'If math was a sport, you\'d be MVP! 🏅',
    'Mr. Chalk thinks you\'re awesome! That\'s a fact, not an opinion! 📝',
    'Your math skills are growing like compound interest! 📈',
    'I asked the calculator and it agrees: you\'re brilliant! 🖩',
    'Parallel lines have so much in common… it\'s a shame they\'ll never meet 🥲',
];

// ── Exported overrides object ─────────────────────────────────────────────────

/**
 * Inject these overrides when calling `pickChalkMessage` so the generic
 * companion gets math-flavoured quips.
 */
export const MATH_MESSAGE_OVERRIDES: ChalkMessageOverrides = {
    topicSuccess: (typeId: string) => TOPIC_SUCCESS[typeId as QuestionType] ?? null,
    topicFail: (typeId: string) => TOPIC_FAIL[typeId as QuestionType] ?? null,
    easterEggs: MATH_EASTER_EGGS,
};
