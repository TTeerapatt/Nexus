"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { FaNetworkWired } from "react-icons/fa";
import { type PortItem } from "@/app/services/port/portAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type PortTableProps = {
  ports: PortItem[];
  loading?: boolean;
  togglingId?: number | null;
  onEdit?: (port: PortItem) => void;
  onDelete?: (port: PortItem) => void;
  onToggleActive?: (port: PortItem) => void;
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

function getProjectTypeBadgeClass(type: string): string {
  const key = String(type || "").trim().toLowerCase();
  if (key === "project") {
    return "bg-[#0e7490] text-white ring-1 ring-[#155e75]/40";
  }
  if (key === "service") {
    return "bg-[#e11d48] text-white ring-1 ring-[#be123c]/40";
  }
  return "bg-[#64748b] text-white ring-1 ring-[#475569]/40";
}

function getProjectTypeLabel(type: string): string {
  const key = String(type || "").trim().toLowerCase();
  if (key === "project") return "Project";
  if (key === "service") return "Service";
  return type || "-";
}

function getResourceTypeBadgeClass(code: string): string {
  const key = String(code || "").trim().toLowerCase();
  if (key === "frontend") {
    return "bg-[#2563eb] text-white ring-1 ring-[#1d4ed8]/40";
  }
  if (key === "backend") {
    return "bg-[#d97706] text-white ring-1 ring-[#b45309]/40";
  }
  if (key === "database") {
    return "bg-[#16a34a] text-white ring-1 ring-[#15803d]/40";
  }
  if (key === "services") {
    return "bg-[#7c3aed] text-white ring-1 ring-[#6d28d9]/40";
  }
  return "bg-[#64748b] text-white ring-1 ring-[#475569]/40";
}

function getPortBadgeClass(resourceTypeCode: string): string {
  const key = String(resourceTypeCode || "").trim().toLowerCase();
  if (key === "frontend") {
    return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  }
  if (key === "backend") {
    return "border-[#fde68a] bg-[#fffbeb] text-[#b45309]";
  }
  if (key === "database") {
    return "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]";
  }
  if (key === "services") {
    return "border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]";
  }
  return "border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]";
}

function PortNumberBadge({
  portNumber,
  resourceTypeCode,
}: {
  portNumber: number;
  resourceTypeCode: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 shadow-sm ${getPortBadgeClass(resourceTypeCode)}`}
      title={`Port ${portNumber}`}
    >
      <span className="text-[11px] font-semibold uppercase tracking-wide opacity-55">
      <FaNetworkWired className="h-4 w-4" />
      </span>
      <span className="font-mono text-[14px] font-bold tabular-nums tracking-wide">
        {portNumber}
      </span>
    </span>
  );
}

function PortRowActions({
  port,
  onEdit,
  onDelete,
}: {
  port: PortItem;
  onEdit?: (port: PortItem) => void;
  onDelete?: (port: PortItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(port)}
        aria-label={`Edit port ${port.port_number}`}
        title="Edit"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#bfdbfe] bg-[var(--surface)] text-[#2563EB] shadow-sm transition hover:border-[#2563EB] hover:bg-[var(--surface-soft)] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(port)}
        aria-label={`Delete port ${port.port_number}`}
        title="Delete"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-[var(--surface)] text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#4c1d2a] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function PortTable({
  ports,
  loading = false,
  togglingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: PortTableProps) {
  const columns = useMemo<TableColumn<PortItem>[]>(
    () => [
      {
        key: "index",
        title: "No.",
        cellClassName: "font-medium text-[var(--text-secondary)]",
        render: (_port, index) => index + 1,
      },
      {
        key: "port_number",
        title: "Port",
        render: (port) => (
          <PortNumberBadge
            portNumber={port.port_number}
            resourceTypeCode={port.resource_type_code}
          />
        ),
      },
      {
        key: "project_name",
        title: "Project",
        render: (port) => (
          <span className="font-semibold text-[var(--text-primary)]">
            {port.project_name}
          </span>
        ),
      },
      {
        key: "project_type",
        title: "Type",
        render: (port) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getProjectTypeBadgeClass(port.project_type)}`}
          >
            {getProjectTypeLabel(port.project_type)}
          </span>
        ),
      },
      {
        key: "resource_type",
        title: "Resource Type",
        render: (port) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getResourceTypeBadgeClass(port.resource_type_code)}`}
          >
            {port.resource_type_name || "-"}
          </span>
        ),
      },
      // {
      //   key: "description",
      //   title: "Description",
      //   render: (port) => (
      //     <span className="text-[var(--text-secondary)]">
      //       {port.description?.trim() ? port.description : "-"}
      //     </span>
      //   ),
      // },
      {
        key: "is_active",
        title: "Status",
        render: (port) => {
          const busy = togglingId === port.id;
          return (
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleActive?.(port)}
              title={port.is_active ? "Deactivate" : "Activate"}
              className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                port.is_active
                  ? "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70 hover:bg-[#bbf7d0]"
                  : "bg-[#f3f4f6] text-[#6b7280] ring-1 ring-[#e5e7eb] hover:bg-[var(--surface-soft)]"
              }`}
            >
              {busy ? "..." : port.is_active ? "Active" : "Inactive"}
            </button>
          );
        },
      },
      {
        key: "created_at",
        title: "Created at",
        render: (port) => formatDateTime(port.created_at),
      },
      // {
      //   key: "updated_at",
      //   title: "Updated at",
      //   render: (port) => formatDateTime(port.updated_at),
      // },
      {
        key: "actions",
        title: "Actions",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (port) => (
          <PortRowActions port={port} onEdit={onEdit} onDelete={onDelete} />
        ),
      },
    ],
    [onDelete, onEdit, onToggleActive, togglingId]
  );

  return (
    <DataTable
      columns={columns}
      data={ports}
      loading={loading}
      getRowKey={(port) => port.id}
      emptyText="No ports found"
      loadingText="Loading ports..."
    />
  );
}
