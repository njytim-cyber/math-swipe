import { memo, useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';

interface Props {
    latex: string;
    className?: string;
    displayMode?: boolean;
}

/**
 * Renders a LaTeX string using KaTeX (lazy-loaded).
 * Shows raw LaTeX as fallback while KaTeX loads.
 */
export const MathExpr = memo(function MathExpr({ latex, className = '', displayMode = false }: Props) {
    const [html, setHtml] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        import('katex').then(({ default: katex }) => {
            if (cancelled) return;
            try {
                setHtml(katex.renderToString(latex, { throwOnError: false, displayMode }));
            } catch {
                setHtml(latex);
            }
        });
        return () => { cancelled = true; };
    }, [latex, displayMode]);

    if (html === null) {
        return <span className={className}>{latex}</span>;
    }

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
});
