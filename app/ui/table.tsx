"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiInbox,
} from "react-icons/fi";
import Loading from "@/app/components/loading";

export type TableColumn<T> = {
  key: string;
  title: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  loadingText?: string;
  getRowKey: (row: T, index: number) => string | number;
  title?: string;
  subtitle?: string;
  count?: number;
  countLabel?: string;
};

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

function TableState({
  text,
  loading = false,
}: {
  text: string;
  loading?: boolean;
}) {
  if (loading) {
    return <Loading variant="page" message={text} />;
  }

  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#242E42]">
        <FiInbox className="h-6 w-6" />
      </span>
      <p className="text-[14px] font-medium text-[#5b657d]">{text}</p>
    </div>
  );
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyText = "No data found",
  loadingText = "Loading...",
  getRowKey,
  title,
  subtitle,
  count,
  countLabel = "items",
}: DataTableProps<T>) {
  const showHeader = Boolean(title || subtitle || typeof count === "number");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const pageStartIndex = (activePage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, data.length);
  const paginatedData = useMemo(
    () => data.slice(pageStartIndex, pageEndIndex),
    [data, pageEndIndex, pageStartIndex]
  );

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#e2e5eb] bg-white shadow-md">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf8eb] bg-white px-5 py-4">
          <div>
            {title ? (
              <h3 className="text-[16px] font-bold text-[#242E42]">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-[13px] text-[#5b657d]">{subtitle}</p>
            ) : null}
          </div>
          {typeof count === "number" ? (
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold text-[#242E42]">
              {count} {countLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {loading ? (
        <TableState text={loadingText} loading />
      ) : data.length === 0 ? (
        <TableState text={emptyText} />
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-[#242E42]">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`px-5 py-3.5 text-left text-[13px] font-semibold tracking-wide text-white first:rounded-tl-none last:rounded-tr-none ${column.headerClassName ?? ""}`}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={getRowKey(row, pageStartIndex + index)}
                  className="border-b border-[#edf8eb] transition hover:bg-white"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 text-[14px] text-[#242E42] ${column.cellClassName ?? ""}`}
                    >
                      {column.render(row, pageStartIndex + index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && data.length > 0 ? (
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#edf8eb] px-5 py-3.5 text-[13px] text-[#5b657d]">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setCurrentPage(1);
              }}
              aria-label="Rows per page"
              className="h-9 cursor-pointer appearance-none rounded-lg border border-[#d7dce7] bg-white py-1 pl-3 pr-9 font-semibold text-[#242E42] outline-none transition focus:border-[#2553d8] focus:ring-2 focus:ring-[#2553d8]/15"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#242E42]" />
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={activePage === 1}
            aria-label="Previous page"
            title="Previous page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7dce7] bg-white text-[#242E42] transition hover:border-[#2553d8] hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronLeft className="h-4 w-4" />
          </button>

          <span className="whitespace-nowrap font-semibold text-[#242E42]">
            Page {activePage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={activePage === totalPages}
            aria-label="Next page"
            title="Next page"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d7dce7] bg-white text-[#242E42] transition hover:border-[#2553d8] hover:bg-[#eef3ff] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FiChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
