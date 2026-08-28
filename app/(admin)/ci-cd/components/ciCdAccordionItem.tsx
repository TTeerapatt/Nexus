"use client";

import { useState } from "react";
import {
  FiActivity,
  FiChevronDown,
  FiExternalLink,
  FiHeart,
} from "react-icons/fi";
import { GoWorkflow } from "react-icons/go";
import ciCdAPI, {
  type CiCdBuildItem,
  type CiCdBuildStages,
  type CiCdJobDetail,
  type CiCdJobItem,
  type CiCdStageItem,
  type CiCdStageLog,
  type JenkinsJobStatus,
} from "@/app/services/ciCd/ciCdAPI";
import { popup } from "@/app/ui/popUp";
import CiCdPipeline from "./ciCdPipeline";
import CiCdStageLogPanel from "./ciCdStageLogPanel";

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
      return "bg-[#242E42] animate-pulse";
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

function buildPillClass(status: JenkinsJobStatus, selected: boolean): string {
  if (selected) {
    return "bg-[#242E42] text-white ring-[#242E42]";
  }
  switch (status) {
    case "success":
      return "bg-white text-[#15803d] ring-[#86efac] hover:bg-[#ecfdf5]";
    case "failed":
      return "bg-white text-[#b91c1c] ring-[#fecaca] hover:bg-[#fef2f2]";
    case "unstable":
      return "bg-white text-[#a16207] ring-[#fde68a] hover:bg-[#fefce8]";
    case "running":
      return "bg-white text-[#1d4ed8] ring-[#93c5fd] hover:bg-[#eff6ff]";
    default:
      return "bg-white text-[#5b657d] ring-[#e4eaf6] hover:bg-white";
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

type BuildStagesApiResult =
  | {
      success?: boolean;
      data?: CiCdBuildStages;
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

type StageLogApiResult =
  | {
      success?: boolean;
      data?: CiCdStageLog;
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

type StagesCache = Record<
  number,
  { stages: CiCdStageItem[]; stagesMessage?: string }
>;

type StageLogCache = Record<
  string,
  { text: string; consoleUrl: string | null }
>;

function stageCacheKey(buildNumber: number, stageId: string) {
  return `${buildNumber}:${stageId}`;
}

type CiCdAccordionItemProps = {
  job: CiCdJobItem;
};

export default function CiCdAccordionItem({ job }: CiCdAccordionItemProps) {
  const [open, setOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingBuild, setLoadingBuild] = useState(false);
  const [detail, setDetail] = useState<CiCdJobDetail | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [selectedBuildNumber, setSelectedBuildNumber] = useState<number | null>(
    null
  );
  const [pendingBuildNumber, setPendingBuildNumber] = useState<number | null>(
    null
  );
  const [stages, setStages] = useState<CiCdStageItem[]>([]);
  const [stagesMessage, setStagesMessage] = useState<string | undefined>();
  const [stagesCache, setStagesCache] = useState<StagesCache>({});
  const [selectedStage, setSelectedStage] = useState<CiCdStageItem | null>(
    null
  );
  const [loadingStageId, setLoadingStageId] = useState<string | null>(null);
  const [stageLogText, setStageLogText] = useState("");
  const [stageLogError, setStageLogError] = useState<string | undefined>();
  const [stageConsoleUrl, setStageConsoleUrl] = useState<string | null>(null);
  const [stageLogCache, setStageLogCache] = useState<StageLogCache>({});

  const clearStageLog = () => {
    setSelectedStage(null);
    setLoadingStageId(null);
    setStageLogText("");
    setStageLogError(undefined);
    setStageConsoleUrl(null);
  };

  const applyStages = (
    buildNumber: number,
    nextStages: CiCdStageItem[],
    nextMessage?: string
  ) => {
    setSelectedBuildNumber(buildNumber);
    setPendingBuildNumber(null);
    setStages(nextStages);
    setStagesMessage(nextMessage);
    setStagesCache((prev) => ({
      ...prev,
      [buildNumber]: {
        stages: nextStages,
        ...(nextMessage ? { stagesMessage: nextMessage } : {}),
      },
    }));
    clearStageLog();
  };

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

      const data = result.data ?? null;
      setDetail(data);
      setLoaded(true);

      if (data?.selectedBuildNumber != null) {
        applyStages(
          data.selectedBuildNumber,
          data.stages || [],
          data.stagesMessage
        );
      } else {
        setSelectedBuildNumber(null);
        setPendingBuildNumber(null);
        setStages([]);
        setStagesMessage(data?.stagesMessage);
        clearStageLog();
      }
    } catch {
      await popup.error("Error", "Unable to fetch job pipeline");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleSelectBuild = async (build: CiCdBuildItem) => {
    if (loadingBuild || loadingStageId) return;
    if (
      selectedBuildNumber === build.number &&
      pendingBuildNumber == null
    ) {
      return;
    }

    const cached = stagesCache[build.number];
    if (cached) {
      applyStages(build.number, cached.stages, cached.stagesMessage);
      return;
    }

    setPendingBuildNumber(build.number);
    setLoadingBuild(true);
    clearStageLog();
    try {
      const result = (await ciCdAPI.getBuildStages(
        job.name,
        build.number
      )) as BuildStagesApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "Unable to fetch build stages";
        setPendingBuildNumber(null);
        await popup.error("Error", message);
        return;
      }

      applyStages(
        build.number,
        result.data?.stages || [],
        result.data?.stagesMessage
      );
    } catch {
      setPendingBuildNumber(null);
      await popup.error("Error", "Unable to fetch build stages");
    } finally {
      setLoadingBuild(false);
    }
  };

  const handleStageClick = async (stage: CiCdStageItem) => {
    if (loadingBuild || loadingStageId) return;
    if (selectedBuildNumber == null) return;

    const stageId = String(stage.id || "").trim();
    if (!stageId) {
      await popup.error("Error", "Stage id is missing");
      return;
    }

    if (selectedStage?.id === stageId && !loadingStageId) {
      clearStageLog();
      return;
    }

    setSelectedStage(stage);
    setStageLogError(undefined);

    const cacheKey = stageCacheKey(selectedBuildNumber, stageId);
    const cached = stageLogCache[cacheKey];
    if (cached) {
      setStageLogText(cached.text);
      setStageConsoleUrl(cached.consoleUrl);
      setLoadingStageId(null);
      return;
    }

    setLoadingStageId(stageId);
    setStageLogText("");
    setStageConsoleUrl(null);

    try {
      const result = (await ciCdAPI.getStageLog(
        job.name,
        selectedBuildNumber,
        stageId
      )) as StageLogApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "Unable to fetch stage log";
        setStageLogError(message);
        return;
      }

      const text = result.data?.text || "";
      const consoleUrl = result.data?.consoleUrl || null;
      setStageLogText(text);
      setStageConsoleUrl(consoleUrl);
      if (text.trim()) {
        setStageLogCache((prev) => ({
          ...prev,
          [cacheKey]: { text, consoleUrl },
        }));
      }
    } catch {
      setStageLogError("Unable to fetch stage log");
    } finally {
      setLoadingStageId(null);
    }
  };

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      await loadDetail();
    }
  };

  const builds: CiCdBuildItem[] = detail?.builds || [];

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-white transition duration-300 ${
        open
          ? "border-[#e2e5eb] shadow-md"
          : "border-[#e4e9f4] shadow-[0_2px_8px_rgba(31,38,64,0.04)] hover:border-[#d4def5] hover:shadow-[0_8px_20px_rgba(31,38,64,0.06)]"
      }`}
    >
      <button
        type="button"
        onClick={() => void handleToggle()}
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition hover:bg-white/80"
        aria-expanded={open}
      >
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#242E42]">
          <GoWorkflow className="h-5 w-5" />
          <span
            className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ${statusDotClass(job.status)}`}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-bold tracking-tight text-[#242E42]">
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
              open ? "rotate-180 bg-white text-[#242E42]" : ""
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
          <div className="border-t border-[#eef1f7] bg-white px-5 py-5">
            {loadingDetail ? (
              <div className="flex items-center gap-3 rounded-2xl border border-[#e4eaf6] bg-white px-4 py-6">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#242E42]/20 border-t-[#242E42]" />
                <p className="text-[13px] font-medium text-[#7a849c]">
                  Loading pipeline stages…
                </p>
              </div>
            ) : detail ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {detail.healthScore != null ? (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-[12px] font-semibold text-[#242E42] ring-1 ring-[#e4eaf6]">
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
                    <FiActivity className="h-3.5 w-3.5 text-[#242E42]" />
                    {stages.length} stages
                    {(pendingBuildNumber ?? selectedBuildNumber) != null
                      ? ` · #${pendingBuildNumber ?? selectedBuildNumber}`
                      : ""}
                  </span>

                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-[12px] font-semibold text-[#242E42] ring-1 ring-[#242E42]/15 transition hover:bg-white"
                    >
                      Open Jenkins
                      <FiExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                </div>

                {builds.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                      Build history
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {builds.map((build) => {
                        const activeNumber =
                          pendingBuildNumber ?? selectedBuildNumber;
                        const selected = activeNumber === build.number;
                        return (
                          <button
                            key={build.number}
                            type="button"
                            onClick={() => void handleSelectBuild(build)}
                            disabled={loadingBuild}
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold ring-1 transition disabled:cursor-not-allowed disabled:opacity-60 ${buildPillClass(build.status, selected)}`}
                            title={`${statusLabel(build.status)}${build.building ? " (running)" : ""}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                selected
                                  ? "bg-white"
                                  : statusDotClass(build.status).split(" ")[0]
                              }`}
                            />
                            #{build.number}
                            {loadingBuild && pendingBuildNumber === build.number ? (
                              <span className="ml-0.5 h-3 w-3 animate-spin rounded-full border border-white/40 border-t-white" />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="relative">
                  <div
                    className={
                      loadingBuild
                        ? "pointer-events-none opacity-40 transition-opacity"
                        : "transition-opacity"
                    }
                  >
                    <CiCdPipeline
                      stages={stages}
                      emptyMessage={stagesMessage}
                      selectedStageId={selectedStage?.id ?? null}
                      loadingStageId={loadingStageId}
                      onStageClick={(stage) => void handleStageClick(stage)}
                    />
                  </div>

                  {loadingBuild ? (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-[1px]">
                      <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-[13px] font-medium text-[#5b657d] ring-1 ring-[#e4eaf6]">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#242E42]/20 border-t-[#242E42]" />
                        Loading build
                        {pendingBuildNumber != null
                          ? ` #${pendingBuildNumber}`
                          : ""}
                        …
                      </div>
                    </div>
                  ) : null}
                </div>

                {selectedStage ? (
                  <CiCdStageLogPanel
                    stage={selectedStage}
                    buildNumber={selectedBuildNumber}
                    loading={loadingStageId === selectedStage.id}
                    text={stageLogText}
                    errorMessage={stageLogError}
                    consoleUrl={stageConsoleUrl}
                    onClose={clearStageLog}
                  />
                ) : null}
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
