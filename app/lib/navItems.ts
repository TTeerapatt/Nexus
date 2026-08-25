import type { IconType } from "react-icons";
import {
  MdCategory,
  MdDashboard,
  MdLocalLaundryService,
  MdPeople,
  MdPriceChange,
  MdReceiptLong,
  MdAdminPanelSettings,
} from "react-icons/md";

export type NavItem = {
  href: string;
  label: string;
  icon: IconType;
};

export const TAB_CODE_TO_HREF: Record<string, string> = {
  overview: "/",
  bi: "/bi",
  admins: "/admins",
  admin_log: "/admin-log",
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "แดชบอร์ด", icon: MdDashboard },
  { href: "/admins", label: "ผู้ดูแลระบบ", icon: MdAdminPanelSettings },
];

export function getTabHrefByCode(tabCode: string): string | null {
  const key = String(tabCode || "").trim().toLowerCase();
  return TAB_CODE_TO_HREF[key] ?? null;
}

export function getTabCodeByPath(pathname: string): string | null {
  const path = String(pathname || "").trim();
  const entries = Object.entries(TAB_CODE_TO_HREF);
  const exact = entries.find(([, href]) => href === path);
  if (exact) return exact[0];

  const nested = entries.find(
    ([, href]) => href !== "/" && path.startsWith(`${href}/`)
  );
  return nested?.[0] ?? null;
}

export function getTabIconByCode(tabCode: string): IconType {
  const key = String(tabCode || "").trim().toLowerCase();
  if (key === "admins" || key === "admin_log") return MdAdminPanelSettings;
  return MdDashboard;
}

export function getNavLabelByPath(pathname: string): string {
  const exact = NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact.label;

  const nested = NAV_ITEMS.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href)
  );
  return nested?.label ?? "แดชบอร์ด";
}
