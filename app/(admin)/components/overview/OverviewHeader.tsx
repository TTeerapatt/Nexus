"use client";

import { FiRefreshCw } from "react-icons/fi";

type OverviewHeaderProps = {
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
};

export default function OverviewHeader({
  loading,
  refreshing,
  onRefresh,
}: OverviewHeaderProps) {
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
        </div>
      </div>
    </section>
  );
}
