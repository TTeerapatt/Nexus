"use client";

import type { ReactNode } from "react";

type FilterPanelProps = {
  children: ReactNode;
};

export default function FilterPanel({ children }: FilterPanelProps) {
  return (
    <section className="rounded-[20px] border border-[#dbe4ff] bg-white p-5 shadow-[0_10px_30px_rgba(37,83,216,0.08)]">
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
        className="mb-2 block text-[13px] font-semibold text-[#163a7f]"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export const filterInputClass =
  "h-11 w-full rounded-xl border border-[#d7dce7] bg-[#fbfcff] px-4 text-[14px] text-[#1f2640] placeholder-[#adb2ba] outline-none transition focus:border-[#2553d8] focus:bg-white focus:ring-2 focus:ring-[#2553d8]/15";

export const filterSelectClass = `${filterInputClass} appearance-none pr-11`;
