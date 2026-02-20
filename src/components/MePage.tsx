import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { useStats } from '../hooks/useStats';
import { typesForBand, type AgeBand } from '../utils/questionTypes';
import { ACHIEVEMENTS, HARD_MODE_ACHIEVEMENTS, TIMED_MODE_ACHIEVEMENTS, ULTIMATE_ACHIEVEMENTS, EVERY_ACHIEVEMENT } from '../utils/achievements';
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
    displayName: string;
    onDisplayNameChange: (name: string) => Promise<void>;
    isAnonymous: boolean;
    onLinkGoogle: () => Promise<void>;
    ageBand: AgeBand;
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

export const MePage = memo(function MePage({ stats, accuracy, onReset, unlocked, activeCostume, onCostumeChange, activeTheme, onThemeChange, displayName, onDisplayNameChange, isAnonymous, onLinkGoogle, ageBand }: Props) {
    const [showRanks, setShowRanks] = useState(false);
    const [resetConfirm, setResetConfirm] = useState<string | null>(null);
    const [editingName, setEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(displayName);
    const { rank, nextRank, progress } = getRank(stats.totalXP);

    return (
        <div className="flex-1 flex flex-col items-center overflow-y-auto px-6 pt-4 pb-20">
            {/* Display name + edit */}
            <div className="flex items-center gap-2 mb-2">
                {editingName ? (
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (nameInput.trim()) {
                            await onDisplayNameChange(nameInput.trim());
                        }
                        setEditingName(false);
                    }} className="flex items-center gap-2">
                        <input
                            type="text"
                            value={nameInput}
                            onChange={e => setNameInput(e.target.value)}
                            maxLength={20}
                            autoFocus
                            className="bg-transparent border-b border-[var(--color-chalk)]/30 text-center text-sm ui text-[rgb(var(--color-fg))]/70 outline-none w-32 py-1"
                        />
                        <button type="submit" className="text-xs ui text-[var(--color-gold)]">✓</button>
                        <button type="button" onClick={() => { setEditingName(false); setNameInput(displayName); }} className="text-xs ui text-[rgb(var(--color-fg))]/30">✕</button>
                    </form>
                ) : (
                    <>
                        <span className="text-sm ui text-[rgb(var(--color-fg))]/60">{displayName}</span>
                        <button
                            onClick={() => { setNameInput(displayName); setEditingName(true); }}
                            className="text-xs text-[rgb(var(--color-fg))]/20 hover:text-[rgb(var(--color-fg))]/40 transition-colors"
                        >
                            ✏️
                        </button>
                    </>
                )}
            </div>

            {/* Google sign-in (Phase 3) */}
            {isAnonymous && (
                <button
                    onClick={onLinkGoogle}
                    className="flex items-center gap-2 text-xs ui text-[rgb(var(--color-fg))]/40 hover:text-[rgb(var(--color-fg))]/60 transition-colors mb-3 border border-[rgb(var(--color-fg))]/10 rounded-lg px-3 py-1.5"
                >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    Link Google Account
                </button>
            )}

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
                    {typesForBand(ageBand).filter(t => !t.id.startsWith('mix-') && t.id !== 'daily' && t.id !== 'challenge').map(t => {
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
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Achievements */}
            <div className="w-full max-w-sm mt-8">
                <div className="text-sm ui text-[rgb(var(--color-fg))]/50 uppercase tracking-widest text-center mb-3">
                    achievements · {[...unlocked].length}/{EVERY_ACHIEVEMENT.length}
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

                {/* 💀 Hard Mode */}
                <div className="mt-5 text-xs ui text-[var(--color-skull)] uppercase tracking-widest text-center mb-2">
                    💀 hard mode
                </div>
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                    {HARD_MODE_ACHIEVEMENTS.map(a => (
                        <AchievementBadge key={a.id} achievementId={a.id} unlocked={unlocked.has(a.id)} name={a.name} desc={a.desc} />
                    ))}
                </div>

                {/* ⏱️ Timed Mode */}
                <div className="mt-5 text-xs ui text-[var(--color-timed)] uppercase tracking-widest text-center mb-2">
                    ⏱️ timed mode
                </div>
                <div className="grid grid-cols-4 gap-3 justify-items-center">
                    {TIMED_MODE_ACHIEVEMENTS.map(a => (
                        <AchievementBadge key={a.id} achievementId={a.id} unlocked={unlocked.has(a.id)} name={a.name} desc={a.desc} />
                    ))}
                </div>

                {/* 💀⏱️ Ultimate Mode */}
                <div className="mt-5 text-xs ui text-[var(--color-ultimate)] uppercase tracking-widest text-center mb-2">
                    💀⏱️ ultimate
                </div>
                <div className="grid grid-cols-3 gap-3 justify-items-center">
                    {ULTIMATE_ACHIEVEMENTS.map(a => (
                        <AchievementBadge key={a.id} achievementId={a.id} unlocked={unlocked.has(a.id)} name={a.name} desc={a.desc} />
                    ))}
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
                        const rankOk = rankIdx >= (t.minLevel - 1);
                        // Mode-exclusive unlock checks
                        const hardOk = !t.hardModeOnly || (stats.hardModeSolved >= (t.hardModeMin ?? 0));
                        const timedOk = !t.timedModeOnly || (stats.timedModeSolved >= (t.timedModeMin ?? 0));
                        const ultimateOk = !t.ultimateOnly || (stats.ultimateSolved >= (t.ultimateMin ?? 0));
                        const isAvailable = rankOk && hardOk && timedOk && ultimateOk;
                        const isActive = activeTheme === t.id;
                        const modeIcon = t.ultimateOnly ? '💀⏱️' : t.hardModeOnly ? '💀' : t.timedModeOnly ? '⏱️' : '';
                        return (
                            <button
                                key={t.id}
                                onClick={() => isAvailable && onThemeChange(t)}
                                title={`${t.name}${modeIcon ? ` ${modeIcon}` : ''}${!isAvailable ? ' (locked)' : ''}`}
                                className={`w-8 h-8 rounded-full border-2 transition-all relative ${isActive ? 'border-[var(--color-gold)] scale-110' :
                                    isAvailable ? 'border-[rgb(var(--color-fg))]/20 hover:border-[rgb(var(--color-fg))]/40' :
                                        'border-[rgb(var(--color-fg))]/8 opacity-40 cursor-not-allowed'
                                    }`}
                                style={{ backgroundColor: t.color }}
                            >
                                {modeIcon && !isAvailable && (
                                    <span className="absolute -top-1 -right-1 text-[8px]">{modeIcon}</span>
                                )}
                            </button>
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
