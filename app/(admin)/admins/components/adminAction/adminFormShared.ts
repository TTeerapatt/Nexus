import { MdAdminPanelSettings, MdManageAccounts, MdBadge } from "react-icons/md";
import type { AdminPermissionInput, AdminPermissionMenu } from "@/app/services/admin/adminAPI";
import type { MenuTab } from "@/app/services/menu/menuAPI";

export type AdminFormModalProps = {
  open: boolean;
  /** ถ้ามีค่า = โหมดแก้ไข โหลดข้อมูลจาก `GET admins/:id/permissions` */
  adminId?: number | null;
  onClose: () => void;
  onCreated: () => void;
  onUpdated?: () => void;
};

export type AdminRole = "owner" | "admin" | "staff";

export type PermissionMap = Record<string, Record<string, boolean>>;

export type FormField =
  | "display_name"
  | "email"
  | "password"
  | "confirmPassword";

export type AdminFormValues = {
  display_name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export function getSteps(isEdit: boolean) {
  return [
    { id: 1, label: "เลือกบทบาท" },
    { id: 2, label: "ข้อมูลผู้ใช้งาน" },
    { id: 3, label: "ขอบเขตสิทธิ์" },
    { id: 4, label: isEdit ? "ยืนยันการแก้ไข" : "ยืนยันการสร้าง" },
  ] as const;
}

export const ROLE_OPTIONS: Array<{
  value: AdminRole;
  title: string;
  subtitle: string;
  description: string;
  Icon: typeof MdAdminPanelSettings;
}> = [
  {
    value: "owner",
    title: "Owner",
    subtitle: "เจ้าของระบบ",
    description: "สิทธิ์เต็มทุกเมนู และข้ามการตรวจ permission",
    Icon: MdAdminPanelSettings,
  },
  {
    value: "admin",
    title: "Admin",
    subtitle: "ผู้ดูแลระบบ",
    description: "จัดการข้อมูลหลักของร้านได้ตามสิทธิ์ที่กำหนด",
    Icon: MdManageAccounts,
  },
  {
    value: "staff",
    title: "Staff",
    subtitle: "พนักงาน",
    description: "ใช้งานตามขอบเขตเมนูที่ได้รับอนุญาต",
    Icon: MdBadge,
  },
];

export const ACTION_ORDER = ["view", "add", "edit", "delete", "export"] as const;

export function emptyForm(): AdminFormValues {
  return {
    display_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };
}

const inputBaseClass =
  "h-11 w-full rounded-xl border bg-white text-[14px] text-[#1f2640] outline-none transition";
const inputNormalClass =
  "border-[#d7dce7] focus:border-[#2553D8] focus:ring-2 focus:ring-[#2553d8]/15";
const inputErrorClass =
  "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20";

export function getInputClass(hasError: boolean, extra = "") {
  return `${inputBaseClass} ${hasError ? inputErrorClass : inputNormalClass} ${extra}`.trim();
}

export function buildDefaultPermissions(
  tabs: MenuTab[],
  role: AdminRole
): PermissionMap {
  const next: PermissionMap = {};
  for (const tab of tabs) {
    const actions = tab.actions ?? [];
    next[tab.code] = {};
    for (const action of actions) {
      if (role === "owner") {
        next[tab.code][action.code] = true;
      } else if (role === "admin") {
        next[tab.code][action.code] = ["view", "add", "edit", "delete"].includes(
          action.code
        );
      } else {
        next[tab.code][action.code] = action.code === "view";
      }
    }
  }
  return next;
}

export function permissionsToPayload(map: PermissionMap): AdminPermissionInput[] {
  return Object.entries(map)
    .map(([tab_code, actions]) => ({
      tab_code,
      action_codes: Object.entries(actions)
        .filter(([, allowed]) => allowed)
        .map(([code]) => code),
    }))
    .filter((item) => item.action_codes.length > 0);
}

export function permissionsFromAdminMenu(
  tabs: MenuTab[],
  menu: AdminPermissionMenu[],
  role: AdminRole
): PermissionMap {
  if (role === "owner") {
    return buildDefaultPermissions(tabs, "owner");
  }

  const next = buildDefaultPermissions(tabs, "staff");
  for (const tab of tabs) {
    for (const action of tab.actions ?? []) {
      next[tab.code][action.code] = false;
    }
  }

  for (const group of menu) {
    for (const tab of group.tabs || []) {
      if (!next[tab.code]) next[tab.code] = {};
      for (const [actionCode, allowed] of Object.entries(tab.actions || {})) {
        next[tab.code][actionCode] = Boolean(allowed);
      }
    }
  }
  return next;
}
