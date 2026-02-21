import React from 'react';

/** Costume accessories — extra SVG elements drawn on Mr. Chalk */
export const COSTUMES: Record<string, React.ReactNode> = {
    'streak-5': ( // Fire aura
        <g opacity="0.5">
            <ellipse cx="50" cy="55" rx="32" ry="45" stroke="currentColor" strokeWidth="1" fill="none" strokeDasharray="4 3" />
        </g>
    ),
    'streak-20': ( // Crown
        <g>
            <path d="M34 14L38 4l6 6 6-8 6 8 6-6 4 10z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
        </g>
    ),
    'sharpshooter': ( // Sunglasses
        <g>
            <rect x="33" y="30" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <rect x="55" y="30" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <line x1="45" y1="34" x2="55" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            <line x1="33" y1="34" x2="28" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            <line x1="67" y1="34" x2="72" y2="32" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        </g>
    ),
    'math-machine': ( // Wizard hat
        <g>
            <path d="M32 16L50 -4L68 16" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.7" />
            <path d="M30 16h40" stroke="currentColor" strokeWidth="2" opacity="0.6" />
            <circle cx="50" cy="-2" r="2" fill="currentColor" opacity="0.5" />
        </g>
    ),
    'century': ( // Star above head
        <g>
            <path d="M50 2l2 4 4 1-3 3 1 4-4-2-4 2 1-4-3-3 4-1z" stroke="currentColor" strokeWidth="1" fill="currentColor" opacity="0.4" />
        </g>
    ),
};
