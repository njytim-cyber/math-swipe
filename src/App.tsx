import { AnimatePresence, motion } from 'framer-motion';
import { BlackboardLayout } from './components/BlackboardLayout';
import { ProblemView } from './components/ProblemView';
import { MrChalk } from './components/MrChalk';
import { ScoreCounter } from './components/ScoreCounter';

import { useGameLoop } from './hooks/useGameLoop';

function App() {
  const {
    problems,
    score,
    streak,
    totalAnswered,
    chalkState,
    flash,
    frozen,
    handleSwipe,
  } = useGameLoop();

  const currentProblem = problems[0];
  const isFirstQuestion = totalAnswered === 0;

  return (
    <BlackboardLayout>

      {/* ── Score (centered, pushed down from edge) ── */}
      <div className="flex flex-col items-center pt-[calc(env(safe-area-inset-top,16px)+40px)] z-30">
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



      {/* ── Mr. Chalk PiP ── */}
      <MrChalk state={chalkState} />

      {/* ── Feedback flash overlay ── */}
      {flash !== 'none' && (
        <div
          className={`absolute inset-0 pointer-events-none z-30 ${flash === 'correct' ? 'flash-correct' : 'flash-wrong'
            }`}
        />
      )}
    </BlackboardLayout>
  );
}

export default App;
