import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BlackboardLayout } from './components/BlackboardLayout';
import { ProblemView } from './components/ProblemView';
import { MrChalk } from './components/MrChalk';
import { ScoreCounter } from './components/ScoreCounter';
import { BottomNav } from './components/BottomNav';
import { ActionButtons } from './components/ActionButtons';
import { SwipeTrail } from './components/SwipeTrail';
import type { AgeBand } from './utils/questionTypes';
import { defaultTypeForBand, typesForBand, AGE_BANDS, BAND_LABELS } from './utils/questionTypes';
/** Retry a dynamic import once by reloading the page (handles stale deploy cache on Cloudflare Pages) */
function lazyRetry<T extends Record<string, unknown>>(factory: () => Promise<T>): Promise<T> {
  return factory().catch(() => {
    const key = 'chunk-reload';
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, '1');
      window.location.reload();
    }
    return factory(); // fallback — will throw if still broken
  });
}

const LeaguePage = lazy(() => lazyRetry(() => import('./components/LeaguePage')).then(m => ({ default: m.LeaguePage })));
const MePage = lazy(() => lazyRetry(() => import('./components/MePage')).then(m => ({ default: m.MePage })));
import { useGameLoop } from './hooks/useGameLoop';
import { useStats } from './hooks/useStats';
import type { QuestionType } from './utils/questionTypes';
import { EVERY_ACHIEVEMENT, loadUnlocked, saveUnlocked, checkAchievements, restoreUnlockedFromCloud } from './utils/achievements';
import { SessionSummary } from './components/SessionSummary';
import { CHALK_THEMES, applyTheme, type ChalkTheme } from './utils/chalkThemes';
import { applyMode } from './hooks/useThemeMode';
import { useLocalState } from './hooks/useLocalState';
import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy, limit } from 'firebase/firestore';
import { db } from './utils/firebase';

type Tab = 'game' | 'league' | 'me';

