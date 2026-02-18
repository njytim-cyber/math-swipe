import { motion } from 'framer-motion';
import { QuestionTypePicker } from './QuestionTypePicker';
import type { QuestionType } from '../utils/mathGenerator';

interface Props {
    questionType: QuestionType;
    onTypeChange: (type: QuestionType) => void;
}

export function ActionButtons({ questionType, onTypeChange }: Props) {
    const handleShare = async () => {
        const shareData = {
            title: 'Math Swipe',
            text: 'Try this mental math game! 🧠✨',
            url: window.location.href,
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(window.location.href);
            }
        } catch {
            // User cancelled share
        }
    };

    return (
        <div className="absolute right-3 top-[35%] -translate-y-1/2 flex flex-col gap-4 z-20">
            {/* Share */}
            <motion.button
                onClick={handleShare}
                className="w-11 h-11 rounded-full border border-white/25 flex items-center justify-center text-white/70 active:text-[var(--color-gold)]"
                whileTap={{ scale: 0.88 }}
            >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7" />
                    <polyline points="16,6 12,2 8,6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
            </motion.button>

            {/* Question type */}
            <QuestionTypePicker current={questionType} onChange={onTypeChange} />
        </div>
    );
}
