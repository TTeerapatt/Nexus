"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiChevronDown,
  FiCpu,
  FiHardDrive,
  FiPlay,
  FiRefreshCw,
  FiSquare,
  FiWifi,
} from "react-icons/fi";
import vpsAPI, {
  type VpsMetricSeries,
  type VpsMetrics,
  type VpsPowerAction,
  type VpsVirtualMachine,
} from "@/app/services/vps/vpsAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";

type VpsCardProps = {
  vm: VpsVirtualMachine;
  onChanged: () => void;
};

function formatMb(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  if (value >= 1024) {
    const gb = value / 1024;
    return `${gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)} GB`;
  }
  return `${Math.round(value)} MB`;
}

function formatDateTime(value: string | null): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function formatMetric(value: number | null, unit: string | null): string {
  if (value == null || !Number.isFinite(value)) return "-";
  const u = (unit || "").toLowerCase();
  if (u.includes("%") || u === "percent" || u === "percentage") {
    return `${value.toFixed(1)}%`;
  }
  if (u.includes("byte") || u === "b" || u === "bytes") {
    return formatMb(value / (1024 * 1024));
  }
  if (u.includes("mb") || u === "mib") {
    return formatMb(value);
  }
  if (u.includes("gb") || u === "gib") {
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)} GB`;
  }
  if (u.includes("sec")) {
    const hours = value / 3600;
    if (hours >= 24) return `${(hours / 24).toFixed(1)} d`;
    return `${hours.toFixed(1)} h`;
  }
  return `${value.toFixed(1)}${unit ? ` ${unit}` : ""}`;
}

type MetricTone = {
  stroke: string;
  fillFrom: string;
  fillTo: string;
  chip: string;
};

const METRIC_TONES: Record<string, MetricTone> = {
  CPU: {
    stroke: "#2553D8",
    fillFrom: "rgba(37,83,216,0.28)",
    fillTo: "rgba(37,83,216,0.02)",
    chip: "bg-[#eef3ff] text-[#2553D8]",
  },
  RAM: {
    stroke: "#7c3aed",
    fillFrom: "rgba(124,58,237,0.24)",
    fillTo: "rgba(124,58,237,0.02)",
    chip: "bg-[#f5f3ff] text-[#6d28d9]",
  },
  Disk: {
    stroke: "#0d9488",
    fillFrom: "rgba(13,148,136,0.24)",
    fillTo: "rgba(13,148,136,0.02)",
    chip: "bg-[#f0fdfa] text-[#0f766e]",
  },
  "In traffic": {
    stroke: "#16a34a",
    fillFrom: "rgba(22,163,74,0.24)",
    fillTo: "rgba(22,163,74,0.02)",
    chip: "bg-[#f0fdf4] text-[#15803d]",
  },
  "Out traffic": {
    stroke: "#ea580c",
    fillFrom: "rgba(234,88,12,0.24)",
    fillTo: "rgba(234,88,12,0.02)",
    chip: "bg-[#fff7ed] text-[#c2410c]",
  },
  Uptime: {
    stroke: "#0891b2",
    fillFrom: "rgba(8,145,178,0.24)",
    fillTo: "rgba(8,145,178,0.02)",
    chip: "bg-[#ecfeff] text-[#0e7490]",
  },
};

function MetricSparkline({
  points,
  tone,
  gradientId,
}: {
  points: Array<{ timestamp: number; value: number }>;
  tone: MetricTone;
  gradientId: string;
}) {
  const geometry = useMemo(() => {
    if (!points.length) return null;

    const width = 320;
    const height = 84;
    const padX = 4;
    const padY = 8;
    const values = points.map((p) => p.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;

    const coords = points.map((point, index) => {
      const x =
        padX +
        (points.length === 1
          ? (width - padX * 2) / 2
          : (index / (points.length - 1)) * (width - padX * 2));
      const y =
        height - padY - ((point.value - min) / span) * (height - padY * 2);
      return { x, y };
    });

    const linePath = coords
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");

    const areaPath = [
      `M ${coords[0].x} ${height - padY}`,
      ...coords.map((point) => `L ${point.x} ${point.y}`),
      `L ${coords[coords.length - 1].x} ${height - padY}`,
      "Z",
    ].join(" ");

    const last = coords[coords.length - 1];

    return { width, height, linePath, areaPath, last };
  }, [points]);

  if (!geometry) {
    return (
      <div className="flex h-[84px] items-center justify-center text-[12px] text-[#9aa3b5]">
        No chart data
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${geometry.width} ${geometry.height}`}
      className="h-[84px] w-full"
      preserveAspectRatio="none"
      role="img"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone.fillFrom} />
          <stop offset="100%" stopColor={tone.fillTo} />
        </linearGradient>
      </defs>
      <path d={geometry.areaPath} fill={`url(#${gradientId})`} />
      <path
        d={geometry.linePath}
        fill="none"
        stroke={tone.stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={geometry.last.x}
        cy={geometry.last.y}
        r="3.5"
        fill="#ffffff"
        stroke={tone.stroke}
        strokeWidth="2"
      />
    </svg>
  );
}

