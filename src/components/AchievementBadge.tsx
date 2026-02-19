import { memo } from 'react';

/**
 * Hand-drawn chalk-style SVG badge icons.
 * All drawn with rough strokes, currentColor, matching Mr. Chalk's aesthetic.
 */

interface BadgeProps {
    size?: number;
    unlocked: boolean;
}

const S = { stroke: 'currentColor', fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

/** Footsteps — First Steps */
const FirstSteps = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-gold)' : 'rgba(255,255,255,0.12)' }}>
        <path d="M16 32c-1 -6 2-12 6-16" {...S} strokeWidth="2.5" />
        <circle cx="22" cy="14" r="3.5" {...S} strokeWidth="2" />
        <path d="M28 36c1-6-2-12-6-16" {...S} strokeWidth="2.5" />
        <circle cx="22" cy="38" r="2.5" {...S} strokeWidth="2" />
        <circle cx="28" cy="20" r="2.5" {...S} strokeWidth="2" />
    </svg>
);

/** Fire — On Fire (5-streak) */
const OnFire = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-streak-fire)' : 'rgba(255,255,255,0.12)' }}>
        <path d="M24 6c-4 10-12 14-8 26 2 5 8 8 8 8s6-3 8-8c4-12-4-16-8-26z" {...S} strokeWidth="2.5" />
        <path d="M20 32c0-4 4-8 4-12 0 4 4 8 4 12" {...S} strokeWidth="2" opacity="0.6" />
    </svg>
);

/** Crown — Unstoppable (20-streak) */
const Unstoppable = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-gold)' : 'rgba(255,255,255,0.12)' }}>
        <path d="M8 34L12 16l8 8 4-12 4 12 8-8 4 18z" {...S} strokeWidth="2.5" />
        <path d="M10 38h28" {...S} strokeWidth="2.5" />
        <circle cx="24" cy="12" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
);

/** Star — Century Club */
const Century = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-gold)' : 'rgba(255,255,255,0.12)' }}>
        <path d="M24 6l5 10 11 2-8 7 2 11-10-5-10 5 2-11-8-7 11-2z" {...S} strokeWidth="2.5" />
    </svg>
);

/** Gear — Math Machine */
const MathMachine = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-chalk)' : 'rgba(255,255,255,0.12)' }}>
        <circle cx="24" cy="24" r="8" {...S} strokeWidth="2.5" />
        <circle cx="24" cy="24" r="3" {...S} strokeWidth="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => {
            const r = (a * Math.PI) / 180;
            return <line key={a} x1={24 + 10 * Math.cos(r)} y1={24 + 10 * Math.sin(r)} x2={24 + 14 * Math.cos(r)} y2={24 + 14 * Math.sin(r)} {...S} strokeWidth="3" />;
        })}
    </svg>
);

/** Crosshair — Sharpshooter */
const Sharpshooter = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-correct)' : 'rgba(255,255,255,0.12)' }}>
        <circle cx="24" cy="24" r="14" {...S} strokeWidth="2" />
        <circle cx="24" cy="24" r="8" {...S} strokeWidth="2" />
        <circle cx="24" cy="24" r="2.5" fill="currentColor" />
        <line x1="24" y1="6" x2="24" y2="14" {...S} strokeWidth="2" />
        <line x1="24" y1="34" x2="24" y2="42" {...S} strokeWidth="2" />
        <line x1="6" y1="24" x2="14" y2="24" {...S} strokeWidth="2" />
        <line x1="34" y1="24" x2="42" y2="24" {...S} strokeWidth="2" />
    </svg>
);

/** Calendar — Dedicated (7-day streak) */
const Dedicated = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-streak-fire)' : 'rgba(255,255,255,0.12)' }}>
        <rect x="8" y="12" width="32" height="28" rx="3" {...S} strokeWidth="2.5" />
        <line x1="8" y1="20" x2="40" y2="20" {...S} strokeWidth="2" />
        <line x1="16" y1="8" x2="16" y2="16" {...S} strokeWidth="2.5" />
        <line x1="32" y1="8" x2="32" y2="16" {...S} strokeWidth="2.5" />
        {/* 7 small check marks */}
        {[14, 19, 24, 29, 34].map(cx => (
            <circle key={cx} cx={cx} cy="28" r="1.5" fill="currentColor" opacity="0.5" />
        ))}
        {[17, 22].map(cx => (
            <circle key={cx} cx={cx} cy="34" r="1.5" fill="currentColor" opacity="0.5" />
        ))}
    </svg>
);

/** Hexagon with ÷×+- — All-Rounder */
const AllRounder = ({ size = 48, unlocked }: BadgeProps) => (
    <svg viewBox="0 0 48 48" width={size} height={size} style={{ color: unlocked ? 'var(--color-gold)' : 'rgba(255,255,255,0.12)' }}>
        <path d="M24 6L40 15v18L24 42 8 33V15z" {...S} strokeWidth="2.5" />
        <text x="24" y="28" textAnchor="middle" fill="currentColor" fontSize="14" fontFamily="var(--font-chalk)">∀</text>
    </svg>
);

/** Map from achievement ID to SVG component */
const BADGE_MAP: Record<string, React.FC<BadgeProps>> = {
    'first-steps': FirstSteps,
    'streak-5': OnFire,
    'streak-20': Unstoppable,
    'century': Century,
    'math-machine': MathMachine,
    'sharpshooter': Sharpshooter,
    'dedicated': Dedicated,
    'all-rounder': AllRounder,
};

interface Props {
    achievementId: string;
    unlocked: boolean;
    name: string;
    desc: string;
}

export const AchievementBadge = memo(function AchievementBadge({ achievementId, unlocked, name, desc }: Props) {
    const Icon = BADGE_MAP[achievementId];
    if (!Icon) return null;

    return (
        <div className={`flex flex-col items-center gap-1 w-16 ${unlocked ? '' : 'opacity-40'}`}>
            <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${unlocked
                ? 'border-white/20 bg-white/[0.05]'
                : 'border-white/8 bg-transparent'
                }`}>
                <Icon size={36} unlocked={unlocked} />
            </div>
            <span className={`text-[9px] ui font-medium text-center leading-tight ${unlocked ? 'text-white/60' : 'text-white/25'
                }`}>
                {name}
            </span>
            {unlocked && (
                <span className="text-[8px] ui text-white/30 text-center leading-tight">
                    {desc}
                </span>
            )}
        </div>
    );
});
