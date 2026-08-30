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
import type { OverviewData } from "./overviewTypes";
import { formatDateTime } from "./overviewUtils";

type OverviewHealthSectionProps = {
  overview: OverviewData;
  runningVps: number;
  activeDomains: number;
  failedJobs: number;
  runningJobs: number;
  lastUpdated: string | null;
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
    <div className="flex items-center justify-between gap-4 rounded-xl bg-[#f8f9fc] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#242e42]">{label}</p>
          <p className="truncate text-[11px] text-[#8b93a7]">{detail}</p>
        </div>
      </div>
      <span className="shrink-0 text-[13px] font-bold text-[#242e42]">
        {value}
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
}: OverviewHealthSectionProps) {
  return (
    <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="rounded-2xl border border-[#e2e5eb] bg-white p-5 shadow-[0_8px_24px_rgba(36,46,66,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-[#242e42]">
              System health
            </h2>
            <p className="mt-1 text-[12px] text-[#8b93a7]">
              Current status across connected services
            </p>
          </div>
          <FiCheckCircle className="h-5 w-5 text-[#16a34a]" />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <HealthRow
            label="VPS"
            value={`${runningVps}/${overview.vps.length}`}
            detail="Running virtual machines"
            tone="bg-[#f5f3ff] text-[#7c3aed]"
            icon={FiServer}
          />
          <HealthRow
            label="CI/CD"
            value={failedJobs > 0 ? `${failedJobs} failed` : "Healthy"}
            detail={`${runningJobs} jobs currently running`}
            tone={
              failedJobs > 0
                ? "bg-[#fef2f2] text-[#dc2626]"
                : "bg-[#f0fdf4] text-[#16a34a]"
            }
            icon={failedJobs > 0 ? FiAlertCircle : FiCheckCircle}
          />
          <HealthRow
            label="Domains"
            value={`${activeDomains}/${overview.domains.length}`}
            detail="Active or registered domains"
            tone="bg-[#eff6ff] text-[#2563eb]"
            icon={FiGlobe}
          />
          <HealthRow
            label="Admins"
            value={String(overview.admins.length)}
            detail="Registered administrator accounts"
            tone="bg-[#fff7ed] text-[#ea580c]"
            icon={FiActivity}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-[#e2e5eb] bg-white p-5 shadow-[0_8px_24px_rgba(36,46,66,0.06)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[16px] font-bold text-[#242e42]">
              Deployment status
            </h2>
            <p className="mt-1 text-[12px] text-[#8b93a7]">
              Jenkins job summary
            </p>
          </div>
          <Link
            href="/ci-cd"
            className="text-[12px] font-semibold text-[#2553d8] hover:underline"
          >
            View jobs
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            {
              label: "Total",
              value: overview.jobs.length,
              tone: "text-[#242e42]",
            },
            {
              label: "Running",
              value: runningJobs,
              tone: "text-[#2563eb]",
            },
            {
              label: "Failed",
              value: failedJobs,
              tone: "text-[#dc2626]",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-[#f8f9fc] px-3 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                {item.label}
              </p>
              <p className={`mt-2 text-[24px] font-bold ${item.tone}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 rounded-xl bg-[#f0fdf4] px-4 py-3 text-[12px] font-medium text-[#15803d]">
          <FiClock className="h-4 w-4 shrink-0" />
          Last updated {lastUpdated ? formatDateTime(lastUpdated) : "—"}
        </div>
      </div>
    </section>
  );
}
