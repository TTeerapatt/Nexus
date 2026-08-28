"use client";

import type { ReactNode } from "react";

type FilterPanelProps = {
  children: ReactNode;
};

export default function FilterPanel({ children }: FilterPanelProps) {
  return (
    <section className="rounded-[20px] border border-[#e2e5eb] bg-white p-5 shadow-md">
      {children}
    </section>
  );
}

export function FilterField({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-[13px] font-semibold text-[#242E42]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const filterInputClass =
  "h-11 w-full rounded-xl border border-[#d7dce7] bg-[#fbfcff] px-4 text-[14px] text-[#242E42] placeholder-[#adb2ba] outline-none transition focus:border-[#242e42] focus:bg-white focus:ring-2 focus:ring-[#242e42]/15";

export const filterSelectClass = `${filterInputClass} appearance-none pr-11`;
