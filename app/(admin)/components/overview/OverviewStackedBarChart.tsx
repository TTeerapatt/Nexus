"use client";

import { LoadingDots } from "@/app/components/loading";
import type { ChartSlice, StackedBarGroup } from "./overviewTypes";

type OverviewStackedBarChartProps = {
  title: string;
  subtitle?: string;
  groups: StackedBarGroup[];
  legend: ChartSlice[];
  emptyText: string;
  loading?: boolean;
};

export default function OverviewStackedBarChart({
  title,
  subtitle,
  groups,
  legend,
  emptyText,
  loading = false,
}: OverviewStackedBarChartProps) {
  const hasData = groups.some((group) =>
    group.segments.some((segment) => segment.value > 0)
  );

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(36,46,66,0.06)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {!loading && hasData ? (
          <ul className="flex flex-wrap items-center gap-3">
            {legend.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--text-secondary)]"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                {item.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center text-[var(--brand-primary)]">
          <LoadingDots />
        </div>
      ) : !hasData ? (
        <p className="mt-12 text-center text-[13px] text-[var(--text-muted)]">
          {emptyText}
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {groups.map((group) => {
            const total = group.segments.reduce(
              (sum, segment) => sum + segment.value,
              0
            );
            const active = group.segments.find(
              (segment) => segment.label.toLowerCase() === "active"
            )?.value;
            const activePercent =
              total > 0 && typeof active === "number"
                ? Math.round((active / total) * 100)
                : null;

            return (
              <div key={group.label}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                  <span className="font-medium text-[var(--text-secondary)]">
                    {group.label}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {total}
                    {activePercent !== null ? (
                      <span className="ml-1.5 font-medium text-[var(--text-muted)]">
                        {activePercent}% active
                      </span>
                    ) : null}
                  </span>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                  {group.segments.map((segment) => {
                    if (segment.value <= 0 || total <= 0) return null;
                    const width = (segment.value / total) * 100;
                    return (
                      <div
                        key={`${group.label}-${segment.label}`}
                        className="h-full first:rounded-l-full last:rounded-r-full"
                        style={{
                          width: `${Math.max(width, 2)}%`,
                          backgroundColor: segment.color,
                        }}
                        title={`${segment.label}: ${segment.value}`}
                      />
                    );
                  })}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[var(--text-muted)]">
                  {group.segments.map((segment) => (
                    <span key={`${group.label}-${segment.label}-meta`}>
                      {segment.label}:{" "}
                      <span className="font-semibold text-[var(--text-secondary)]">
                        {segment.value}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
