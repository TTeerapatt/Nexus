"use client";

import { FiChevronDown, FiPlus, FiSearch, FiXCircle } from "react-icons/fi";
import type { ResourceTypeItem } from "@/app/services/resourceType/resourceTypeAPI";
import FilterPanel, {
  FilterField,
  filterInputClass,
  filterSelectClass,
} from "@/app/ui/filterPanel";

type ProjectFilterProps = {
  search: string;
  status: string;
  resourceTypeId: string;
  resourceTypes: ResourceTypeItem[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onResourceTypeChange: (value: string) => void;
  onClear: () => void;
  onAdd?: () => void;
};

const STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function ProjectFilter({
  search,
  status,
  resourceTypeId,
  resourceTypes,
  onSearchChange,
  onStatusChange,
  onResourceTypeChange,
  onClear,
  onAdd,
}: ProjectFilterProps) {
  return (
    <FilterPanel>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <FilterField
            label="ค้นหา"
            htmlFor="project-search"
            className="w-full sm:w-[260px]"
          >
            <div className="relative">
              <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a849c]" />
              <input
                id="project-search"
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ค้นหาจากชื่อหรือรายละเอียด"
                className={`${filterInputClass} pl-10`}
              />
            </div>
          </FilterField>

          <FilterField
            label="Resource Type"
            htmlFor="project-resource-type"
            className="w-full sm:w-[200px]"
          >
            <div className="relative">
              <select
                id="project-resource-type"
                value={resourceTypeId}
                onChange={(e) => onResourceTypeChange(e.target.value)}
                className={`${filterSelectClass} cursor-pointer hover:border-[#2553d8]/40`}
              >
                <option value="">ทั้งหมด</option>
                {resourceTypes.map((type) => (
                  <option key={type.id} value={String(type.id)}>
                    {type.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b657d]" />
            </div>
          </FilterField>

          <FilterField
            label="สถานะ"
            htmlFor="project-status"
            className="w-full sm:w-[180px]"
          >
            <div className="relative">
              <select
                id="project-status"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
                className={`${filterSelectClass} cursor-pointer hover:border-[#2553d8]/40`}
              >
                {STATUS_OPTIONS.map((option) => (
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
            className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#b8c9ff] bg-[#f8faff] px-4 text-[13px] font-semibold text-[#2553D8] shadow-sm transition hover:border-[#2553D8] hover:bg-[#eef3ff] hover:shadow-md active:scale-[0.98]"
          >
            <FiXCircle className="h-4 w-4" />
            ล้างตัวกรอง
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2553D8] px-5 text-[14px] font-semibold text-white shadow-[0_4px_14px_rgba(37,83,216,0.28)] transition hover:bg-[#1d44b5] hover:shadow-[0_6px_18px_rgba(37,83,216,0.36)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#2553d8]/40"
        >
          <FiPlus className="h-4 w-4" />
          เพิ่ม Project
        </button>
      </div>
    </FilterPanel>
  );
}
