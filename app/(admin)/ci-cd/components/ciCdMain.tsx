"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { GoWorkflow } from "react-icons/go";
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

export default function CiCdMain() {
  const [jobs, setJobs] = useState<CiCdJobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = (await ciCdAPI.getJobs()) as JobListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "Unable to fetch CI-CD jobs";
        await popup.error("Error", message);
        setJobs([]);
        return;
      }

      setJobs(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("Error", "Unable to fetch CI-CD jobs");
      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const summary = useMemo(() => {
    const total = jobs.length;
    const success = jobs.filter((j) => j.status === "success").length;
    const failed = jobs.filter((j) => j.status === "failed").length;
    const running = jobs.filter((j) => j.status === "running").length;
    return { total, success, failed, running };
  }, [jobs]);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-[#dbe5ff] bg-gradient-to-br from-[#ffffff] via-[#f7f9ff] to-[#eef3ff] px-6 py-5 shadow-[0_8px_24px_rgba(37,83,216,0.06)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#2553D8]/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 left-20 h-28 w-28 rounded-full bg-[#60a5fa]/15 blur-2xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2553D8] text-white">
              <GoWorkflow className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold tracking-tight text-[#1f2640]">
                Jenkins CI/CD
              </h1>
              {/* <p className="mt-1 text-[14px] text-[#7a849c]">
                Jenkins deploy jobs and live pipeline stages
              </p> */}
            </div>
          </div>

          <button
            type="button"
            onClick={() => void fetchJobs(true)}
            disabled={loading || refreshing}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2553D8] px-4 text-[13px] font-semibold text-white shadow-[0_4px_14px_rgba(37,83,216,0.28)] transition hover:bg-[#1d44b5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {!loading && jobs.length > 0 ? (
          <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Jobs", value: summary.total, tone: "text-[#1f2640]" },
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
                className="rounded-2xl bg-white/70 px-4 py-3 backdrop-blur-sm shadow-[0_4px_14px_rgba(37,83,216,0.12)]"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
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
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#e4e9f4] bg-white px-5 py-14">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#2553D8]/20 border-t-[#2553D8]" />
          <p className="text-[14px] font-medium text-[#7a849c]">
            Loading Jenkins jobs…
          </p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d8e0f0] bg-white px-5 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3f6fc] text-[#2553D8]">
            <GoWorkflow className="h-6 w-6" />
          </div>
          <p className="text-[15px] font-semibold text-[#1f2640]">
            No Jenkins jobs found
          </p>
          <p className="mt-1 text-[13px] text-[#7a849c]">
            Check Jenkins connection or try Refresh
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <CiCdAccordionItem key={job.name} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
