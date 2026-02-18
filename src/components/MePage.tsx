import { motion } from 'framer-motion';
import type { useStats } from '../hooks/useStats';

interface Props {
    stats: ReturnType<typeof useStats>['stats'];
    accuracy: number;
    sessionScore: number;
    sessionStreak: number;
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.08, duration: 0.3, ease: 'easeOut' as const },
    }),
};

function StatCard({ icon, label, value, color, index }: {
    icon: string; label: string; value: string | number; color: string; index: number;
}) {
    return (
        <motion.div
            className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1"
            custom={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
        >
            <span className="text-2xl">{icon}</span>
            <span className={`text-2xl font-[family-name:var(--font-chalk)] ${color}`}>
                {value}
            </span>
            <span className="text-[11px] font-[family-name:var(--font-ui)] text-white/40 tracking-wide uppercase">
                {label}
            </span>
        </motion.div>
    );
}

export function MePage({ stats, accuracy, sessionScore, sessionStreak }: Props) {
    const level = stats.totalXP < 100 ? 1
        : stats.totalXP < 500 ? 2
            : stats.totalXP < 1500 ? 3
                : stats.totalXP < 5000 ? 4 : 5;

    const levelNames = ['Beginner', 'Learner', 'Thinker', 'Wizard', 'Legend'];
    const levelEmojis = ['🌱', '📖', '🧠', '🧙‍♂️', '👑'];

    return (
        <div className="flex-1 flex flex-col px-6 pt-[calc(env(safe-area-inset-top,16px)+24px)] pb-4 overflow-y-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-4xl mb-1">{levelEmojis[level - 1]}</div>
                <h2 className="text-3xl font-[family-name:var(--font-chalk)] text-[var(--color-gold)]">
                    {levelNames[level - 1]}
                </h2>
                <p className="text-xs font-[family-name:var(--font-ui)] text-white/30 mt-1">
                    Level {level} · Your Math Aura
                </p>
            </motion.div>

            {/* Stat Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatCard icon="⚡" label="Total XP" value={stats.totalXP.toLocaleString()} color="text-[var(--color-gold)]" index={0} />
                <StatCard icon="🔥" label="Best Streak" value={stats.bestStreak} color="text-[var(--color-streak-fire)]" index={1} />
                <StatCard icon="🎯" label="Accuracy" value={`${accuracy}%`} color="text-[var(--color-correct)]" index={2} />
                <StatCard icon="✅" label="Solved" value={stats.totalSolved.toLocaleString()} color="text-white/80" index={3} />
            </div>

            {/* Session stats */}
            <motion.div
                className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <h3 className="text-sm font-[family-name:var(--font-ui)] text-white/40 mb-3 tracking-wide uppercase">
                    This Session
                </h3>
                <div className="flex justify-around text-center">
                    <div>
                        <div className="text-xl font-[family-name:var(--font-chalk)] text-[var(--color-gold)]">
                            {sessionScore}
                        </div>
                        <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/30">XP</div>
                    </div>
                    <div>
                        <div className="text-xl font-[family-name:var(--font-chalk)] text-[var(--color-streak-fire)]">
                            {sessionStreak}
                        </div>
                        <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/30">Best Streak</div>
                    </div>
                    <div>
                        <div className="text-xl font-[family-name:var(--font-chalk)] text-white/70">
                            {stats.sessionsPlayed}
                        </div>
                        <div className="text-[10px] font-[family-name:var(--font-ui)] text-white/30">Sessions</div>
                    </div>
                </div>
            </motion.div>

            {/* Fun aura message */}
            <motion.p
                className="text-center text-sm font-[family-name:var(--font-ui)] text-white/25 mt-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                {accuracy >= 90 ? '✨ Your math aura is radiant ✨' :
                    accuracy >= 70 ? '🌟 You have a bright math aura 🌟' :
                        accuracy >= 50 ? '💫 Your aura is growing stronger 💫' :
                            stats.totalSolved > 0 ? '🌱 Every problem grows your aura 🌱' :
                                '🎮 Start playing to build your aura!'}
            </motion.p>
        </div>
    );
}
