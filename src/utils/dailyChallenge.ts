/**
 * utils/dailyChallenge.ts
 *
 * Seeded daily and challenge generators.
 * Math-specific constants (DAILY_COUNT, DAILY_TYPES) imported from math domain.
 * The functions themselves are domain-agnostic in signature.
 */
import { createSeededRng, dateSeed, stringSeed } from './seededRng';
import { generateProblem, type Problem } from './mathGenerator';
import { DAILY_COUNT, DAILY_TYPES } from '../domains/math/mathDailyConfig';

/** Forward-compat alias so callers can use EngineItem in the future */
export type { Problem };

/**
 * Generate today's daily challenge — same N problems for everyone.
 * Uses a date-seeded RNG so every player gets the same set.
 */
export function generateDailyChallenge(): { problems: Problem[]; dateLabel: string } {
    const today = new Date();
    const seed = dateSeed(today);
    const rng = createSeededRng(seed);

    const problems: Problem[] = [];
    for (let i = 0; i < DAILY_COUNT; i++) {
        const type = DAILY_TYPES[Math.floor(rng() * DAILY_TYPES.length)];
        const difficulty = 2 + Math.floor(i / 3);
        problems.push(generateProblem(difficulty, type, false, rng));
    }
    problems.forEach((p, i) => { p.id = `daily-${seed}-${i}`; });
    return {
        problems,
        dateLabel: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
}

/**
 * Generate a challenge from a seed string (e.g., from a URL param).
 * Same seed → same problems for both players.
 */
export function generateChallenge(challengeId: string): Problem[] {
    const seed = stringSeed(challengeId);
    const rng = createSeededRng(seed);

    const problems: Problem[] = [];
    for (let i = 0; i < DAILY_COUNT; i++) {
        const type = DAILY_TYPES[Math.floor(rng() * DAILY_TYPES.length)];
        const difficulty = 2 + Math.floor(i / 3);
        problems.push(generateProblem(difficulty, type, false, rng));
    }
    problems.forEach((p, i) => { p.id = `challenge-${seed}-${i}`; });
    return problems;
}

/** Create a short challenge ID from current timestamp */
export function createChallengeId(): string {
    return Date.now().toString(36);
}
