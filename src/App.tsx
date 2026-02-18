import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BlackboardLayout } from './components/BlackboardLayout';
import { ProblemView } from './components/ProblemView';
import { MrChalk } from './components/MrChalk';
import { ScoreCounter } from './components/ScoreCounter';
import { BottomNav } from './components/BottomNav';
import { ActionButtons } from './components/ActionButtons';
import { LeaguePage } from './components/LeaguePage';
import { MePage } from './components/MePage';
import { useGameLoop } from './hooks/useGameLoop';
import { useStats } from './hooks/useStats';
import type { QuestionType } from './utils/mathGenerator';
import { ACHIEVEMENTS, loadUnlocked, saveUnlocked, checkAchievements } from './utils/achievements';

type Tab = 'game' | 'league' | 'me';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [questionType, setQuestionType] = useState<QuestionType>('multiply');
  const [hardMode, setHardMode] = useState(false);

  const {
    problems,
    score,
    streak,
    bestStreak,
    totalCorrect,
    totalAnswered,
    chalkState,
    flash,
    frozen,
    milestone,
    speedBonus,
    handleSwipe,
  } = useGameLoop(questionType, hardMode);

  const { stats, accuracy, recordSession, resetStats } = useStats();

  const currentProblem = problems[0];
  const isFirstQuestion = totalAnswered === 0;
  const toggleHardMode = useCallback(() => setHardMode(h => !h), []);

  // Record session data when switching away from game tab
  const prevTab = useRef<Tab>('game');
  useEffect(() => {
    if (prevTab.current === 'game' && activeTab !== 'game' && totalAnswered > 0) {
      recordSession(score, totalCorrect, totalAnswered, bestStreak, questionType);
    }
    prevTab.current = activeTab;
  }, [activeTab, score, totalCorrect, totalAnswered, bestStreak, recordSession]);

  // ── Achievements ──
  const [unlocked, setUnlocked] = useState(() => loadUnlocked());
  const [unlockToast, setUnlockToast] = useState('');

  // Check achievements whenever navigating away from game (i.e. stats recorded)
  useEffect(() => {
    const snap = { ...stats, bestStreak: Math.max(stats.bestStreak, bestStreak) };
    const fresh = checkAchievements(snap, unlocked);
    if (fresh.length > 0) {
      const next = new Set(unlocked);
      fresh.forEach(id => next.add(id));
      setUnlocked(next);
      saveUnlocked(next);
      // Show toast for first new unlock
      const badge = ACHIEVEMENTS.find(a => a.id === fresh[0]);
      if (badge) {
        setUnlockToast(badge.name);
        setTimeout(() => setUnlockToast(''), 2500);
      }
    }
  }, [stats, bestStreak]);

  return (
    <>
      {/* Desktop gate */}
      <div className="desktop-gate hidden">
        <div className="flex flex-col items-center justify-center h-screen bg-[var(--color-board)] text-center px-8">
          <div className="text-6xl mb-4">📱</div>
          <h1 className="text-3xl chalk text-[var(--color-gold)] mb-3">
            Math Swipe
          </h1>
          <p className="text-lg chalk text-white/50 mb-6">
            This game is designed for mobile
          </p>
          <p className="text-sm ui text-white/25">
            Open on your phone or resize your browser to a narrow width
          </p>
        </div>
      </div>

      <BlackboardLayout>
        {activeTab === 'game' && (
          <>
            {/* ── Score (centered, pushed down from edge) ── */}
            <div className="landscape-score flex flex-col items-center pt-[calc(env(safe-area-inset-top,16px)+40px)] z-30">
              <ScoreCounter value={score} />

              {/* Streak display */}
              <AnimatePresence>
                {streak > 1 && (
                  <motion.div
                    key="streak"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="mt-2 flex items-center gap-1"
                  >
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(streak, 15) }, (_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className={`w-2 h-2 rounded-full ${streak >= 10
                            ? 'bg-[var(--color-streak-fire)]'
                            : streak >= 5
                              ? 'bg-[var(--color-gold)]'
                              : 'bg-white/40'
                            }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-sm font-[family-name:var(--font-ui)] ml-2 ${streak >= 10
                        ? 'text-[var(--color-streak-fire)]'
                        : streak >= 5
                          ? 'text-[var(--color-gold)]'
                          : 'text-white/40'
                        }`}
                    >
                      {streak >= 10 ? `🔥 ${streak}×` : `${streak}×`}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Daily streak */}
              {stats.dayStreak > 0 && (
                <div className="mt-1 text-[10px] ui text-white/25">
                  🔥 Day {stats.dayStreak}
                </div>
              )}
            </div>

            {/* ── Main Problem Area ── */}
            <AnimatePresence mode="popLayout">
              {currentProblem && (
                <motion.div
                  key={currentProblem.id}
                  className="flex-1 flex flex-col"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -60 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <ProblemView
                    problem={currentProblem}
                    frozen={frozen}
                    highlightCorrect={isFirstQuestion}
                    onSwipe={handleSwipe}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── TikTok-style action buttons ── */}
            <ActionButtons
              questionType={questionType}
              onTypeChange={setQuestionType}
              hardMode={hardMode}
              onHardModeToggle={toggleHardMode}
            />

            {/* ── Mr. Chalk PiP ── */}
            <div className="landscape-hide">
              <MrChalk state={chalkState} />
            </div>

            {/* ── Feedback flash overlay ── */}
            {flash !== 'none' && (
              <div
                className={`absolute inset-0 pointer-events-none z-30 ${flash === 'correct' ? 'flash-correct' : 'flash-wrong'
                  }`}
              />
            )}

            {/* ── Streak milestone popup ── */}
            {milestone && (
              <div key={milestone + streak} className="milestone-pop absolute inset-0 flex items-center justify-center z-40 text-8xl">
                {milestone}
              </div>
            )}

            {/* ── Speed bonus ── */}
            {speedBonus && (
              <div key={'speed' + score} className="speed-pop absolute left-1/2 -translate-x-1/2 top-[30%] z-40 text-sm ui text-[var(--color-gold)] whitespace-nowrap">
                ⚡ SPEED BONUS +2
              </div>
            )}
          </>
        )}

        {activeTab === 'league' && <LeaguePage userXP={stats.totalXP} userStreak={stats.bestStreak} />}

        {activeTab === 'me' && (
          <MePage
            stats={stats}
            accuracy={accuracy}
            sessionScore={score}
            sessionStreak={bestStreak}
            onReset={resetStats}
            unlocked={unlocked}
          />
        )}

        {/* ── Bottom Navigation ── */}
        <BottomNav active={activeTab} onChange={setActiveTab} />

        {/* ── Achievement unlock toast ── */}
        <AnimatePresence>
          {unlockToast && (
            <motion.div
              key={unlockToast}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-black/80 border border-[var(--color-gold)]/30 rounded-2xl px-5 py-3 flex items-center gap-3"
            >
              <span className="text-2xl">🏅</span>
              <div>
                <div className="text-xs ui text-white/40">Achievement Unlocked!</div>
                <div className="text-sm chalk text-[var(--color-gold)]">{unlockToast}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </BlackboardLayout>
    </>
  );
}

export default App;
