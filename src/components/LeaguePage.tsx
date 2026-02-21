import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, orderBy, limit, onSnapshot, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { CHALK_THEMES } from '../utils/chalkThemes';
import { COSTUMES } from '../utils/costumes';

// Make COSTUMES accessible: We will import it from MrChalk, so we must export COSTUMES in MrChalk.
// Assuming we'll export COSTUMES from MrChalk in a subsequent change.

interface LeaderboardEntry {
    uid: string;
    displayName: string;
    totalXP: number;
    bestStreak: number;
    activeThemeId?: string;
    activeCostume?: string;
    rank?: number;
}

interface Props {
    userXP: number;
    userStreak: number;
    uid: string | null;
    displayName: string;
    activeThemeId: string;
    activeCostume: string;
}

export const LeaguePage = memo(function LeaguePage({ userXP, userStreak, uid, displayName, activeThemeId, activeCostume }: Props) {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlayer, setSelectedPlayer] = useState<LeaderboardEntry | null>(null);

    const [pingCooldown, setPingCooldown] = useState(false);

    const handleAction = async (action: 'race' | 'ping') => {
        if (!selectedPlayer) return;
        if (action === 'race') {
            // Trigger Ghost Race via challenge param
            window.location.search = `?c=ghost-${selectedPlayer.uid}`;
        } else if (action === 'ping') {
            if (pingCooldown) return;
            setPingCooldown(true);
            try {
                await addDoc(collection(db, 'pings'), {
                    targetUid: selectedPlayer.uid,
                    senderUid: uid || 'anonymous',
                    senderName: displayName || 'Someone',
                    createdAt: serverTimestamp(),
                    read: false
                });
                alert(`Ping sent to ${selectedPlayer.displayName}!`);
            } catch (err) {
                console.error("Failed to send ping", err);
            }
            setSelectedPlayer(null);
            setTimeout(() => setPingCooldown(false), 5000); // 5s cooldown
        }
    };

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
                activeThemeId: doc.data().activeThemeId || 'classic',
                activeCostume: doc.data().activeCostume || '',
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
                activeThemeId,
                activeCostume,
            });
        } else if (userInList) {
            // Update with latest local stats (may be newer than Firestore snapshot)
            userInList.totalXP = Math.max(userInList.totalXP, userXP);
            userInList.bestStreak = Math.max(userInList.bestStreak, userStreak);
            userInList.activeThemeId = activeThemeId;
            userInList.activeCostume = activeCostume;
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

                                {/* Name & Cosmetic */}
                                <div className="flex-1 min-w-0 flex items-center gap-1.5" onClick={() => !entry.isYou && setSelectedPlayer(entry)}>
                                    <div
                                        className={`text-sm ui font-semibold truncate ${entry.isYou ? '' : 'text-[rgb(var(--color-fg))]/70'}`}
                                        style={entry.activeThemeId ? { color: CHALK_THEMES.find(t => t.id === entry.activeThemeId)?.color } : undefined}
                                    >
                                        {entry.displayName}
                                        {entry.isYou && <span className="ml-1 text-xs opacity-50" style={{ color: 'rgb(var(--color-fg))' }}>(you)</span>}
                                    </div>
                                    {entry.activeCostume && COSTUMES[entry.activeCostume] && (
                                        <svg viewBox="0 0 100 160" className="w-[14px] h-[22px] flex-shrink-0" style={{ color: CHALK_THEMES.find(t => t.id === entry.activeThemeId)?.color || 'var(--color-chalk)' }}>
                                            {COSTUMES[entry.activeCostume]}
                                        </svg>
                                    )}
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
            {/* Action Sheet Modal */}
            <AnimatePresence>
                {selectedPlayer && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            className="fixed inset-0 bg-[var(--color-overlay)] z-40 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPlayer(null)}
                        />
                        {/* Drawer */}
                        <motion.div
                            className="fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-gold)]/20 rounded-t-3xl p-6 z-50 pb-[calc(env(safe-area-inset-bottom,20px)+20px)]"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                {selectedPlayer.activeCostume && COSTUMES[selectedPlayer.activeCostume] ? (
                                    <svg viewBox="0 0 100 160" className="w-[28px] h-[44px]" style={{ color: CHALK_THEMES.find(t => t.id === selectedPlayer.activeThemeId)?.color || 'var(--color-chalk)' }}>
                                        {COSTUMES[selectedPlayer.activeCostume]}
                                    </svg>
                                ) : (
                                    <div className="w-[28px] h-[44px] flex items-center justify-center text-xl">👤</div>
                                )}
                                <div>
                                    <h3
                                        className="text-lg ui font-bold"
                                        style={{ color: CHALK_THEMES.find(t => t.id === selectedPlayer.activeThemeId)?.color || 'rgb(var(--color-fg))' }}
                                    >
                                        {selectedPlayer.displayName}
                                    </h3>
                                    <p className="text-xs ui text-[rgb(var(--color-fg))]/40">Rank #{selectedPlayer.rank} • {selectedPlayer.totalXP.toLocaleString()} XP</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleAction('race')}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold ui text-[var(--color-surface)] bg-[var(--color-gold)] active:opacity-80 transition-opacity"
                                >
                                    <span>⚔️</span> Ghost Race
                                </button>
                                <button
                                    onClick={() => handleAction('ping')}
                                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold ui border border-[var(--color-gold)]/30 text-[var(--color-gold)] active:bg-[var(--color-gold)]/10 transition-colors"
                                >
                                    <span>👋</span> Ping Player
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
});
