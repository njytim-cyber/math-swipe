export type QuestionType =
    | 'add' | 'subtract' | 'multiply' | 'divide' | 'square' | 'sqrt'
    | 'fraction' | 'decimal' | 'percent' | 'linear'
    | 'add1' | 'sub1' | 'bonds' | 'doubles' | 'compare' | 'skip'
    | 'round' | 'orderops' | 'placevalue'
    | 'exponent' | 'negatives' | 'gcflcm' | 'ratio'
    | 'mix-basic' | 'mix-all'
    | 'daily' | 'challenge';

export type QuestionGroup = 'daily' | 'young' | 'whole' | 'core' | 'advanced' | 'parts' | 'mixed';

export type AgeBand = 'k2' | '35' | '6+';

export interface QuestionTypeEntry {
    id: QuestionType;
    icon: string;
    label: string;
    group: QuestionGroup;
    hidden?: boolean;
}

export const GROUP_LABELS: Record<QuestionGroup, string> = {
    daily: '🗓️ Daily',
    young: '🐣 Young',
    whole: 'Whole',
    core: '🧱 Core',
    advanced: 'Advanced',
    parts: 'Parts',
    mixed: 'Mixed',
};

/** Which groups are visible per age band */
const BAND_GROUPS: Record<AgeBand, Set<QuestionGroup>> = {
    'k2': new Set(['daily', 'young']),
    '35': new Set(['daily', 'whole', 'core', 'mixed']),
    '6+': new Set(['daily', 'whole', 'core', 'advanced', 'parts', 'mixed']),
};

export const BAND_LABELS: Record<AgeBand, { emoji: string; label: string }> = {
    'k2': { emoji: '🐣', label: 'K–2' },
    '35': { emoji: '📚', label: '3–5' },
    '6+': { emoji: '🚀', label: '6+' },
};

export const AGE_BANDS: AgeBand[] = ['k2', '35', '6+'];

/** Shared question type definitions — single source of truth */
export const QUESTION_TYPES: ReadonlyArray<QuestionTypeEntry> = [
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
    { id: 'placevalue', icon: '🏠', label: 'Place Val', group: 'core' },
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

/** Returns question types visible in the given age band */
export function typesForBand(band: AgeBand): ReadonlyArray<QuestionTypeEntry> {
    const groups = BAND_GROUPS[band];
    return QUESTION_TYPES.filter(t => groups.has(t.group));
}

/** Returns the default question type for a band */
export function defaultTypeForBand(band: AgeBand): QuestionType {
    if (band === 'k2') return 'add1';
    return 'multiply';
}
