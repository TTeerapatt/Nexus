"use client";

import { FiBarChart2, FiClock, FiRefreshCw } from "react-icons/fi";
import type { BiRangeDays } from "./biTypes";
import { formatDateTime } from "./biUtils";

const RANGE_OPTIONS: Array<{ value: BiRangeDays; label: string }> = [
  { value: 7, label: "7d" },
  { value: 30, label: "30d" },
  { value: 90, label: "90d" },
];

type BiHeaderProps = {
  loading: boolean;
  refreshing: boolean;
  lastUpdated?: string | null;
  rangeDays: BiRangeDays;
  onRangeChange: (days: BiRangeDays) => void;
  onRefresh: () => void;
};

export default function BiHeader({
  loading,
  refreshing,
  lastUpdated = null,
  rangeDays,
  onRangeChange,
  onRefresh,
}: BiHeaderProps) {
  const busy = loading || refreshing;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[var(--surface-raised)] px-6 py-6 text-white shadow-[0_10px_28px_rgba(36,46,66,0.18)]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[rgba(91,134,255,0.18)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-[rgba(34,211,238,0.12)] blur-3xl"
      />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60">
            <FiBarChart2 className="h-3.5 w-3.5" />
            Business intelligence
          </p>
          <h1 className="mt-2 text-[28px] font-bold tracking-tight">BI</h1>
          {/* <p className="mt-2 max-w-xl text-[13px] text-white/70">
            Cross-module analytics for inventory, CI/CD health, domain risk, and
            admin activity.
          </p> */}
          <p className="mt-2 inline-flex items-center gap-2 text-[12px] font-medium text-white/65">
            <FiClock className="h-3.5 w-3.5 shrink-0" />
            {busy && !lastUpdated
              ? "Updating analytics…"
              : `Last updated ${lastUpdated ? formatDateTime(lastUpdated) : "—"}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl border border-white/15 bg-white/5 p-1 backdrop-blur-sm">
            {RANGE_OPTIONS.map((option) => {
              const active = option.value === rangeDays;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onRangeChange(option.value)}
                  disabled={busy}
                  className={`h-8 min-w-[44px] cursor-pointer rounded-lg px-3 text-[12px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/35 disabled:cursor-not-allowed disabled:opacity-50 ${
                    active
                      ? "bg-[rgba(91,134,255,0.45)] text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={busy}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[13px] font-semibold text-white/90 shadow-sm backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/35 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
}
