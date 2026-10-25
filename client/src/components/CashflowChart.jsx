import { useId, useMemo, useRef, useState } from 'react';
import { cx, usd } from '../lib/format';

const WIDTH = 760;
const HEIGHT = 196;
const TOP = 16;
const BASE = 172;

function smoothPath(points) {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1];
    const current = points[i];
    const midX = (previous.x + current.x) / 2;
    path += ` C ${midX} ${previous.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
  }
  return path;
}

function tickLabel(dateString, span) {
  const date = new Date(`${dateString}T12:00:00Z`);
  if (span <= 7) {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'UTC' }).format(date);
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function longLabel(dateString) {
  const date = new Date(`${dateString}T12:00:00Z`);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export default function CashflowChart({ data = [], range = 30 }) {
  const rawId = useId();
  const gradientId = `cash-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const wrapRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  const visible = useMemo(() => data.slice(-range), [data, range]);

  const { inPoints, outPoints, inPath, outPath, areaPath, maxValue, totalIn, totalOut } =
    useMemo(() => {
      const pointsIn = [];
      const pointsOut = [];
      const max = Math.max(
        1,
        ...visible.flatMap((day) => [day.inCents, day.outCents]),
      );
      const paddedMax = max * 1.12;

      visible.forEach((day, index) => {
        const x =
          visible.length === 1 ? WIDTH / 2 : (index / (visible.length - 1)) * WIDTH;
        const inY = BASE - (day.inCents / paddedMax) * (BASE - TOP);
        const outY = BASE - (day.outCents / paddedMax) * (BASE - TOP);
        pointsIn.push({ x, y: inY });
        pointsOut.push({ x, y: outY });
      });

      const lineIn = smoothPath(pointsIn);
      const lineOut = smoothPath(pointsOut);
      const area =
        pointsIn.length > 1
          ? `${lineIn} L ${pointsIn[pointsIn.length - 1].x} ${BASE} L ${pointsIn[0].x} ${BASE} Z`
          : '';

      return {
        inPoints: pointsIn,
        outPoints: pointsOut,
        inPath: lineIn,
        outPath: lineOut,
        areaPath: area,
        maxValue: paddedMax,
        totalIn: visible.reduce((sum, day) => sum + day.inCents, 0),
        totalOut: visible.reduce((sum, day) => sum + day.outCents, 0),
      };
    }, [visible]);

  const tickIndexes = useMemo(() => {
    if (visible.length <= 4) return visible.map((_, index) => index);
    const candidates = [0, Math.round((visible.length - 1) / 3), Math.round(((visible.length - 1) * 2) / 3), visible.length - 1];
    return [...new Set(candidates)];
  }, [visible]);

  const hovered = hoverIndex !== null ? visible[hoverIndex] : null;
  const hoverX = useMemo(() => {
    if (hoverIndex === null || !visible.length) return 0;
    return (hoverIndex / Math.max(1, visible.length - 1)) * 100;
  }, [hoverIndex, visible.length]);

  function handlePointerMove(event) {
    if (!wrapRef.current || visible.length === 0) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    setHoverIndex(Math.round(fraction * (visible.length - 1)));
  }

  if (!visible.length) {
    return (
      <div className="grid h-[220px] place-items-center text-[13px] text-slate-ink">
        No activity yet.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-4 text-[11px] font-medium text-slate-ink">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#8ABF32]" /> Money in
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#A7B3A9]" /> Money out
          </span>
        </div>
        <div className="hidden items-center gap-4 text-[11px] text-slate-ink sm:flex">
          <span>
            In <span className="numeric font-semibold text-ink">{usd(totalIn)}</span>
          </span>
          <span>
            Out <span className="numeric font-semibold text-ink">{usd(totalOut)}</span>
          </span>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative w-full cursor-crosshair select-none"
        onPointerMove={handlePointerMove}
        onPointerLeave={() => setHoverIndex(null)}
        role="img"
        aria-label={`Cash flow over the last ${range} days. Money in ${usd(totalIn)}, money out ${usd(totalOut)}.`}
      >
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-[180px] w-full overflow-visible sm:h-[205px]"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B8E957" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#C9F65D" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.33, 0.66, 1].map((step) => {
            const y = TOP + step * (BASE - TOP);
            return (
              <line
                key={step}
                x1="0"
                x2={WIDTH}
                y1={y}
                y2={y}
                stroke="#0B1710"
                strokeOpacity="0.07"
                strokeDasharray="3 6"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}

          <path
            d={outPath}
            fill="none"
            stroke="#A7B3A9"
            strokeWidth="1.6"
            strokeDasharray="4 5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={inPath}
            fill="none"
            stroke="#9BCB38"
            strokeWidth="2.4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />

          {inPoints.length > 0 ? (
            <circle
              cx={inPoints[inPoints.length - 1].x}
              cy={inPoints[inPoints.length - 1].y}
              r="3.4"
              fill="#A9D93E"
              stroke="#fff"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          ) : null}

          {hoverIndex !== null && visible[hoverIndex] ? (
            <>
              <line
                x1={inPoints[hoverIndex].x}
                x2={inPoints[hoverIndex].x}
                y1="6"
                y2={BASE}
                stroke="#08100B"
                strokeOpacity="0.18"
                strokeDasharray="3 4"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={inPoints[hoverIndex].x}
                cy={inPoints[hoverIndex].y}
                r="4"
                fill="#9BCB38"
                stroke="#fff"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                cx={outPoints[hoverIndex].x}
                cy={outPoints[hoverIndex].y}
                r="3.5"
                fill="#A7B3A9"
                stroke="#fff"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </>
          ) : null}
        </svg>

        <div className="mt-1 flex justify-between text-[10.5px] font-medium text-slate-ink">
          {tickIndexes.map((index) => (
            <span key={index}>{tickLabel(visible[index].date, visible.length)}</span>
          ))}
        </div>

        {hovered ? (
          <div
            className="pointer-events-none absolute top-[-8px] z-10 -translate-x-1/2 rounded-xl border border-ink/10 bg-ink px-3 py-2 text-cream shadow-lift"
            style={{ left: `${Math.min(89, Math.max(11, hoverX))}%` }}
          >
            <p className="whitespace-nowrap text-[10px] font-medium text-cream/50">
              {longLabel(hovered.date)}
            </p>
            <div className="mt-1 flex items-center gap-3 text-[11px]">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                <span className="numeric font-semibold">{usd(hovered.inCents)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-cream/60">
                <span className="h-1.5 w-1.5 rounded-full bg-cream/40" />
                <span className="numeric">{usd(hovered.outCents)}</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>
      <span className="sr-only">Peak activity scale: {usd(maxValue)}</span>
    </div>
  );
}
