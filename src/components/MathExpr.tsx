import { memo, useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface Props {
    latex: string;
    className?: string;
    displayMode?: boolean;
}

/**
 * Renders a LaTeX string using KaTeX.
 * Uses renderToString for static HTML — no DOM manipulation overhead.
 */
export const MathExpr = memo(function MathExpr({ latex, className = '', displayMode = false }: Props) {
    const html = useMemo(() => {
        try {
            return katex.renderToString(latex, {
                throwOnError: false,
                displayMode,
            });
        } catch {
            return latex;
        }
    }, [latex, displayMode]);

    return (
        <span
            className={className}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
});
