"use client";

import { FiChevronDown, FiPlus, FiSearch, FiXCircle } from "react-icons/fi";
import FilterPanel, {
  FilterField,
  filterInputClass,
  filterSelectClass,
} from "@/app/ui/filterPanel";

type AdminFilterProps = {
  search: string;
  role: string;
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
  onClear: () => void;
  onAdd?: () => void;
};

const ROLE_OPTIONS = [
  { value: "", label: "All" },
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "staff", label: "Staff" },
];

export default function AdminFilter({
  search,
  role,
  onSearchChange,
  onRoleChange,
  onClear,
  onAdd,
}: AdminFilterProps) {
  return (
    <FilterPanel>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <FilterField label="Search" htmlFor="admin-search" className="w-full sm:w-[280px]">
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a849c]" />
              <input
                id="admin-search"
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name or email"
                className={`${filterInputClass} pl-10`}
              />
            </div>
          </FilterField>

          <FilterField label="Role" htmlFor="admin-role" className="w-full sm:w-[200px]">
            <div className="relative">
              <select
                id="admin-role"
                value={role}
                onChange={(e) => onRoleChange(e.target.value)}
                className={`${filterSelectClass} cursor-pointer hover:border-[#242e42]/40`}
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b657d]" />
            </div>
          </FilterField>

          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e2e5eb] bg-white px-4 text-[13px] font-semibold text-[#242E42] shadow-sm transition hover:border-[#242E42] hover:bg-white hover:shadow-md active:scale-[0.98]"
          >
            <FiXCircle className="h-4 w-4" />
            Clear filters
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#242E42] px-5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-[#1b2333] hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#242e42]/40"
        >
          <FiPlus className="h-4 w-4" />
          Add admin
        </button>
      </div>
    </FilterPanel>
  );
}
