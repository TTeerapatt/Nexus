"use client";

import { useMemo } from "react";
import { getActiveTone, getDatabaseEngineTone } from "@/app/lib/uiTone";
import { type DatabaseItem } from "@/app/services/database/databaseAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";
import TableIconActions from "@/app/ui/tableIconActions";

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
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getDatabaseEngineTone(database.all_database_code)}`}
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
              className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:cursor-wait disabled:opacity-60 ${getActiveTone(database.is_active)}`}
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
          <TableIconActions
            editLabel={`Edit ${database.name}`}
            deleteLabel={`Delete ${database.name}`}
            onEdit={() => onEdit?.(database)}
            onDelete={() => onDelete?.(database)}
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
