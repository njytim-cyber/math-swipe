import { motion } from 'framer-motion';

export function LeaguePage() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
            {/* Trophy */}
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                <svg viewBox="0 0 100 100" className="w-24 h-24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-gold)' }}>
                    <path d="M25 20h50v25a25 25 0 0 1-50 0V20z" strokeWidth="2.5" />
                    <path d="M25 28H15a3 3 0 0 0-3 3v5a12 12 0 0 0 12 12h1" />
                    <path d="M75 28h10a3 3 0 0 1 3 3v5a12 12 0 0 1-12 12h-1" />
                    <path d="M42 68v10h16v-10" />
                    <path d="M35 82h30" strokeWidth="2.5" />
                    <circle cx="50" cy="42" r="8" strokeWidth="1.5" opacity="0.4" />
                </svg>
            </motion.div>

            <div className="text-center">
                <h2 className="text-3xl font-[family-name:var(--font-chalk)] text-[var(--color-gold)] mb-3">
                    League
                </h2>
                <p className="text-lg font-[family-name:var(--font-chalk)] text-white/50">
                    Coming Soon
                </p>
                <p className="text-sm font-[family-name:var(--font-ui)] text-white/30 mt-2">
                    Compete with friends & climb the ranks
                </p>
            </div>
        </div>
    );
}
