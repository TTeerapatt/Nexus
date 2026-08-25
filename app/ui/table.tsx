"use client";

import type { ReactNode } from "react";
import { FiInbox } from "react-icons/fi";
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
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef3ff] text-[#2553D8]">
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
  emptyText = "ไม่พบข้อมูล",
  loadingText = "กำลังโหลดข้อมูล...",
  getRowKey,
  title,
  subtitle,
  count,
  countLabel = "รายการ",
}: DataTableProps<T>) {
  const showHeader = Boolean(title || subtitle || typeof count === "number");

  return (
    <section className="overflow-hidden rounded-[20px] border border-[#dbe4ff] bg-white shadow-[0_10px_30px_rgba(37,83,216,0.08)]">
      {showHeader ? (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2ff] bg-gradient-to-r from-[#f8faff] to-[#eef3ff] px-5 py-4">
          <div>
            {title ? (
              <h3 className="text-[16px] font-bold text-[#163a7f]">{title}</h3>
            ) : null}
            {subtitle ? (
              <p className="mt-0.5 text-[13px] text-[#5b657d]">{subtitle}</p>
            ) : null}
          </div>
          {typeof count === "number" ? (
            <span className="inline-flex items-center rounded-full bg-[#2553D8]/10 px-3 py-1.5 text-[13px] font-semibold text-[#2553D8]">
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
              <tr className="bg-gradient-to-r from-[#4C7DFF] to-[#2553D8]">
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
              {data.map((row, index) => (
                <tr
                  key={getRowKey(row, index)}
                  className="border-b border-[#eef2ff] transition hover:bg-[#f8faff]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 text-[14px] text-[#2b3348] ${column.cellClassName ?? ""}`}
                    >
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
