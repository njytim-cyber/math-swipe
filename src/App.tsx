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
import type { QuestionType } from './utils/questionTypes';
import { ACHIEVEMENTS, loadUnlocked, saveUnlocked, checkAchievements } from './utils/achievements';
import { SessionSummary } from './components/SessionSummary';
import { CHALK_THEMES, loadTheme, saveTheme, applyTheme, type ChalkTheme } from './utils/chalkThemes';

type Tab = 'game' | 'league' | 'me';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('game');
  const [hardMode, setHardMode] = useState(false);
  const [timedMode, setTimedMode] = useState(false);

  // ── Check URL for challenge link ──
  const [challengeId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get('c');
    if (c) {
      // Clean URL so refresh doesn't re-trigger
      window.history.replaceState({}, '', window.location.pathname);
    }
    return c;
  });
  const [questionType, setQuestionType] = useState<QuestionType>(
    challengeId ? 'challenge' : 'multiply'
  );

  const {
    problems,
    score,
    streak,
    bestStreak,
    totalCorrect,
    totalAnswered,
    answerHistory,
    chalkState,
    flash,
    frozen,
    milestone,
    speedBonus,
    handleSwipe,
    timerProgress,
    dailyComplete,
  } = useGameLoop(questionType, hardMode, challengeId, timedMode);

  const { stats, accuracy, recordSession, resetStats } = useStats();

  const currentProblem = problems[0];
  const isFirstQuestion = totalAnswered === 0;
  const toggleHardMode = useCallback(() => setHardMode(h => !h), []);
  const toggleTimedMode = useCallback(() => setTimedMode(t => !t), []);

  // ── Score floater ──
  const prevScoreRef = useRef(0);
  const [pointsFloater, setPointsFloater] = useState(0);
  useEffect(() => {
    const delta = score - prevScoreRef.current;
    prevScoreRef.current = score;
    if (delta > 0) {
      setPointsFloater(delta);
      const t = setTimeout(() => setPointsFloater(0), 800);
      return () => clearTimeout(t);
    }
  }, [score]);

  // ── Auto-show summary when daily challenge finishes ──
  useEffect(() => {
    if (dailyComplete) setShowSummary(true);
  }, [dailyComplete]);

  // Track previous tab for session recording (handled in handleTabChange)
  const prevTab = useRef<Tab>('game');
  useEffect(() => {
    prevTab.current = activeTab;
  }, [activeTab]);

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

  // ── Personal best detection ──
  const [showPB, setShowPB] = useState(false);
  const prevBestRef = useRef(stats.bestStreak);
  useEffect(() => {
    if (bestStreak > prevBestRef.current && bestStreak > 0) {
      setShowPB(true);
      setTimeout(() => setShowPB(false), 2000);
      prevBestRef.current = bestStreak;
    }
  }, [bestStreak]);

  // ── Session summary ──
  const [showSummary, setShowSummary] = useState(false);
  const sessionAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const handleTabChange = useCallback((tab: Tab) => {
    if (prevTab.current === 'game' && tab !== 'game' && totalAnswered > 0) {
      recordSession(score, totalCorrect, totalAnswered, bestStreak, questionType);
      setShowSummary(true);
    }
    setActiveTab(tab);
  }, [score, totalCorrect, totalAnswered, bestStreak, questionType, recordSession]);

  // ── Costumes ──
  const [activeCostume, setActiveCostume] = useState(() => localStorage.getItem('math-swipe-costume') || '');
  const handleCostumeChange = useCallback((id: string) => {
    setActiveCostume(id);
    localStorage.setItem('math-swipe-costume', id);
  }, []);

  // ── Chalk themes ──
  const [activeThemeId, setActiveThemeId] = useState(() => loadTheme());
  useEffect(() => {
    const t = CHALK_THEMES.find(th => th.id === activeThemeId);
    if (t) applyTheme(t.color);
  }, [activeThemeId]);
  const handleThemeChange = useCallback((t: ChalkTheme) => {
    setActiveThemeId(t.id);
    saveTheme(t.id);
  }, []);

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
              {/* Challenge header */}
              {questionType === 'challenge' && (
                <div className="text-xs ui text-[var(--color-gold)] mb-2 flex items-center gap-2">
                  <span>⚔️ Challenge</span>
                  <span className="text-white/30">·</span>
                  <span className="text-white/40">{totalAnswered}/10</span>
                </div>
              )}
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
                      className={`text-sm ui ml-2 ${streak >= 10
                        ? 'text-[var(--color-streak-fire)] on-fire'
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

            {/* ── Points earned floater ── */}
            <AnimatePresence>
              {pointsFloater > 0 && (
                <motion.div
                  key={'pts' + score}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="absolute left-1/2 -translate-x-1/2 top-[calc(env(safe-area-inset-top,16px)+100px)] z-30 text-lg chalk text-[var(--color-gold)] pointer-events-none"
                >
                  +{pointsFloater}
                </motion.div>
              )}
            </AnimatePresence>

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
                    showHints={totalCorrect < 4}
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
              timedMode={timedMode}
              onTimedModeToggle={toggleTimedMode}
              timerProgress={timerProgress}
            />

            {/* ── Mr. Chalk PiP ── */}
            <div className="landscape-hide">
              <MrChalk state={chalkState} costume={activeCostume} streak={streak} totalAnswered={totalAnswered} questionType={questionType} hardMode={hardMode} timedMode={timedMode} />
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

            {/* ── Personal best ── */}
            <AnimatePresence>
              {showPB && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute left-1/2 -translate-x-1/2 top-[18%] z-40 text-lg chalk text-[var(--color-gold)] whitespace-nowrap"
                >
                  🏆 NEW PERSONAL BEST!
                </motion.div>
              )}
            </AnimatePresence>
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
            activeCostume={activeCostume}
            onCostumeChange={handleCostumeChange}
            activeTheme={activeThemeId}
            onThemeChange={handleThemeChange}
          />
        )}

        {/* ── Bottom Navigation ── */}
        <BottomNav active={activeTab} onChange={handleTabChange} />

        {/* ── Session Summary ── */}
        <SessionSummary
          solved={totalAnswered}
          correct={totalCorrect}
          bestStreak={bestStreak}
          accuracy={sessionAccuracy}
          xpEarned={score}
          answerHistory={answerHistory}
          questionType={questionType}
          visible={showSummary}
          onDismiss={() => setShowSummary(false)}
        />

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
