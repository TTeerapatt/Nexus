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

function getResourceTypeBadgeClass(code: string): string {
  const key = String(code || "").trim().toLowerCase();
  if (key === "frontend") {
    return "bg-[#dbeafe] text-[#1d4ed8] ring-1 ring-[#93c5fd]/60";
  }
  if (key === "backend") {
    return "bg-[#fef3c7] text-[#b45309] ring-1 ring-[#fcd34d]/70";
  }
  if (key === "database") {
    return "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70";
  }
  if (key === "services") {
    return "bg-[#f3e8ff] text-[#7e22ce] ring-1 ring-[#d8b4fe]/70";
  }
  return "bg-[#f3f4f6] text-[#4b5563] ring-1 ring-[#e5e7eb]";
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
        aria-label={`แก้ไข ${project.name}`}
        title="แก้ไข"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#c7d7ff] bg-white text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(project)}
        aria-label={`ลบ ${project.name}`}
        title="ลบ"
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
        title: "ลำดับ",
        cellClassName: "font-medium text-[#5b657d]",
        render: (_project, index) => index + 1,
      },
      {
        key: "name",
        title: "Project",
        render: (project) => (
          <span className="font-semibold text-[#1f2640]">{project.name}</span>
        ),
      },
      {
        key: "description",
        title: "รายละเอียด",
        render: (project) => (
          <span className="text-[#5b657d]">
            {project.description?.trim() ? project.description : "-"}
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
        title: "สถานะ",
        render: (project) => {
          const busy = togglingId === project.id;
          return (
            <button
              type="button"
              disabled={busy}
              onClick={() => onToggleActive?.(project)}
              title={project.is_active ? "ปิดใช้งาน" : "เปิดใช้งาน"}
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
        title: "สร้างเมื่อ",
        render: (project) => formatDateTime(project.created_at),
      },
      {
        key: "updated_at",
        title: "แก้ไขล่าสุด",
        render: (project) => formatDateTime(project.updated_at),
      },
      {
        key: "actions",
        title: "การใช้งาน",
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
      emptyText="ไม่พบข้อมูล Project"
      loadingText="กำลังโหลดข้อมูล Project..."
      title="รายการ Project"
      count={projects.length}
    />
  );
}
