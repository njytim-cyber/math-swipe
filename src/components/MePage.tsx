import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { useStats } from '../hooks/useStats';
import { QUESTION_TYPES } from '../utils/questionTypes';
import { ACHIEVEMENTS } from '../utils/achievements';
import { AchievementBadge } from './AchievementBadge';
import { CHALK_THEMES, type ChalkTheme } from '../utils/chalkThemes';

interface Props {
    stats: ReturnType<typeof useStats>['stats'];
    accuracy: number;
    sessionScore: number;
    sessionStreak: number;
    onReset: () => void;
    unlocked: Set<string>;
    activeCostume: string;
    onCostumeChange: (id: string) => void;
    activeTheme: string;
    onThemeChange: (theme: ChalkTheme) => void;
}

/** Ranks with progressive XP thresholds (gets harder to level up) */
const RANKS = [
    { name: 'Beginner', emoji: '🌱', xp: 0 },
    { name: 'Learner', emoji: '📚', xp: 100 },
    { name: 'Thinker', emoji: '🧠', xp: 300 },
    { name: 'Problem Solver', emoji: '🔧', xp: 600 },
    { name: 'Calculator', emoji: '🖩', xp: 1000 },
    { name: 'Mathematician', emoji: '📐', xp: 1800 },
    { name: 'Wizard', emoji: '🧙', xp: 3000 },
    { name: 'Grandmaster', emoji: '♟️', xp: 5000 },
    { name: 'Legend', emoji: '👑', xp: 8000 },
    { name: 'Mythic', emoji: '🌌', xp: 12000 },
    { name: 'Transcendent', emoji: '✨', xp: 20000 },
];

function getRank(xp: number) {
    let rank = RANKS[0];
    let nextRank: typeof RANKS[number] | null = RANKS[1];
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (xp >= RANKS[i].xp) {
            rank = RANKS[i];
            nextRank = RANKS[i + 1] || null;
            break;
        }
    }
    const progress = nextRank
        ? (xp - rank.xp) / (nextRank.xp - rank.xp)
        : 1;
    return { rank, nextRank, progress };
}

