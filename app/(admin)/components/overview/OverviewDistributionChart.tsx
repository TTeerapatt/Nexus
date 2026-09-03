"use client";

import { LoadingDots } from "@/app/components/loading";
import type { DistributionItem } from "./overviewTypes";

type OverviewDistributionChartProps = {
  title: string;
  items: DistributionItem[];
  emptyText: string;
  loading?: boolean;
};

export default function OverviewDistributionChart({
  title,
  items,
  emptyText,
  loading = false,
}: OverviewDistributionChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(36,46,66,0.06)]">
      <h2 className="text-[16px] font-bold text-[var(--text-primary)]">{title}</h2>
      {loading ? (
        <div className="flex min-h-[92px] items-center justify-center text-[var(--brand-primary)]">
          <LoadingDots />
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 text-center text-[13px] text-[var(--text-muted)]">
          {emptyText}
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                <span className="font-medium text-[var(--text-secondary)]">{item.label}</span>
                <span className="font-bold text-[var(--text-primary)]">{item.value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[var(--surface-soft)]">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{
                    width: `${Math.max((item.value / maxValue) * 100, 4)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
