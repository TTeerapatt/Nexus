"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut } from "react-icons/fi";
import {
  clearAdminSession,
  getStoredAdmin,
  type StoredAdmin,
} from "@/app/lib/adminStorage";
import { getNavLabelByPath, getTabCodeByPath } from "@/app/lib/navItems";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import { useAdminSession } from "@/app/providers/AdminSessionProvider";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { withLoading } = useLoading();
  const { menuAll } = useAdminSession();
  const [admin, setAdmin] = useState<StoredAdmin | null>(null);

  useEffect(() => {
    setAdmin(getStoredAdmin());
  }, []);

  const tabCode = getTabCodeByPath(pathname);
  const title =
    (tabCode &&
      menuAll?.tabs.find((tab) => tab.code === tabCode)?.name?.trim()) ||
    getNavLabelByPath(pathname);
  const displayName = admin?.display_name?.trim() || "Admin";
  const email = admin?.email?.trim() || "";
  const initials = displayName
    .split(/[\s_]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "A";

  const handleLogout = async () => {
    const confirmed = await popup.logout();
    if (!confirmed) return;

    await withLoading(async () => {
      clearAdminSession();
    }, "กำลังออกจากระบบ...");
    await popup.success("ออกจากระบบสำเร็จ", "คุณได้ออกจากระบบแล้ว");
    router.replace("/login");
  };

  return (
    <header
      className="flex h-[72px] w-full items-center justify-between px-6 text-white shadow-[0_6px_18px_rgba(31,41,87,0.18)]"
      style={{
        backgroundImage: "linear-gradient(180deg, #4C7DFF 0%, #2553D8 100%)",
      }}
    >
      <h1 className="text-[22px] font-bold tracking-wide">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dbe4ff] text-[13px] font-bold text-[#2553D8]">
            {initials}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="max-w-[160px] truncate text-[15px] font-semibold">
              {displayName}
            </p>
            {email ? (
              <p className="max-w-[180px] truncate text-[12px] text-white/80">
                {email}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/35 bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white transition hover:border-red-400/60 hover:bg-red-500 hover:text-white"
          aria-label="ออกจากระบบ"
        >
          <FiLogOut className="h-4 w-4" />
          {/* Logout */}
        </button>
      </div>
    </header>
  );
}
