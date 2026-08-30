"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { type DatabaseItem } from "@/app/services/database/databaseAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type DatabaseTableProps = {
  databases: DatabaseItem[];
  loading?: boolean;
  togglingId?: number | null;
  onEdit?: (database: DatabaseItem) => void;
  onDelete?: (database: DatabaseItem) => void;
  onToggleActive?: (database: DatabaseItem) => void;
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

function getDatabaseTypeBadgeClass(code: string): string {
  const key = String(code || "").trim().toLowerCase();
  if (key === "postgres") {
    return "bg-[#2563eb] text-white ring-1 ring-[#1d4ed8]/40";
  }
  if (key === "mysql") {
    return "bg-[#d97706] text-white ring-1 ring-[#b45309]/40";
  }
  if (key === "mongodb") {
    return "bg-[#16a34a] text-white ring-1 ring-[#15803d]/40";
  }
  if (key === "firebase") {
    return "bg-[#ea580c] text-white ring-1 ring-[#c2410c]/40";
  }
  if (key === "supabase") {
    return "bg-[#0d9488] text-white ring-1 ring-[#0f766e]/40";
  }
  return "bg-[#64748b] text-white ring-1 ring-[#475569]/40";
}

function DatabaseRowActions({
  database,
  onEdit,
  onDelete,
}: {
  database: DatabaseItem;
  onEdit?: (database: DatabaseItem) => void;
  onDelete?: (database: DatabaseItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(database)}
        aria-label={`Edit ${database.name}`}
        title="Edit"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#bfdbfe] bg-[var(--surface)] text-[#2563EB] shadow-sm transition hover:border-[#2563EB] hover:bg-[var(--surface-soft)] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(database)}
        aria-label={`Delete ${database.name}`}
        title="Delete"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-[var(--surface)] text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#4c1d2a] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function DatabaseTable({
  databases,
  loading = false,
  togglingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: DatabaseTableProps) {
  const columns = useMemo<TableColumn<DatabaseItem>[]>(
    () => [
      {
        key: "index",
        title: "No.",
        cellClassName: "font-medium text-[var(--text-secondary)]",
        render: (_database, index) => index + 1,
      },
      {
        key: "name",
        title: "Name",
        render: (database) => (
          <span className="font-semibold text-[var(--text-primary)]">{database.name}</span>
        ),
      },
      {
        key: "project",
        title: "Project",
        render: (database) => (
          <span className="font-medium text-[var(--text-primary)]">
            {database.project_name || "-"}
          </span>
        ),
      },
      {
        key: "all_database",
        title: "Database Type",
        render: (database) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getDatabaseTypeBadgeClass(database.all_database_code)}`}
          >
            {database.all_database_name || "-"}
          </span>
        ),
      },
      {
        key: "description",
        title: "Description",
        render: (database) => (
          <span className="text-[var(--text-secondary)]">
            {database.description?.trim() || "-"}
          </span>
        ),
      },
      {
        key: "is_active",
        title: "Status",
        render: (database) => {
          const busy = togglingId === database.id;
          return (
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleActive?.(database)}
              title={database.is_active ? "Deactivate" : "Activate"}
              className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                database.is_active
                  ? "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70 hover:bg-[#bbf7d0]"
                  : "bg-[#f3f4f6] text-[#6b7280] ring-1 ring-[#e5e7eb] hover:bg-[var(--surface-soft)]"
              }`}
            >
              {busy ? "..." : database.is_active ? "Active" : "Inactive"}
            </button>
          );
        },
      },
      {
        key: "created_at",
        title: "Created at",
        render: (database) => formatDateTime(database.created_at),
      },
      {
        key: "actions",
        title: "Actions",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (database) => (
          <DatabaseRowActions
            database={database}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ),
      },
    ],
    [onDelete, onEdit, onToggleActive, togglingId]
  );

  return (
    <DataTable
      columns={columns}
      data={databases}
      loading={loading}
      getRowKey={(database) => database.id}
      emptyText="No databases found"
      loadingText="Loading databases..."
    />
  );
}
