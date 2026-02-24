/**
 * domains/math/mathDailyConfig.ts
 *
 * Math-specific daily challenge configuration.
 * Moved from dailyChallenge.ts so other domains can define their own.
 */
import type { QuestionType } from './mathCategories';

/** Number of problems in a daily or challenge set */
export const DAILY_COUNT = 10;

/** Question types sampled for daily / challenge sets */
export const DAILY_TYPES: QuestionType[] = [
    'add', 'subtract', 'multiply', 'divide', 'square', 'sqrt',
];
