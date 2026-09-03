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
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:brightness-110 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>
    </section>
  );
}
