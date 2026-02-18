import { createSeededRng, dateSeed, stringSeed } from './seededRng';
import { generateProblem, type Problem, type QuestionType } from './mathGenerator';

const DAILY_COUNT = 10;
const DAILY_TYPES: QuestionType[] = ['add', 'subtract', 'multiply', 'divide', 'square', 'sqrt'];

/**
 * Generate today's daily challenge — same 10 problems for everyone.
 * Uses a seeded RNG keyed to the date so every player gets the same set.
 */
export function generateDailyChallenge(): { problems: Problem[]; dateLabel: string } {
    const today = new Date();
    const seed = dateSeed(today);
    const rng = createSeededRng(seed);

    // Temporarily replace Math.random with our seeded version
    const origRandom = Math.random;
    Math.random = rng;

    try {
        const problems: Problem[] = [];
        for (let i = 0; i < DAILY_COUNT; i++) {
            const type = DAILY_TYPES[Math.floor(rng() * DAILY_TYPES.length)];
            const difficulty = 2 + Math.floor(i / 3); // ramp from 2 to 5
            problems.push(generateProblem(difficulty, type, false));
        }
        // Assign sequential IDs for stability
        problems.forEach((p, i) => { p.id = seed + i; });
        return {
            problems,
            dateLabel: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        };
    } finally {
        Math.random = origRandom;
    }
}

/**
 * Generate a challenge from a seed string (e.g., from a URL param).
 * Same seed → same 10 problems, so two players can compete.
 */
export function generateChallenge(challengeId: string): Problem[] {
    const seed = stringSeed(challengeId);
    const rng = createSeededRng(seed);

    const origRandom = Math.random;
    Math.random = rng;

    try {
        const problems: Problem[] = [];
        for (let i = 0; i < DAILY_COUNT; i++) {
            const type = DAILY_TYPES[Math.floor(rng() * DAILY_TYPES.length)];
            const difficulty = 2 + Math.floor(i / 3);
            problems.push(generateProblem(difficulty, type, false));
        }
        problems.forEach((p, i) => { p.id = seed + i; });
        return problems;
    } finally {
        Math.random = origRandom;
    }
}

/** Create a short challenge ID from current timestamp */
export function createChallengeId(): string {
    return Date.now().toString(36);
}
