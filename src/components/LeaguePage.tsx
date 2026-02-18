import { memo } from 'react';
import { motion } from 'framer-motion';

const LEADERBOARD = [
    { rank: 1, name: 'MathWizard99', xp: 12_450, streak: 47, emoji: '👑' },
    { rank: 2, name: 'CalcQueen', xp: 10_200, streak: 38, emoji: '⚡' },
    { rank: 3, name: 'NumberNinja', xp: 8_900, streak: 32, emoji: '🔥' },
    { rank: 4, name: 'BrainiacBoy', xp: 7_300, streak: 28, emoji: '' },
    { rank: 5, name: 'SpeedSolver', xp: 6_100, streak: 25, emoji: '' },
    { rank: 6, name: 'You', xp: 0, streak: 0, emoji: '🎮', isYou: true },
    { rank: 7, name: 'MathMonkey', xp: 4_800, streak: 22, emoji: '' },
    { rank: 8, name: 'PiLover314', xp: 3_500, streak: 18, emoji: '' },
    { rank: 9, name: 'QuickCalc', xp: 2_200, streak: 14, emoji: '' },
    { rank: 10, name: 'Newbie123', xp: 800, streak: 5, emoji: '' },
];

interface Props {
    userXP: number;
    userStreak: number;
}

export const LeaguePage = memo(function LeaguePage({ userXP, userStreak }: Props) {
    // Inject user's real stats
    const board = LEADERBOARD.map(entry =>
        entry.isYou ? { ...entry, xp: userXP, streak: userStreak } : entry
    ).sort((a, b) => b.xp - a.xp).map((e, i) => ({ ...e, rank: i + 1 }));

    return (
        <div className="flex-1 flex flex-col items-center px-4 pt-[calc(env(safe-area-inset-top,16px)+40px)] pb-24 overflow-y-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl chalk text-[var(--color-gold)] mb-1">League</h2>
                <p className="text-xs ui text-white/30">Weekly leaderboard</p>
            </motion.div>

            {/* Leaderboard */}
            <div className="w-full max-w-sm">
                {board.map((entry, i) => (
                    <motion.div
                        key={entry.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className={`flex items-center gap-3 py-3 px-3 rounded-xl mb-1 ${entry.isYou
                                ? 'bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20'
                                : ''
                            }`}
                    >
                        {/* Rank */}
                        <div className={`w-7 text-center chalk text-lg ${entry.rank === 1 ? 'text-[var(--color-gold)]' :
                                entry.rank === 2 ? 'text-white/60' :
                                    entry.rank === 3 ? 'text-[var(--color-streak-fire)]' :
                                        'text-white/30'
                            }`}>
                            {entry.rank <= 3 ? entry.emoji : entry.rank}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                            <div className={`text-sm chalk truncate ${entry.isYou ? 'text-[var(--color-gold)]' : 'text-white/70'
                                }`}>
                                {entry.name}
                            </div>
                        </div>

                        {/* XP */}
                        <div className="text-right">
                            <div className={`text-sm chalk ${entry.isYou ? 'text-[var(--color-gold)]' : 'text-white/50'
                                }`}>
                                {entry.xp.toLocaleString()}
                            </div>
                            <div className="text-[9px] ui text-white/20">XP</div>
                        </div>

                        {/* Streak */}
                        <div className="text-right w-10">
                            <div className="text-xs chalk text-[var(--color-streak-fire)]">
                                {entry.streak > 0 ? `${entry.streak}🔥` : '—'}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
});
