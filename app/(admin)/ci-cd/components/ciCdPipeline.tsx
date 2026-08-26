"use client";

import type { CiCdStageItem } from "@/app/services/ciCd/ciCdAPI";

function stageTone(status: string): {
  node: string;
  line: string;
  label: string;
} {
  const value = status.trim().toUpperCase();

  if (value === "SUCCESS") {
    return {
      node: "border-[#16a34a] bg-[#16a34a] text-white",
      line: "bg-[#86efac]",
      label: "text-[#15803d]",
    };
  }
  if (value === "FAILED" || value === "FAILURE") {
    return {
      node: "border-[#dc2626] bg-[#dc2626] text-white",
      line: "bg-[#fecaca]",
      label: "text-[#b91c1c]",
    };
  }
  if (
    value === "IN_PROGRESS" ||
    value === "RUNNING" ||
    value === "PAUSED_PENDING_INPUT"
  ) {
    return {
      node: "border-[#2553D8] bg-[#2553D8] text-white animate-pulse",
      line: "bg-[#bfdbfe]",
      label: "text-[#2553D8]",
    };
  }
  if (value === "UNSTABLE") {
    return {
      node: "border-[#ca8a04] bg-[#ca8a04] text-white",
      line: "bg-[#fde68a]",
      label: "text-[#a16207]",
    };
  }
  if (value === "ABORTED") {
    return {
      node: "border-[#6b7280] bg-[#6b7280] text-white",
      line: "bg-[#d1d5db]",
      label: "text-[#4b5563]",
    };
  }

  return {
    node: "border-[#d1d5db] bg-[#f3f4f6] text-[#9ca3af]",
    line: "bg-[#e5e7eb]",
    label: "text-[#9ca3af]",
  };
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
      <p className="text-[13px] text-[#7a849c]">
        {emptyMessage || "No pipeline stages available"}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-start gap-0 px-1 py-2">
        {stages.map((stage, index) => {
          const tone = stageTone(stage.status);
          const duration = formatDuration(stage.durationMillis);
          const isLast = index === stages.length - 1;

          return (
            <li key={`${stage.name}-${index}`} className="flex items-start">
              <div className="flex w-[120px] flex-col items-center text-center">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 text-[12px] font-bold shadow-sm ${tone.node}`}
                  title={stage.status}
                >
                  {index + 1}
                </span>
                <span
                  className={`mt-2 max-w-[110px] text-[12px] font-semibold leading-tight ${tone.label}`}
                >
                  {stage.name}
                </span>
                <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#9aa3b5]">
                  {stage.status}
                </span>
                {duration ? (
                  <span className="mt-0.5 text-[11px] text-[#7a849c]">
                    {duration}
                  </span>
                ) : null}
              </div>

              {!isLast ? (
                <div
                  className={`mt-[16px] h-[3px] w-10 shrink-0 rounded-full ${tone.line}`}
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
