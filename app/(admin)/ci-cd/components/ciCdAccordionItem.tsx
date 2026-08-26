"use client";

import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";
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
      return "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70";
    case "failed":
      return "bg-[#fee2e2] text-[#b91c1c] ring-1 ring-[#fecaca]/80";
    case "unstable":
      return "bg-[#fef9c3] text-[#a16207] ring-1 ring-[#fde68a]/80";
    case "running":
      return "bg-[#dbeafe] text-[#1d4ed8] ring-1 ring-[#93c5fd]/70";
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
    <div className="overflow-hidden rounded-2xl border border-[#e4e9f4] bg-white shadow-[0_1px_2px_rgba(31,38,64,0.04)]">
      <button
        type="button"
        onClick={() => void handleToggle()}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#f8faff]"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold text-[#1f2640]">
            {job.name}
          </p>
          {job.url ? (
            <p className="mt-0.5 truncate text-[12px] text-[#7a849c]">
              {job.url}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${statusBadgeClass(job.status)}`}
          >
            {statusLabel(job.status)}
          </span>
          <FiChevronDown
            className={`h-5 w-5 text-[#5b657d] transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {open ? (
        <div className="border-t border-[#eef1f7] bg-[#fbfcff] px-5 py-4">
          {loadingDetail ? (
            <p className="text-[13px] text-[#7a849c]">Loading pipeline…</p>
          ) : detail ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-[12px] text-[#5b657d]">
                {detail.lastBuildNumber != null ? (
                  <span className="rounded-lg bg-white px-2.5 py-1 font-semibold ring-1 ring-[#e8ecf4]">
                    Build #{detail.lastBuildNumber}
                  </span>
                ) : null}
                {detail.healthScore != null ? (
                  <span className="rounded-lg bg-white px-2.5 py-1 font-semibold ring-1 ring-[#e8ecf4]">
                    Health {detail.healthScore}%
                  </span>
                ) : null}
              </div>
              <CiCdPipeline
                stages={detail.stages}
                emptyMessage={detail.stagesMessage}
              />
            </div>
          ) : (
            <p className="text-[13px] text-[#7a849c]">
              Unable to load pipeline details
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
