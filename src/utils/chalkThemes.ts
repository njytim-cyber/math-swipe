/** Chalk color themes — unlocked at level thresholds or hard mode play */

export interface ChalkTheme {
    id: string;
    name: string;
    color: string;          // CSS color value for dark-mode chalk
    minLevel: number;       // Level required to unlock (1-5)
    hardModeOnly?: boolean; // Exclusive to hard mode players
    hardModeMin?: number;   // Hard mode solves required to unlock
    timedModeOnly?: boolean;
    timedModeMin?: number;
    ultimateOnly?: boolean;
    ultimateMin?: number;
}

export const CHALK_THEMES: ChalkTheme[] = [
    { id: 'classic', name: 'Classic White', color: 'rgba(230, 230, 230, 0.85)', minLevel: 1 },
    { id: 'sky', name: 'Sky Blue', color: 'rgba(135, 206, 250, 0.85)', minLevel: 1 },
    { id: 'rose', name: 'Chalk Rose', color: 'rgba(255, 182, 193, 0.85)', minLevel: 2 },
    { id: 'mint', name: 'Mint Fresh', color: 'rgba(152, 251, 200, 0.85)', minLevel: 2 },
    { id: 'gold', name: 'Golden Hour', color: 'rgba(255, 215, 100, 0.85)', minLevel: 3 },
    { id: 'sunset', name: 'Sunset', color: 'rgba(255, 160, 122, 0.85)', minLevel: 3 },
    // 💀 Hard mode exclusive
    { id: 'skull-purple', name: 'Skull Purple', color: 'rgba(180, 120, 255, 0.85)', minLevel: 1, hardModeOnly: true, hardModeMin: 25 },
    { id: 'blood-moon', name: 'Blood Moon', color: 'rgba(255, 80, 80, 0.85)', minLevel: 1, hardModeOnly: true, hardModeMin: 100 },
    { id: 'shadow-flame', name: 'Shadow Flame', color: 'rgba(255, 160, 40, 0.85)', minLevel: 1, hardModeOnly: true, hardModeMin: 200 },
    // ⏱️ Timed mode exclusive
    { id: 'electric-blue', name: 'Electric Blue', color: 'rgba(80, 180, 255, 0.85)', minLevel: 1, timedModeOnly: true, timedModeMin: 25 },
    { id: 'neon-green', name: 'Neon Pulse', color: 'rgba(50, 255, 150, 0.85)', minLevel: 1, timedModeOnly: true, timedModeMin: 100 },
    // 💀⏱️ Ultimate exclusive
    { id: 'void-black', name: 'Void', color: 'rgba(160, 140, 180, 0.85)', minLevel: 1, ultimateOnly: true, ultimateMin: 10 },
    { id: 'prismatic', name: 'Prismatic', color: 'rgba(255, 200, 255, 0.85)', minLevel: 1, ultimateOnly: true, ultimateMin: 50 },
];

/**
 * Apply chalk theme color.
 * In dark mode the chalk-theme color is used directly.
 * In light mode we force a dark value so text is readable.
 */
export function applyTheme(color: string) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.style.setProperty(
        '--color-chalk',
        isLight ? '#000000' : color,
    );
    // Stash the theme color so mode-toggle can re-derive
    document.documentElement.style.setProperty('--chalk-theme-color', color);
}