function MetricChartCard({
  label,
  series,
  vmId,
}: {
  label: string;
  series: VpsMetricSeries | null | undefined;
  vmId: number;
}) {
  const tone = METRIC_TONES[label] ?? METRIC_TONES.CPU;
  const points = series?.points ?? [];
  const latest = series?.latest ?? null;
  const unit = series?.unit ?? null;
  const gradientId = `metric-${vmId}-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8ecf4] bg-white shadow-[0_4px_14px_rgba(37,83,216,0.04)]">
      <div className="flex items-start justify-between gap-3 px-4 pt-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
            {label}
          </p>
          <p className="mt-1 text-[20px] font-bold tracking-tight text-[#1f2640]">
            {formatMetric(latest, unit)}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone.chip}`}
        >
          24h
        </span>
      </div>
      <div className="px-2 pb-2 pt-1">
        <MetricSparkline
          points={points}
          tone={tone}
          gradientId={gradientId}
        />
      </div>
    </div>
  );
}

function getStateBadgeClass(state: string): string {
  const key = state.trim().toLowerCase();
  if (key === "running") {
    return "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70";
  }
  if (key === "stopped" || key === "off") {
    return "bg-[#f3f4f6] text-[#6b7280] ring-1 ring-[#e5e7eb]";
  }
  if (key === "starting" || key === "stopping" || key === "restarting") {
    return "bg-[#dbeafe] text-[#1d4ed8] ring-1 ring-[#93c5fd]/70";
  }
  if (key === "error" || key === "failed") {
    return "bg-[#fee2e2] text-[#b91c1c] ring-1 ring-[#fecaca]/70";
  }
  return "bg-[#eef2ff] text-[#4338ca] ring-1 ring-[#c7d2fe]/70";
}

function primaryIp(vm: VpsVirtualMachine): string {
  return vm.ipv4[0]?.address || vm.ipv6[0]?.address || "-";
}

