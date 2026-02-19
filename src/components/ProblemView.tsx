import { memo } from 'react';
import { motion, useMotionValue, useTransform, useMotionTemplate, type MotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Problem } from '../utils/mathGenerator';
import { MathExpr } from './MathExpr';

interface Props {
    problem: Problem;
    frozen: boolean;
    highlightCorrect?: boolean;
    showHints?: boolean;
    onSwipe: (dir: 'left' | 'right' | 'up' | 'down') => void;
}

const DIRS: Array<'left' | 'down' | 'right'> = ['left', 'down', 'right'];
const DIR_LABELS = ['<', 'v', '>'];

const pulseAnim = {
    scale: [1, 1.03, 1],
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' as const },
};

/** Glow animation for the tutorial-highlighted answer */
const glowAnim = {
    boxShadow: [
        '0 0 0 0 rgba(255,255,255,0)',
        '0 0 20px 4px rgba(251,191,36,0.5)',
        '0 0 0 0 rgba(255,255,255,0)',
    ],
    scale: [1, 1.08, 1],
};

const glowTransition = { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const };

/** Single answer option */
const correctFlashAnim = {
    scale: [1, 1.15, 1],
    boxShadow: [
        '0 0 0 0 rgba(74,222,128,0)',
        '0 0 20px 6px rgba(74,222,128,0.6)',
        '0 0 0 0 rgba(74,222,128,0)',
    ],
};

const AnswerOption = memo(function AnswerOption({
    value, label, dir, dirLabel, glow, frozen, onSwipe, highlighted, correctFlash, showHint,
}: {
    value: number; label?: string; dir: 'left' | 'down' | 'right'; dirLabel: string;
    glow: MotionValue<number>; frozen: boolean;
    onSwipe: (d: 'left' | 'right' | 'up' | 'down') => void;
    highlighted?: boolean;
    correctFlash?: boolean;
    showHint?: boolean;
}) {
    const scale = useTransform(glow, [0, 0.3, 1], [1, 1.05, 1.35]);
    const opacity = useTransform(glow, [0, 1], [0.55, 1]);
    // Gold border + text intensity driven by drag distance
    const borderAlpha = useTransform(glow, [0, 0.3, 1], [0, 0.3, 1]);
    const borderColor = useMotionTemplate`rgba(251,191,36,${borderAlpha})`;
    const shadowSpread = useTransform(glow, [0, 1], [0, 16]);
    const boxShadow = useMotionTemplate`0 0 ${shadowSpread}px 2px rgba(251,191,36,0.4)`;

    return (
        <motion.button
            className="flex flex-col items-center gap-2 flex-1 gpu-layer"
            style={{ scale, opacity }}
            onClick={() => !frozen && onSwipe(dir)}
        >
            {/* Direction chevron — glows gold if highlighted, hidden after first swipes */}
            {showHint !== false && (
                <motion.div
                    className={`text-xl tracking-widest font-bold ui ${highlighted ? 'text-[var(--color-gold)]' : 'text-white/60'}`}
                    animate={highlighted ? { opacity: [0.5, 1, 0.5] } : {}}
                    transition={highlighted ? { duration: 1, repeat: Infinity } : {}}
                >
                    {dirLabel}
                </motion.div>
            )}
            {/* Answer bubble — lights up gold as you drag toward it */}
            <motion.div
                className={`w-[80px] h-[80px] rounded-full border-2 bg-white/[0.08] flex items-center justify-center text-[28px] chalk active:scale-90 transition-transform ${correctFlash ? 'border-[var(--color-correct)] text-[var(--color-correct)]'
                    : highlighted ? 'border-[var(--color-gold)] text-[var(--color-gold)]'
                        : 'border-white/40 text-white'
                    }`}
                style={!correctFlash && !highlighted ? { borderColor, boxShadow } : {}}
                animate={correctFlash ? correctFlashAnim : highlighted ? glowAnim : {}}
                transition={correctFlash ? { duration: 0.35 } : highlighted ? glowTransition : {}}
            >
                {label ?? value}
            </motion.div>
        </motion.button>
    );
});

export const ProblemView = memo(function ProblemView({ problem, frozen, highlightCorrect, showHints = true, onSwipe }: Props) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const leftGlow = useTransform(x, [-140, -50, 0], [1, 0.3, 0]);
    const rightGlow = useTransform(x, [0, 50, 140], [0, 0.3, 1]);
    const downGlow = useTransform(y, [0, 50, 140], [0, 0.3, 1]);
    const glows = [leftGlow, downGlow, rightGlow];

    // Swipe dust trail — driven by existing motion values, no extra animation
    const trailOpacity = useTransform(
        [x, y] as MotionValue[],
        ([xv, yv]: number[]) => Math.min(Math.sqrt(xv * xv + yv * yv) / 120, 0.6)
    );
    const trailBg = useMotionTemplate`rgba(255,255,255,${trailOpacity})`;

    const handleDragEnd = (_: unknown, info: PanInfo) => {
        if (frozen) return;
        const t = 80;
        if (info.offset.y < -t || info.velocity.y < -400) onSwipe('up');
        else if (info.offset.y > t || info.velocity.y > 400) onSwipe('down');
        else if (info.offset.x > t || info.velocity.x > 400) onSwipe('right');
        else if (info.offset.x < -t || info.velocity.x < -400) onSwipe('left');
    };

    return (
        <motion.div
            className="landscape-answers flex-1 flex flex-col items-center justify-center px-4 pb-24 relative z-10 gpu-layer"
            style={{ x, y }}
            drag={!frozen}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
        >
            {/* Swipe chalk dust trail */}
            <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
                style={{ opacity: trailOpacity }}
            >
                {[0.3, 0.6, 0.9].map(s => (
                    <motion.div
                        key={s}
                        className="absolute rounded-full"
                        style={{
                            width: 6, height: 6,
                            background: trailBg,
                            x: useTransform(x, v => -v * s),
                            y: useTransform(y, v => -v * s),
                        }}
                    />
                ))}
            </motion.div>
            {/* Problem expression */}
            <motion.div className="text-center mb-12" animate={pulseAnim}>
                <div className={`landscape-question chalk leading-tight tracking-wider text-white whitespace-nowrap ${problem.expression.length > 10 ? 'text-4xl' : 'text-6xl'}`}>
                    {problem.latex
                        ? <MathExpr latex={problem.latex} />
                        : problem.expression
                    }
                </div>
            </motion.div>

            {/* Tutorial hint — only on first question */}
            {highlightCorrect && (
                <motion.div
                    className="text-sm ui text-white/50 mb-4"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    ← swipe towards the answer →
                </motion.div>
            )}

            {/* Answer options */}
            <div className="flex items-center justify-center gap-3 w-full max-w-[380px]">
                {problem.options.map((opt, i) => (
                    <AnswerOption
                        key={`${opt}-${i}`}
                        value={opt}
                        label={problem.optionLabels?.[i]}
                        dir={DIRS[i]}
                        dirLabel={DIR_LABELS[i]}
                        glow={glows[i]}
                        frozen={frozen}
                        onSwipe={onSwipe}
                        highlighted={highlightCorrect && i === problem.correctIndex}
                        correctFlash={frozen && i === problem.correctIndex}
                        showHint={showHints}
                    />
                ))}
            </div>

            {/* Skip hint */}
            {showHints && (
                <div className="mt-8 flex flex-col items-center text-white/40">
                    <div className="text-xl font-bold tracking-wider ui">^</div>
                    <span className="text-xs ui mt-1 tracking-wider">skip</span>
                </div>
            )}
        </motion.div>
    );
});
