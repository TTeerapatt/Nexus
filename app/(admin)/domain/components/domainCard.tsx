"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FiChevronDown, FiGlobe, FiLock, FiShield } from "react-icons/fi";
import domainAPI, {
  type DnsRecordItem,
  type DomainDetail,
  type DomainListItem,
} from "@/app/services/domain/domainAPI";

type DomainCardProps = {
  item: DomainListItem;
};

function formatDate(value: string | null): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("th-TH", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function getStatusBadgeClass(status: string): string {
  const key = status.trim().toLowerCase();
  if (key === "active" || key === "ok") {
    return "bg-[#dcfce7] text-[#15803d] ring-1 ring-[#86efac]/70";
  }
  if (key === "expired" || key === "fail" || key === "failed") {
    return "bg-[#fee2e2] text-[#b91c1c] ring-1 ring-[#fecaca]/70";
  }
  if (key === "pending" || key === "processing") {
    return "bg-[#dbeafe] text-[#1d4ed8] ring-1 ring-[#93c5fd]/70";
  }
  return "bg-white text-[#4338ca] ring-1 ring-[#c7d2fe]/70";
}

function getDnsTypeBadgeClass(type: string): string {
  const key = type.trim().toUpperCase();
  if (key === "A") return "bg-[#2563eb] text-white";
  if (key === "AAAA") return "bg-[#7c3aed] text-white";
  if (key === "CNAME") return "bg-[#0d9488] text-white";
  if (key === "MX") return "bg-[#d97706] text-white";
  if (key === "TXT") return "bg-[#64748b] text-white";
  if (key === "NS") return "bg-[#e11d48] text-white";
  return "bg-[#475569] text-white";
}

export default function DomainCard({ item }: DomainCardProps) {
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState<DomainDetail | null>(null);
  const [dnsRecords, setDnsRecords] = useState<DnsRecordItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const hasCacheRef = useRef(false);
  const requestIdRef = useRef(0);

  const loadDetail = useCallback(async (soft = false) => {
    const requestId = ++requestIdRef.current;
    if (!soft) {
      setLoadingDetail(true);
    }
    setDetailError(null);

    try {
      const [detailResult, dnsResult] = (await Promise.all([
        domainAPI.getDomainByName(item.domain),
        domainAPI.getDomainDns(item.domain),
      ])) as [
        {
          success?: boolean;
          status?: string;
          data?: DomainDetail;
          errMessage?: string;
          message?: string;
        },
        {
          success?: boolean;
          status?: string;
          data?: DnsRecordItem[];
          errMessage?: string;
          message?: string;
        },
      ];

      if (requestId !== requestIdRef.current) return;

      let nextError: string | null = null;

      if (
        !detailResult ||
        detailResult.status === "failed" ||
        detailResult.success === false
      ) {
        if (!soft) setDetail(null);
        nextError =
          detailResult?.errMessage ||
          detailResult?.message ||
          "Unable to load domain detail";
      } else {
        setDetail(detailResult.data ?? null);
        hasCacheRef.current = true;
      }

      if (
        !dnsResult ||
        dnsResult.status === "failed" ||
        dnsResult.success === false
      ) {
        if (!soft) setDnsRecords([]);
        nextError =
          nextError ||
          dnsResult?.errMessage ||
          dnsResult?.message ||
          "Unable to load DNS records";
      } else {
        setDnsRecords(Array.isArray(dnsResult.data) ? dnsResult.data : []);
        hasCacheRef.current = true;
      }

      setDetailError(nextError);
    } catch {
      if (requestId !== requestIdRef.current) return;
      if (!soft) {
        setDetail(null);
        setDnsRecords([]);
      }
      setDetailError("Unable to load domain detail");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoadingDetail(false);
      }
    }
  }, [item.domain]);

  useEffect(() => {
    if (!open) return;
    void loadDetail(hasCacheRef.current);
    return () => {
      requestIdRef.current += 1;
    };
  }, [loadDetail, open]);

  const handleToggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next && !hasCacheRef.current) {
        setLoadingDetail(true);
      }
      if (!next) {
        requestIdRef.current += 1;
        setLoadingDetail(false);
      }
      return next;
    });
  };

  const status = String(item.status || "unknown");
  const showInitialLoading = loadingDetail && !hasCacheRef.current;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4e9f4] bg-white shadow-md">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition hover:bg-white"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#242E42]">
          <FiGlobe className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[16px] font-bold text-[#242E42]">
              {item.domain}
            </h3>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getStatusBadgeClass(status)}`}
            >
              {status}
            </span>
            {item.type ? (
              <span className="inline-flex rounded-full bg-[#f3f4f6] px-2.5 py-0.5 text-[11px] font-semibold text-[#6b7280]">
                {item.type}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-[13px] text-[#7a849c]">
            Expires {formatDate(item.expires_at)}
          </p>
        </div>

        <FiChevronDown
          className={`h-5 w-5 shrink-0 text-[#5b657d] transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-[#edf8eb] px-5 py-5">
          {showInitialLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-[#e8ecf4] bg-white px-4 py-6 text-[13px] text-[#7a849c]">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#242E42]/20 border-t-[#242E42]" />
              Loading domain & DNS…
            </div>
          ) : (
            <>
              {loadingDetail ? (
                <div className="flex items-center gap-2 text-[12px] text-[#7a849c]">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#242E42]/20 border-t-[#242E42]" />
                  Refreshing…
                </div>
              ) : null}

              {detailError && !detail ? (
                <div className="rounded-xl border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] text-[#b91c1c]">
                  {detailError}
                </div>
              ) : null}

              {detail ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl border border-[#e8ecf4] bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                      Nameservers
                    </p>
                    <p className="mt-1 break-all text-[12px] font-semibold text-[#242E42]">
                      {detail.ns1 || "-"}
                      <br />
                      {detail.ns2 || "-"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e8ecf4] bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                      Lock
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#242E42]">
                      <FiLock className="h-3.5 w-3.5 text-[#242E42]" />
                      {detail.is_locked == null
                        ? "-"
                        : detail.is_locked
                          ? "Locked"
                          : "Unlocked"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e8ecf4] bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                      Privacy
                    </p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#242E42]">
                      <FiShield className="h-3.5 w-3.5 text-[#242E42]" />
                      {detail.is_privacy_protected == null
                        ? "-"
                        : detail.is_privacy_protected
                          ? "Protected"
                          : "Off"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#e8ecf4] bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b93a7]">
                      Registered
                    </p>
                    <p className="mt-1 text-[13px] font-semibold text-[#242E42]">
                      {formatDate(detail.registered_at || detail.created_at)}
                    </p>
                  </div>
                </div>
              ) : null}

              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h4 className="text-[14px] font-bold text-[#242E42]">
                    DNS records
                  </h4>
                  <span className="text-[12px] font-medium text-[#7a849c]">
                    {dnsRecords.length} records
                  </span>
                </div>

                {dnsRecords.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[#d8e0f0] bg-white px-4 py-8 text-center text-[13px] text-[#7a849c]">
                    No DNS records found (or zone not managed by Hostinger DNS)
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-xl border border-[#e8ecf4]">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-[13px]">
                        <thead className="bg-[#242E42] text-white">
                          <tr>
                            <th className="px-3 py-2.5 font-semibold">Type</th>
                            <th className="px-3 py-2.5 font-semibold">Name</th>
                            <th className="px-3 py-2.5 font-semibold">
                              Content
                            </th>
                            <th className="px-3 py-2.5 font-semibold">TTL</th>
                            <th className="px-3 py-2.5 font-semibold">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {dnsRecords.map((record, index) => (
                            <tr
                              key={`${record.type}-${record.name}-${record.content}-${index}`}
                              className="border-t border-[#edf8eb] bg-white"
                            >
                              <td className="px-3 py-2.5">
                                <span
                                  className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-bold ${getDnsTypeBadgeClass(record.type)}`}
                                >
                                  {record.type}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 font-semibold text-[#242E42]">
                                {record.name}
                              </td>
                              <td className="max-w-[320px] truncate px-3 py-2.5 font-mono text-[12px] text-[#5b657d]">
                                {record.content}
                              </td>
                              <td className="px-3 py-2.5 text-[#5b657d]">
                                {record.ttl ?? "-"}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                    record.is_disabled
                                      ? "bg-[#f3f4f6] text-[#6b7280]"
                                      : "bg-[#dcfce7] text-[#15803d]"
                                  }`}
                                >
                                  {record.is_disabled ? "Disabled" : "Active"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
