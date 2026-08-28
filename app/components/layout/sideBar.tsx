"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MdAdminPanelSettings } from "react-icons/md";
import type {
  StoredMenuLabel,
  StoredMenuTab,
} from "@/app/lib/adminStorage";
import {
  getTabHrefByCode,
  getTabIconByCode,
  NAV_ITEMS,
} from "@/app/lib/navItems";
import { useAdminSession } from "@/app/providers/AdminSessionProvider";

type GroupedMenu = {
  label: StoredMenuLabel;
  tabs: StoredMenuTab[];
};

export default function SideBar() {
  const pathname = usePathname();
  const { permissionMenu, menuAll } = useAdminSession();

  const groups = useMemo(() => {
    if (!menuAll) return [] as GroupedMenu[];

    const canViewTab = new Set<string>();
    for (const menu of permissionMenu) {
      for (const tab of menu.tabs || []) {
        if (tab.actions?.view === true) {
          canViewTab.add(String(tab.code || "").trim().toLowerCase());
        }
      }
    }

    const labels = [...menuAll.labels]
      .filter((label) => label.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
    const tabs = [...menuAll.tabs]
      .filter((tab) => tab.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);

    return labels
      .map((label) => {
        const allowedTabs = tabs.filter((tab) => {
          const tabCode = String(tab.code || "").trim().toLowerCase();
          return (
            tab.menu_label_id === label.id &&
            canViewTab.has(tabCode) &&
            Boolean(getTabHrefByCode(tabCode))
          );
        });
        return { label, tabs: allowedTabs };
      })
      .filter((group) => group.tabs.length > 0);
  }, [permissionMenu, menuAll]);

  const fallbackItems = useMemo(() => NAV_ITEMS, []);
  const hasDynamicMenu = groups.length > 0;

  return (
    <aside className="flex h-screen w-[250px] shrink-0 flex-col border-r border-[#e8ecf4] bg-white">
      <div className="flex h-[88px] items-center justify-center border-b border-[#eef1f7] px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <MdAdminPanelSettings className="h-10 w-10 text-[#242E42]" />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-[#242E42]">Nexus Admin</p>
            <p className="text-[11px] font-medium text-[#7a849c]">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4">
        {hasDynamicMenu
          ? groups.map((group) => (
              <div key={group.label.code} className="space-y-2">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-[#8893ad]">
                  {group.label.name}
                </p>
                {group.tabs.map((tab) => {
                  const href = getTabHrefByCode(tab.code) as string;
                  const Icon = getTabIconByCode(tab.code);
                  const isActive =
                    href === "/"
                      ? pathname === "/"
                      : pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <Link
                      key={`${group.label.code}-${tab.code}`}
                      href={href}
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold transition ${
                        isActive
                          ? "bg-[#242E42] text-white shadow-md"
                          : "bg-[#f3f5f9] text-[#242E42] hover:bg-[#e9edf5]"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          isActive ? "text-white" : "text-[#5b657d]"
                        }`}
                      />
                      <span>{tab.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))
          : fallbackItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[14px] font-semibold transition ${
                    isActive
                      ? "bg-[#242E42] text-white shadow-md"
                      : "bg-[#f3f5f9] text-[#242E42] hover:bg-[#e9edf5]"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? "text-white" : "text-[#5b657d]"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
      </nav>
    </aside>
  );
}
