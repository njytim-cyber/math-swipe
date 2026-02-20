import { type ReactNode, memo } from 'react';
import { motion } from 'framer-motion';

type Tab = 'game' | 'league' | 'me';

interface Props {
    active: Tab;
    onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    {
        id: 'game',
        label: "Let's Go!",
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polygon points="5,3 19,12 5,21" />
            </svg>
        ),
    },
    {
        id: 'league',
        label: 'League',
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 9H4a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4h1" />
                <path d="M18 9h2a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4h-1" />
                <path d="M8 4h8v6a4 4 0 0 1-8 0V4z" />
                <path d="M10 18v2h4v-2" />
                <path d="M7 22h10" />
            </svg>
        ),
    },
    {
        id: 'me',
        label: 'Me',
        icon: (
            <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="5" />
                <path d="M3 21v-1a7 7 0 0 1 14 0v1" />
            </svg>
        ),
    },
];

export const BottomNav = memo(function BottomNav({ active, onChange }: Props) {
    return (
        <nav className="landscape-nav mt-auto flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom,4px)] pt-1 z-40 relative">
            {/* Subtle top border */}
            <div className="absolute top-0 left-4 right-4 h-px bg-[rgb(var(--color-fg))]/10" />

            {tabs.map(tab => {
                const isActive = tab.id === active;
                return (
                    <motion.button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-lg transition-colors ${isActive
                            ? 'text-[var(--color-gold)]'
                            : 'text-[rgb(var(--color-fg))]/40 active:text-[rgb(var(--color-fg))]/60'
                            }`}
                        whileTap={{ scale: 0.92 }}
                    >
                        {tab.icon}
                        <span className="text-[10px] ui tracking-wide">
                            {tab.label}
                        </span>
                    </motion.button>
                );
            })}
        </nav>
    );
});