export const MePage = memo(function MePage({ stats, accuracy, onReset, unlocked, activeCostume, onCostumeChange, activeTheme, onThemeChange }: Props) {
    const [showRanks, setShowRanks] = useState(false);
    const [resetConfirm, setResetConfirm] = useState<string | null>(null);
    const { rank, nextRank, progress } = getRank(stats.totalXP);

    return (
        <div className="flex-1 flex flex-col items-center overflow-y-auto px-6 pt-4 pb-20">
            {/* Title — rank display */}
            <motion.div
                className="text-center mb-8"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-5xl mb-2">{rank.emoji}</div>
                <button
                    onClick={() => setShowRanks(true)}
                    className="text-2xl chalk text-[var(--color-gold)] leading-tight hover:opacity-80 transition-opacity"
                >
                    {rank.name}
                </button>
                {/* Progress to next rank */}
                {nextRank && (
                    <div className="mt-3 w-48 mx-auto">
                        <div className="h-1.5 rounded-full bg-[rgb(var(--color-fg))]/10 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-[var(--color-gold)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.round(progress * 100)}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut' }}
                            />
                        </div>
                        <div className="text-xs ui text-[rgb(var(--color-fg))]/50 mt-1.5">
                            {stats.totalXP.toLocaleString()} / {nextRank.xp.toLocaleString()} → {nextRank.name}
                        </div>
                    </div>
                )}
                {!nextRank && (
                    <div className="text-xs ui text-[rgb(var(--color-fg))]/50 mt-2">
                        Max rank reached! {stats.totalXP.toLocaleString()} points ✨
                    </div>
                )}
            </motion.div>

            {/* Core stats — horizontal, chalk style */}
            <div className="flex gap-6 mb-8">
                <div className="text-center">
                    <div className="text-2xl chalk text-[var(--color-streak-fire)]">
                        {stats.bestStreak}
                    </div>
                    <div className="text-xs ui text-[rgb(var(--color-fg))]/60">🔥 streak</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl chalk text-[var(--color-correct)]">
                        {accuracy}%
                    </div>
                    <div className="text-xs ui text-[rgb(var(--color-fg))]/40">🎯 accuracy</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl chalk text-[rgb(var(--color-fg))]/70">
                        {stats.totalSolved}
                    </div>
                    <div className="text-xs ui text-[rgb(var(--color-fg))]/40">✅ solved</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl chalk text-[var(--color-gold)]">
                        {(() => {
                            const d = stats.byType.daily ?? { solved: 0, correct: 0 };
                            return d.solved > 0 ? `${Math.round((d.correct / d.solved) * 100)}%` : '?';
                        })()}
                    </div>
                    <div className="text-xs ui text-[rgb(var(--color-fg))]/60">📅 daily</div>
                </div>
            </div>

            {/* Per question type row */}
            <div className="w-full max-w-sm">
                <div className="text-xs ui text-[rgb(var(--color-fg))]/50 uppercase tracking-widest text-center mb-3">
                    by type
                </div>
                <div className="grid grid-cols-5 gap-2 justify-items-center">
                    {QUESTION_TYPES.filter(t => !t.id.startsWith('mix-') && t.id !== 'daily' && t.id !== 'challenge').map(t => {
                        const ts = stats.byType[t.id] ?? { solved: 0, correct: 0 };
                        const pct = ts.solved > 0 ? Math.round((ts.correct / ts.solved) * 100) : 0;
                        return (
                            <div key={t.id} className="flex flex-col items-center gap-1">
                                <div className={`chalk text-[rgb(var(--color-fg))]/50 ${t.icon.length === 1 ? 'text-xl' : 'text-lg'}`}>
                                    {t.icon}
                                </div>
                                <div className={`text-sm ui font-semibold ${ts.solved === 0 ? 'text-[rgb(var(--color-fg))]/20' :
                                    pct >= 80 ? 'text-[var(--color-correct)]' :
                                        pct >= 50 ? 'text-[var(--color-gold)]' :
                                            'text-[rgb(var(--color-fg))]/50'
                                    }`}>
                                    {ts.solved === 0 ? '—' : `${pct}%`}
                                </div>
                                <div className="text-[10px] ui text-[rgb(var(--color-fg))]/30">
                                    {ts.solved === 0 ? '—' : `${ts.solved} solved`}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Achievements */}
            <div className="w-full max-w-sm mt-8">
                <div className="text-sm ui text-[rgb(var(--color-fg))]/50 uppercase tracking-widest text-center mb-3">
                    achievements · {[...unlocked].length}/{ACHIEVEMENTS.length}
                </div>
                <div className="grid grid-cols-4 gap-3 justify-items-center">
                    {ACHIEVEMENTS.map(a => {
                        const isUnlocked = unlocked.has(a.id);
                        const hasCostume = ['streak-5', 'streak-20', 'sharpshooter', 'math-machine', 'century'].includes(a.id);
                        const isActive = activeCostume === a.id;
                        return (
                            <div
                                key={a.id}
                                onClick={() => isUnlocked && hasCostume && onCostumeChange(isActive ? '' : a.id)}
                                className={isUnlocked && hasCostume ? 'cursor-pointer' : ''}
                            >
                                <AchievementBadge
                                    achievementId={a.id}
                                    unlocked={isUnlocked}
                                    equipped={isActive}
                                    name={a.name}
                                    desc={isActive ? '✅ equipped' : a.desc}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Chalk Themes — locked ones faded like achievements */}
            <div className="w-full max-w-sm mt-6">
                <div className="text-sm ui text-[rgb(var(--color-fg))]/50 uppercase tracking-widest text-center mb-3">
                    CHALK COLOR
                </div>
                <div className="flex justify-center gap-2.5 flex-wrap">
                    {CHALK_THEMES.map(t => {
                        const rankIdx = RANKS.findIndex(r => r.name === rank.name);
                        const isAvailable = rankIdx >= (t.minLevel - 1);
                        const isActive = activeTheme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => isAvailable && onThemeChange(t)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${isActive ? 'border-[var(--color-gold)] scale-110' :
                                    isAvailable ? 'border-[rgb(var(--color-fg))]/20 hover:border-[rgb(var(--color-fg))]/40' :
                                        'border-[rgb(var(--color-fg))]/8 opacity-40 cursor-not-allowed'
                                    }`}
                                style={{ backgroundColor: t.color }}
                            />
                        );
                    })}
                </div>
            </div>

            <button
                onClick={() => {
                    const prompts = [
                        `You've earned ${stats.totalXP.toLocaleString()} points! Are you sure you want to start fresh? 🥺`,
                        `Mr. Chalk will miss your ${stats.bestStreak}-streak record! Reset anyway? 🤔`,
                        `${stats.totalSolved} problems solved and counting… wipe it all? 😱`,
                        'A fresh start can be beautiful! Ready to begin again? 🌱',
                        'Your math journey so far has been amazing! Really reset? ✨',
                        'Even superheroes get a fresh origin story! Reset? 🦸',
                    ];
                    setResetConfirm(prompts[Math.floor(Math.random() * prompts.length)]);
                }}
                className="text-sm ui text-[rgb(var(--color-fg))]/35 mt-12 hover:text-[rgb(var(--color-fg))]/50 transition-colors uppercase tracking-widest"
            >
                RESET STATS
            </button>

            {/* Rank list modal */}
            <AnimatePresence>
                {showRanks && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-[var(--color-overlay-dim)] z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowRanks(false)}
                        />
                        <motion.div
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-overlay)] border border-[rgb(var(--color-fg))]/15 rounded-2xl px-5 py-5 max-h-[75vh] overflow-y-auto w-[300px]"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                        >
                            <h3 className="text-lg chalk text-[var(--color-gold)] text-center mb-4">Ranks</h3>
                            <div className="space-y-2">
                                {RANKS.map((r) => {
                                    const isCurrent = r.name === rank.name;
                                    const isReached = stats.totalXP >= r.xp;
                                    return (
                                        <div
                                            key={r.name}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${isCurrent
                                                ? 'bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30'
                                                : ''
                                                }`}
                                        >
                                            <span className="text-xl">{r.emoji}</span>
                                            <div className="flex-1">
                                                <div className={`text-sm ui font-semibold ${isCurrent ? 'text-[var(--color-gold)]' :
                                                    isReached ? 'text-[rgb(var(--color-fg))]/70' : 'text-[rgb(var(--color-fg))]/30'
                                                    }`}>
                                                    {r.name}
                                                    {isCurrent && <span className="ml-1 text-xs">← you</span>}
                                                </div>
                                                <div className="text-[11px] ui text-[rgb(var(--color-fg))]/25">
                                                    {r.xp === 0 ? 'Starting rank' : `${r.xp.toLocaleString()} points`}
                                                </div>
                                            </div>
                                            {isReached && (
                                                <span className="text-xs text-[var(--color-correct)]">✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={() => setShowRanks(false)}
                                className="w-full mt-4 py-2 text-sm ui text-[rgb(var(--color-fg))]/40 hover:text-[rgb(var(--color-fg))]/60 transition-colors"
                            >
                                close
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Reset confirmation modal */}
            <AnimatePresence>
                {resetConfirm && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-[var(--color-overlay-dim)] z-50"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setResetConfirm(null)}
                        />
                        <motion.div
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[var(--color-overlay)] border border-[rgb(var(--color-fg))]/15 rounded-2xl px-6 py-6 w-[280px] text-center"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.15 }}
                        >
                            <div className="text-4xl mb-3">🧹</div>
                            <p className="chalk text-[rgb(var(--color-fg))]/80 text-base leading-relaxed mb-6">
                                {resetConfirm}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setResetConfirm(null)}
                                    className="flex-1 py-2.5 rounded-xl border border-[rgb(var(--color-fg))]/15 text-sm ui text-[rgb(var(--color-fg))]/50 hover:text-[rgb(var(--color-fg))]/70 hover:border-[rgb(var(--color-fg))]/30 transition-colors"
                                >
                                    cancel
                                </button>
                                <button
                                    onClick={() => { onReset(); setResetConfirm(null); }}
                                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-streak-fire)]/40 bg-[var(--color-streak-fire)]/10 text-sm ui text-[var(--color-streak-fire)] hover:bg-[var(--color-streak-fire)]/20 transition-colors"
                                >
                                    reset
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
});
