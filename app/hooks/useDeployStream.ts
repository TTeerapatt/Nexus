"use client";

import { useEffect, useRef, useState } from "react";
import { getAdminToken } from "@/app/lib/adminStorage";
import type { JenkinsJobStatus } from "@/app/services/ciCd/ciCdAPI";

export type DeployPhase = "started" | "stage" | "finished";
export type DeployWebhookStatus = "in_progress" | "success" | "failed";

export type DeployStreamEvent = {
  jobName: string;
  buildNumber: number;
  phase: DeployPhase;
  status: DeployWebhookStatus;
  jobStatus: JenkinsJobStatus;
  color: string;
  stage?: string;
  message?: string;
  timestamp: string;
};

type UseDeployStreamOptions = {
  jobName?: string;
  enabled?: boolean;
};

function buildStreamUrl(jobName?: string): string | null {
  const token = getAdminToken();
  if (!token) return null;

  const base = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001/nexus/api/"
  ).replace(/\/?$/, "/");

  const params = new URLSearchParams({ token });
  if (jobName?.trim()) {
    params.set("jobName", jobName.trim());
  }

  return `${base}stream-status?${params.toString()}`;
}

export function useDeployStream(options: UseDeployStreamOptions = {}) {
  const { jobName, enabled = true } = options;
  const [lastEvent, setLastEvent] = useState<DeployStreamEvent | null>(null);
  const [snapshot, setSnapshot] = useState<DeployStreamEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
      return;
    }

    const url = buildStreamUrl(jobName);
    if (!url) {
      setConnected(false);
      setError("Missing auth token");
      return;
    }

    let cancelled = false;
    const es = new EventSource(url);
    esRef.current = es;

    es.addEventListener("connected", () => {
      if (cancelled) return;
      setConnected(true);
      setError(null);
    });

    es.addEventListener("snapshot", (raw) => {
      if (cancelled) return;
      try {
        const data = JSON.parse((raw as MessageEvent).data) as DeployStreamEvent[];
        if (!Array.isArray(data)) return;
        setSnapshot(data);
        if (data.length > 0) {
          setLastEvent(data[data.length - 1] ?? null);
        }
      } catch {
        // ignore malformed snapshot
      }
    });

    es.addEventListener("deploy-status", (raw) => {
      if (cancelled) return;
      try {
        const data = JSON.parse(
          (raw as MessageEvent).data
        ) as DeployStreamEvent;
        if (!data?.jobName) return;
        setLastEvent(data);
        setSnapshot((prev) => {
          const next = prev.filter((item) => item.jobName !== data.jobName);
          next.push(data);
          return next;
        });
      } catch {
        // ignore malformed events
      }
    });

    es.onopen = () => {
      if (cancelled) return;
      setConnected(true);
      setError(null);
    };

    es.onerror = () => {
      if (cancelled) return;
      setConnected(false);
      setError("SSE connection interrupted");
    };

    return () => {
      cancelled = true;
      es.close();
      if (esRef.current === es) {
        esRef.current = null;
      }
      setConnected(false);
    };
  }, [enabled, jobName]);

  return { lastEvent, snapshot, connected, error };
}
