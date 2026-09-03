"use client";

import Link from "next/link";
import {
  FiActivity,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiGlobe,
  FiServer,
} from "react-icons/fi";
import type { IconType } from "react-icons";
import { LoadingDots } from "@/app/components/loading";
import type { OverviewData } from "./overviewTypes";
import { formatDateTime } from "./overviewUtils";

type OverviewHealthSectionProps = {
  overview: OverviewData;
  runningVps: number;
  activeDomains: number;
  failedJobs: number;
  runningJobs: number;
  lastUpdated: string | null;
  loading?: {
    vps?: boolean;
    jobs?: boolean;
    domains?: boolean;
    admins?: boolean;
  };
};

function HealthRow({
  label,
  value,
  detail,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
  icon: IconType;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface-muted)] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--text-primary)]">{label}</p>
          <p className="truncate text-[11px] text-[var(--text-muted)]">{detail}</p>
        </div>
      </div>
      <span className="flex min-w-[36px] shrink-0 justify-end text-[13px] font-bold text-[var(--text-primary)]">
        {value === "—" ? <LoadingDots className="text-[var(--text-muted)]" /> : value}
      </span>
    </div>
  );
}

export default function OverviewHealthSection({
  overview,
  runningVps,
  activeDomains,
  failedJobs,
  runningJobs,
  lastUpdated,
  loading = {},
}: OverviewHealthSectionProps) {
  const statusLoading =
    loading.vps ||
    loading.jobs ||
    loading.domains ||
    loading.admins;

  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(36,46,66,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
              System health
            </h2>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              Current status across connected services
            </p>
          </div>
          <FiCheckCircle className="h-5 w-5 text-[#16a34a]" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <HealthRow
            label="VPS"
            value={loading.vps ? "—" : `${runningVps}/${overview.vps.length}`}
            detail={loading.vps ? "Loading VPS status" : "Running virtual machines"}
            tone="bg-[#f5f3ff] text-[#7c3aed]"
            icon={FiServer}
          />
          <HealthRow
            label="CI/CD"
            value={
              loading.jobs
                ? "—"
                : failedJobs > 0
                  ? `${failedJobs} failed`
                  : "Healthy"
            }
            detail={
              loading.jobs
                ? "Loading job status"
                : `${runningJobs} jobs currently running`
            }
            tone={
              failedJobs > 0
                ? "bg-[#fef2f2] text-[#dc2626]"
                : "bg-[#f0fdf4] text-[#16a34a]"
            }
            icon={failedJobs > 0 ? FiAlertCircle : FiCheckCircle}
          />
          <HealthRow
            label="Domains"
            value={
              loading.domains
                ? "—"
                : `${activeDomains}/${overview.domains.length}`
            }
            detail={
              loading.domains
                ? "Loading domain status"
                : "Active or registered domains"
            }
            tone="bg-[#eff6ff] text-[#2563eb]"
            icon={FiGlobe}
          />
          <HealthRow
            label="Admins"
            value={loading.admins ? "—" : String(overview.admins.length)}
            detail={
              loading.admins
                ? "Loading administrator data"
                : "Registered administrator accounts"
            }
            tone="bg-[#fff7ed] text-[#ea580c]"
            icon={FiActivity}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_8px_24px_rgba(36,46,66,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
              Deployment status
            </h2>
            <p className="mt-1 text-[12px] text-[var(--text-muted)]">
              Jenkins job summary
            </p>
          </div>
          <Link
            href="/ci-cd"
            className="text-[12px] font-semibold text-[var(--brand-primary)] hover:underline"
          >
            View jobs
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            {
              label: "Total",
              value: loading.jobs ? null : overview.jobs.length,
              tone: "text-[var(--text-primary)]",
            },
            {
              label: "Running",
              value: loading.jobs ? null : runningJobs,
              tone: "text-[#2563eb]",
            },
            {
              label: "Failed",
              value: loading.jobs ? null : failedJobs,
              tone: "text-[#dc2626]",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-[var(--surface-muted)] px-3 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                {item.label}
              </p>
              <p className={`mt-2 text-[24px] font-bold ${item.tone}`}>
                {item.value === null ? (
                  <LoadingDots className="text-[var(--text-muted)]" />
                ) : (
                  item.value
                )}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f0fdf4] px-4 py-3 text-[12px] font-medium text-[#15803d]">
          <FiClock className="h-4 w-4 shrink-0" />
          {statusLoading
            ? (
              <>
                <span>Loading current status</span>
                <LoadingDots className="text-[#15803d]" />
              </>
            )
            : `Last updated ${lastUpdated ? formatDateTime(lastUpdated) : "—"}`}
        </div>
      </div>
    </section>
  );
}
