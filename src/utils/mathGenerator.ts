export type QuestionType = 'add' | 'subtract' | 'multiply' | 'divide' | 'square' | 'sqrt';

export interface Problem {
    id: number;
    expression: string;
    answer: number;
    options: number[];     // 3 shuffled choices
    correctIndex: number;  // which index in options[] is the answer
    startTime?: number;
}

/**
 * Difficulty levels scale the range of operands.
 * Each question type adapts its own sensible ranges.
 */
export function generateProblem(difficulty: number, type: QuestionType = 'multiply'): Problem {
    switch (type) {
        case 'add': return genAdd(difficulty);
        case 'subtract': return genSubtract(difficulty);
        case 'multiply': return genMultiply(difficulty);
        case 'divide': return genDivide(difficulty);
        case 'square': return genSquare(difficulty);
        case 'sqrt': return genSqrt(difficulty);
    }
}

// ── Generators ──────────────────────────────────────────

function genAdd(d: number): Problem {
    const [lo, hi] = addRange(d);
    const a = randInt(lo, hi), b = randInt(lo, hi);
    return pack(`${a} + ${b}`, a + b, nearDistractors);
}

function genSubtract(d: number): Problem {
    const [lo, hi] = addRange(d);
    let a = randInt(lo, hi), b = randInt(lo, hi);
    if (a < b) [a, b] = [b, a]; // keep positive
    return pack(`${a} − ${b}`, a - b, nearDistractors);
}

function genMultiply(d: number): Problem {
    const [minA, maxA, minB, maxB] = mulRange(d);
    const a = randInt(minA, maxA), b = randInt(minB, maxB);
    const flip = Math.random() > 0.5;
    return pack(flip ? `${b} × ${a}` : `${a} × ${b}`, a * b, (ans) => mulDistractors(a, b, ans));
}

function genDivide(d: number): Problem {
    const [minA, maxA, minB, maxB] = mulRange(d);
    const a = randInt(minA, maxA), b = randInt(minB, maxB);
    const product = a * b;
    return pack(`${product} ÷ ${b}`, a, nearDistractors);
}

function genSquare(d: number): Problem {
    const max = d <= 2 ? 9 : d <= 4 ? 12 : 15;
    const n = randInt(2, max);
    return pack(`${n}²`, n * n, nearDistractors);
}

function genSqrt(d: number): Problem {
    const max = d <= 2 ? 9 : d <= 4 ? 12 : 15;
    const n = randInt(2, max);
    return pack(`√${n * n}`, n, nearDistractors);
}

// ── Ranges ──────────────────────────────────────────────

function addRange(d: number): [number, number] {
    if (d <= 1) return [2, 20];
    if (d <= 2) return [5, 50];
    if (d <= 3) return [10, 100];
    if (d <= 4) return [20, 200];
    return [50, 500];
}

function mulRange(d: number): [number, number, number, number] {
    if (d <= 1) return [2, 5, 2, 5];
    if (d <= 2) return [2, 9, 2, 9];
    if (d <= 3) return [3, 9, 6, 12];
    if (d <= 4) return [6, 12, 8, 15];
    return [10, 15, 10, 15];
}

// ── Distractor strategies ───────────────────────────────

function nearDistractors(answer: number): [number, number] {
    const used = new Set<number>([answer]);
    const result: number[] = [];
    let safety = 0;
    while (result.length < 2 && safety < 50) {
        safety++;
        const offset = randInt(1, Math.max(3, Math.floor(answer * 0.15)));
        const d = answer + (Math.random() > 0.5 ? offset : -offset);
        if (d > 0 && !used.has(d)) { used.add(d); result.push(d); }
    }
    while (result.length < 2) { result.push(answer + result.length + 1); }
    return [result[0], result[1]];
}

function mulDistractors(a: number, b: number, answer: number): [number, number] {
    const used = new Set<number>([answer]);
    const result: number[] = [];
    const strategies = [
        () => (a + (Math.random() > 0.5 ? 1 : -1)) * b,
        () => a * (b + (Math.random() > 0.5 ? 1 : -1)),
        () => answer + (Math.random() > 0.5 ? a : -a),
        () => answer + (Math.random() > 0.5 ? b : -b),
        () => answer + randInt(-5, 5),
    ];
    let safety = 0;
    while (result.length < 2 && safety < 50) {
        safety++;
        const d = strategies[randInt(0, strategies.length - 1)]();
        if (d > 0 && !used.has(d)) { used.add(d); result.push(d); }
    }
    while (result.length < 2) { result.push(answer + result.length + 1); }
    return [result[0], result[1]];
}

// ── Helpers ─────────────────────────────────────────────

function pack(
    expression: string,
    answer: number,
    distractorFn: (ans: number) => [number, number],
): Problem {
    const distractors = distractorFn(answer);
    const correctIndex = randInt(0, 2);
    const options: number[] = [...distractors];
    options.splice(correctIndex, 0, answer);
    return { id: Date.now() + Math.random(), expression, answer, options, correctIndex };
}

function randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
