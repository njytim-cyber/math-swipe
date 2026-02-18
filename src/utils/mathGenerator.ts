export interface Problem {
    id: number;
    expression: string;
    answer: number;
    options: number[];     // 3 shuffled choices
    correctIndex: number;  // which index in options[] is the answer
    startTime?: number;
}

/**
 * Difficulty levels:
 *  1 = easy     (2-5) × (2-5)
 *  2 = normal   (2-9) × (2-9)
 *  3 = medium   (3-9) × (6-12)
 *  4 = hard     (6-12)× (8-15)
 *  5 = extreme  (10-15)×(10-15)
 */
export function generateProblem(difficulty: number): Problem {
    let minA = 2, maxA = 9, minB = 2, maxB = 9;

    switch (difficulty) {
        case 1: maxA = 5; maxB = 5; break;
        case 3: minA = 3; maxA = 9; minB = 6; maxB = 12; break;
        case 4: minA = 6; maxA = 12; minB = 8; maxB = 15; break;
        case 5: minA = 10; maxA = 15; minB = 10; maxB = 15; break;
        // default is level 2
    }

    const a = randInt(minA, maxA);
    const b = randInt(minB, maxB);
    const answer = a * b;

    // Build expression (randomly flip for variety)
    const flip = Math.random() > 0.5;
    const expression = flip ? `${b} × ${a}` : `${a} × ${b}`;

    // Generate 2 plausible distractors
    const distractors = generateDistractors(a, b, answer);

    // Shuffle answer into the options
    const correctIndex = randInt(0, 2);
    const options: number[] = [...distractors];
    options.splice(correctIndex, 0, answer);

    return {
        id: Date.now() + Math.random(),
        expression,
        answer,
        options,
        correctIndex,
    };
}

function generateDistractors(a: number, b: number, answer: number): [number, number] {
    const used = new Set<number>([answer]);
    const result: number[] = [];

    const strategies = [
        () => (a + (Math.random() > 0.5 ? 1 : -1)) * b,  // off-by-one on factor a
        () => a * (b + (Math.random() > 0.5 ? 1 : -1)),   // off-by-one on factor b
        () => answer + (Math.random() > 0.5 ? a : -a),     // off by one factor
        () => answer + (Math.random() > 0.5 ? b : -b),     // off by the other factor
        () => answer + randInt(-5, 5),                      // close random
    ];

    let safety = 0;
    while (result.length < 2 && safety < 50) {
        safety++;
        const strat = strategies[randInt(0, strategies.length - 1)];
        const d = strat();
        if (d > 0 && !used.has(d)) {
            used.add(d);
            result.push(d);
        }
    }

    // Fallback if we couldn't generate 2 unique distractors
    while (result.length < 2) {
        const d = answer + result.length + 1;
        if (!used.has(d)) { result.push(d); used.add(d); }
    }

    return [result[0], result[1]];
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
