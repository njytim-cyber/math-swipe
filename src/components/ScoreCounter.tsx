import { useEffect, useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * Animated score counter that "rolls" up to the new value.
 */
export function ScoreCounter({ value }: { value: number }) {
    const [display, setDisplay] = useState(0);
    const spring = useSpring(0, { stiffness: 80, damping: 20 });
    const prevValue = useRef(0);
    const justBumped = value > prevValue.current;

    useEffect(() => {
        prevValue.current = value;
        spring.set(value);
    }, [value, spring]);

    useEffect(() => {
        const unsub = spring.on('change', (v) => setDisplay(Math.round(v)));
        return unsub;
    }, [spring]);

    return (
        <motion.div
            className="font-[family-name:var(--font-chalk)] text-[var(--color-gold)] text-7xl leading-none drop-shadow-lg tabular-nums"
            animate={justBumped ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
        >
            {value === 0 ? (
                <span className="text-5xl leading-tight">Let's<br />Goooooooo!</span>
            ) : display}
        </motion.div>
    );
}
