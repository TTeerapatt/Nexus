"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoWorkflow } from "react-icons/go";
import {
  useDeployStream,
  type DeployStreamEvent,
} from "@/app/hooks/useDeployStream";
import ciCdAPI, { type CiCdJobItem } from "@/app/services/ciCd/ciCdAPI";
import { popup } from "@/app/ui/popUp";
import CiCdAccordionItem from "./ciCdAccordionItem";

type JobListApiResult =
  | {
      success?: boolean;
      data?: CiCdJobItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

function applyDeployEventToJobs(
  jobs: CiCdJobItem[],
  event: DeployStreamEvent
): CiCdJobItem[] {
  let found = false;
  const next = jobs.map((job) => {
    if (job.name !== event.jobName) return job;
    found = true;
    if (job.status === event.jobStatus && job.color === event.color) {
      return job;
    }
    return {
      ...job,
      status: event.jobStatus,
      color: event.color,
    };
  });

  if (found) return next;

  // Job not yet in list — append a lightweight card until next full refresh
  return [
    ...next,
    {
      name: event.jobName,
      url: "",
      color: event.color,
      status: event.jobStatus,
    },
  ];
}

export default function CiCdMain() {
  const [jobs, setJobs] = useState<CiCdJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const lastHandledAtRef = useRef<string | null>(null);
  const appliedSnapshotRef = useRef(false);
  const syncInFlightRef = useRef(false);

  const { lastEvent, snapshot, connected } = useDeployStream({
    enabled: !loading,
  });

  const fetchJobs = useCallback(
    async (opts?: { background?: boolean; silent?: boolean }) => {
      const background = opts?.background === true;
      const silent = opts?.silent === true;
      if (syncInFlightRef.current) return;
      syncInFlightRef.current = true;
      if (!background) {
        setLoading(true);
      }

      try {
        const result = (await ciCdAPI.getJobs()) as JobListApiResult;

        if (!result || result.status === "failed" || result.success === false) {
          const message =
            result?.errMessage ||
            result?.message ||
            "Unable to fetch CI-CD jobs";
          if (!silent) {
            await popup.error("Error", message);
          }
          if (!background) {
            setJobs([]);
          }
          return;
        }

        setJobs(Array.isArray(result.data) ? result.data : []);
      } catch {
        if (!silent) {
          await popup.error("Error", "Unable to fetch CI-CD jobs");
        }
        if (!background) {
          setJobs([]);
        }
      } finally {
        if (!background) {
          setLoading(false);
        }
        syncInFlightRef.current = false;
      }
    },
    []
  );

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  // Fallback sync: keep UI fresh even when webhook events are delayed/missed
  useEffect(() => {
    const timer = window.setInterval(() => {
      void fetchJobs({ background: true, silent: true });
    }, 8000);
    return () => window.clearInterval(timer);
  }, [fetchJobs]);

  // Apply in-memory webhook snapshot once after SSE connects
  useEffect(() => {
    if (appliedSnapshotRef.current || !snapshot.length) return;
    appliedSnapshotRef.current = true;
    setJobs((prev) => {
      let next = prev;
      for (const event of snapshot) {
        next = applyDeployEventToJobs(next, event);
      }
      return next;
    });
  }, [snapshot]);

  useEffect(() => {
    if (!lastEvent) return;
    const key = `${lastEvent.jobName}:${lastEvent.buildNumber}:${lastEvent.status}:${lastEvent.timestamp}`;
    if (lastHandledAtRef.current === key) return;
    lastHandledAtRef.current = key;
    setJobs((prev) => applyDeployEventToJobs(prev, lastEvent));
  }, [lastEvent]);

  const summary = useMemo(() => {
    const total = jobs.length;
    const success = jobs.filter((j) => j.status === "success").length;
    const failed = jobs.filter((j) => j.status === "failed").length;
    const running = jobs.filter((j) => j.status === "running").length;
    return { total, success, failed, running };
  }, [jobs]);

  const liveByJob = useMemo(() => {
    const map = new Map<string, DeployStreamEvent>();
    for (const event of snapshot) {
      map.set(event.jobName, event);
    }
    if (lastEvent) {
      map.set(lastEvent.jobName, lastEvent);
    }
    return map;
  }, [snapshot, lastEvent]);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[0_8px_24px_rgba(36,46,66,0.08)]">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-raised)] text-white">
              <GoWorkflow className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-primary)]">
                Jenkins CI/CD
              </h1>
              <p className="mt-1 flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                <span
                  className={`inline-flex h-2 w-2 rounded-full ${
                    connected
                      ? "bg-[#22c55e] shadow-[0_0_0_4px_rgba(34,197,94,0.18)]"
                      : "bg-[#94a3b8]"
                  }`}
                />
                {connected ? "Live updates connected" : "Connecting live updates…"}
              </p>
            </div>
          </div>
        </div>

        {!loading && jobs.length > 0 ? (
          <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                label: "Jobs",
                value: summary.total,
                tone: "text-[var(--text-primary)]",
              },
              {
                label: "Success",
                value: summary.success,
                tone: "text-[#15803d]",
              },
              {
                label: "Failed",
                value: summary.failed,
                tone: "text-[#b91c1c]",
              },
              {
                label: "Running",
                value: summary.running,
                tone: "text-[#1d4ed8]",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-[var(--surface)] px-4 py-3 shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  {item.label}
                </p>
                <p className={`mt-1 text-[22px] font-bold ${item.tone}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-14">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)]" />
          <p className="text-[14px] font-medium text-[var(--text-muted)]">
            Loading Jenkins jobs…
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-5 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--text-primary)]">
            <GoWorkflow className="h-6 w-6" />
          </div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            No Jenkins jobs found
          </p>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            Check Jenkins connection or webhook stream
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <CiCdAccordionItem
              key={job.name}
              job={job}
              liveEvent={liveByJob.get(job.name) ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
