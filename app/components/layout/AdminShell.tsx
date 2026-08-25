"use client";

import SideBar from "@/app/components/layout/sideBar";
import Header from "@/app/components/layout/header";
import LoadingOverlayHost from "@/app/components/layout/LoadingOverlayHost";
import AuthGuard from "@/app/hooks/AuthGuard";
import { LoadingProvider } from "@/app/providers/LoadingProvider";
import { AdminSessionProvider } from "@/app/providers/AdminSessionProvider";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LoadingProvider>
      <AuthGuard requireAuth>
        <AdminSessionProvider>
          <div className="flex min-h-screen bg-[#f4f6fb]">
            <SideBar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <main className="relative flex-1 overflow-auto p-6">
                {children}
                <LoadingOverlayHost />
              </main>
            </div>
          </div>
        </AdminSessionProvider>
      </AuthGuard>
    </LoadingProvider>
  );
}
