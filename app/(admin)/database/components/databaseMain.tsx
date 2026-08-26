"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import databaseAPI, {
  type DatabaseItem,
} from "@/app/services/database/databaseAPI";
import allDatabaseAPI, {
  type AllDatabaseItem,
} from "@/app/services/allDatabase/allDatabaseAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import DatabaseFilter from "./databaseFilter";
import DatabaseTable from "./databaseTable";
import DatabaseFormModal from "./databaseAction/databaseFormModal";

type DatabaseListApiResult =
  | {
      success?: boolean;
      data?: DatabaseItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

type AllDatabaseListApiResult =
  | {
      success?: boolean;
      data?: AllDatabaseItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function DatabaseMain() {
  const { withLoading } = useLoading();
  const [databases, setDatabases] = useState<DatabaseItem[]>([]);
  const [allDatabases, setAllDatabases] = useState<AllDatabaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [allDatabaseId, setAllDatabaseId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingDatabase, setEditingDatabase] = useState<DatabaseItem | null>(
    null
  );
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchDatabases = useCallback(async () => {
    setLoading(true);
    try {
      const result =
        (await databaseAPI.getDatabaseAll()) as DatabaseListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "Unable to fetch Databases";
        await popup.error("Error", message);
        setDatabases([]);
        return;
      }

      setDatabases(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("Error", "Unable to fetch Databases");
      setDatabases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllDatabases = useCallback(async () => {
    try {
      const result =
        (await allDatabaseAPI.getAllDatabaseAll()) as AllDatabaseListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        setAllDatabases([]);
        return;
      }

      setAllDatabases(Array.isArray(result.data) ? result.data : []);
    } catch {
      setAllDatabases([]);
    }
  }, []);

  useEffect(() => {
    void fetchDatabases();
    void fetchAllDatabases();
  }, [fetchAllDatabases, fetchDatabases]);

  const filteredDatabases = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const statusFilter = status.trim().toLowerCase();
    const typeFilter = allDatabaseId.trim();

    return databases.filter((database) => {
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && database.is_active) ||
        (statusFilter === "inactive" && !database.is_active);

      const matchesType =
        !typeFilter || String(database.all_database_id) === typeFilter;

      if (!keyword) return matchesStatus && matchesType;

      const name = String(database.name || "").toLowerCase();
      const description = String(database.description || "").toLowerCase();
      const typeName = String(database.all_database_name || "").toLowerCase();
      const typeCode = String(database.all_database_code || "").toLowerCase();
      const matchesSearch =
        name.includes(keyword) ||
        description.includes(keyword) ||
        typeName.includes(keyword) ||
        typeCode.includes(keyword);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [allDatabaseId, databases, search, status]);

  const handleClearFilter = () => {
    setSearch("");
    setStatus("");
    setAllDatabaseId("");
  };

  const handleToggleActive = async (database: DatabaseItem) => {
    const nextActive = !database.is_active;
    setTogglingId(database.id);

    try {
      const result = (await databaseAPI.patchDatabaseIsActive(
        database.id,
        nextActive
      )) as {
        success?: boolean;
        status?: string;
        data?: DatabaseItem;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "Status update failed",
          result?.errMessage ||
            result?.message ||
            "Unable to update Database status"
        );
        return;
      }

      const updated = result.data;
      setDatabases((prev) =>
        prev.map((item) =>
          item.id === database.id
            ? updated
              ? updated
              : { ...item, is_active: nextActive }
            : item
        )
      );
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteDatabase = async (database: DatabaseItem) => {
    const confirmed = await popup.confirmDelete({
      title: "Delete this Database?",
      text: `Delete ${database.name}?`,
    });
    if (!confirmed) return;

    let deleted = false;

    await withLoading(async () => {
      const result = (await databaseAPI.softDeleteDatabase(database.id)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "Delete failed",
          result?.errMessage || result?.message || "Unable to delete Database"
        );
        return;
      }

      deleted = true;
    }, "Deleting Database...");

    if (!deleted) return;

    void fetchDatabases();
    await popup.success(
      "Deleted successfully",
      "Database deleted successfully"
    );
  };

  return (
    <div className="space-y-5">
      <DatabaseFilter
        search={search}
        status={status}
        allDatabaseId={allDatabaseId}
        allDatabases={allDatabases}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onAllDatabaseChange={setAllDatabaseId}
        onClear={handleClearFilter}
        onAdd={() => setCreateOpen(true)}
      />

      <DatabaseTable
        databases={filteredDatabases}
        loading={loading}
        togglingId={togglingId}
        onEdit={setEditingDatabase}
        onDelete={(database) => void handleDeleteDatabase(database)}
        onToggleActive={(database) => void handleToggleActive(database)}
      />

      <DatabaseFormModal
        open={createOpen}
        allDatabases={allDatabases}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          void fetchDatabases();
        }}
      />

      <DatabaseFormModal
        open={editingDatabase != null}
        database={editingDatabase}
        allDatabases={allDatabases}
        onClose={() => setEditingDatabase(null)}
        onSaved={() => {
          void fetchDatabases();
        }}
      />
    </div>
  );
}
