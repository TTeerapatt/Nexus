"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { type ProjectItem } from "@/app/services/project/projectAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type ProjectTableProps = {
  projects: ProjectItem[];
  loading?: boolean;
  togglingId?: number | null;
  onEdit?: (project: ProjectItem) => void;
  onDelete?: (project: ProjectItem) => void;
  onToggleActive?: (project: ProjectItem) => void;
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

function ProjectRowActions({
  project,
  onEdit,
  onDelete,
}: {
  project: ProjectItem;
  onEdit?: (project: ProjectItem) => void;
  onDelete?: (project: ProjectItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(project)}
        aria-label={`Edit ${project.name}`}
        title="Edit"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#bfdbfe] bg-white text-[#2563EB] shadow-sm transition hover:border-[#2563EB] hover:bg-[#eff6ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(project)}
        aria-label={`Delete ${project.name}`}
        title="Delete"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#fef2f2] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ProjectTable({
  projects,
  loading = false,
  togglingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: ProjectTableProps) {
  const columns = useMemo<TableColumn<ProjectItem>[]>(
    () => [
      {
        key: "index",
        title: "No.",
        cellClassName: "font-medium text-[#5b657d]",
        render: (_project, index) => index + 1,
      },
      {
        key: "name",
        title: "Name",
        render: (project) => (
          <span className="font-semibold text-[#242E42]">{project.name}</span>
        ),
      },
      {
        key: "type",
        title: "Type",
        render: (project) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getProjectTypeBadgeClass(project.type)}`}
          >
            {getProjectTypeLabel(project.type)}
          </span>
        ),
      },
      {
        key: "resource_type",
        title: "Resource Type",
        render: (project) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getResourceTypeBadgeClass(project.resource_type_code)}`}
          >
            {project.resource_type_name || "-"}
          </span>
        ),
      },
      {
        key: "is_active",
        title: "Status",
        render: (project) => {
          const busy = togglingId === project.id;
          return (
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleActive?.(project)}
              title={project.is_active ? "Deactivate" : "Activate"}
              className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
                project.is_active
                  ? "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70 hover:bg-[#bbf7d0]"
                  : "bg-[#f3f4f6] text-[#6b7280] ring-1 ring-[#e5e7eb] hover:bg-[#e5e7eb]"
              }`}
            >
              {busy ? "..." : project.is_active ? "Active" : "Inactive"}
            </button>
          );
        },
      },
      {
        key: "created_at",
        title: "Created at",
        render: (project) => formatDateTime(project.created_at),
      },
      // {
      //   key: "updated_at",
      //   title: "Updated at",
      //   render: (project) => formatDateTime(project.updated_at),
      // },
      {
        key: "actions",
        title: "Actions",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (project) => (
          <ProjectRowActions
            project={project}
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
      data={projects}
      loading={loading}
      getRowKey={(project) => project.id}
      emptyText="No projects found"
      loadingText="Loading projects..."
    />
  );
}
