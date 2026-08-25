"use client";

import { MdLocalLaundryService } from "react-icons/md";

export type LoadingProps = {
  message?: string;
  variant?: "fullscreen" | "overlay" | "inline" | "page";
  className?: string;
};

function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClass =
    size === "sm"
      ? "h-10 w-10"
      : size === "lg"
        ? "h-20 w-20"
        : "h-14 w-14";
  const iconClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-5 w-5";

  return (
    <div className={`relative ${sizeClass}`}>
      <div className="absolute inset-0 rounded-full border-[3px] border-[#dbe4ff]" />
      <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#2553D8] border-r-[#4C7DFF]" />
      <div className="absolute inset-[18%] flex items-center justify-center rounded-full bg-[#eef3ff] shadow-inner">
        <MdLocalLaundryService
          className={`${iconClass} text-[#2553D8] animate-pulse`}
        />
      </div>
    </div>
  );
}

export default function Loading({
  message = "กำลังโหลด...",
  variant = "inline",
  className = "",
}: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center gap-3 text-center">
      <LoadingSpinner size={variant === "inline" ? "sm" : "md"} />
      {message ? (
        <p className="max-w-[240px] text-[14px] font-medium leading-snug text-[#5b657d]">
          {message}
        </p>
      ) : null}
    </div>
  );

  if (variant === "fullscreen") {
    return (
      <div
        className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#f4f6fb]/95 backdrop-blur-sm ${className}`}
      >
        <div className="rounded-[24px] border border-[#dbe4ff] bg-white px-10 py-8 shadow-[0_20px_50px_rgba(37,83,216,0.12)]">
          {content}
        </div>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <div
        className={`absolute inset-0 z-40 flex items-center justify-center bg-white/75 backdrop-blur-[2px] ${className}`}
      >
        <div className="rounded-[22px] border border-[#dbe4ff] bg-white px-8 py-7 shadow-[0_16px_40px_rgba(37,83,216,0.1)]">
          {content}
        </div>
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div
        className={`flex min-h-[280px] flex-1 items-center justify-center px-6 py-10 ${className}`}
      >
        {content}
      </div>
    );
  }

  return <div className={`flex items-center justify-center ${className}`}>{content}</div>;
}

export { LoadingSpinner };
