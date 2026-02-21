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
            const tens = Math.floor(Math.random() * 19) + 1; // 1 to 19 (15² through 195²)
            const num = tens * 10 + 5;
            const ans = num * num;
            const spread = Math.max(50, Math.floor(ans * 0.02));
            return packTrick(`${num} × ${num}`, ans, spread, -spread);
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
            const base = [20, 25, 30, 40, 50, 60, 75, 80, 100, 150][Math.floor(Math.random() * 10)];
            const diff = Math.floor(Math.random() * 5) + 1; // 1 to 5
            const n1 = base - diff;
            const n2 = base + diff;
            const ans = n1 * n2;
            const off = Math.max(diff * diff + 1, Math.floor(ans * 0.01));
            return packTrick(`${n1} × ${n2}`, ans, off, -off);
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
            // Any 2-digit number from 12 to 99 (skip 11 to avoid trivial)
            const num = Math.floor(Math.random() * 88) + 12;
            const ans = num * 11;
            const spread = Math.floor(Math.random() * 40) + 11;
            return packTrick(`${num} × 11`, ans, spread, -spread);
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
            // 80s and 90s (81-99) for more variety
            const num = Math.floor(Math.random() * 19) + 81;
            const ans = num * num;
            const gap = 100 - num;
            const spread = Math.max(20, gap * gap + Math.floor(Math.random() * 30));
            return packTrick(`${num}²`, ans, spread, -spread);
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
            const n = Math.floor(Math.random() * 10) + 3; // 3 to 12 terms
            const terms = [];
            for (let i = 0; i < n; i++) terms.push(1 + i * 2);
            const expr = terms.slice(0, 3).join(' + ') + (n > 4 ? ' + ... + ' : ' + ') + terms[n - 1];
            const spread = Math.max(2, Math.floor(n * 0.7));
            return packTrick(expr, n * n, spread, -spread);
        }
    },
    {
        id: 'multiply-5',
        title: 'Multiply by 5',
        description: 'Half the number, then multiply by 10.',
        difficulty: 1,
        icon: '🖐️',
        lesson: {
            equation: '48 × 5',
            steps: [
                'Think of 5 as 10 divided by 2.',
                'So first, cut the number in half: 48 ÷ 2 = 24.',
                'Then multiply by 10 (just add a zero): 240.'
            ],
            result: '240'
        },
        generatePractice: () => {
            const num = Math.floor(Math.random() * 88) + 12; // 12 to 99
            const ans = num * 5;
            const spread = Math.max(10, Math.floor(ans * 0.1));
            return packTrick(`${num} × 5`, ans, spread, -spread);
        }
    },
    {
        id: 'multiply-9',
        title: 'Multiply by 9',
        description: 'Multiply by 10, then subtract the number.',
        difficulty: 2,
        icon: '➿',
        lesson: {
            equation: '48 × 9',
            steps: [
                '9 is just 10 minus 1.',
                'First, multiply by 10: 480',
                'Then subtract the original number: 480 - 48',
                '480 - 40 = 440...',
                '440 - 8 = 432.'
            ],
            result: '432'
        },
        generatePractice: () => {
            const num = Math.floor(Math.random() * 88) + 12;
            const ans = num * 9;
            const spread = Math.max(9, Math.floor(ans * 0.05));
            return packTrick(`${num} × 9`, ans, spread, -spread);
        }
    },
    {
        id: 'multiply-12',
        title: 'Multiply by 12',
        description: 'Multiply by 10, then add double the number.',
        difficulty: 2,
        icon: '🕛',
        lesson: {
            equation: '34 × 12',
            steps: [
                '12 is 10 plus 2.',
                'Multiply by 10: 340',
                'Double the number: 68',
                'Add them together: 340 + 68 = 408'
            ],
            result: '408'
        },
        generatePractice: () => {
            const num = Math.floor(Math.random() * 88) + 12;
            const ans = num * 12;
            const spread = Math.max(12, Math.floor(ans * 0.05));
            return packTrick(`${num} × 12`, ans, spread, -spread);
        }
    },
    {
        id: 'multiply-15',
        title: 'Multiply by 15',
        description: 'Multiply by 10, then add half of that result.',
        difficulty: 2,
        icon: '⏱️',
        lesson: {
            equation: '34 × 15',
            steps: [
                '15 is 10 plus 5 (which is half of 10).',
                'Multiply by 10: 340',
                'Take half of that result: 170',
                'Add them together: 340 + 170 = 510'
            ],
            result: '510'
        },
        generatePractice: () => {
            let num = Math.floor(Math.random() * 88) + 12;
            if (Math.random() > 0.3 && num % 2 !== 0) num += 1; // Bias towards even
            const ans = num * 15;
            const spread = Math.max(15, Math.floor(ans * 0.05));
            return packTrick(`${num} × 15`, ans, spread, -spread);
        }
    },
    {
        id: 'multiply-25',
        title: 'Multiply by 25',
        description: 'Divide by 4, then multiply by 100.',
        difficulty: 2,
        icon: '🪙',
        lesson: {
            equation: '32 × 25',
            steps: [
                '25 is exactly 100 divided by 4.',
                'So just divide the number by 4: 32 ÷ 4 = 8.',
                'Then multiply by 100 (add two zeros): 800.'
            ],
            result: '800'
        },
        generatePractice: () => {
            const num = (Math.floor(Math.random() * 23) + 3) * 4; // 12 to 100 multiples of 4
            const ans = num * 25;
            const spread = Math.max(100, Math.floor(ans * 0.05));
            return packTrick(`${num} × 25`, ans, spread, -spread);
        }
    },
    {
        id: 'double-halve',
        title: 'Double and Halve',
        description: 'Cut one number in half, double the other.',
        difficulty: 3,
        icon: '⚖️',
        lesson: {
            equation: '14 × 45',
            steps: [
                'When multiplying an even number by a multiple of 5...',
                'Cut the even number in half: 14 ÷ 2 = 7.',
                'Double the other number: 45 × 2 = 90.',
                'Now multiply those two: 7 × 90 = 630.'
            ],
            result: '630'
        },
        generatePractice: () => {
            // Generate an even number (12 to 48) and a number ending in 5 (15 to 95)
            const ev = (Math.floor(Math.random() * 19) + 6) * 2;
            const fv = (Math.floor(Math.random() * 9) + 1) * 10 + 5;
            const p1 = Math.random() > 0.5 ? ev : fv;
            const p2 = p1 === ev ? fv : ev;
            const ans = p1 * p2;
            const spread = Math.max(10, Math.floor(ans * 0.05));
            return packTrick(`${p1} × ${p2}`, ans, spread, -spread);
        }
    },
    {
        id: 'rule-of-101',
        title: 'Rule of 101',
        description: 'Multiply any 2-digit number by 101 instantly.',
        difficulty: 1,
        icon: '🪞',
        lesson: {
            equation: '43 × 101',
            steps: [
                '101 works like a mirror for 2-digit numbers.',
                'Just take the number and write it twice!',
                '43... 43...',
                '4343'
            ],
            result: '4343'
        },
        generatePractice: () => {
            const num = Math.floor(Math.random() * 88) + 12; // 12-99
            const ans = num * 101;
            const spread = Math.max(10, Math.floor(ans * 0.05));
            return packTrick(`${num} × 101`, ans, spread, -spread);
        }
    },
    {
        id: 'rule-of-99',
        title: 'Rule of 99',
        description: 'Multiply any number by 99.',
        difficulty: 3,
        icon: '⏬',
        lesson: {
            equation: '43 × 99',
            steps: [
                '99 is just 100 minus 1.',
                'Multiply the number by 100: 4300',
                'Subtract the exact number from that: 4300 - 43.',
                '4300 - 40 = 4260... then minus 3 is 4257.'
            ],
            result: '4257'
        },
        generatePractice: () => {
            const num = Math.floor(Math.random() * 88) + 12; // 12-99
            const ans = num * 99;
            const spread = Math.max(99, Math.floor(ans * 0.05));
            return packTrick(`${num} × 99`, ans, spread, -spread);
        }
    },
    {
        id: 'just-over-100',
        title: 'Just Over 100',
        description: 'Multiply two numbers slightly above 100.',
        difficulty: 3,
        icon: '📈',
        lesson: {
            equation: '104 × 106',
            steps: [
                'Take one number and add the last digit of the other: 104 + 6 = 110.',
                'This gives you the first part: 110...',
                'Now multiply just the last digits: 4 × 6 = 24.',
                'Stick them together: 11024'
            ],
            result: '11024'
        },
        generatePractice: () => {
            const d1 = Math.floor(Math.random() * 9) + 1; // 1-9
            const d2 = Math.floor(Math.random() * 9) + 1;
            const n1 = 100 + d1;
            const n2 = 100 + d2;
            const ans = n1 * n2;
            const spread = Math.max(10, Math.floor(ans * 0.01));
            return packTrick(`${n1} × ${n2}`, ans, spread, -spread);
        }
    },
    {
        id: 'cross-multiply',
        title: 'Cross-Multiplication',
        description: 'Left-to-right universal Vedic multiplication.',
        difficulty: 5,
        icon: '⚔️',
        lesson: {
            equation: '23 × 12',
            steps: [
                'Left digits: 2 × 1 = 2 (This is the hundreds: 200).',
                'Right digits: 3 × 2 = 6 (This is the units: 6).',
                'Cross multiply: (2×2) + (3×1) = 4 + 3 = 7 (This is the tens: 70).',
                'Add: 200 + 70 + 6 = 276'
            ],
            result: '276'
        },
        generatePractice: () => {
            // Keep digits somewhat small to make it manageable mentally
            const n1 = (Math.floor(Math.random() * 3) + 1) * 10 + Math.floor(Math.random() * 4) + 1; // 11 to 34
            const n2 = (Math.floor(Math.random() * 3) + 1) * 10 + Math.floor(Math.random() * 4) + 1;
            const ans = n1 * n2;
            const spread = Math.max(10, Math.floor(ans * 0.05));
            return packTrick(`${n1} × ${n2}`, ans, spread, -spread);
        }
    },
    {
        id: 'square-50s',
        title: 'Squares in the 50s',
        description: 'Instantly square numbers from 51 to 59.',
        difficulty: 2,
        icon: '🧮',
        lesson: {
            equation: '54²',
            steps: [
                'Add the last digit to 25: 25 + 4 = 29.',
                'This is the first half of the answer.',
                'Square the last digit: 4² = 16.',
                'This is the second half. Put them together: 2916'
            ],
            result: '2916'
        },
        generatePractice: () => {
            const d = Math.floor(Math.random() * 9) + 1; // 1-9
            const num = 50 + d;
            const ans = num * num;
            const spread = Math.max(15, Math.floor(ans * 0.01));
            return packTrick(`${num}²`, ans, spread, -spread);
        }
    },
    {
        id: 'square-40s',
        title: 'Squares in the 40s',
        description: 'Instantly square numbers from 41 to 49.',
        difficulty: 3,
        icon: '📉',
        lesson: {
            equation: '48²',
            steps: [
                'How far is 48 from 50? It is 2 away.',
                'Subtract 2 from 25: 25 - 2 = 23. (First half)',
                'Square that distance: 2² = 04. (Second half)',
                'Put them together: 2304'
            ],
            result: '2304'
        },
        generatePractice: () => {
            const d = Math.floor(Math.random() * 9) + 1; // 1-9
            const num = 40 + d;
            const ans = num * num;
            const spread = Math.max(15, Math.floor(ans * 0.01));
            return packTrick(`${num}²`, ans, spread, -spread);
        }
    },
    {
        id: 'near-1000',
        title: 'Squares Near 1000',
        description: 'Square numbers in the 990s in your head.',
        difficulty: 4,
        icon: '🏔️',
        lesson: {
            equation: '996²',
            steps: [
                '996 is 4 away from 1000.',
                'Subtract 4 from 996: 996 - 4 = 992. (First part)',
                'Square the 4 as a 3-digit block: 4² = 016. (Second part)',
                'Put them together: 992016'
            ],
            result: '992016'
        },
        generatePractice: () => {
            const num = Math.floor(Math.random() * 9) + 991; // 991-999
            const ans = num * num;
            const spread = Math.max(100, Math.floor(ans * 0.0001));
            return packTrick(`${num}²`, ans, spread, -spread);
        }
    },
    {
        id: 'divide-5',
        title: 'Divide by 5',
        description: 'Divide any number by 5 instantly.',
        difficulty: 1,
        icon: '🍰',
        lesson: {
            equation: '130 ÷ 5',
            steps: [
                'Instead of dividing by 5, divide by 10 and double it!',
                'Or, double the number first: 130 × 2 = 260.',
                'Then drop a zero (divide by 10): 26.'
            ],
            result: '26'
        },
        generatePractice: () => {
            // Let's stick to numbers divisible by 5 for clean answers
            const num = (Math.floor(Math.random() * 180) + 20) * 5; // 100 to 1000
            const ans = num / 5;
            const spread = Math.max(5, Math.floor(ans * 0.1));
            return packTrick(`${num} ÷ 5`, ans, spread, -spread);
        }
    },
    {
        id: 'divide-25',
        title: 'Divide by 25',
        description: 'Divide large numbers by 25 easily.',
        difficulty: 2,
        icon: '🍫',
        lesson: {
            equation: '800 ÷ 25',
            steps: [
                'There are four 25s in every 100.',
                'So take the number of hundreds (8)...',
                'And multiply by 4! 8 × 4 = 32.',
                'For non-hundreds, multiply the whole thing by 4 then divide by 100.'
            ],
            result: '32'
        },
        generatePractice: () => {
            // Multiples of 25 up to 2500
            const ans = Math.floor(Math.random() * 88) + 12; // 12 to 99
            const num = ans * 25;
            const spread = Math.max(5, Math.floor(ans * 0.1));
            return packTrick(`${num} ÷ 25`, ans, spread, -spread);
        }
    },
    {
        id: 'sub-1000',
        title: 'Subtract from 1000',
        description: 'Vedic rule: "All from 9 and the last from 10".',
        difficulty: 1,
        icon: '💵',
        lesson: {
            equation: '1000 - 473',
            steps: [
                'Subtract the first digit from 9: 9 - 4 = 5.',
                'Subtract the middle digit from 9: 9 - 7 = 2.',
                'Subtract the last digit from 10: 10 - 3 = 7.',
                'Put them together: 527. No borrowing needed!'
            ],
            result: '527'
        },
        generatePractice: () => {
            const ans = Math.floor(Math.random() * 888) + 111; // 111 to 999
            const num = 1000 - ans;
            const spread = Math.max(10, Math.floor(ans * 0.05));
            return packTrick(`1000 - ${num}`, ans, spread, -spread);
        }
    },
    {
        id: 'left-to-right-add',
        title: 'Left-to-Right Addition',
        description: 'Add numbers the way you read them.',
        difficulty: 2,
        icon: '⏩',
        lesson: {
            equation: '47 + 35',
            steps: [
                'Forget carrying from the right. Add the tens first.',
                '40 + 30 = 70.',
                'Now add the units: 7 + 5 = 12.',
                'Combine them: 70 + 12 = 82.'
            ],
            result: '82'
        },
        generatePractice: () => {
            const n1 = Math.floor(Math.random() * 88) + 12; // 12-99
            const n2 = Math.floor(Math.random() * 88) + 12; // 12-99
            const ans = n1 + n2;
            const spread = Math.max(5, Math.floor(ans * 0.05));
            return packTrick(`${n1} + ${n2}`, ans, spread, -spread);
        }
    },
    {
        id: 'round-and-compensate',
        title: 'Round and Compensate',
        description: 'Addition shortcut using friendly numbers.',
        difficulty: 2,
        icon: '🎯',
        lesson: {
            equation: '48 + 35',
            steps: [
                '48 is very close to 50.',
                'Add 50 instead of 48: 50 + 35 = 85.',
                'Since we added 2 too many, subtract 2 from the result.',
                '85 - 2 = 83.'
            ],
            result: '83'
        },
        generatePractice: () => {
            // Generate numbers close to multiples of 10
            const n1 = (Math.floor(Math.random() * 8) + 1) * 10 + (Math.random() > 0.5 ? 8 : 9); // ends in 8 or 9
            const n2 = Math.floor(Math.random() * 88) + 12; // 12-99
            const p1 = Math.random() > 0.5 ? n1 : n2;
            const p2 = p1 === n1 ? n2 : n1;
            const ans = p1 + p2;
            const spread = Math.max(5, Math.floor(ans * 0.05));
            return packTrick(`${p1} + ${p2}`, ans, spread, -spread);
        }
    },
    {
        id: 'multiply-ends-5-10-apart',
        title: 'Ends in 5, 10 Apart',
        description: 'Multiply numbers like 35 × 45.',
        difficulty: 4,
        icon: '🤝',
        lesson: {
            equation: '35 × 45',
            steps: [
                'Multiply the tens digits: 3 × 4 = 12.',
                'Add the smaller tens digit: 12 + 3 = 15.',
                'This is the first part.',
                'Always attach 75 to the end. Result: 1575.'
            ],
            result: '1575'
        },
        generatePractice: () => {
            const tens = Math.floor(Math.random() * 8) + 1; // 1-8
            const n1 = tens * 10 + 5;
            const n2 = (tens + 1) * 10 + 5;
            const ans = n1 * n2;
            const spread = Math.max(50, Math.floor(ans * 0.05));
            return packTrick(`${n1} × ${n2}`, ans, spread, -spread);
        }
    },
    {
        id: 'divide-3',
        title: 'Divide by 3',
        description: 'Use the digit-sum rule to divide large numbers.',
        difficulty: 2,
        icon: '🕵️',
        lesson: {
            equation: '5712 ÷ 3',
            steps: [
                'Add all the digits: 5+7+1+2 = 15. Since 15 divides by 3, you know it works!',
                'Break it down left to right: 3 goes into 5 once (remainder 2).',
                'Carry 2: 3 goes into 27 nine times.',
                '3 into 1 is 0 (carry 1). 3 into 12 is 4. Result: 1904.'
            ],
            result: '1904'
        },
        generatePractice: () => {
            const ans = Math.floor(Math.random() * 800) + 100; // 100-900 answer
            const num = ans * 3;
            const spread = Math.max(5, Math.floor(ans * 0.05));
            return packTrick(`${num} ÷ 3`, ans, spread, -spread);
        }
    }
];
