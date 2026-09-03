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
  if (value === "FAILED" || value === "FAILURE" || value === "ERROR") {
    return "failed";
  }
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
        node: "border-[#16a34a] bg-[var(--surface)] text-[#16a34a]",
        rail: "bg-[#16a34a]",
        chip: "bg-[#ecfdf5] text-[#15803d] ring-[#bbf7d0]",
        title: "text-[#22c55e]",
        selectedRing: "ring-[#16a34a]/35",
      };
    case "failed":
      return {
        node: "border-[#dc2626] bg-[var(--surface)] text-[#dc2626]",
        rail: "bg-[#dc2626]",
        chip: "bg-[#fef2f2] text-[#b91c1c] ring-[#fecaca]",
        title: "text-[#7f1d1d]",
        selectedRing: "ring-[#dc2626]/30",
      };
    case "running":
      return {
        node: "border-[#2563eb] bg-[var(--surface)] text-[#2563eb] animate-pulse",
        rail: "bg-[#2563eb]",
        chip: "bg-[#eff6ff] text-[#1d4ed8] ring-[#bfdbfe]",
        title: "text-[#1e3a8a]",
        selectedRing: "ring-[#2563eb]/30",
      };
    case "unstable":
      return {
        node: "border-[#ca8a04] bg-[var(--surface)] text-[#ca8a04]",
        rail: "bg-[#ca8a04]",
        chip: "bg-[#fefce8] text-[#a16207] ring-[#fde68a]",
        title: "text-[#713f12]",
        selectedRing: "ring-[#ca8a04]/30",
      };
    case "aborted":
      return {
        node: "border-[#6b7280] bg-[var(--surface)] text-[#6b7280]",
        rail: "bg-[#6b7280]",
        chip: "bg-[#f9fafb] text-[#4b5563] ring-[#e5e7eb]",
        title: "text-[#374151]",
        selectedRing: "ring-[#6b7280]/25",
      };
    default:
      return {
        node: "border-[#d1d5db] bg-[var(--surface)] text-[#9ca3af]",
        rail: "bg-[#d1d5db]",
        chip: "bg-[#f9fafb] text-[#9ca3af] ring-[#e5e7eb]",
        title: "text-[#6b7280]",
        selectedRing: "ring-[#d1d5db]/40",
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
  if (value === "FAILED" || value === "FAILURE" || value === "ERROR") {
    return "Failed";
  }
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
  selectedStageId?: string | null;
  loadingStageId?: string | null;
  onStageClick?: (stage: CiCdStageItem) => void;
};

export default function CiCdPipeline({
  stages,
  emptyMessage,
  selectedStageId,
  loadingStageId,
  onStageClick,
}: CiCdPipelineProps) {
  if (!stages.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)]/70 px-4 py-10 text-center">
        <p className="max-w-md text-[13px] leading-relaxed text-[var(--text-muted)]">
          {emptyMessage || "No pipeline stages available"}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
      <ol className="flex min-w-max items-start px-2 py-3">
        {stages.map((stage, index) => {
          const kind = stageKind(stage.status);
          const styles = stageStyles(kind);
          const duration = formatDuration(stage.durationMillis);
          const isLast = index === stages.length - 1;
          const displayName = prettyStageName(stage.name);
          const stageKey = stage.id || `${stage.name}-${index}`;
          const selected = selectedStageId === stageKey;
          const loading = loadingStageId === stageKey;
          const clickable = typeof onStageClick === "function";

          return (
            <li
              key={stageKey}
              className="flex items-start"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <button
                type="button"
                disabled={!clickable}
                onClick={() => onStageClick?.(stage)}
                className={`group flex w-[138px] flex-col items-center rounded-2xl px-1 py-1 text-center transition ${
                  clickable
                    ? "cursor-pointer hover:bg-[var(--surface-soft)]"
                    : "cursor-default"
                } ${
                  selected
                    ? `bg-[var(--surface-soft)] ring-2 ${styles.selectedRing}`
                    : ""
                }`}
                title={
                  clickable
                    ? `View log · ${displayName}`
                    : `${displayName} · ${stage.status}`
                }
              >
                <span
                  className={`relative z-[1] flex h-11 w-11 items-center justify-center rounded-full border-2 transition duration-200 group-hover:scale-105 ${styles.node}`}
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <StageIcon kind={kind} />
                  )}
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
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--text-muted)]">
                    <FiClock className="h-3 w-3" />
                    {duration}
                  </span>
                ) : null}
              </button>

              {!isLast ? (
                <div
                  className="mt-[20px] flex w-18 shrink-0 items-center self-start px-1"
                  aria-hidden
                >
                  <div
                    className={`h-[2px] w-full rounded-full ${styles.rail}`}
                  />
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
