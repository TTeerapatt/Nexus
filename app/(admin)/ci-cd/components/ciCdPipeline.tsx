"use client";

import type { CiCdStageItem } from "@/app/services/ciCd/ciCdAPI";
import { FiCheck, FiClock, FiMinus, FiX } from "react-icons/fi";
import { BiError } from "react-icons/bi";

type StageKind =
  | "success"
  | "failed"
  | "running"
  | "unstable"
  | "aborted"
  | "pending";

function stageKind(status: string): StageKind {
  const value = status.trim().toUpperCase();
  if (value === "SUCCESS") return "success";
  if (value === "FAILED" || value === "FAILURE") return "failed";
  if (
    value === "IN_PROGRESS" ||
    value === "RUNNING" ||
    value === "PAUSED_PENDING_INPUT"
  ) {
    return "running";
  }
  if (value === "UNSTABLE") return "unstable";
  if (value === "ABORTED") return "aborted";
  return "pending";
}

function stageStyles(kind: StageKind) {
  switch (kind) {
    case "success":
      return {
        node: "border-[#22c55e] bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white shadow-[0_6px_16px_rgba(34,197,94,0.35)]",
        rail: "from-[#86efac] to-[#4ade80]",
        chip: "bg-[#ecfdf5] text-[#15803d] ring-[#bbf7d0]",
        title: "text-[#14532d]",
      };
    case "failed":
      return {
        node: "border-[#ef4444] bg-gradient-to-br from-[#f87171] to-[#dc2626] text-white shadow-[0_6px_16px_rgba(239,68,68,0.35)]",
        rail: "from-[#fecaca] to-[#f87171]",
        chip: "bg-[#fef2f2] text-[#b91c1c] ring-[#fecaca]",
        title: "text-[#7f1d1d]",
      };
    case "running":
      return {
        node: "border-[#2553D8] bg-gradient-to-br from-[#4f7cff] to-[#2553D8] text-white shadow-[0_6px_16px_rgba(37,83,216,0.35)] animate-pulse",
        rail: "from-[#bfdbfe] to-[#60a5fa]",
        chip: "bg-[#eff6ff] text-[#1d4ed8] ring-[#bfdbfe]",
        title: "text-[#1e3a8a]",
      };
    case "unstable":
      return {
        node: "border-[#eab308] bg-gradient-to-br from-[#facc15] to-[#ca8a04] text-white shadow-[0_6px_16px_rgba(234,179,8,0.3)]",
        rail: "from-[#fde68a] to-[#facc15]",
        chip: "bg-[#fefce8] text-[#a16207] ring-[#fde68a]",
        title: "text-[#713f12]",
      };
    case "aborted":
      return {
        node: "border-[#9ca3af] bg-gradient-to-br from-[#d1d5db] to-[#6b7280] text-white shadow-sm",
        rail: "from-[#e5e7eb] to-[#d1d5db]",
        chip: "bg-[#f9fafb] text-[#4b5563] ring-[#e5e7eb]",
        title: "text-[#374151]",
      };
    default:
      return {
        node: "border-[#e5e7eb] bg-white text-[#9ca3af] shadow-sm",
        rail: "from-[#e5e7eb] to-[#e5e7eb]",
        chip: "bg-[#f9fafb] text-[#9ca3af] ring-[#e5e7eb]",
        title: "text-[#6b7280]",
      };
  }
}

function StageIcon({ kind }: { kind: StageKind }) {
  if (kind === "success") return <FiCheck className="h-4 w-4" strokeWidth={3} />;
  if (kind === "failed") return <FiX className="h-4 w-4" strokeWidth={3} />;
  if (kind === "running") return <FiClock className="h-4 w-4" />;
  if (kind === "unstable") return <BiError className="h-4 w-4" />;
  if (kind === "aborted") return <FiMinus className="h-4 w-4" strokeWidth={3} />;
  return <span className="h-2 w-2 rounded-full bg-current opacity-50" />;
}

function prettyStageName(name: string): string {
  return name.replace(/^Declarative:\s*/i, "").trim() || name;
}

function formatDuration(ms: number | null): string | null {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return null;
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem > 0 ? `${minutes}m ${rem}s` : `${minutes}m`;
}

function statusLabel(status: string): string {
  const value = status.trim().toUpperCase();
  if (value === "SUCCESS") return "Success";
  if (value === "FAILED" || value === "FAILURE") return "Failed";
  if (value === "IN_PROGRESS" || value === "RUNNING") return "Running";
  if (value === "NOT_EXECUTED") return "Skipped";
  if (value === "PAUSED_PENDING_INPUT") return "Paused";
  if (value === "UNSTABLE") return "Unstable";
  if (value === "ABORTED") return "Aborted";
  return status || "Unknown";
}

type CiCdPipelineProps = {
  stages: CiCdStageItem[];
  emptyMessage?: string;
};

export default function CiCdPipeline({
  stages,
  emptyMessage,
}: CiCdPipelineProps) {
  if (!stages.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-[#d8e0f0] bg-white/70 px-4 py-10 text-center">
        <p className="max-w-md text-[13px] leading-relaxed text-[#7a849c]">
          {emptyMessage || "No pipeline stages available"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e4eaf6] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <ol className="flex min-w-max items-start px-2 py-3">
        {stages.map((stage, index) => {
          const kind = stageKind(stage.status);
          const styles = stageStyles(kind);
          const duration = formatDuration(stage.durationMillis);
          const isLast = index === stages.length - 1;
          const displayName = prettyStageName(stage.name);

          return (
            <li
              key={`${stage.name}-${index}`}
              className="flex items-start"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="group flex w-[138px] flex-col items-center text-center">

                <span
                  className={`relative z-[1] flex h-11 w-11 items-center justify-center rounded-full border-2 transition duration-200 group-hover:scale-105 ${styles.node}`}
                  title={stage.status}
                >
                  <StageIcon kind={kind} />
                </span>

                <p
                  className={`mt-3 max-w-[128px] text-[12px] font-bold leading-snug ${styles.title}`}
                  title={stage.name}
                >
                  {displayName}
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ${styles.chip}`}
                >
                  {statusLabel(stage.status)}
                </span>

                {duration ? (
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[#8b93a7]">
                    <FiClock className="h-3 w-3" />
                    {duration}
                  </span>
                ) : null}
              </div>

              {!isLast ? (
                <div
                  className={`mt-[20px] h-[3px] w-8 shrink-0 rounded-full bg-gradient-to-r ${styles.rail}`}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
