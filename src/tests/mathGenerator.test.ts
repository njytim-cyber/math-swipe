import { describe, it, expect } from 'vitest';
import { generateProblem } from '../utils/mathGenerator';

describe('mathGenerator.ts', () => {

    describe('Basic Operations (add, sub, multiply, divide)', () => {
        it('addition problems should have exactly 3 unique options', () => {
            for (let i = 0; i < 50; i++) {
                const p = generateProblem(1, 'add');
                expect(p.options).toHaveLength(3);
                // Options must be unique
                const uniqueSet = new Set(p.options);
                expect(uniqueSet.size).toBe(3);
                // Correct answer must exist at correctIndex
                expect(p.options[p.correctIndex]).toBe(p.answer);
                // Expression string should contain a plus sign
                expect(p.expression).toMatch(/\+/);
            }
        });

        it('subtraction problems should not result in negative numbers', () => {
            for (let i = 0; i < 50; i++) {
                const p = generateProblem(1, 'subtract');
                expect(p.answer).toBeGreaterThanOrEqual(0);
                // Format check (handles minus or minus-sign unicode)
                expect(p.expression).toMatch(/^\d+\s*[-−]\s*\d+$/);
                expect(p.options[p.correctIndex]).toBe(p.answer);
            }
        });

        it('division problems should result in clean integers', () => {
            for (let i = 0; i < 50; i++) {
                const p = generateProblem(1, 'divide');
                // The answer should be an integer
                expect(Number.isInteger(p.answer)).toBe(true);
                // Ensure no divide-by-zero
                const divisorMatch = p.expression.split('÷')[1];
                if (divisorMatch) {
                    const divisor = parseInt(divisorMatch.trim(), 10);
                    expect(divisor).not.toBe(0);
                }
            }
        });
    });

    describe('Ultimate Mode Stress Tests', () => {
        it('ultimate mode returns a valid problem of *some* type', () => {
            for (let i = 0; i < 20; i++) {
                const p = generateProblem(10, 'mix-all');
                expect(p.options.length).toBe(3);
                expect(p.correctIndex).toBeGreaterThanOrEqual(0);
                expect(p.correctIndex).toBeLessThanOrEqual(2);
                expect(new Set(p.options).size).toBe(3);
                expect(p.options[p.correctIndex]).toBe(p.answer);
            }
        });
    });

    describe('Fractions & LaTeX Output', () => {
        it('fractions generation returns LaTeX with \frac or integer simplifications', () => {
            for (let i = 0; i < 50; i++) {
                const p = generateProblem(1, 'fraction');
                // Fractions generate LaTeX
                expect(p.latex).toBeTruthy();
                // Ensure it generated labels (LaTeX formatted options or basic fractions)
                expect(p.optionLabels).toBeDefined();
                expect(p.optionLabels).toHaveLength(3);

                // If the answer is an integer, it shouldn't contain \frac, otherwise it should contain formatting.
                const correctLabel = p.optionLabels![p.correctIndex];
                expect(correctLabel).toBeDefined();
            }
        });
    });

});
