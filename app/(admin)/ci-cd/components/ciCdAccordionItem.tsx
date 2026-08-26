"use client";

import { useState } from "react";
import {
  FiActivity,
  FiChevronDown,
  FiExternalLink,
  FiHeart,
  FiHash,
} from "react-icons/fi";
import { GoWorkflow } from "react-icons/go";
import ciCdAPI, {
  type CiCdJobDetail,
  type CiCdJobItem,
  type JenkinsJobStatus,
} from "@/app/services/ciCd/ciCdAPI";
import { popup } from "@/app/ui/popUp";
import CiCdPipeline from "./ciCdPipeline";

function statusBadgeClass(status: JenkinsJobStatus): string {
  switch (status) {
    case "success":
      return "bg-[#ecfdf5] text-[#15803d] ring-1 ring-[#86efac]/80";
    case "failed":
      return "bg-[#fef2f2] text-[#b91c1c] ring-1 ring-[#fecaca]/90";
    case "unstable":
      return "bg-[#fefce8] text-[#a16207] ring-1 ring-[#fde68a]/90";
    case "running":
      return "bg-[#eff6ff] text-[#1d4ed8] ring-1 ring-[#93c5fd]/80";
    case "aborted":
      return "bg-[#f3f4f6] text-[#4b5563] ring-1 ring-[#e5e7eb]";
    case "disabled":
      return "bg-[#f3f4f6] text-[#6b7280] ring-1 ring-[#e5e7eb]";
    case "not_built":
      return "bg-[#f8fafc] text-[#64748b] ring-1 ring-[#e2e8f0]";
    default:
      return "bg-[#f3f4f6] text-[#4b5563] ring-1 ring-[#e5e7eb]";
  }
}

function statusDotClass(status: JenkinsJobStatus): string {
  switch (status) {
    case "success":
      return "bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]";
    case "failed":
      return "bg-[#ef4444] shadow-[0_0_0_4px_rgba(239,68,68,0.16)]";
    case "unstable":
      return "bg-[#eab308] shadow-[0_0_0_4px_rgba(234,179,8,0.18)]";
    case "running":
      return "bg-[#2553D8] shadow-[0_0_0_4px_rgba(37,83,216,0.18)] animate-pulse";
    default:
      return "bg-[#9ca3af] shadow-[0_0_0_4px_rgba(156,163,175,0.16)]";
  }
}

function statusLabel(status: JenkinsJobStatus): string {
  switch (status) {
    case "success":
      return "Success";
    case "failed":
      return "Failed";
    case "unstable":
      return "Unstable";
    case "running":
      return "Running";
    case "aborted":
      return "Aborted";
    case "disabled":
      return "Disabled";
    case "not_built":
      return "Not built";
    default:
      return "Unknown";
  }
}

function healthBarClass(score: number): string {
  if (score >= 80) return "bg-[#22c55e]";
  if (score >= 50) return "bg-[#eab308]";
  return "bg-[#ef4444]";
}

type DetailApiResult =
  | {
      success?: boolean;
      data?: CiCdJobDetail;
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

type CiCdAccordionItemProps = {
  job: CiCdJobItem;
};

export default function CiCdAccordionItem({ job }: CiCdAccordionItemProps) {
  const [open, setOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<CiCdJobDetail | null>(null);
  const [loaded, setLoaded] = useState(false);

  const loadDetail = async () => {
    if (loaded || loadingDetail) return;

    setLoadingDetail(true);
    try {
      const result = (await ciCdAPI.getJobByName(job.name)) as DetailApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "Unable to fetch job pipeline";
        await popup.error("Error", message);
        setDetail(null);
        return;
      }

      setDetail(result.data ?? null);
      setLoaded(true);
    } catch {
      await popup.error("Error", "Unable to fetch job pipeline");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadDetail();
    }
  };

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition duration-300 ${
        open
          ? "border-[#c7d7ff] shadow-[0_12px_32px_rgba(37,83,216,0.10)]"
          : "border-[#e4e9f4] shadow-[0_2px_8px_rgba(31,38,64,0.04)] hover:border-[#d4def5] hover:shadow-[0_8px_20px_rgba(31,38,64,0.06)]"
      }`}
    >
      <button
        type="button"
        onClick={() => void handleToggle()}
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition hover:bg-[#f8faff]/80"
        aria-expanded={open}
      >
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#2553D8]/10 text-[#2553D8]">
          <GoWorkflow className="h-5 w-5" />
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${statusDotClass(job.status)}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold tracking-tight text-[#1f2640]">
            {job.name}
          </p>
          {job.url ? (
            <p className="mt-0.5 truncate text-[12px] text-[#8b93a7]">
              {job.url.replace(/^https?:\/\//, "")}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold ${statusBadgeClass(job.status)}`}
          >
            {statusLabel(job.status)}
          </span>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-xl bg-[#f3f6fc] text-[#5b657d] transition-transform duration-300 ${
              open ? "rotate-180 bg-[#eef3ff] text-[#2553D8]" : ""
            }`}
          >
            <FiChevronDown className="h-4 w-4" />
          </span>
        </div>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#eef1f7] bg-gradient-to-b from-[#f7f9ff] to-[#fbfcff] px-5 py-5">
            {loadingDetail ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#e4eaf6] bg-white px-4 py-6">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2553D8]/20 border-t-[#2553D8]" />
                <p className="text-[13px] font-medium text-[#7a849c]">
                  Loading pipeline stages…
                </p>
              </div>
            ) : detail ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {detail.lastBuildNumber != null ? (
                    <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1f2640] ring-1 ring-[#e4eaf6]">
                      <FiHash className="h-3.5 w-3.5 text-[#2553D8]" />
                      Build {detail.lastBuildNumber}
                    </span>
                  ) : null}

                  {detail.healthScore != null ? (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[12px] font-semibold text-[#1f2640] ring-1 ring-[#e4eaf6]">
                      <FiHeart className="h-3.5 w-3.5 text-[#ef4444]" />
                      Health {detail.healthScore}%
                      <span className="ml-1 h-1.5 w-16 overflow-hidden rounded-full bg-[#eef1f7]">
                        <span
                          className={`block h-full rounded-full ${healthBarClass(detail.healthScore)}`}
                          style={{
                            width: `${Math.max(0, Math.min(100, detail.healthScore))}%`,
                          }}
                        />
                      </span>
                    </span>
                  ) : null}

                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5b657d] ring-1 ring-[#e4eaf6]">
                    <FiActivity className="h-3.5 w-3.5 text-[#2553D8]" />
                    {detail.stages.length} stages
                  </span>

                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#2553D8]/8 px-3 py-1.5 text-[12px] font-semibold text-[#2553D8] ring-1 ring-[#2553D8]/15 transition hover:bg-[#2553D8]/15"
                    >
                      Open Jenkins
                      <FiExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>

                <CiCdPipeline
                  stages={detail.stages}
                  emptyMessage={detail.stagesMessage}
                />
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d8e0f0] bg-white/70 px-4 py-8 text-center text-[13px] text-[#7a849c]">
                Unable to load pipeline details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
