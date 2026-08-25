"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
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
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#c7d7ff] bg-white text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(port)}
        aria-label={`Delete port ${port.port_number}`}
        title="Delete"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#fef2f2] hover:shadow-md active:scale-95"
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
        cellClassName: "font-medium text-[#5b657d]",
        render: (_port, index) => index + 1,
      },
      {
        key: "port_number",
        title: "Port",
        render: (port) => (
          <span className="font-semibold tabular-nums text-[#1f2640]">
            {port.port_number}
          </span>
        ),
      },
      {
        key: "project_name",
        title: "Project",
        render: (port) => (
          <span className="font-semibold text-[#1f2640]">
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
      //     <span className="text-[#5b657d]">
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
                  : "bg-[#f3f4f6] text-[#6b7280] ring-1 ring-[#e5e7eb] hover:bg-[#e5e7eb]"
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
