"use client";

import { FiChevronDown, FiSearch, FiXCircle } from "react-icons/fi";
import FilterPanel, {
  FilterField,
  filterInputClass,
  filterSelectClass,
} from "@/app/ui/filterPanel";

type LogsFilterProps = {
  search: string;
  action: string;
  datetime: string;
  actionOptions: string[];
  onSearchChange: (value: string) => void;
  onActionChange: (value: string) => void;
  onDatetimeChange: (value: string) => void;
  onClear: () => void;
};

export default function LogsFilter({
  search,
  action,
  datetime,
  actionOptions,
  onSearchChange,
  onActionChange,
  onDatetimeChange,
  onClear,
}: LogsFilterProps) {
  return (
    <FilterPanel>
      <div className="flex flex-nowrap items-end gap-3 overflow-x-auto pb-0.5">
        <FilterField
          label="Search"
          htmlFor="logs-search"
          className="w-[180px] shrink-0"
        >
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              id="logs-search"
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className={`${filterInputClass} pl-9`}
            />
          </div>
        </FilterField>

        <FilterField
          label="Action"
          htmlFor="logs-action"
          className="w-[140px] shrink-0"
        >
          <div className="relative">
            <select
              id="logs-action"
              value={action}
              onChange={(e) => onActionChange(e.target.value)}
              className={`${filterSelectClass} cursor-pointer hover:border-[var(--brand-primary)]/40`}
            >
              <option value="">All</option>
              {actionOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-secondary)]" />
          </div>
        </FilterField>

        <FilterField
          label="Date time"
          htmlFor="logs-datetime"
          className="w-[220px] shrink-0"
        >
          <input
            id="logs-datetime"
            type="datetime-local"
            value={datetime}
            onChange={(e) => onDatetimeChange(e.target.value)}
            className={`${filterInputClass} cursor-pointer hover:border-[var(--brand-primary)]/40`}
          />
        </FilterField>

        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-[13px] font-semibold text-[var(--text-primary)] shadow-sm transition hover:border-[var(--brand-primary)] hover:bg-[var(--surface)] hover:shadow-md active:scale-[0.98]"
        >
          <FiXCircle className="h-4 w-4" />
          Clear
        </button>
      </div>
    </FilterPanel>
  );
}
