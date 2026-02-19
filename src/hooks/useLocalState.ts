import { useState, useCallback } from 'react';

/**
 * useState backed by localStorage — reads on mount, writes on every set.
 * Eliminates the load/save/onChange boilerplate scattered across App.tsx.
 */
export function useLocalState(
    key: string,
    defaultValue: string,
): [string, (value: string) => void] {
    const [state, setInner] = useState<string>(
        () => localStorage.getItem(key) || defaultValue,
    );

    const setState = useCallback((value: string) => {
        setInner(value);
        localStorage.setItem(key, value);
    }, [key]);

    return [state, setState];
}
