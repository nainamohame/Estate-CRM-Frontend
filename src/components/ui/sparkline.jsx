import { useId } from 'react';
import { cn } from '../../lib/cn';

const TONES = {
  brand: { stroke: 'var(--color-brand-500)', fill: 'var(--color-brand-500)' },
  success: { stroke: 'var(--color-success-500)', fill: 'var(--color-success-500)' },
  warning: { stroke: 'var(--color-warning-500)', fill: 'var(--color-warning-500)' },
  danger: { stroke: 'var(--color-danger-500)', fill: 'var(--color-danger-500)' },
  accent: { stroke: 'var(--color-accent-500)', fill: 'var(--color-accent-500)' },
};

/**
 * A tiny trend line with a soft area fill and a dot on the latest point.
 * Hand-drawn SVG rather than a charting library: at this size a library
 * would be ~50x the bytes for strictly less control.
 *
 * @param {number[]} data
 */
export function Sparkline({ data = [], tone = 'brand', width = 88, height = 28, className }) {
  const gradientId = useId();
  if (data.length < 2) return null;

  const { stroke, fill } = TONES[tone] ?? TONES.brand;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 2;

  const points = data.map((value, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((value - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height} L${points[0][0].toFixed(1)},${height} Z`;
  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.22" />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={stroke} />
      <circle cx={lastX} cy={lastY} r="5" fill={stroke} fillOpacity="0.18" />
    </svg>
  );
}

/**
 * Compact vertical bars — used where the series is categorical (per-stage
 * counts) rather than a time trend.
 */
export function MiniBars({ data = [], tone = 'brand', height = 28, className }) {
  if (!data.length) return null;
  const { fill } = TONES[tone] ?? TONES.brand;
  const max = Math.max(...data) || 1;

  return (
    <div className={cn('flex items-end gap-0.5', className)} style={{ height }} aria-hidden="true">
      {data.map((value, i) => (
        <span
          key={i}
          className="w-1.5 rounded-sm transition-all"
          style={{
            height: `${Math.max(8, (value / max) * 100)}%`,
            backgroundColor: fill,
            opacity: 0.35 + (i / Math.max(1, data.length - 1)) * 0.65,
          }}
        />
      ))}
    </div>
  );
}
