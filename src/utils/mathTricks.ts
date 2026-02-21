/** Data structures defining the Math Magic curriculum */

export interface MagicTrick {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    icon: string;       // emoji icon
    // Lesson steps presented by Mr. Chalk
    lesson: {
        equation: string;   // e.g. "65 × 65"
        steps: string[];    // Array of string explanations
        result: string;     // The final answer shown
    };
    // Generator function for the rapid-fire practice barrage
    generatePractice: () => {
        expression: string;
        latex?: string;
        answer: number;
        options: number[];
        correctIndex: number;
    };
}

// Helper to bundle simple questions
function packTrick(expr: string, ans: number, off1: number, off2: number) {
    const opts = [ans, ans + off1, ans + off2].sort(() => Math.random() - 0.5);
    return {
        expression: expr,
        answer: ans,
        options: opts,
        correctIndex: opts.indexOf(ans)
    };
}

export const MAGIC_TRICKS: MagicTrick[] = [
    {
        id: 'square-5',
        title: 'Squaring Ends in 5',
        description: 'Instantly square numbers ending in 5',
        difficulty: 1,
        icon: '⚡',
        lesson: {
            equation: '65 × 65',
            steps: [
                'First, take the tens digit: 6',
                'Multiply it by the next number up: 6 × 7 = 42',
                'Finally, attach 25 to the end!',
                '42... 25... -> 4225'
            ],
            result: '4225'
        },
        generatePractice: () => {
            const tens = Math.floor(Math.random() * 9) + 1; // 1 to 9
            const num = tens * 10 + 5;
            const ans = num * num;
            return packTrick(`${num} × ${num}`, ans, 100, -100);
        }
    },
    {
        id: 'diff-squares',
        title: 'Difference of Squares',
        description: 'Multiply numbers equally spaced from a round number',
        difficulty: 2,
        icon: '🎯',
        lesson: {
            equation: '98 × 102',
            steps: [
                'Notice they are both 2 away from 100.',
                'This is (100 - 2) × (100 + 2).',
                'Which equals 100² - 2².',
                '10000 - 4'
            ],
            result: '9996'
        },
        generatePractice: () => {
            const base = [20, 30, 40, 50, 60, 100][Math.floor(Math.random() * 6)];
            const diff = Math.floor(Math.random() * 4) + 1;
            const n1 = base - diff;
            const n2 = base + diff;
            const ans = n1 * n2;
            return packTrick(`${n1} × ${n2}`, ans, diff * diff, -(diff * diff));
        }
    },
    {
        id: 'multiply-11',
        title: 'Rule of 11',
        description: 'Multiply any 2-digit number by 11 in seconds',
        difficulty: 1,
        icon: '🚀',
        lesson: {
            equation: '43 × 11',
            steps: [
                'Separate the two digits: 4 and 3',
                'Add them together: 4 + 3 = 7',
                'Put the 7 in the middle!'
            ],
            result: '473'
        },
        generatePractice: () => {
            // Keep sum < 10 for basic drill to match lesson
            let d1 = 1, d2 = 1;
            while (d1 + d2 >= 10) {
                d1 = Math.floor(Math.random() * 8) + 1;
                d2 = Math.floor(Math.random() * 8) + 1;
            }
            const num = d1 * 10 + d2;
            const ans = num * 11;
            return packTrick(`${num} × 11`, ans, 10, -10);
        }
    },
    {
        id: 'near-100',
        title: 'Near 100 Squares',
        description: 'Square numbers in the 90s effortlessly',
        difficulty: 3,
        icon: '🔥',
        lesson: {
            equation: '96²',
            steps: [
                '96 is 4 away from 100.',
                'Subtract that 4 from 96: 96 - 4 = 92 (first part)',
                'Square the 4: 4² = 16 (second part)',
                'Stick them together: 92...16'
            ],
            result: '9216'
        },
        generatePractice: () => {
            const num = Math.floor(Math.random() * 9) + 91; // 91-99
            const ans = num * num;
            return packTrick(`${num}²`, ans, 10, -10);
        }
    },
    {
        id: 'sum-odds',
        title: 'Sum of Consecutive Odds',
        description: 'Add up long strings of odd numbers instantly',
        difficulty: 2,
        icon: '✨',
        lesson: {
            equation: '1 + 3 + 5 + 7 + 9',
            steps: [
                'How many numbers are there? Count them: 5 numbers.',
                'The sum of the first N odd numbers is always N²!',
                '5 numbers... so 5²'
            ],
            result: '25'
        },
        generatePractice: () => {
            const n = Math.floor(Math.random() * 7) + 3; // 3 to 10 terms
            const terms = [];
            for (let i = 0; i < n; i++) terms.push(1 + i * 2);
            const expr = terms.slice(0, 3).join(' + ') + (n > 4 ? ' + ... + ' : ' + ') + terms[n - 1];
            return packTrick(expr, n * n, 1, -1);
        }
    }
];
