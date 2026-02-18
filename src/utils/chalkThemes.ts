/** Chalk color themes — unlocked at level thresholds */

export interface ChalkTheme {
    id: string;
    name: string;
    color: string;      // CSS color value for --color-chalk
    minLevel: number;   // Level required to unlock (1-5)
}

export const CHALK_THEMES: ChalkTheme[] = [
    { id: 'classic', name: 'Classic White', color: 'rgba(230, 230, 230, 0.85)', minLevel: 1 },
    { id: 'sky', name: 'Sky Blue', color: 'rgba(135, 206, 250, 0.85)', minLevel: 2 },
    { id: 'rose', name: 'Chalk Rose', color: 'rgba(255, 182, 193, 0.85)', minLevel: 3 },
    { id: 'gold', name: 'Golden Hour', color: 'rgba(255, 215, 100, 0.85)', minLevel: 4 },
    { id: 'mint', name: 'Mint Fresh', color: 'rgba(152, 251, 200, 0.85)', minLevel: 4 },
    { id: 'sunset', name: 'Sunset', color: 'rgba(255, 160, 122, 0.85)', minLevel: 5 },
];

const STORAGE_KEY = 'math-swipe-chalk-theme';

export function loadTheme(): string {
    return localStorage.getItem(STORAGE_KEY) || 'classic';
}

export function saveTheme(id: string) {
    localStorage.setItem(STORAGE_KEY, id);
}

export function applyTheme(color: string) {
    document.documentElement.style.setProperty('--color-chalk', color);
}
