import type { QuestionType } from './mathGenerator';

/** Shared question type icons — single source of truth for MePage & QuestionTypePicker */
export const QUESTION_TYPES: ReadonlyArray<{ id: QuestionType; icon: string }> = [
    { id: 'add', icon: '+' },
    { id: 'subtract', icon: '−' },
    { id: 'multiply', icon: '×' },
    { id: 'divide', icon: '÷' },
    { id: 'square', icon: 'x²' },
    { id: 'sqrt', icon: '√' },
] as const;
