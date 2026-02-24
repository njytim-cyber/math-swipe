/**
 * domains/math/mathCategories.ts
 *
 * Math-domain category definitions.
 * Moved from src/utils/questionTypes.ts — all math-specific, none engine-level.
 */
import type { CategoryEntry, BandEntry } from '../../engine/categories';

// ── Question type union ───────────────────────────────────────────────────────

export type QuestionType =
    | 'add' | 'subtract' | 'multiply' | 'divide' | 'square' | 'sqrt'
    | 'fraction' | 'decimal' | 'percent' | 'linear'
    | 'add1' | 'sub1' | 'bonds' | 'doubles' | 'compare' | 'skip'
    | 'round' | 'orderops'
    | 'exponent' | 'negatives' | 'gcflcm' | 'ratio'
    | 'mix-basic' | 'mix-all'
    | 'daily' | 'challenge' | 'speedrun' | 'ghost';

export type QuestionGroup = 'daily' | 'young' | 'whole' | 'core' | 'advanced' | 'parts' | 'mixed';

export type AgeBand = 'k2' | '35' | '6+';

// ── Renamed aliases for backward compatibility ────────────────────────────────
/** @deprecated Use CategoryEntry from engine/categories */
export type QuestionTypeEntry = CategoryEntry<QuestionType>;

// ── Group labels ──────────────────────────────────────────────────────────────

export const GROUP_LABELS: Record<QuestionGroup, string> = {
    daily: '🗓️ Daily',
    young: '🐣 Young',
    whole: 'Whole',
    core: '🧱 Core',
    advanced: 'Advanced',
    parts: 'Parts',
    mixed: 'Mixed',
};

// ── Category list ─────────────────────────────────────────────────────────────

/** Single source of truth for all math category entries */
export const QUESTION_TYPES: ReadonlyArray<CategoryEntry<QuestionType>> = [
    // Daily
    { id: 'daily', icon: '📅', label: 'Daily', group: 'daily' },
    // Young (K-2)
    { id: 'add1', icon: '+', label: '1-Digit +', group: 'young' },
    { id: 'sub1', icon: '−', label: '1-Digit −', group: 'young' },
    { id: 'bonds', icon: '🔗', label: 'Bonds', group: 'young' },
    { id: 'doubles', icon: '👯', label: 'Doubles', group: 'young' },
    { id: 'compare', icon: '⚖️', label: 'Compare', group: 'young' },
    { id: 'skip', icon: '🦘', label: 'Skip Count', group: 'young' },
    // Whole
    { id: 'add', icon: '+', label: 'Add', group: 'whole' },
    { id: 'subtract', icon: '−', label: 'Subtract', group: 'whole' },
    { id: 'multiply', icon: '×', label: 'Multiply', group: 'whole' },
    { id: 'divide', icon: '÷', label: 'Divide', group: 'whole' },
    // Core (3-5)
    { id: 'round', icon: '≈', label: 'Rounding', group: 'core' },
    { id: 'orderops', icon: '🔢', label: 'PEMDAS', group: 'core' },
    // Advanced
    { id: 'square', icon: 'x²', label: 'Square', group: 'advanced' },
    { id: 'sqrt', icon: '√', label: 'Root', group: 'advanced' },
    { id: 'exponent', icon: 'xⁿ', label: 'Exponent', group: 'advanced' },
    { id: 'negatives', icon: '±', label: 'Negatives', group: 'advanced' },
    { id: 'linear', icon: 'x=', label: 'Linear', group: 'advanced' },
    { id: 'gcflcm', icon: 'GCF', label: 'GCF/LCM', group: 'advanced' },
    { id: 'ratio', icon: 'a:b', label: 'Ratios', group: 'advanced' },
    // Parts
    { id: 'fraction', icon: '⅓', label: 'Fractions', group: 'parts' },
    { id: 'decimal', icon: '.5', label: 'Decimals', group: 'parts' },
    { id: 'percent', icon: '%', label: 'Percent', group: 'parts' },
    // Mixed
    { id: 'mix-basic', icon: '+-\n×÷', label: 'Basic Mix', group: 'mixed' },
    { id: 'mix-all', icon: '🌀', label: 'All Mix', group: 'mixed' },
] as const;

// ── Band definitions ──────────────────────────────────────────────────────────

export const AGE_BANDS: AgeBand[] = ['k2', '35', '6+'];

export const MATH_BANDS: ReadonlyArray<BandEntry<AgeBand>> = [
    {
        id: 'k2',
        emoji: '🐣',
        label: 'K–2',
        groups: new Set(['daily', 'young']),
        defaultCategoryId: 'add1',
    },
    {
        id: '35',
        emoji: '📚',
        label: '3–5',
        groups: new Set(['daily', 'whole', 'core', 'mixed']),
        defaultCategoryId: 'multiply',
    },
    {
        id: '6+',
        emoji: '🚀',
        label: '6+',
        groups: new Set(['daily', 'whole', 'core', 'advanced', 'parts', 'mixed']),
        defaultCategoryId: 'multiply',
    },
];

/** Band display labels — kept for UI components that need only emoji+label */
export const BAND_LABELS: Record<AgeBand, { emoji: string; label: string }> = {
    'k2': { emoji: '🐣', label: 'K–2' },
    '35': { emoji: '📚', label: '3–5' },
    '6+': { emoji: '🚀', label: '6+' },
};

// ── Convenience wrappers (math-domain entry points) ───────────────────────────

import { typesForBand as _typesForBand, defaultTypeForBand as _defaultTypeForBand } from '../../engine/categories';

/** Returns question types visible for the given age band */
export function typesForBand(band: AgeBand): ReadonlyArray<CategoryEntry<QuestionType>> {
    return _typesForBand(band, MATH_BANDS, QUESTION_TYPES) as ReadonlyArray<CategoryEntry<QuestionType>>;
}

/** Returns the default question type for a band */
export function defaultTypeForBand(band: AgeBand): QuestionType {
    return _defaultTypeForBand(band, MATH_BANDS) as QuestionType;
}
