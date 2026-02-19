import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { db } from '../utils/firebase';

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    totalXP: number;
    bestStreak: number;
}

interface Props {
    userXP: number;
    userStreak: number;
    uid: string | null;
    displayName: string;
}

export const LeaguePage = memo(function LeaguePage({ userXP, userStreak, uid, displayName }: Props) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'users'),
            where('totalXP', '>', 0),
            orderBy('totalXP', 'desc'),
            limit(20),
        );

        const unsub = onSnapshot(q, (snap) => {
            const data: LeaderboardEntry[] = snap.docs.map(doc => ({
                uid: doc.id,
                displayName: doc.data().displayName || 'Anonymous',
                totalXP: doc.data().totalXP || 0,
                bestStreak: doc.data().bestStreak || 0,
            }));
            setEntries(data);
            setLoading(false);
        }, (err) => {
            console.warn('Leaderboard query failed:', err);
            setLoading(false);
        });

        return unsub;
    }, []);

    // Ensure current user appears in the list (they might not be top 20)
    const board = (() => {
        const list = [...entries];
        const userInList = uid ? list.find(e => e.uid === uid) : null;
        if (!userInList && uid) {
            list.push({
                uid,
                displayName: displayName || 'You',
                totalXP: userXP,
                bestStreak: userStreak,
            });
        } else if (userInList) {
            // Update with latest local stats (may be newer than Firestore snapshot)
            userInList.totalXP = Math.max(userInList.totalXP, userXP);
            userInList.bestStreak = Math.max(userInList.bestStreak, userStreak);
        }
        return list
            .sort((a, b) => b.totalXP - a.totalXP)
            .map((e, i) => ({ ...e, rank: i + 1, isYou: e.uid === uid }));
    })();

    return (
        <div className="flex-1 flex flex-col items-center px-4 pt-[calc(env(safe-area-inset-top,16px)+40px)] pb-24 overflow-y-auto">
            {/* Header */}
            <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h2 className="text-3xl chalk text-[var(--color-gold)] mb-1">League</h2>
                <p className="text-xs ui text-[rgb(var(--color-fg))]/30">Global leaderboard</p>
            </motion.div>

            {/* Loading state */}
            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        className="text-sm ui text-[rgb(var(--color-fg))]/30"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        Loading leaderboard...
                    </motion.div>
                </div>
            )}

            {/* Empty state */}
            {!loading && board.length === 0 && (
                <div className="text-sm ui text-[rgb(var(--color-fg))]/30 mt-8">
                    No players yet. Be the first! 🎮
                </div>
            )}

            {/* Leaderboard */}
            <AnimatePresence>
                {!loading && (
                    <motion.div
                        className="w-full max-w-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {board.map((entry, i) => (
                            <motion.div
                                key={entry.uid}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.04 }}
                                className={`flex items-center gap-3 py-3 px-3 rounded-xl mb-1 ${entry.isYou
                                    ? 'bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/20'
                                    : ''
                                    }`}
                            >
                                {/* Rank */}
                                <div className={`w-7 text-center ui font-bold text-lg ${entry.rank === 1 ? 'text-[var(--color-gold)]' :
                                    entry.rank === 2 ? 'text-[rgb(var(--color-fg))]/60' :
                                        entry.rank === 3 ? 'text-[var(--color-streak-fire)]' :
                                            'text-[rgb(var(--color-fg))]/30'
                                    }`}>
                                    {entry.rank === 1 ? '👑' : entry.rank === 2 ? '⚡' : entry.rank === 3 ? '🔥' : entry.rank}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm ui font-semibold truncate ${entry.isYou ? 'text-[var(--color-gold)]' : 'text-[rgb(var(--color-fg))]/70'
                                        }`}>
                                        {entry.displayName}
                                        {entry.isYou && <span className="ml-1 text-xs opacity-50">(you)</span>}
                                    </div>
                                </div>

                                {/* XP */}
                                <div className="text-right">
                                    <div className={`text-sm ui font-semibold ${entry.isYou ? 'text-[var(--color-gold)]' : 'text-[rgb(var(--color-fg))]/50'
                                        }`}>
                                        {entry.totalXP.toLocaleString()}
                                    </div>
                                    <div className="text-[9px] ui text-[rgb(var(--color-fg))]/20">XP</div>
                                </div>

                                {/* Streak */}
                                <div className="text-right w-10">
                                    <div className="text-xs ui font-semibold text-[var(--color-streak-fire)]">
                                        {entry.bestStreak > 0 ? `${entry.bestStreak}🔥` : '—'}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
});
