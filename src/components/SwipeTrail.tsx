import { useEffect, useRef, memo, useCallback } from 'react';

export interface TrailPoint {
    x: number;
    y: number;
    timestamp: number;
}

interface SwipeTrailProps {
    streak: number;
    activeTrailId?: string;
    baseColor?: string; // e.g. from active chalk theme
}

// Configurable constants
const TRAIL_LIFETIME_MS = 350;
const TRAIL_MAX_WIDTH = 18;

export const SwipeTrail = memo(function SwipeTrail({ streak, activeTrailId, baseColor = '#ffffff' }: SwipeTrailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pointsRef = useRef<TrailPoint[]>([]);
    const animationFrameRef = useRef<number>(0);

    // Determine target color based on streak and unlocks
    const getTrailColor = useCallback(() => {
        // If a specific trail cosmetic is equipped, we'd handle it here
        if (activeTrailId === 'rainbow') {
            // A static rainbow gradient will be created in the render loop based on bounding box
            return 'rainbow';
        }

        // Default behavior: react to streak
        if (streak >= 10) return '#FF00FF'; // Magenta
        if (streak >= 5) return 'var(--color-gold)';
        return baseColor;
    }, [activeTrailId, streak, baseColor]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Ensure canvas scale matches screen CSS size for sharp rendering
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        // Pointer tracking
        const handlePointerMove = (e: PointerEvent) => {
            // Only capture if primary pointer (prevent multi-touch noise)
            if (!e.isPrimary) return;

            pointsRef.current.push({
                x: e.clientX,
                y: e.clientY,
                timestamp: performance.now()
            });
        };

        const handleTouchMove = (e: TouchEvent) => {
            // Fallback for some mobile browsers treating touch indiscriminately
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                pointsRef.current.push({
                    x: touch.clientX,
                    y: touch.clientY,
                    timestamp: performance.now()
                });
            }
        };

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: true });

        // Render loop
        const render = (time: DOMHighResTimeStamp) => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Filter dead points
            pointsRef.current = pointsRef.current.filter(p => time - p.timestamp < TRAIL_LIFETIME_MS);
            const points = pointsRef.current;

            if (points.length > 1) {
                const color = getTrailColor();

                // Advanced Rainbow rendering bypasses standard strokeStyle
                if (color === 'rainbow') {
                    // Create bounding box for gradient
                    const xs = points.map(p => p.x);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);

                    if (maxX - minX > 0) {
                        const grad = ctx.createLinearGradient(minX, 0, maxX, 0);
                        grad.addColorStop(0, '#ff0000');
                        grad.addColorStop(0.2, '#ff8000');
                        grad.addColorStop(0.4, '#ffff00');
                        grad.addColorStop(0.6, '#008000');
                        grad.addColorStop(0.8, '#0000ff');
                        grad.addColorStop(1, '#800080');
                        ctx.strokeStyle = grad;
                    } else {
                        ctx.strokeStyle = '#FFFFFF';
                    }
                } else {
                    // Normalize CSS variables to actual canvas-readable values if needed
                    // For performance, direct canvas 2D rendering works best without CSS vars, 
                    // but most modern browsers can resolve them if attached to the root document.
                    // For safety, we use hex fallbacks.
                    if (color === 'var(--color-gold)') ctx.strokeStyle = '#fbbc04'; // exact gold hex
                    else ctx.strokeStyle = color;
                }

                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Draw splines segment by segment to apply fading thickness
                // (Canvas 2D doesn't support interpolating thickness across a single path natively)
                for (let i = 0; i < points.length - 1; i++) {
                    const p1 = points[i];
                    const p2 = points[i + 1];

                    // Age defines 0 to 1 value (0 = brand new, 1 = dead)
                    const age1 = (time - p1.timestamp) / TRAIL_LIFETIME_MS;

                    // Fade out opacity and shrink width
                    const alpha = Math.max(0, 1 - age1);
                    ctx.globalAlpha = alpha;

                    // Bezier Curve approximation or simple line interpolation for thickness
                    // Reverse ease-out logic: brand new points are thinnest, middle points inflate.
                    // To simulate fruit-ninja, the leading edge is thick, trailing is thin.
                    ctx.lineWidth = Math.max(1, TRAIL_MAX_WIDTH * (1 - age1));

                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);

                    // Simple quadratic curve to smooth rigid pointer events
                    if (i < points.length - 2) {
                        const p3 = points[i + 2];
                        const xc = (p2.x + p3.x) / 2;
                        const yc = (p2.y + p3.y) / 2;
                        ctx.quadraticCurveTo(p2.x, p2.y, xc, yc);
                    } else {
                        ctx.lineTo(p2.x, p2.y);
                    }

                    ctx.stroke();
                }
            }

            // Restore alpha
            ctx.globalAlpha = 1.0;

            animationFrameRef.current = requestAnimationFrame(render);
        };

        animationFrameRef.current = requestAnimationFrame(render);

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('touchmove', handleTouchMove);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [getTrailColor]); // Extracted and memoized

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-[100] pointer-events-none touch-none mix-blend-screen"
        />
    );
});
