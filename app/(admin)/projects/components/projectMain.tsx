"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import projectAPI, { type ProjectItem } from "@/app/services/project/projectAPI";
import resourceTypeAPI, {
  type ResourceTypeItem,
} from "@/app/services/resourceType/resourceTypeAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import ProjectFilter from "./projectFilter";
import ProjectTable from "./projectTable";
import ProjectFormModal from "./projectAction/projectFormModal";

type ProjectListApiResult =
  | {
      success?: boolean;
      data?: ProjectItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

type ResourceTypeListApiResult =
  | {
      success?: boolean;
      data?: ResourceTypeItem[];
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

export default function ProjectMain() {
  const { withLoading } = useLoading();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [resourceTypeId, setResourceTypeId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(
    null
  );
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const result = (await projectAPI.getProjectAll()) as ProjectListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        const message =
          result?.errMessage ||
          result?.message ||
          "ไม่สามารถดึงข้อมูล Project ได้";
        await popup.error("เกิดข้อผิดพลาด", message);
        setProjects([]);
        return;
      }

      setProjects(Array.isArray(result.data) ? result.data : []);
    } catch {
      await popup.error("เกิดข้อผิดพลาด", "ไม่สามารถดึงข้อมูล Project ได้");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchResourceTypes = useCallback(async () => {
    try {
      const result =
        (await resourceTypeAPI.getResourceTypeAll()) as ResourceTypeListApiResult;

      if (!result || result.status === "failed" || result.success === false) {
        setResourceTypes([]);
        return;
      }

      setResourceTypes(Array.isArray(result.data) ? result.data : []);
    } catch {
      setResourceTypes([]);
    }
  }, []);

  useEffect(() => {
    void fetchProjects();
    void fetchResourceTypes();
  }, [fetchProjects, fetchResourceTypes]);

  const filteredProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const statusFilter = status.trim().toLowerCase();
    const typeFilter = resourceTypeId.trim();

    return projects.filter((project) => {
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && project.is_active) ||
        (statusFilter === "inactive" && !project.is_active);

      const matchesType =
        !typeFilter || String(project.resource_type_id) === typeFilter;

      if (!keyword) return matchesStatus && matchesType;

      const name = String(project.name || "").toLowerCase();
      const description = String(project.description || "").toLowerCase();
      const typeName = String(project.resource_type_name || "").toLowerCase();
      const matchesSearch =
        name.includes(keyword) ||
        description.includes(keyword) ||
        typeName.includes(keyword);

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [projects, resourceTypeId, search, status]);

  const handleClearFilter = () => {
    setSearch("");
    setStatus("");
    setResourceTypeId("");
  };

  const handleToggleActive = async (project: ProjectItem) => {
    const nextActive = !project.is_active;
    setTogglingId(project.id);

    try {
      const result = (await projectAPI.patchProjectIsActive(
        project.id,
        nextActive
      )) as {
        success?: boolean;
        status?: string;
        data?: ProjectItem;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "เปลี่ยนสถานะไม่สำเร็จ",
          result?.errMessage ||
            result?.message ||
            "ไม่สามารถเปลี่ยนสถานะ Project ได้"
        );
        return;
      }

      const updated = result.data;
      setProjects((prev) =>
        prev.map((item) =>
          item.id === project.id
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

  const handleDeleteProject = async (project: ProjectItem) => {
    const confirmed = await popup.confirmDelete({
      title: "ยืนยันการลบ Project?",
      text: `ต้องการลบ ${project.name} ใช่หรือไม่`,
    });
    if (!confirmed) return;

    let deleted = false;

    await withLoading(async () => {
      const result = (await projectAPI.softDeleteProject(project.id)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "ลบไม่สำเร็จ",
          result?.errMessage || result?.message || "ไม่สามารถลบ Project ได้"
        );
        return;
      }

      deleted = true;
    }, "กำลังลบ Project...");

    if (!deleted) return;

    void fetchProjects();
    await popup.success("ลบสำเร็จ", "ลบ Project เรียบร้อยแล้ว");
  };

  return (
    <div className="space-y-5">
      <ProjectFilter
        search={search}
        status={status}
        resourceTypeId={resourceTypeId}
        resourceTypes={resourceTypes}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onResourceTypeChange={setResourceTypeId}
        onClear={handleClearFilter}
        onAdd={() => setCreateOpen(true)}
      />

      <ProjectTable
        projects={filteredProjects}
        loading={loading}
        togglingId={togglingId}
        onEdit={setEditingProject}
        onDelete={(project) => void handleDeleteProject(project)}
        onToggleActive={(project) => void handleToggleActive(project)}
      />

      <ProjectFormModal
        open={createOpen}
        resourceTypes={resourceTypes}
        onClose={() => setCreateOpen(false)}
        onSaved={() => {
          void fetchProjects();
        }}
      />

      <ProjectFormModal
        open={editingProject != null}
        project={editingProject}
        resourceTypes={resourceTypes}
        onClose={() => setEditingProject(null)}
        onSaved={() => {
          void fetchProjects();
        }}
      />
    </div>
  );
}
