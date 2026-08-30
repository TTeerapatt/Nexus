"use client";

import { useMemo } from "react";
import { type AdminLogItem } from "@/app/services/adminLog/adminLogAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type LogsTableProps = {
  logs: AdminLogItem[];
  loading?: boolean;
};

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

function getActionLabel(action: string): string {
  const key = String(action || "").trim().toLowerCase();
  if (key === "login") return "Login";
  if (key === "create") return "Create";
  if (key === "update") return "Update";
  if (key === "soft_delete") return "Soft delete";
  if (key === "hard_delete") return "Hard delete";
  if (key === "delete") return "Delete";
  if (key === "start") return "Start";
  if (key === "stop") return "Stop";
  if (key === "restart") return "Restart";
  return action || "-";
}

function getActionBadgeClass(action: string): string {
  const key = String(action || "").trim().toLowerCase();
  if (key === "login") {
    return "bg-[#dbeafe] text-[#1d4ed8] ring-1 ring-[#93c5fd]/70";
  }
  if (key === "create" || key === "start") {
    return "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70";
  }
  if (key === "update" || key === "restart") {
    return "bg-[#fef3c7] text-[#b45309] ring-1 ring-[#fcd34d]/70";
  }
  if (
    key === "soft_delete" ||
    key === "hard_delete" ||
    key === "delete" ||
    key === "stop"
  ) {
    return "bg-[#fee2e2] text-[#b91c1c] ring-1 ring-[#fecaca]/70";
  }
  return "bg-[var(--surface)] text-[#4338ca] ring-1 ring-[#c7d2fe]/70";
}

export default function LogsTable({ logs, loading = false }: LogsTableProps) {
  const columns = useMemo<TableColumn<AdminLogItem>[]>(
    () => [
      {
        key: "index",
        title: "No.",
        headerClassName: "w-[72px]",
        cellClassName: "w-[72px] font-medium text-[var(--text-secondary)]",
        render: (_log, index) => index + 1,
      },
      {
        key: "created_at",
        title: "Time",
        headerClassName: "w-[180px]",
        cellClassName: "w-[180px] whitespace-nowrap text-[var(--text-secondary)]",
        render: (log) => formatDateTime(log.created_at),
      },
      {
        key: "admin",
        title: "Admin",
        headerClassName: "w-[180px]",
        cellClassName: "w-[180px]",
        render: (log) => (
          <span className="font-semibold text-[var(--text-primary)]">
            {log.admin_display_name?.trim() || `Admin #${log.admin_id}`}
          </span>
        ),
      },
      {
        key: "email",
        title: "Email",
        headerClassName: "w-[220px]",
        cellClassName: "w-[220px]",
        render: (log) => (
          <span className="text-[var(--text-secondary)]">
            {log.admin_email?.trim() || "-"}
          </span>
        ),
      },
      {
        key: "action",
        title: "Action",
        headerClassName: "w-[140px]",
        cellClassName: "w-[140px]",
        render: (log) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getActionBadgeClass(log.action)}`}
          >
            {getActionLabel(log.action)}
          </span>
        ),
      },
      {
        key: "message",
        title: "Message",
        render: (log) => (
          <span
            className="block max-w-[520px] truncate text-[var(--text-secondary)]"
            title={log.message?.trim() || undefined}
          >
            {log.message?.trim() ? log.message : "-"}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      columns={columns}
      data={logs}
      loading={loading}
      getRowKey={(log) => log.id}
      emptyText="No logs found"
      loadingText="Loading logs..."
    />
  );
}
