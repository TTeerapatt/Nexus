"use client";

import { useCallback, useEffect, useState } from "react";
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

  const fetchJobs = useCallback(async () => {
    setLoading(true);
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
    }
  }, []);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#1f2640]">
            CI-CD
          </h1>
          <p className="mt-1 text-[14px] text-[#7a849c]">
            Jenkins deploy jobs and pipeline stages
          </p>
        </div>
        <button
          type="button"
          onClick={() => void fetchJobs()}
          className="inline-flex h-10 cursor-pointer items-center justify-center rounded-xl border border-[#b8c9ff] bg-[#f8faff] px-4 text-[13px] font-semibold text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff]"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-[#e4e9f4] bg-white px-5 py-10 text-center text-[14px] text-[#7a849c]">
          Loading Jenkins jobs…
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-[#e4e9f4] bg-white px-5 py-10 text-center text-[14px] text-[#7a849c]">
          No Jenkins jobs found
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
