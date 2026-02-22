import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MagicTrick } from '../utils/mathTricks';
import { TrickPractice } from './TrickPractice';

interface Props {
    trick: MagicTrick;
    onClose: () => void;
}

export function TrickLesson({ trick, onClose }: Props) {
    const [step, setStep] = useState(0);
    const [startedPractice, setStartedPractice] = useState(false);

    const isLastStep = step === trick.lesson.steps.length - 1;

    if (startedPractice) {
        return <TrickPractice trick={trick} onClose={onClose} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="absolute inset-0 bg-[var(--color-bg)] z-50 flex flex-col pt-[max(env(safe-area-inset-top,12px),12px)] px-4 pb-[env(safe-area-inset-bottom,12px)]"
        >
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={onClose}
                    className="w-10 h-10 flex items-center justify-center text-[rgb(var(--color-fg))]/50 bg-[rgb(var(--color-fg))]/5 rounded-full"
                >
                    ✕
                </button>
                <div className="ui text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-bold">
                    Lesson mode
                </div>
                <div className="w-10" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center -mt-12 text-center max-w-sm mx-auto w-full">
                <div className="text-4xl mb-4">{trick.icon}</div>
                <h2 className="chalk text-2xl text-[var(--color-gold)] mb-8">{trick.title}</h2>

                {/* Example Equation */}
                <div className="text-5xl chalk mb-12">
                    {trick.lesson.equation} = {isLastStep ? <span className="text-[var(--color-gold)]">{trick.lesson.result}</span> : '?'}
                </div>

                {/* Steps Display */}
                <div className="h-32 flex flex-col justify-center items-center relative w-full mb-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <p className="ui text-lg leading-relaxed text-[rgb(var(--color-fg))]/80">
                                {trick.lesson.steps[step]}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => {
                            if (isLastStep) setStartedPractice(true);
                            else setStep(s => s + 1);
                        }}
                        className="w-full h-14 bg-[var(--color-gold)] text-[#1a1a2e] rounded-xl font-bold ui text-lg shadow-[0_4px_0_rgb(var(--color-fg),0.2)] active:translate-y-1 active:shadow-none transition-all"
                    >
                        {isLastStep ? 'Start Practice Blitz! ⚡' : 'Next Step'}
                    </button>
                    {step > 0 && (
                        <button
                            onClick={() => setStep(s => s - 1)}
                            className="ui text-xs text-[rgb(var(--color-fg))]/50 py-2"
                        >
                            Go Back
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