function App() {
  const { user, loading: authLoading, setDisplayName, linkGoogle } = useFirebaseAuth();
  const uid = user?.uid ?? null;

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

  const { stats, accuracy, recordSession, resetStats, updateCosmetics } = useStats(uid);

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

  // ── Session summary ──
  const [showSummary, setShowSummary] = useState(false);
  const sessionAccuracy = answerHistory.length > 0
    ? Math.round(answerHistory.filter(Boolean).length / answerHistory.length * 100)
    : 0;

  // ── Auto-show summary when daily challenge finishes (adjust state during render) ──
  const [prevDailyComplete, setPrevDailyComplete] = useState(false);
  if (dailyComplete && !prevDailyComplete) {
    setPrevDailyComplete(true);
    setShowSummary(true);
  }
  if (!dailyComplete && prevDailyComplete) {
    setPrevDailyComplete(false);
  }

  // ── Ping Listener (Async Taunts) ──
  const [pingMessage, setPingMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'pings'),
      where('targetUid', '==', uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const pingDoc = snap.docs[0];
        const data = pingDoc.data();
        setPingMessage(`${data.senderName} challenged you! ⚔️`);

        // Mark as read so it doesn't pop again
        updateDoc(doc(db, 'pings', pingDoc.id), { read: true }).catch(console.error);

        // Clear after 6 seconds
        setTimeout(() => setPingMessage(null), 6000);
      }
    });
    return unsub;
  }, [uid]);

  // Track previous tab for session recording (handled in handleTabChange)
  const prevTab = useRef<Tab>('game');
  useEffect(() => {
    prevTab.current = activeTab;
  }, [activeTab]);

  // ── Achievements ──
  const [unlocked, setUnlocked] = useState(() => loadUnlocked());
  const unlockedRef = useRef(unlocked);
  useEffect(() => { unlockedRef.current = unlocked; }, [unlocked]);
  const [unlockToast, setUnlockToast] = useState('');

  // Restore achievements from Firestore on auth
  useEffect(() => {
    if (!uid) return;
    restoreUnlockedFromCloud(uid).then(restored => {
      if (restored) {
        setUnlocked(restored);
        unlockedRef.current = restored;
      }
    });
  }, [uid]);

  // Check achievements whenever navigating away from game (i.e. stats recorded)
  useEffect(() => {
    const snap = { ...stats, bestStreak: Math.max(stats.bestStreak, bestStreak) };
    const fresh = checkAchievements(snap, unlockedRef.current);
    if (fresh.length > 0) {
      const next = new Set(unlockedRef.current);
      fresh.forEach(id => next.add(id));
      setUnlocked(next);
      saveUnlocked(next, uid);
      // Show toast for first new unlock
      const badge = EVERY_ACHIEVEMENT.find(a => a.id === fresh[0]);
      if (badge) {
        setUnlockToast(badge.name);
        const t = setTimeout(() => setUnlockToast(''), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [stats, bestStreak]);

  // ── Personal best detection — fire once when session streak first exceeds all-time best ──
  const [showPB, setShowPB] = useState(false);
  const [pbShown, setPbShown] = useState(false);
  if (!pbShown && bestStreak > stats.bestStreak && bestStreak > 0) {
    setPbShown(true);
    setShowPB(true);
  }
  // Auto-hide PB toast
  useEffect(() => {
    if (!showPB) return;
    const t = setTimeout(() => setShowPB(false), 2000);
    return () => clearTimeout(t);
  }, [showPB]);

  const handleTabChange = useCallback((tab: Tab) => {
    if (prevTab.current === 'game' && tab !== 'game' && totalAnswered > 0) {
      recordSession(score, totalCorrect, totalAnswered, bestStreak, questionType, hardMode, timedMode);
      setShowSummary(true);
    }
    setActiveTab(tab);
  }, [score, totalCorrect, totalAnswered, bestStreak, questionType, recordSession, hardMode, timedMode]);

  // ── Costumes & Trails ──
  const [activeCostume, handleCostumeChange] = useLocalState('math-swipe-costume', '', uid);
  const [activeTrailId, handleTrailChange] = useLocalState('math-swipe-trail', '', uid);

  // ── Chalk themes ──
  const [activeThemeId, setActiveThemeId] = useLocalState('math-swipe-chalk-theme', 'classic', uid);
  useEffect(() => {
    const t = CHALK_THEMES.find(th => th.id === activeThemeId);
    if (t) applyTheme(t.color);
  }, [activeThemeId]);

  // Persist cosmetics to Firebase payload
  useEffect(() => {
    if (!uid) return;
    updateCosmetics(activeThemeId as string, activeCostume as string, activeTrailId as string);
  }, [uid, activeThemeId, activeCostume, activeTrailId, updateCosmetics]);

  const handleThemeChange = useCallback((t: ChalkTheme) => setActiveThemeId(t.id), [setActiveThemeId]);

  // ── Theme mode (dark/light) ──
  const [themeMode, setThemeMode] = useLocalState('math-swipe-theme', 'dark', uid);
  useEffect(() => { applyMode(themeMode as 'dark' | 'light'); }, [themeMode]);
  const toggleThemeMode = useCallback(() => {
    setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
  }, [themeMode, setThemeMode]);
  // ── Age Band ──
  const [ageBand, setAgeBand] = useLocalState('math-swipe-age-band', '35' as AgeBand, uid) as [AgeBand, (v: AgeBand) => void];
  const handleBandChange = useCallback((band: AgeBand) => {
    setAgeBand(band);
    // Reset to the band's default type if current type isn't in the new band
    const available = typesForBand(band);
    if (!available.some(t => t.id === questionType)) {
      setQuestionType(defaultTypeForBand(band));
    }
  }, [questionType, setAgeBand, setQuestionType]);

  // Show loading screen while Firebase auth initializes
  if (authLoading) {
    return (
      <BlackboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-lg chalk text-[var(--color-chalk)]/50"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading...
          </motion.div>
        </div>
      </BlackboardLayout>
    );
  }

  return (
    <>

      <BlackboardLayout>
        {/* ── Global Canvas Overlay (Swipe Trail) ── */}
        <SwipeTrail
          streak={streak}
          activeTrailId={activeTrailId as string}
          baseColor={CHALK_THEMES.find(t => t.id === activeThemeId)?.color}
        />

        {/* ── Top-right controls (band picker + theme toggle) ── */}
        <div className="absolute top-[calc(env(safe-area-inset-top,12px)+12px)] right-4 z-50 flex items-center gap-2">
          <button
            onClick={() => {
              const idx = AGE_BANDS.indexOf(ageBand);
              handleBandChange(AGE_BANDS[(idx + 1) % AGE_BANDS.length]);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[rgb(var(--color-fg))]/50 active:text-[var(--color-gold)] transition-colors"
            aria-label="Change age band"
          >
            <span className="text-base">{BAND_LABELS[ageBand].emoji}</span>
            <span className="text-[10px] ui">{BAND_LABELS[ageBand].label}</span>
          </button>
          <button
            onClick={toggleThemeMode}
            className="w-9 h-9 flex items-center justify-center text-[rgb(var(--color-fg))]/60 active:text-[var(--color-gold)] transition-colors"
            aria-label="Toggle theme"
          >
            {themeMode === 'light' ? (
              <motion.svg
                viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </motion.svg>
            ) : (
              <motion.svg
                viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                animate={{ rotate: [0, -8, 8, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </motion.svg>
            )}
          </button>
        </div>

        {activeTab === 'game' && (
          <div key={totalAnswered} className={flash === 'wrong' ? 'wrong-shake' : flash === 'correct' ? 'answer-bounce' : ''}>
            {/* ── Score (centered, pushed down from edge) ── */}
            <div className="landscape-score flex flex-col items-center pt-[calc(env(safe-area-inset-top,16px)+40px)] pb-6 z-30">
              {/* Challenge header */}
              {questionType === 'challenge' && (
                <div className="text-xs ui text-[var(--color-gold)] mb-2 flex items-center gap-2">
                  <span>⚔️ Challenge</span>
                  <span className="text-[rgb(var(--color-fg))]/30">·</span>
                  <span className="text-[rgb(var(--color-fg))]/40">{totalAnswered}/10</span>
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
                    {streak <= 5 ? (
                      /* Dots for small streaks */
                      <div className="flex gap-1">
                        {Array.from({ length: streak }, (_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.04 }}
                            className="w-2 h-2 rounded-full bg-[var(--color-gold)]/60"
                          />
                        ))}
                      </div>
                    ) : (
                      /* Multiplier label for 6+ */
                      <span
                        className={`text-sm ui font-semibold ${streak >= 10
                          ? 'text-[var(--color-streak-fire)] on-fire'
                          : 'text-[var(--color-gold)]'
                          }`}
                      >
                        {streak >= 10 ? `🔥 ${streak}×` : `${streak}×`}
                      </span>
                    )}
                    {/* Milestone pulse */}
                    {[5, 10, 20, 50].includes(streak) && (
                      <motion.div
                        key={`milestone-glow-${streak}`}
                        className="absolute inset-0 rounded-full"
                        initial={{ scale: 1, opacity: 0.6 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{ background: 'var(--color-gold)', filter: 'blur(8px)' }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Daily streak */}
              {stats.dayStreak > 0 && (
                <div className="mt-1 text-[10px] ui text-[rgb(var(--color-fg))]/25">
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
            <div className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                {currentProblem && (
                  <motion.div
                    key={currentProblem.id}
                    className="flex-1 flex flex-col"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
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
            </div>

            {/* ── TikTok-style action buttons ── */}
            <ActionButtons
              questionType={questionType}
              onTypeChange={setQuestionType}
              hardMode={hardMode}
              onHardModeToggle={toggleHardMode}
              timedMode={timedMode}
              onTimedModeToggle={toggleTimedMode}
              timerProgress={timerProgress}
              ageBand={ageBand}

            />

            {/* ── Mr. Chalk PiP ── */}
            <div className="landscape-hide">
              <MrChalk state={chalkState} costume={activeCostume} streak={streak} totalAnswered={totalAnswered} questionType={questionType} hardMode={hardMode} timedMode={timedMode} pingMessage={pingMessage} />
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
          </div>
        )}

        {activeTab === 'league' && <Suspense fallback={null}><LeaguePage userXP={stats.totalXP} userStreak={stats.bestStreak} uid={uid} displayName={user?.displayName ?? 'You'} activeThemeId={activeThemeId as string} activeCostume={activeCostume as string} /></Suspense>}

        {activeTab === 'me' && (
          <Suspense fallback={null}><MePage
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
            activeTrailId={activeTrailId as string}
            onTrailChange={handleTrailChange}
            displayName={user?.displayName ?? ''}
            onDisplayNameChange={setDisplayName}
            isAnonymous={user?.isAnonymous ?? true}
            onLinkGoogle={linkGoogle}
            ageBand={ageBand}
          /></Suspense>
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
          hardMode={hardMode}
          timedMode={timedMode}
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
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-overlay)] border border-[var(--color-gold)]/30 rounded-2xl px-5 py-3 flex items-center gap-3"
            >
              <span className="text-2xl">🏅</span>
              <div>
                <div className="text-xs ui text-[rgb(var(--color-fg))]/40">Achievement Unlocked!</div>
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
