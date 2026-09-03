"use client";

import { FiClock, FiRefreshCw } from "react-icons/fi";
import { formatDateTime } from "./overviewUtils";

type OverviewHeaderProps = {
  loading: boolean;
  refreshing: boolean;
  lastUpdated?: string | null;
  onRefresh: () => void;
};

export default function OverviewHeader({
  loading,
  refreshing,
  lastUpdated = null,
  onRefresh,
}: OverviewHeaderProps) {
  const busy = loading || refreshing;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[var(--surface-raised)] px-6 py-6 text-white shadow-[0_10px_28px_rgba(36,46,66,0.18)]">
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Nexus control center
          </p>
          <h1 className="mt-2 text-[28px] font-bold tracking-tight">
            Overview
          </h1>
          <p className="mt-2 inline-flex items-center gap-2 text-[12px] font-medium text-white/65">
            <FiClock className="h-3.5 w-3.5 shrink-0" />
            {busy && !lastUpdated
              ? "Updating status…"
              : `Last updated ${lastUpdated ? formatDateTime(lastUpdated) : "—"}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={busy}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 text-[13px] font-semibold text-white/90 shadow-sm backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/35 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </section>
  );
}
