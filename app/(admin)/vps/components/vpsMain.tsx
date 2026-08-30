"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { MdCloud } from "react-icons/md";
import vpsAPI, {
  type VpsVirtualMachine,
} from "@/app/services/vps/vpsAPI";
import { popup } from "@/app/ui/popUp";
import VpsCard from "./vpsCard";

type VpsListApiResult =
  | {
      success?: boolean;
      data?: VpsVirtualMachine[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function VpsMain() {
  const [vms, setVms] = useState<VpsVirtualMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVms = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = (await vpsAPI.getVpsAll()) as VpsListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "Unable to fetch VPS list";
        await popup.error("Error", message);
        setVms([]);
        return;
      }

      setVms(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("Error", "Unable to fetch VPS list");
      setVms([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchVms();
  }, [fetchVms]);

  const summary = useMemo(() => {
    const total = vms.length;
    const running = vms.filter(
      (vm) => String(vm.state).toLowerCase() === "running"
    ).length;
    const stopped = vms.filter((vm) => {
      const state = String(vm.state).toLowerCase();
      return state === "stopped" || state === "off";
    }).length;
    const other = Math.max(total - running - stopped, 0);
    return { total, running, stopped, other };
  }, [vms]);

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] px-6 py-5 shadow-[0_8px_24px_rgba(36,46,66,0.08)]">

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-raised)] text-white">
              <MdCloud className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold tracking-tight text-[var(--text-primary)]">
                Hostinger VPS
              </h1>
              {/* <p className="mt-1 text-[14px] text-[var(--text-muted)]">
                Live status, specs, and metrics from Hostinger API
              </p> */}
            </div>
          </div>

          {/* <button
            type="button"
            onClick={() => void fetchVms(true)}
            disabled={loading || refreshing}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--surface-raised)] px-4 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[var(--surface-soft)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiRefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button> */}
        </div>

        {!loading && vms.length > 0 ? (
          <div className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: summary.total, tone: "text-[var(--text-primary)]" },
              {
                label: "Running",
                value: summary.running,
                tone: "text-[#15803d]",
              },
              {
                label: "Stopped",
                value: summary.stopped,
                tone: "text-[#6b7280]",
              },
              {
                label: "Other",
                value: summary.other,
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
            Loading Hostinger VPS…
          </p>
        </div>
      ) : vms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)] px-5 py-14 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--surface-muted)] text-[var(--text-primary)]">
            <MdCloud className="h-6 w-6" />
          </div>
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">
            No VPS found
          </p>
          <p className="mt-1 text-[13px] text-[var(--text-muted)]">
            Check Hostinger API token or try Refresh
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {vms.map((vm) => (
            <VpsCard
              key={vm.id}
              vm={vm}
              onChanged={() => {
                void fetchVms(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
