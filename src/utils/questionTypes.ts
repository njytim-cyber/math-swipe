export type QuestionType =
    | 'add' | 'subtract' | 'multiply' | 'divide' | 'square' | 'sqrt'
    | 'fraction' | 'decimal' | 'percent' | 'linear'
    | 'mix-basic' | 'mix-all'
    | 'daily' | 'challenge';

export type QuestionGroup = 'daily' | 'whole' | 'advanced' | 'parts' | 'mixed';

export interface QuestionTypeEntry {
    id: QuestionType;
    icon: string;
    label: string;
    group: QuestionGroup;
    hidden?: boolean;
}

export const GROUP_LABELS: Record<QuestionGroup, string> = {
    daily: '🗓️ Daily',
    whole: 'Whole',
    advanced: 'Advanced',
    parts: 'Parts',
    mixed: 'Mixed',
};

/** Shared question type definitions — single source of truth */
export const QUESTION_TYPES: ReadonlyArray<QuestionTypeEntry> = [
    // Daily
    { id: 'daily', icon: '📅', label: 'Daily', group: 'daily' },
    // Whole (formerly Basic)
    { id: 'add', icon: '+', label: 'Add', group: 'whole' },
    { id: 'subtract', icon: '−', label: 'Subtract', group: 'whole' },
    { id: 'multiply', icon: '×', label: 'Multiply', group: 'whole' },
    { id: 'divide', icon: '÷', label: 'Divide', group: 'whole' },
    // Advanced (formerly Powers, now includes Linear)
    { id: 'square', icon: 'x²', label: 'Square', group: 'advanced' },
    { id: 'sqrt', icon: '√', label: 'Root', group: 'advanced' },
    { id: 'linear', icon: 'x=', label: 'Linear', group: 'advanced' },
    // Parts (formerly Advanced)
    { id: 'fraction', icon: '⅓', label: 'Fractions', group: 'parts' },
    { id: 'decimal', icon: '.5', label: 'Decimals', group: 'parts' },
    { id: 'percent', icon: '%', label: 'Percent', group: 'parts' },
    // Mixed
    { id: 'mix-basic', icon: '+-\n×÷', label: 'Basic Mix', group: 'mixed' },
    { id: 'mix-all', icon: '🌀', label: 'All Mix', group: 'mixed' },
] as const;
