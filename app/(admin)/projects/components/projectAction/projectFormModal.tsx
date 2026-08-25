"use client";

import { useCallback, useEffect, useState } from "react";
import { FiChevronDown, FiX } from "react-icons/fi";
import projectAPI, { type ProjectItem } from "@/app/services/project/projectAPI";
import type { ResourceTypeItem } from "@/app/services/resourceType/resourceTypeAPI";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import {
  FilterField,
  filterInputClass,
  filterSelectClass,
} from "@/app/ui/filterPanel";

type ProjectFormModalProps = {
  open: boolean;
  project?: ProjectItem | null;
  resourceTypes: ResourceTypeItem[];
  onClose: () => void;
  onSaved: () => void;
};

type FormState = {
  name: string;
  description: string;
  resource_type_id: string;
  is_active: boolean;
};

type FormField = keyof FormState;

function emptyForm(resourceTypes: ResourceTypeItem[]): FormState {
  return {
    name: "",
    description: "",
    resource_type_id:
      resourceTypes.length > 0 ? String(resourceTypes[0].id) : "",
    is_active: true,
  };
}

function formFromProject(project: ProjectItem): FormState {
  return {
    name: project.name || "",
    description: project.description || "",
    resource_type_id: String(project.resource_type_id || ""),
    is_active: Boolean(project.is_active),
  };
}

export default function ProjectFormModal({
  open,
  project = null,
  resourceTypes,
  onClose,
  onSaved,
}: ProjectFormModalProps) {
  const { withLoading } = useLoading();
  const isEdit = project != null;
  const [form, setForm] = useState<FormState>(() => emptyForm(resourceTypes));
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormField, boolean>>
  >({});

  const resetState = useCallback(() => {
    setForm(project ? formFromProject(project) : emptyForm(resourceTypes));
    setFieldErrors({});
  }, [project, resourceTypes]);

  useEffect(() => {
    if (!open) return;
    resetState();
  }, [open, resetState]);

  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const html = document.documentElement;
    const main = document.querySelector("main");

    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevMainOverflow =
      main instanceof HTMLElement ? main.style.overflow : "";

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (main instanceof HTMLElement) {
      main.style.overflow = "hidden";
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      if (main instanceof HTMLElement) {
        main.style.overflow = prevMainOverflow;
      }
    };
  }, [open]);

  const clearFieldError = (field: FormField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleRequestClose = async () => {
    const confirmed = await popup.confirm({
      title: "ต้องการออกจากหน้านี้หรือไม่?",
      text: "ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;
    onClose();
  };

  const handleSave = async () => {
    const name = form.name.trim();
    const description = form.description.trim();
    const resourceTypeId = Number(form.resource_type_id);

    if (!name) {
      setFieldErrors({ name: true });
      await popup.warning("ข้อมูลไม่ครบ", "กรุณากรอกชื่อ Project");
      return;
    }

    if (!Number.isInteger(resourceTypeId) || resourceTypeId <= 0) {
      setFieldErrors({ resource_type_id: true });
      await popup.warning("ข้อมูลไม่ครบ", "กรุณาเลือก Resource Type");
      return;
    }

    let saved = false;

    await withLoading(async () => {
      const payload = {
        name,
        description: description || null,
        resource_type_id: resourceTypeId,
        is_active: form.is_active,
      };

      const result = (
        isEdit
          ? await projectAPI.updateProject(project.id, payload)
          : await projectAPI.createProject(payload)
      ) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          isEdit ? "แก้ไขไม่สำเร็จ" : "สร้างไม่สำเร็จ",
          result?.errMessage ||
            result?.message ||
            (isEdit
              ? "ไม่สามารถแก้ไข Project ได้"
              : "ไม่สามารถสร้าง Project ได้")
        );
        return;
      }

      saved = true;
    }, isEdit ? "กำลังบันทึกการแก้ไข..." : "กำลังสร้าง Project...");

    if (!saved) return;

    onClose();
    onSaved();
    await popup.success(
      isEdit ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ",
      isEdit
        ? "บันทึกข้อมูล Project เรียบร้อยแล้ว"
        : "สร้าง Project เรียบร้อยแล้ว"
    );
  };

  if (!open) return null;

  const inputErrorClass =
    "border-[#f87171] focus:border-[#ef4444] focus:ring-[#ef4444]/20";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden overscroll-none p-4">
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        className="absolute inset-0 bg-[#0f172a]/45"
        onClick={() => void handleRequestClose()}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[560px] flex-col overflow-hidden rounded-[24px] border border-[#e8ecf4] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[#eef2ff] px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1f2640]">
              {isEdit ? "แก้ไข Project" : "เพิ่ม Project"}
            </h2>
            <p className="text-[13px] text-[#7a849c]">
              ระบุชื่อ project และประเภท resource
            </p>
          </div>
          <button
            type="button"
            onClick={() => void handleRequestClose()}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[#e8ecf4] text-[#5b657d] transition hover:bg-[#f8faff]"
            aria-label="ปิด"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          <FilterField label="ชื่อ Project *" htmlFor="project-name">
            <input
              id="project-name"
              type="text"
              value={form.name}
              onChange={(e) => {
                clearFieldError("name");
                setForm((prev) => ({ ...prev, name: e.target.value }));
              }}
              placeholder=""
              className={`${filterInputClass} ${fieldErrors.name ? inputErrorClass : ""}`}
            />
          </FilterField>

          <FilterField label="Resource Type *" htmlFor="project-type">
            <div className="relative">
              <select
                id="project-type"
                value={form.resource_type_id}
                onChange={(e) => {
                  clearFieldError("resource_type_id");
                  setForm((prev) => ({
                    ...prev,
                    resource_type_id: e.target.value,
                  }));
                }}
                className={`${filterSelectClass} cursor-pointer ${fieldErrors.resource_type_id ? inputErrorClass : ""}`}
              >
                {resourceTypes.length === 0 ? (
                  <option value="">ไม่มี Resource Type</option>
                ) : (
                  resourceTypes.map((type) => (
                    <option key={type.id} value={String(type.id)}>
                      {type.name}
                    </option>
                  ))
                )}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5b657d]" />
            </div>
          </FilterField>

          <FilterField label="รายละเอียด" htmlFor="project-description">
            <textarea
              id="project-description"
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder=""
              className={`${filterInputClass} h-auto min-h-[96px] resize-y py-3`}
            />
          </FilterField>

          <div className="flex items-center justify-between rounded-xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
            <div>
              <p className="text-[14px] font-semibold text-[#1f2640]">สถานะ</p>
              <p className="text-[12px] text-[#7a849c]">
                {form.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน"}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() =>
                setForm((prev) => ({ ...prev, is_active: !prev.is_active }))
              }
              className={`relative h-7 w-12 cursor-pointer rounded-full transition ${
                form.is_active ? "bg-[#2553D8]" : "bg-[#cbd5e1]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
                  form.is_active ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-[#eef2ff] px-6 py-4">
          <button
            type="button"
            onClick={() => void handleRequestClose()}
            className="inline-flex h-11 cursor-pointer items-center rounded-xl px-4 text-[14px] font-semibold text-[#5b657d] transition hover:bg-[#f3f5f9]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            className="inline-flex h-11 cursor-pointer items-center rounded-xl bg-[#2553D8] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d44b5]"
          >
            {isEdit ? "บันทึกการแก้ไข" : "สร้าง Project"}
          </button>
        </div>
      </div>
    </div>
  );
}
