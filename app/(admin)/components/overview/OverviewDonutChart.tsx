"use client";

import { LoadingDots } from "@/app/components/loading";
import type { ChartSlice } from "./overviewTypes";

type OverviewDonutChartProps = {
  title: string;
  subtitle?: string;
  items: ChartSlice[];
  emptyText: string;
  loading?: boolean;
  centerLabel?: string;
};

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function OverviewDonutChart({
  title,
  subtitle,
  items,
  emptyText,
  loading = false,
  centerLabel = "Total",
}: OverviewDonutChartProps) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  let offset = 0;
  const segments = items.map((item) => {
    const length = total > 0 ? (item.value / total) * CIRCUMFERENCE : 0;
    const segment = {
      ...item,
      dasharray: `${length} ${CIRCUMFERENCE - length}`,
      dashoffset: -offset,
    };
    offset += length;
    return segment;
  });

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(36,46,66,0.06)]">
      <div>
        <h2 className="text-[16px] font-bold text-[var(--text-primary)]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-[12px] text-[var(--text-muted)]">{subtitle}</p>
        ) : null}
      </div>

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center text-[var(--brand-primary)]">
          <LoadingDots />
        </div>
      ) : items.length === 0 || total === 0 ? (
        <p className="mt-12 text-center text-[13px] text-[var(--text-muted)]">
          {emptyText}
        </p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative shrink-0">
            <svg
              width={SIZE}
              height={SIZE}
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              className="-rotate-90"
              aria-hidden
            >
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke="var(--surface-soft)"
                strokeWidth={STROKE}
              />
              {segments.map((segment) => (
                <circle
                  key={segment.label}
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={STROKE}
                  strokeDasharray={segment.dasharray}
                  strokeDashoffset={segment.dashoffset}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {centerLabel}
              </p>
              <p className="text-[24px] font-bold leading-none text-[var(--text-primary)]">
                {total}
              </p>
            </div>
          </div>

          <ul className="w-full min-w-0 space-y-2.5 sm:max-w-[180px]">
            {items.map((item) => {
              const percent =
                total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 text-[13px]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="truncate font-medium text-[var(--text-secondary)]">
                      {item.label}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-[var(--text-primary)]">
                    {item.value}
                    <span className="ml-1 font-medium text-[var(--text-muted)]">
                      ({percent}%)
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