export default function VpsCard({ vm, onChanged }: VpsCardProps) {
  const { withLoading } = useLoading();
  const [open, setOpen] = useState(false);
  const [metrics, setMetrics] = useState<VpsMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const result = (await vpsAPI.getVpsMetrics(vm.id)) as {
        success?: boolean;
        status?: string;
        data?: VpsMetrics;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        setMetrics(null);
        return;
      }

      setMetrics(result.data ?? null);
    } catch {
      setMetrics(null);
    } finally {
      setMetricsLoading(false);
    }
  }, [vm.id]);

  useEffect(() => {
    if (!open) return;
    void loadMetrics();
  }, [loadMetrics, open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  const handlePower = async (action: VpsPowerAction) => {
    const labels: Record<VpsPowerAction, string> = {
      start: "Start",
      stop: "Stop",
      restart: "Restart",
    };

    const confirmed = await popup.confirm({
      title: `${labels[action]} this VPS?`,
      text: `${labels[action]} ${vm.hostname}`,
      confirmText: labels[action],
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    setActionBusy(true);
    let ok = false;

    await withLoading(async () => {
      const result = (await vpsAPI.powerAction(vm.id, action)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          `${labels[action]} failed`,
          result?.errMessage ||
            result?.message ||
            `Unable to ${action} VPS`
        );
        return;
      }

      ok = true;
    }, `${labels[action]}ing VPS...`);

    setActionBusy(false);
    if (!ok) return;

    await popup.success(
      `${labels[action]} requested`,
      "Hostinger is processing the action"
    );
    onChanged();
    if (open) void loadMetrics();
  };

  const state = String(vm.state || "unknown");
  const canStart = state === "stopped" || state === "off";
  const canStop = state === "running";
  const canRestart = state === "running";

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4e9f4] bg-white shadow-[0_6px_18px_rgba(37,83,216,0.05)]">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition hover:bg-[#f8faff]"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef3ff] text-[#2553D8]">
          <FiCpu className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-bold text-[#1f2640]">
              {vm.hostname}
            </h3>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getStateBadgeClass(state)}`}
            >
              {state}
            </span>
          </div>
          <p className="mt-1 truncate text-[13px] text-[#7a849c]">
            {primaryIp(vm)}
            {vm.plan ? ` · ${vm.plan}` : ""}
            {vm.template?.name ? ` · ${vm.template.name}` : ""}
          </p>
        </div>

        <div className="hidden items-center gap-4 text-[12px] font-semibold text-[#5b657d] sm:flex">
          <span>{vm.cpus != null ? `${vm.cpus} vCPU` : "-"}</span>
          <span>{formatMb(vm.memory_mb)}</span>
          <span>{formatMb(vm.disk_mb)}</span>
        </div>

        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-[#5b657d] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[#eef2ff] px-5 py-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                IPv4
              </p>
              <p className="mt-1 font-mono text-[13px] font-semibold text-[#1f2640]">
                {vm.ipv4.map((ip) => ip.address).join(", ") || "-"}
              </p>
            </div>
            <div className="rounded-xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                Specs
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#1f2640]">
                {vm.cpus != null ? `${vm.cpus} vCPU` : "-"} ·{" "}
                {formatMb(vm.memory_mb)} · {formatMb(vm.disk_mb)}
              </p>
            </div>
            <div className="rounded-xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                Bandwidth
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#1f2640]">
                {formatMb(vm.bandwidth_mb)}
              </p>
            </div>
            <div className="rounded-xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                Created
              </p>
              <p className="mt-1 text-[13px] font-semibold text-[#1f2640]">
                {formatDateTime(vm.created_at)}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[#e8ecf4] bg-gradient-to-r from-[#f8faff] via-white to-[#f8faff] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                Power controls
              </p>
              {actionBusy ? (
                <span className="text-[11px] font-medium text-[#7a849c]">
                  Processing…
                </span>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={actionBusy || !canStart}
                onClick={() => void handlePower("start")}
                className="group inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-xl bg-[#16a34a] px-4 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(22,163,74,0.28)] transition hover:bg-[#15803d] hover:shadow-[0_8px_18px_rgba(22,163,74,0.34)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#86efac] disabled:shadow-none disabled:opacity-70"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 transition group-hover:bg-white/25">
                  <FiPlay className="h-3.5 w-3.5 fill-current" />
                </span>
                Start
              </button>

              <button
                type="button"
                disabled={actionBusy || !canStop}
                onClick={() => void handlePower("stop")}
                className="group inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-xl bg-[#dc2626] px-4 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(220,38,38,0.28)] transition hover:bg-[#b91c1c] hover:shadow-[0_8px_18px_rgba(220,38,38,0.34)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#fca5a5] disabled:shadow-none disabled:opacity-70"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 transition group-hover:bg-white/25">
                  <FiSquare className="h-3.5 w-3.5 fill-current" />
                </span>
                Stop
              </button>

              <button
                type="button"
                disabled={actionBusy || !canRestart}
                onClick={() => void handlePower("restart")}
                className="group inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-xl bg-[#2553D8] px-4 text-[13px] font-semibold text-white shadow-[0_6px_14px_rgba(37,83,216,0.28)] transition hover:bg-[#1d44b5] hover:shadow-[0_8px_18px_rgba(37,83,216,0.36)] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#93b0f5] disabled:shadow-none disabled:opacity-70"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 transition group-hover:bg-white/25">
                  <FiRefreshCw className="h-3.5 w-3.5" />
                </span>
                Restart
              </button>

              <div className="mx-0.5 hidden h-8 w-px bg-[#dbe3f3] sm:block" />

              <button
                type="button"
                disabled={metricsLoading}
                onClick={() => void loadMetrics()}
                className="group inline-flex h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-[#c7d7ff] bg-white px-4 text-[13px] font-semibold text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef3ff] text-[#2553D8] transition group-hover:bg-[#dbe7ff]">
                  <FiWifi
                    className={`h-3.5 w-3.5 ${metricsLoading ? "animate-pulse" : ""}`}
                  />
                </span>
                Refresh metrics
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2">
              <FiHardDrive className="h-4 w-4 text-[#2553D8]" />
              <h4 className="text-[14px] font-bold text-[#1f2640]">
                Metrics (last 24h)
              </h4>
            </div>

            {metricsLoading && !metrics ? (
              <div className="flex items-center gap-2 rounded-xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-6 text-[13px] text-[#7a849c]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2553D8]/20 border-t-[#2553D8]" />
                Loading metrics…
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    label: "CPU",
                    series: metrics?.cpu_usage,
                  },
                  {
                    label: "RAM",
                    series: metrics?.ram_usage,
                  },
                  {
                    label: "Disk",
                    series: metrics?.disk_space,
                  },
                  {
                    label: "In traffic",
                    series: metrics?.incoming_traffic,
                  },
                  {
                    label: "Out traffic",
                    series: metrics?.outgoing_traffic,
                  },
                  {
                    label: "Uptime",
                    series: metrics?.uptime,
                  },
                ].map((item) => (
                  <MetricChartCard
                    key={item.label}
                    label={item.label}
                    series={item.series}
                    vmId={vm.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
