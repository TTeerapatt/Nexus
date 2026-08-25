"use client";

import { useMemo } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { type AdminItem } from "@/app/services/admin/adminAPI";
import DataTable, { type TableColumn } from "@/app/ui/table";

type AdminTableProps = {
  admins: AdminItem[];
  loading?: boolean;
  onEdit?: (admin: AdminItem) => void;
  onDelete?: (admin: AdminItem) => void;
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

function getRoleLabel(role: string): string {
  const key = String(role || "").trim().toLowerCase();
  if (key === "owner") return "Owner";
  if (key === "admin") return "Admin";
  if (key === "staff") return "Staff";
  return role || "-";
}

function getRoleBadgeClass(role: string): string {
  const key = String(role || "").trim().toLowerCase();
  if (key === "owner") {
    return "bg-[#2553D8]/12 text-[#2553D8] ring-1 ring-[#2553D8]/20";
  }
  if (key === "admin") {
    return "bg-[#dbeafe] text-[#1d4ed8] ring-1 ring-[#93c5fd]/60";
  }
  if (key === "staff") {
    return "bg-[#f3f4f6] text-[#4b5563] ring-1 ring-[#e5e7eb]";
  }
  return "bg-[#f3f4f6] text-[#4b5563] ring-1 ring-[#e5e7eb]";
}

function AdminRowActions({
  admin,
  onEdit,
  onDelete,
}: {
  admin: AdminItem;
  onEdit?: (admin: AdminItem) => void;
  onDelete?: (admin: AdminItem) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(admin)}
        aria-label={`แก้ไข ${admin.display_name}`}
        title="แก้ไข"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#c7d7ff] bg-white text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-95"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete?.(admin)}
        aria-label={`ลบ ${admin.display_name}`}
        title="ลบ"
        className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#fecaca] bg-white text-[#dc2626] shadow-sm transition hover:border-[#f87171] hover:bg-[#fef2f2] hover:shadow-md active:scale-95"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function AdminTable({
  admins,
  loading = false,
  onEdit,
  onDelete,
}: AdminTableProps) {
  const columns = useMemo<TableColumn<AdminItem>[]>(
    () => [
      {
        key: "index",
        title: "ลำดับ",
        cellClassName: "font-medium text-[#5b657d]",
        render: (_admin, index) => index + 1,
      },
      {
        key: "display_name",
        title: "ชื่อ",
        render: (admin) => (
          <span className="font-semibold text-[#1f2640]">{admin.display_name}</span>
        ),
      },
      {
        key: "email",
        title: "อีเมล",
        render: (admin) => admin.email,
      },
      {
        key: "role",
        title: "Role",
        render: (admin) => (
          <span
            className={`inline-flex rounded-full px-3 py-1 text-[12px] font-semibold ${getRoleBadgeClass(admin.role)}`}
          >
            {getRoleLabel(admin.role)}
          </span>
        ),
      },
      {
        key: "last_login_at",
        title: "เข้าใช้ล่าสุด",
        render: (admin) => formatDateTime(admin.last_login_at),
      },
      // {
      //   key: "created_at",
      //   title: "วันที่สร้าง",
      //   render: (admin) => formatDateTime(admin.created_at),
      // },
      {
        key: "actions",
        title: "การใช้งาน",
        headerClassName: "text-right",
        cellClassName: "text-right",
        render: (admin) => (
          <AdminRowActions admin={admin} onEdit={onEdit} onDelete={onDelete} />
        ),
      },
    ],
    [onDelete, onEdit]
  );

  return (
    <DataTable
      columns={columns}
      data={admins}
      loading={loading}
      getRowKey={(admin) => admin.id}
      emptyText="ไม่พบข้อมูลผู้ดูแลระบบ"
      loadingText="กำลังโหลดข้อมูลผู้ดูแลระบบ..."
    />
  );
}
