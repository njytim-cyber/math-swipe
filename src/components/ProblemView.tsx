import { memo } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import type { Problem } from '../utils/mathGenerator';

interface Props {
    problem: Problem;
    frozen: boolean;
    highlightCorrect?: boolean;
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
const AnswerOption = memo(function AnswerOption({
    value, dir, dirLabel, glow, frozen, onSwipe, highlighted,
}: {
    value: number; dir: 'left' | 'down' | 'right'; dirLabel: string;
    glow: MotionValue<number>; frozen: boolean;
    onSwipe: (d: 'left' | 'right' | 'up' | 'down') => void;
    highlighted?: boolean;
}) {
    const scale = useTransform(glow, [0, 1], [1, 1.18]);
    const opacity = useTransform(glow, [0, 1], [0.7, 1]);

    return (
        <motion.button
            className="flex flex-col items-center gap-2 flex-1 gpu-layer"
            style={{ scale, opacity }}
            onClick={() => !frozen && onSwipe(dir)}
        >
            {/* Direction chevron — glows gold if highlighted */}
            <motion.div
                className={`text-xl tracking-widest font-bold ui ${highlighted ? 'text-[var(--color-gold)]' : 'text-white/60'}`}
                animate={highlighted ? { opacity: [0.5, 1, 0.5] } : {}}
                transition={highlighted ? { duration: 1, repeat: Infinity } : {}}
            >
                {dirLabel}
            </motion.div>
            {/* Answer bubble — pulsing gold glow if highlighted */}
            <motion.div
                className={`w-[80px] h-[80px] rounded-full border-2 bg-white/[0.08] flex items-center justify-center text-[28px] chalk active:scale-90 transition-transform ${highlighted ? 'border-[var(--color-gold)] text-[var(--color-gold)]' : 'border-white/40 text-white'
                    }`}
                animate={highlighted ? glowAnim : {}}
                transition={highlighted ? glowTransition : {}}
            >
                {value}
            </motion.div>
        </motion.button>
    );
});

export const ProblemView = memo(function ProblemView({ problem, frozen, highlightCorrect, onSwipe }: Props) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const leftGlow = useTransform(x, [-140, -50, 0], [1, 0.3, 0]);
    const rightGlow = useTransform(x, [0, 50, 140], [0, 0.3, 1]);
    const downGlow = useTransform(y, [0, 50, 140], [0, 0.3, 1]);
    const glows = [leftGlow, downGlow, rightGlow];

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
            {/* Problem expression */}
            <motion.div className="text-center mb-12" animate={pulseAnim}>
                <div className="landscape-question text-6xl chalk leading-tight tracking-wider text-white">
                    {problem.expression}
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
                        dir={DIRS[i]}
                        dirLabel={DIR_LABELS[i]}
                        glow={glows[i]}
                        frozen={frozen}
                        onSwipe={onSwipe}
                        highlighted={highlightCorrect && i === problem.correctIndex}
                    />
                ))}
            </div>

            {/* Skip hint */}
            <div className="mt-8 flex flex-col items-center text-white/40">
                <div className="text-xl font-bold tracking-wider ui">^</div>
                <span className="text-xs ui mt-1 tracking-wider">skip</span>
            </div>
        </motion.div>
    );
});
