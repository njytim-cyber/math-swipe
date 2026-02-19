/** Dark / Light mode toggle — persisted to localStorage */

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'math-swipe-theme';

export function loadMode(): ThemeMode {
    return (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'dark';
}

export function saveMode(mode: ThemeMode) {
    localStorage.setItem(STORAGE_KEY, mode);
}

export function applyMode(mode: ThemeMode) {
    if (mode === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    // Update PWA theme-color to match
    const meta = document.getElementById('meta-theme-color');
    if (meta) meta.setAttribute('content', mode === 'light' ? '#f5f0e8' : '#1b1b1b');
}
