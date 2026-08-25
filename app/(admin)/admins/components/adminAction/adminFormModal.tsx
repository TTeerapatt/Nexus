"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiCheck, FiX } from "react-icons/fi";
import adminAPI, {
  type AdminPermissionMenu,
  type CreateAdminPayload,
  type UpdateAdminPayload,
} from "@/app/services/admin/adminAPI";
import menuAPI, {
  type MenuAllResponse,
  type MenuLabel,
  type MenuTab,
} from "@/app/services/menu/menuAPI";
import { evaluatePasswordPolicy } from "@/app/lib/passwordPolicy";
import { popup } from "@/app/ui/popUp";
import { useLoading } from "@/app/providers/LoadingProvider";
import {
  ACTION_ORDER,
  ROLE_OPTIONS,
  buildDefaultPermissions,
  emptyForm,
  permissionsFromAdminMenu,
  permissionsToPayload,
  type AdminFormModalProps,
  type AdminRole,
  type FormField,
  type PermissionMap,
} from "./adminFormShared";
import {
  AdminConfirmStep,
  AdminFormStepper,
  AdminPermissionStep,
  AdminProfileStep,
  AdminRoleStep,
} from "./AdminFormSteps";

export type { AdminFormModalProps };

export default function AdminCreateModal({
  open,
  adminId = null,
  onClose,
  onCreated,
  onUpdated,
}: AdminFormModalProps) {
  const { withLoading } = useLoading();
  const isEdit = adminId != null;
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<AdminRole | "">("");
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [labels, setLabels] = useState<MenuLabel[]>([]);
  const [tabs, setTabs] = useState<MenuTab[]>([]);
  const [permissions, setPermissions] = useState<PermissionMap>({});
  const [menuLoading, setMenuLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<FormField, boolean>>
  >({});

  const resetState = useCallback(() => {
    setStep(1);
    setRole("");
    setForm(emptyForm());
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPermissions({});
    setFieldErrors({});
    setDetailLoading(false);
  }, []);

  const clearFieldError = (field: FormField) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const markFieldError = (field: FormField) => {
    setFieldErrors({ [field]: true });
  };

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

  useEffect(() => {
    if (!open) return;
    resetState();

    let cancelled = false;
    const loadData = async () => {
      setMenuLoading(true);
      if (adminId != null) setDetailLoading(true);

      try {
        const menuPromise = menuAPI.getMenuAll() as Promise<{
          success?: boolean;
          status?: string;
          data?: MenuAllResponse;
          errMessage?: string;
          message?: string;
        }>;

        const detailPromise =
          adminId != null
            ? (adminAPI.getAdminByIdPermission(adminId) as Promise<{
                success?: boolean;
                status?: string;
                data?: {
                  admin?: {
                    id: number;
                    email: string;
                    display_name: string;
                    role: string;
                  };
                  menu?: AdminPermissionMenu[];
                };
                errMessage?: string;
                message?: string;
              }>)
            : Promise.resolve(null);

        const [menuResult, detailResult] = await Promise.all([
          menuPromise,
          detailPromise,
        ]);

        if (cancelled) return;

        if (
          !menuResult ||
          menuResult.status === "failed" ||
          menuResult.success === false
        ) {
          await popup.error(
            "เกิดข้อผิดพลาด",
            menuResult?.errMessage ||
              menuResult?.message ||
              "ไม่สามารถดึงข้อมูลเมนูสิทธิ์ได้"
          );
          setLabels([]);
          setTabs([]);
          return;
        }

        const nextLabels = Array.isArray(menuResult.data?.labels)
          ? menuResult.data.labels.filter((item) => item.is_active)
          : [];
        const nextTabs = Array.isArray(menuResult.data?.tabs)
          ? menuResult.data.tabs.filter((item) => item.is_active)
          : [];
        setLabels(nextLabels);
        setTabs(nextTabs);

        if (adminId == null) return;

        if (
          !detailResult ||
          detailResult.status === "failed" ||
          detailResult.success === false ||
          !detailResult.data?.admin
        ) {
          await popup.error(
            "เกิดข้อผิดพลาด",
            detailResult?.errMessage ||
              detailResult?.message ||
              "ไม่สามารถดึงข้อมูลผู้ดูแลระบบได้"
          );
          onClose();
          return;
        }

        const admin = detailResult.data.admin;
        const nextRole = String(admin.role || "")
          .trim()
          .toLowerCase() as AdminRole;
        const validRole = ROLE_OPTIONS.some((item) => item.value === nextRole)
          ? nextRole
          : "";

        setRole(validRole);
        setForm({
          display_name: String(admin.display_name || ""),
          email: String(admin.email || ""),
          password: "",
          confirmPassword: "",
        });

        if (validRole) {
          setPermissions(
            permissionsFromAdminMenu(
              nextTabs,
              Array.isArray(detailResult.data.menu)
                ? detailResult.data.menu
                : [],
              validRole
            )
          );
        }
      } catch {
        if (!cancelled) {
          await popup.error(
            "เกิดข้อผิดพลาด",
            adminId != null
              ? "ไม่สามารถดึงข้อมูลผู้ดูแลระบบได้"
              : "ไม่สามารถดึงข้อมูลเมนูสิทธิ์ได้"
          );
          setLabels([]);
          setTabs([]);
          if (adminId != null) onClose();
        }
      } finally {
        if (!cancelled) {
          setMenuLoading(false);
          setDetailLoading(false);
        }
      }
    };

    void loadData();
    return () => {
      cancelled = true;
    };
    // onClose omitted — parent often passes an inline callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, adminId, resetState]);

  const groupedTabs = useMemo(() => {
    const sortedLabels = [...labels].sort(
      (a, b) => a.sort_order - b.sort_order || a.id - b.id
    );
    return sortedLabels
      .map((label) => ({
        label,
        tabs: tabs
          .filter((tab) => tab.menu_label_id === label.id)
          .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
      }))
      .filter((group) => group.tabs.length > 0);
  }, [labels, tabs]);

  const selectedRole = ROLE_OPTIONS.find((item) => item.value === role);

  const allActionColumns = useMemo(() => {
    const found = new Set<string>();
    for (const tab of tabs) {
      for (const action of tab.actions ?? []) {
        found.add(action.code);
      }
    }
    return ACTION_ORDER.filter((code) => found.has(code));
  }, [tabs]);

  const handleSelectRole = (nextRole: AdminRole) => {
    setRole((prev) => {
      if (prev !== nextRole) {
        setPermissions(buildDefaultPermissions(tabs, nextRole));
      }
      return nextRole;
    });
  };

  useEffect(() => {
    if (!role || tabs.length === 0) return;
    setPermissions((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return buildDefaultPermissions(tabs, role);
    });
  }, [role, tabs]);

  const togglePermission = (tabCode: string, actionCode: string) => {
    setPermissions((prev) => ({
      ...prev,
      [tabCode]: {
        ...(prev[tabCode] || {}),
        [actionCode]: !prev[tabCode]?.[actionCode],
      },
    }));
  };

  const validateStep2 = async () => {
    const displayName = form.display_name.trim();
    const email = form.email.trim();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!displayName) {
      markFieldError("display_name");
      await popup.warning("ข้อมูลไม่ครบถ้วน", "กรุณากรอกชื่อที่แสดง");
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      markFieldError("email");
      await popup.warning("ข้อมูลไม่ถูกต้อง", "กรุณากรอกอีเมลให้ถูกต้อง");
      return false;
    }

    const changingPassword = Boolean(password || confirmPassword);
    if (!isEdit || changingPassword) {
      if (!evaluatePasswordPolicy(password).requiredPassed) {
        markFieldError("password");
        await popup.warning(
          "รหัสผ่านไม่ผ่านเงื่อนไข",
          isEdit
            ? "ถ้าต้องการเปลี่ยนรหัสผ่าน กรุณาตั้งตามเงื่อนไขที่กำหนด"
            : "กรุณาตั้งรหัสผ่านตามเงื่อนไขที่กำหนด"
        );
        return false;
      }
      if (password !== confirmPassword) {
        setFieldErrors({ confirmPassword: true, password: true });
        await popup.warning("ข้อมูลไม่ถูกต้อง", "รหัสผ่านยืนยันไม่ตรงกัน");
        return false;
      }
    }

    setFieldErrors({});
    return true;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!role) {
        await popup.warning("ข้อมูลไม่ครบถ้วน", "กรุณาเลือกบทบาทผู้ใช้งาน");
        return;
      }
      setFieldErrors({});
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!(await validateStep2())) return;
      setStep(3);
      return;
    }
    if (step === 3) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleConfirmSave = async () => {
    if (!role) return;

    const confirmed = await popup.confirm({
      title: isEdit
        ? "ยืนยันการแก้ไขผู้ดูแลระบบ?"
        : "ยืนยันการสร้างผู้ดูแลระบบ?",
      text: isEdit
        ? `ต้องการบันทึกการแก้ไขบัญชี ${form.display_name.trim()} (${form.email.trim()}) ใช่หรือไม่`
        : `ต้องการสร้างบัญชี ${form.display_name.trim()} (${form.email.trim()}) ในบทบาท ${role} ใช่หรือไม่`,
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    const password = form.password.trim();
    let saved = false;

    await withLoading(async () => {
      if (isEdit && adminId != null) {
        const payload: UpdateAdminPayload = {
          email: form.email.trim(),
          display_name: form.display_name.trim(),
          role,
          permissions:
            role === "owner" ? undefined : permissionsToPayload(permissions),
        };
        if (password) {
          payload.password = password;
        }

        const result = (await adminAPI.updateAdmin(adminId, payload)) as {
          success?: boolean;
          status?: string;
          errMessage?: string;
          message?: string;
        };

        if (!result || result.status === "failed" || result.success === false) {
          await popup.error(
            "แก้ไขไม่สำเร็จ",
            result?.errMessage ||
              result?.message ||
              "ไม่สามารถแก้ไขผู้ดูแลระบบได้"
          );
          return;
        }
        saved = true;
        return;
      }

      const payload: CreateAdminPayload = {
        email: form.email.trim(),
        password,
        display_name: form.display_name.trim(),
        role,
        permissions:
          role === "owner" ? undefined : permissionsToPayload(permissions),
      };

      const result = (await adminAPI.createAdmin(payload)) as {
        success?: boolean;
        status?: string;
        errMessage?: string;
        message?: string;
      };

      if (!result || result.status === "failed" || result.success === false) {
        await popup.error(
          "สร้างไม่สำเร็จ",
          result?.errMessage ||
            result?.message ||
            "ไม่สามารถสร้างผู้ดูแลระบบได้"
        );
        return;
      }

      saved = true;
    }, isEdit ? "กำลังบันทึกการแก้ไข..." : "กำลังสร้างผู้ดูแลระบบ...");

    if (!saved) return;

    handleClose();
    if (isEdit) {
      onUpdated?.();
      await popup.success(
        "แก้ไขผู้ใช้งานสำเร็จแล้ว",
        "บันทึกข้อมูลผู้ดูแลระบบเรียบร้อยแล้ว"
      );
      return;
    }

    onCreated();
    await popup.success(
      "เพิ่มผู้ใช้งานสำเร็จแล้ว",
      "สร้างบัญชีผู้ดูแลระบบเรียบร้อยแล้ว"
    );
  };

  const handleRequestClose = async () => {
    const confirmed = await popup.confirm({
      title: "ต้องการออกจากหน้านี้หรือไม่?",
      text: "ข้อมูลที่กรอกไว้จะไม่ถูกบันทึก",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    });
    if (!confirmed) return;

    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden overscroll-none p-4">
      <button
        type="button"
        aria-label="ปิดหน้าต่าง"
        className="absolute inset-0 bg-[#0f172a]/45"
        onClick={() => void handleRequestClose()}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[980px] flex-col overflow-hidden rounded-[24px] border border-[#e8ecf4] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex items-center justify-between border-b border-[#eef2ff] px-6 py-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1f2640]">
              {isEdit ? "แก้ไขผู้ดูแลระบบ" : "เพิ่มผู้ดูแลระบบ"}
            </h2>
            {/* <p className="text-[13px] text-[#7a849c]">
              สร้างบัญชีผู้ใช้งานทีละขั้นตอน
            </p> */}
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

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <AdminFormStepper currentStep={step} isEdit={isEdit} />

          {detailLoading ? (
            <p className="py-16 text-center text-[14px] text-[#7a849c]">
              กำลังโหลดข้อมูลผู้ดูแลระบบ...
            </p>
          ) : null}

          {!detailLoading && step === 1 ? (
            <AdminRoleStep role={role} onSelectRole={handleSelectRole} />
          ) : null}

          {!detailLoading && step === 2 ? (
            <AdminProfileStep
              isEdit={isEdit}
              form={form}
              fieldErrors={fieldErrors}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              onClearFieldError={clearFieldError}
              onFormChange={(patch) =>
                setForm((prev) => ({ ...prev, ...patch }))
              }
              onToggleShowPassword={() => setShowPassword((prev) => !prev)}
              onToggleShowConfirmPassword={() =>
                setShowConfirmPassword((prev) => !prev)
              }
            />
          ) : null}

          {!detailLoading && step === 3 ? (
            <AdminPermissionStep
              roleTitle={selectedRole?.title || "-"}
              menuLoading={menuLoading}
              groupedTabs={groupedTabs}
              actionColumns={allActionColumns}
              permissions={permissions}
              role={role}
              onToggle={togglePermission}
            />
          ) : null}

          {!detailLoading && step === 4 ? (
            <AdminConfirmStep
              isEdit={isEdit}
              selectedRoleTitle={selectedRole?.title}
              selectedRoleSubtitle={selectedRole?.subtitle}
              form={form}
              groupedTabs={groupedTabs}
              actionColumns={allActionColumns}
              permissions={permissions}
            />
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-[#eef2ff] px-6 py-4">
          <button
            type="button"
            onClick={
              step === 1 ? () => void handleRequestClose() : handleBack
            }
            disabled={detailLoading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-[#5b657d] transition hover:bg-[#f3f5f9] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiArrowLeft className="h-4 w-4" />
            {step === 1 ? "ยกเลิก" : "ย้อนกลับ"}
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => void handleNext()}
              disabled={detailLoading}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#2553D8] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1d44b5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ถัดไป
              <FiArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void handleConfirmSave()}
              disabled={detailLoading}
              className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#16a34a] px-5 text-[14px] font-semibold text-white transition hover:bg-[#15803d] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiCheck className="h-4 w-4" />
              {isEdit ? "ยืนยันการแก้ไข" : "ยืนยันการสร้าง"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
