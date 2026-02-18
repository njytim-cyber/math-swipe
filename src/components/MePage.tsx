import { motion } from 'framer-motion';
import type { useStats } from '../hooks/useStats';
import type { QuestionType } from '../utils/mathGenerator';

interface Props {
    stats: ReturnType<typeof useStats>['stats'];
    accuracy: number;
    sessionScore: number;
    sessionStreak: number;
}

const TYPE_LABELS: { id: QuestionType; icon: string }[] = [
    { id: 'add', icon: '+' },
    { id: 'subtract', icon: '−' },
    { id: 'multiply', icon: '×' },
    { id: 'divide', icon: '÷' },
    { id: 'square', icon: 'x²' },
    { id: 'sqrt', icon: '√' },
];

export function MePage({ stats, accuracy, sessionScore, sessionStreak }: Props) {
    const level = stats.totalXP < 100 ? 1
        : stats.totalXP < 500 ? 2
            : stats.totalXP < 1500 ? 3
                : stats.totalXP < 5000 ? 4 : 5;

    const levelNames = ['Beginner', 'Learner', 'Thinker', 'Wizard', 'Legend'];

    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
            {/* Title — big chalk style like score on game screen */}
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-7xl font-[family-name:var(--font-chalk)] text-[var(--color-gold)] leading-tight">
                    {stats.totalXP.toLocaleString()}
                </div>
                <div className="text-sm font-[family-name:var(--font-ui)] text-white/30 mt-1">
                    XP · {levelNames[level - 1]}
                </div>
            </motion.div>

            {/* Core stats — horizontal, chalk style */}
            <div className="flex gap-8 mb-10">
                <div className="text-center">
                    <div className="text-2xl font-[family-name:var(--font-chalk)] text-[var(--color-streak-fire)]">
                        {stats.bestStreak}
                    </div>
                    <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/30">🔥 streak</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-[family-name:var(--font-chalk)] text-[var(--color-correct)]">
                        {accuracy}%
                    </div>
                    <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/30">🎯 accuracy</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-[family-name:var(--font-chalk)] text-white/70">
                        {stats.totalSolved}
                    </div>
                    <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/30">✅ solved</div>
                </div>
            </div>

            {/* Per question type row */}
            <div className="w-full max-w-sm">
                <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/20 uppercase tracking-widest text-center mb-3">
                    by type
                </div>
                <div className="flex justify-between">
                    {TYPE_LABELS.map(t => {
                        const ts = stats.byType[t.id];
                        const pct = ts.solved > 0 ? Math.round((ts.correct / ts.solved) * 100) : 0;
                        return (
                            <div key={t.id} className="flex flex-col items-center gap-1">
                                <div className="text-lg font-[family-name:var(--font-chalk)] text-white/50">
                                    {t.icon}
                                </div>
                                <div className={`text-xs font-[family-name:var(--font-chalk)] ${ts.solved === 0 ? 'text-white/15' :
                                        pct >= 80 ? 'text-[var(--color-correct)]' :
                                            pct >= 50 ? 'text-[var(--color-gold)]' :
                                                'text-white/40'
                                    }`}>
                                    {ts.solved === 0 ? '—' : `${pct}%`}
                                </div>
                                <div className="text-[9px] font-[family-name:var(--font-ui)] text-white/15">
                                    {ts.solved === 0 ? '' : ts.solved}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Session */}
            {sessionScore > 0 && (
                <motion.div
                    className="mt-10 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/20 uppercase tracking-widest mb-2">
                        this session
                    </div>
                    <span className="text-lg font-[family-name:var(--font-chalk)] text-[var(--color-gold)]">
                        {sessionScore} xp
                    </span>
                    <span className="text-white/20 mx-2">·</span>
                    <span className="text-lg font-[family-name:var(--font-chalk)] text-[var(--color-streak-fire)]">
                        {sessionStreak}🔥
                    </span>
                </motion.div>
            )}

            {/* Aura */}
            <motion.p
                className="text-xs font-[family-name:var(--font-ui)] text-white/15 mt-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {accuracy >= 90 ? '✨ radiant aura ✨' :
                    accuracy >= 70 ? '🌟 bright aura' :
                        accuracy >= 50 ? '💫 growing aura' :
                            stats.totalSolved > 0 ? '🌱 budding aura' :
                                '🎮 play to build your aura'}
            </motion.p>
        </div>
    );
}
