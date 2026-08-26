import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

export type JenkinsJobStatus =
  | "success"
  | "failed"
  | "unstable"
  | "running"
  | "aborted"
  | "not_built"
  | "disabled"
  | "unknown";

export type CiCdJobItem = {
  name: string;
  url: string;
  color: string;
  status: JenkinsJobStatus;
};

export type CiCdStageItem = {
  name: string;
  status: string;
  durationMillis: number | null;
};

export type CiCdJobDetail = {
  name: string;
  url: string;
  color: string;
  status: JenkinsJobStatus;
  healthScore: number | null;
  lastBuildNumber: number | null;
  stages: CiCdStageItem[];
  stagesMessage?: string;
};

function failedResult(err: unknown, fallback: string) {
  return {
    status: "failed" as const,
    errMessage:
      (err as { message?: string; errMessage?: string })?.message ||
      (err as { errMessage?: string })?.errMessage ||
      (typeof err === "string" ? err : null) ||
      fallback,
    error: err,
  };
}

const ciCdAPI = {
  getJobs() {
    return apiServices
      .get(`ci-cd/jobs`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getJobs:", err);
        return failedResult(err, "Failed to fetch CI-CD jobs");
      });
  },

  getJobByName(jobName: string) {
    return apiServices
      .get(`ci-cd/jobs/${encodeURIComponent(jobName)}`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getJobByName:", err);
        return failedResult(err, "Failed to fetch CI-CD job detail");
      });
  },
};

export default ciCdAPI;
