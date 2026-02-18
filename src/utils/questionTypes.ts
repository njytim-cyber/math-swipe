import type { QuestionType } from './mathGenerator';

export type QuestionGroup = 'basic' | 'powers' | 'advanced' | 'mixed';

export interface QuestionTypeEntry {
    id: QuestionType;
    icon: string;
    label: string;
    group: QuestionGroup;
}

export const GROUP_LABELS: Record<QuestionGroup, string> = {
    basic: 'Basic',
    powers: 'Powers',
    advanced: 'Advanced',
    mixed: 'Mixed',
};

/** Shared question type definitions — single source of truth */
export const QUESTION_TYPES: ReadonlyArray<QuestionTypeEntry> = [
    // Basic
    { id: 'add', icon: '+', label: 'Add', group: 'basic' },
    { id: 'subtract', icon: '−', label: 'Subtract', group: 'basic' },
    { id: 'multiply', icon: '×', label: 'Multiply', group: 'basic' },
    { id: 'divide', icon: '÷', label: 'Divide', group: 'basic' },
    // Powers
    { id: 'square', icon: 'x²', label: 'Square', group: 'powers' },
    { id: 'sqrt', icon: '√', label: 'Root', group: 'powers' },
    // Advanced
    { id: 'fraction', icon: '⅓', label: 'Fractions', group: 'advanced' },
    { id: 'decimal', icon: '.5', label: 'Decimals', group: 'advanced' },
    { id: 'percent', icon: '%', label: 'Percent', group: 'advanced' },
    { id: 'linear', icon: 'x=', label: 'Equations', group: 'advanced' },
    // Mixed
    { id: 'mix-basic', icon: '🎲', label: 'Basic Mix', group: 'mixed' },
    { id: 'mix-all', icon: '🌀', label: 'All Mix', group: 'mixed' },
] as const;
