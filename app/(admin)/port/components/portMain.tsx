"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import portAPI, { type PortItem } from "@/app/services/port/portAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import PortFilter from "./portFilter";
import PortTable from "./portTable";
import PortFormModal from "./portAction/portFormModal";

type PortListApiResult =
  | {
      success?: boolean;
      data?: PortItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function PortMain() {
  const { withLoading } = useLoading();
  const [ports, setPorts] = useState<PortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<PortItem | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchPorts = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await portAPI.getPortAll()) as PortListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "ไม่สามารถดึงข้อมูล Port ได้";
        await popup.error("เกิดข้อผิดพลาด", message);
        setPorts([]);
        return;
      }

      setPorts(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูล Port ได้");
      setPorts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPorts();
  }, [fetchPorts]);

  const filteredPorts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const statusFilter = status.trim().toLowerCase();

    return ports.filter((port) => {
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && port.is_active) ||
        (statusFilter === "inactive" && !port.is_active);

      if (!keyword) return matchesStatus;

      const projectName = String(port.project_name || "").toLowerCase();
      const description = String(port.description || "").toLowerCase();
      const portNumber = String(port.port_number);
      const matchesSearch =
        projectName.includes(keyword) ||
        description.includes(keyword) ||
        portNumber.includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [ports, search, status]);

  const handleClearFilter = () => {
    setSearch("");
    setStatus("");
  };

  const handleToggleActive = async (port: PortItem) => {
    const nextActive = !port.is_active;
    setTogglingId(port.id);

    try {
      const result = (await portAPI.patchPortIsActive(port.id, nextActive)) as {
        success?: boolean;
        status?: string;
        data?: PortItem;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "เปลี่ยนสถานะไม่สำเร็จ",
          result?.errMessage ||
            result?.message ||
            "ไม่สามารถเปลี่ยนสถานะ Port ได้"
        );
        return;
      }

      const updated = result.data;
      setPorts((prev) =>
        prev.map((item) =>
          item.id === port.id
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

  const handleDeletePort = async (port: PortItem) => {
    const confirmed = await popup.confirmDelete({
      title: "ยืนยันการลบ Port?",
      text: `ต้องการลบ port ${port.port_number} (${port.project_name}) ใช่หรือไม่`,
    });
    if (!confirmed) return;

    let deleted = false;

    await withLoading(async () => {
      const result = (await portAPI.softDeletePort(port.id)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "ลบไม่สำเร็จ",
          result?.errMessage || result?.message || "ไม่สามารถลบ Port ได้"
        );
        return;
      }

      deleted = true;
    }, "กำลังลบ Port...");

    if (!deleted) return;

    void fetchPorts();
    await popup.success("ลบสำเร็จ", "ลบ Port เรียบร้อยแล้ว");
  };

  return (
    <div className="space-y-5">
      <PortFilter
        search={search}
        status={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onClear={handleClearFilter}
        onAdd={() => setCreateOpen(true)}
      />

      <PortTable
        ports={filteredPorts}
        loading={loading}
        togglingId={togglingId}
        onEdit={setEditingPort}
        onDelete={(port) => void handleDeletePort(port)}
        onToggleActive={(port) => void handleToggleActive(port)}
      />

      <PortFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          void fetchPorts();
        }}
      />

      <PortFormModal
        open={editingPort != null}
        port={editingPort}
        onClose={() => setEditingPort(null)}
        onSaved={() => {
          void fetchPorts();
        }}
      />
    </div>
  );
}
