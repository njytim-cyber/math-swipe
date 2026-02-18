import { memo } from 'react';
import { motion } from 'framer-motion';
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



const LEVEL_NAMES = ['Beginner', 'Learner', 'Thinker', 'Wizard', 'Legend'] as const;

export const MePage = memo(function MePage({ stats, accuracy, sessionScore, sessionStreak, onReset, unlocked, activeCostume, onCostumeChange, activeTheme, onThemeChange }: Props) {
    const level = stats.totalXP < 100 ? 1
        : stats.totalXP < 500 ? 2
            : stats.totalXP < 1500 ? 3
                : stats.totalXP < 5000 ? 4 : 5;


    return (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
            {/* Title — big chalk style like score on game screen */}
            <motion.div
                className="text-center mb-10"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="text-7xl chalk text-[var(--color-gold)] leading-tight">
                    {stats.totalXP.toLocaleString()}
                </div>
                <div className="text-sm ui text-white/30 mt-1">
                    XP · {LEVEL_NAMES[level - 1]}
                </div>
            </motion.div>

            {/* Core stats — horizontal, chalk style */}
            <div className="flex gap-8 mb-10">
                <div className="text-center">
                    <div className="text-2xl chalk text-[var(--color-streak-fire)]">
                        {stats.bestStreak}
                    </div>
                    <div className="text-[10px] ui text-white/30">🔥 streak</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl chalk text-[var(--color-correct)]">
                        {accuracy}%
                    </div>
                    <div className="text-[10px] ui text-white/30">🎯 accuracy</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl chalk text-white/70">
                        {stats.totalSolved}
                    </div>
                    <div className="text-[10px] ui text-white/30">✅ solved</div>
                </div>
            </div>

            {/* Per question type row */}
            <div className="w-full max-w-sm">
                <div className="text-[10px] ui text-white/20 uppercase tracking-widest text-center mb-3">
                    by type
                </div>
                <div className="grid grid-cols-5 gap-2 justify-items-center">
                    {QUESTION_TYPES.filter(t => !t.id.startsWith('mix-')).map(t => {
                        const ts = stats.byType[t.id] ?? { solved: 0, correct: 0 };
                        const pct = ts.solved > 0 ? Math.round((ts.correct / ts.solved) * 100) : 0;
                        return (
                            <div key={t.id} className="flex flex-col items-center gap-1">
                                <div className="text-lg chalk text-white/50">
                                    {t.icon}
                                </div>
                                <div className={`text-xs chalk ${ts.solved === 0 ? 'text-white/15' :
                                    pct >= 80 ? 'text-[var(--color-correct)]' :
                                        pct >= 50 ? 'text-[var(--color-gold)]' :
                                            'text-white/40'
                                    }`}>
                                    {ts.solved === 0 ? '—' : `${pct}%`}
                                </div>
                                <div className="text-[9px] ui text-white/15">
                                    {ts.solved === 0 ? '' : ts.solved}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Achievements */}
            <div className="w-full max-w-sm mt-8">
                <div className="text-[10px] ui text-white/20 uppercase tracking-widest text-center mb-3">
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
                                    name={a.name}
                                    desc={isActive ? '✅ equipped' : a.desc}
                                />
                            </div>
                        );
                    })}
                </div>
                {[...unlocked].some(id => ['streak-5', 'streak-20', 'sharpshooter', 'math-machine', 'century'].includes(id)) && (
                    <p className="text-[8px] ui text-white/15 text-center mt-2">tap a badge to equip on Mr. Chalk</p>
                )}
            </div>

            {/* Chalk Themes */}
            <div className="w-full max-w-sm mt-6">
                <div className="text-[10px] ui text-white/20 uppercase tracking-widest text-center mb-3">
                    chalk color
                </div>
                <div className="flex justify-center gap-2 flex-wrap">
                    {CHALK_THEMES.map(t => {
                        const isAvailable = level >= t.minLevel;
                        const isActive = activeTheme === t.id;
                        return (
                            <button
                                key={t.id}
                                onClick={() => isAvailable && onThemeChange(t)}
                                title={isAvailable ? t.name : `Unlock at ${['', 'Beginner', 'Learner', 'Thinker', 'Wizard', 'Legend'][t.minLevel]}`}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${isActive ? 'border-[var(--color-gold)] scale-110' :
                                    isAvailable ? 'border-white/20 hover:border-white/40' :
                                        'border-white/8 opacity-30 cursor-not-allowed'
                                    }`}
                                style={{ backgroundColor: t.color }}
                            />
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
                    <div className="text-[10px] ui text-white/20 uppercase tracking-widest mb-2">
                        this session
                    </div>
                    <span className="text-lg chalk text-[var(--color-gold)]">
                        {sessionScore} xp
                    </span>
                    <span className="text-white/20 mx-2">·</span>
                    <span className="text-lg chalk text-[var(--color-streak-fire)]">
                        {sessionStreak}🔥
                    </span>
                </motion.div>
            )}

            {/* Aura */}
            <motion.p
                className="text-xs ui text-white/15 mt-auto"
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

            <button
                onClick={onReset}
                className="text-[10px] ui text-white/15 mt-4 hover:text-white/30 transition-colors"
            >
                reset stats
            </button>
        </div>
    );
});
