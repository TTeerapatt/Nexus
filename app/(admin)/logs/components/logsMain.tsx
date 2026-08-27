"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import adminLogAPI, {
  type AdminLogItem,
  type AdminLogListParams,
} from "@/app/services/adminLog/adminLogAPI";
import { popup } from "@/app/ui/popUp";
import LogsFilter from "./logsFilter";
import LogsTable from "./logsTable";

type AdminLogListApiResult =
  | {
      success?: boolean;
      data?: AdminLogItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

const KNOWN_ACTIONS = [
  "login",
  "create",
  "update",
  "soft_delete",
  "hard_delete",
  "start",
  "stop",
  "restart",
];

function toApiDateTime(value: string): string | undefined {
  const raw = value.trim();
  if (!raw) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export default function LogsMain() {
  const [logs, setLogs] = useState<AdminLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [datetime, setDatetime] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminLogListParams = {};
      if (action.trim()) params.action = action.trim();

      const dateFrom = toApiDateTime(datetime);
      if (dateFrom) params.date_from = dateFrom;

      const result = (await adminLogAPI.getAdminLogAll(
        params
      )) as AdminLogListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "Unable to fetch admin logs";
        await popup.error("Error", message);
        setLogs([]);
        return;
      }

      setLogs(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("Error", "Unable to fetch admin logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [action, datetime]);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const actionOptions = useMemo(() => {
    const values = new Set<string>(KNOWN_ACTIONS);
    for (const log of logs) {
      const value = String(log.action || "").trim();
      if (value) values.add(value);
    }
    if (action.trim()) values.add(action.trim());
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [action, logs]);

  const filteredLogs = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return logs;

    return logs.filter((log) => {
      const haystack = [
        log.message,
        log.action,
        log.entity_type,
        log.admin_display_name,
        log.admin_email,
        log.admin_id,
        log.entity_id,
      ]
        .map((value) => String(value ?? "").toLowerCase())
        .join(" ");

      return haystack.includes(keyword);
    });
  }, [logs, search]);

  const handleClearFilter = () => {
    setSearch("");
    setAction("");
    setDatetime("");
  };

  return (
    <div className="space-y-5">
      <LogsFilter
        search={search}
        action={action}
        datetime={datetime}
        actionOptions={actionOptions}
        onSearchChange={setSearch}
        onActionChange={setAction}
        onDatetimeChange={setDatetime}
        onClear={handleClearFilter}
      />

      <LogsTable logs={filteredLogs} loading={loading} />
    </div>
  );
}
