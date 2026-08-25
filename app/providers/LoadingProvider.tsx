"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type LoadingContextValue = {
  isLoading: boolean;
  message: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(task: () => Promise<T>, message?: string) => Promise<T>;
};

const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [manualCount, setManualCount] = useState(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [message, setMessage] = useState("กำลังโหลด...");
  const routeTimerRef = useRef<number | null>(null);

  const clearRouteTimer = useCallback(() => {
    if (routeTimerRef.current !== null) {
      window.clearTimeout(routeTimerRef.current);
      routeTimerRef.current = null;
    }
  }, []);

  const showLoading = useCallback((nextMessage?: string) => {
    if (nextMessage?.trim()) {
      setMessage(nextMessage.trim());
    } else {
      setMessage("กำลังโหลด...");
    }
    setManualCount((count) => count + 1);
  }, []);

  const hideLoading = useCallback(() => {
    setManualCount((count) => Math.max(0, count - 1));
  }, []);

  const withLoading = useCallback(
    async <T,>(task: () => Promise<T>, nextMessage?: string) => {
      showLoading(nextMessage);
      try {
        return await task();
      } finally {
        hideLoading();
      }
    },
    [hideLoading, showLoading]
  );

  useEffect(() => {
    setRouteLoading(false);
    clearRouteTimer();
  }, [pathname, clearRouteTimer]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]");
      if (!anchor || anchor.getAttribute("target") === "_blank") return;

      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      let nextPath = href;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        nextPath = url.pathname;
      } catch {
        return;
      }

      if (nextPath === pathname) return;

      setMessage("กำลังเปลี่ยนหน้า...");
      setRouteLoading(true);
      clearRouteTimer();
      routeTimerRef.current = window.setTimeout(() => {
        setRouteLoading(false);
        routeTimerRef.current = null;
      }, 10000);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
      clearRouteTimer();
    };
  }, [pathname, clearRouteTimer]);

  const value = useMemo<LoadingContextValue>(
    () => ({
      isLoading: manualCount > 0 || routeLoading,
      message,
      showLoading,
      hideLoading,
      withLoading,
    }),
    [hideLoading, manualCount, message, routeLoading, showLoading, withLoading]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider");
  }
  return context;
}
