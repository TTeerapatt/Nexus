"use client";

import { FiCheck, FiEye, FiEyeOff, FiShield, FiUser } from "react-icons/fi";
import PasswordPolicyChecklist from "@/app/components/PasswordPolicyChecklist";
import type { MenuLabel, MenuTab } from "@/app/services/menu/menuAPI";
import {
  ROLE_OPTIONS,
  getInputClass,
  getSteps,
  type AdminFormValues,
  type AdminRole,
  type FormField,
  type PermissionMap,
} from "./adminFormShared";

export function AdminFormStepper({
  currentStep,
  isEdit,
}: {
  currentStep: number;
  isEdit: boolean;
}) {
  const steps = getSteps(isEdit);
  return (
    <div className="mb-8 flex items-start justify-between gap-2 px-2">
      {steps.map((step, index) => {
        const isDone = currentStep > step.id;
        const isActive = currentStep === step.id;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="relative flex flex-1 flex-col items-center">
            {!isLast ? (
              <div
                className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-4 h-[2px] ${
                  isDone || currentStep > step.id
                    ? "bg-[#2553D8]"
                    : "bg-[#d7dce7]"
                }`}
              />
            ) : null}
            <div
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold ${
                isDone || isActive
                  ? "bg-[#2553D8] text-white"
                  : "bg-[#e8ecf4] text-[#8b93a7]"
              }`}
            >
              {isDone ? <FiCheck className="h-4 w-4" /> : step.id}
            </div>
            <p
              className={`mt-2 text-center text-[12px] font-semibold ${
                isActive || isDone ? "text-[#2553D8]" : "text-[#8b93a7]"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function PermissionFragmentGroup({
  labelName,
  tabs,
  actionColumns,
  permissions,
  disabled,
  readOnly = false,
  onToggle,
}: {
  labelName: string;
  tabs: MenuTab[];
  actionColumns: readonly string[];
  permissions: PermissionMap;
  disabled?: boolean;
  readOnly?: boolean;
  onToggle: (tabCode: string, actionCode: string) => void;
}) {
  return (
    <>
      <tr className="bg-[#f3f5f9]">
        <td
          colSpan={1 + actionColumns.length}
          className="px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[#5b657d]"
        >
          {labelName}
        </td>
      </tr>
      {tabs.map((tab) => {
        const available = new Set((tab.actions ?? []).map((item) => item.code));
        return (
          <tr key={tab.code} className="border-t border-[#eef2ff]">
            <td className="px-4 py-3 text-[14px] font-medium text-[#1f2640]">
              {tab.name}
            </td>
            {actionColumns.map((actionCode) => {
              const supported = available.has(actionCode);
              const checked = Boolean(permissions[tab.code]?.[actionCode]);
              return (
                <td key={actionCode} className="px-3 py-3 text-center">
                  {supported ? (
                    readOnly ? (
                      checked ? (
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#2553D8]/10 text-[#2553D8]">
                          <FiCheck className="h-3.5 w-3.5" />
                        </span>
                      ) : (
                        <span className="text-[#c5cad6]">—</span>
                      )
                    ) : (
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => onToggle(tab.code, actionCode)}
                        className="h-4 w-4 cursor-pointer accent-[#2553D8] disabled:cursor-not-allowed"
                      />
                    )
                  ) : (
                    <span className="text-[#c5cad6]">—</span>
                  )}
                </td>
              );
            })}
          </tr>
        );
      })}
    </>
  );
}

type GroupedTab = {
  label: MenuLabel;
  tabs: MenuTab[];
};

export function AdminPermissionTable({
  groupedTabs,
  actionColumns,
  permissions,
  disabled,
  readOnly = false,
  onToggle,
}: {
  groupedTabs: GroupedTab[];
  actionColumns: readonly string[];
  permissions: PermissionMap;
  disabled?: boolean;
  readOnly?: boolean;
  onToggle: (tabCode: string, actionCode: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#e8ecf4]">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-[#f8faff] text-left text-[12px] font-semibold text-[#5b657d]">
            <th className="px-4 py-3">หมวดหมู่ / เมนูระบบ</th>
            {actionColumns.map((code) => (
              <th key={code} className="px-3 py-3 text-center capitalize">
                {code}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groupedTabs.map((group) => (
            <PermissionFragmentGroup
              key={group.label.code}
              labelName={group.label.name}
              tabs={group.tabs}
              actionColumns={actionColumns}
              permissions={permissions}
              disabled={disabled}
              readOnly={readOnly}
              onToggle={onToggle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminRoleStep({
  role,
  onSelectRole,
}: {
  role: AdminRole | "";
  onSelectRole: (role: AdminRole) => void;
}) {
  return (
    <div>
      <h3 className="text-[22px] font-bold text-[#1f2640]">
        เลือกบทบาทผู้ใช้งาน
      </h3>
      {/* <p className="mt-1 text-[14px] text-[#7a849c]">
        เลือกบทบาทที่ตรงกับหน้าที่การทำงาน เพื่อกำหนดสิทธิ์การใช้งานที่เหมาะสม
      </p> */}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ROLE_OPTIONS.map((option) => {
          const selected = role === option.value;
          const Icon = option.Icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelectRole(option.value)}
              className={`relative cursor-pointer rounded-2xl border px-4 py-6 text-left transition ${
                selected
                  ? "border-[#2553D8] bg-[#eef3ff] shadow-[0_8px_20px_rgba(37,83,216,0.12)]"
                  : "border-[#e8ecf4] bg-white hover:border-[#c7d7ff]"
              }`}
            >
              {selected ? (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2553D8] text-white">
                  <FiCheck className="h-3.5 w-3.5" />
                </span>
              ) : null}
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2553D8]/10 text-[#2553D8]">
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-center text-[16px] font-bold text-[#1f2640]">
                {option.title}
              </p>
              <p className="mt-1 text-center text-[13px] font-medium text-[#2553D8]">
                ({option.subtitle})
              </p>
              {/* <p className="mt-3 text-center text-[12px] leading-relaxed text-[#7a849c]">
                {option.description}
              </p> */}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminProfileStep({
  isEdit,
  form,
  fieldErrors,
  showPassword,
  showConfirmPassword,
  onClearFieldError,
  onFormChange,
  onToggleShowPassword,
  onToggleShowConfirmPassword,
}: {
  isEdit: boolean;
  form: AdminFormValues;
  fieldErrors: Partial<Record<FormField, boolean>>;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onClearFieldError: (field: FormField) => void;
  onFormChange: (patch: Partial<AdminFormValues>) => void;
  onToggleShowPassword: () => void;
  onToggleShowConfirmPassword: () => void;
}) {
  return (
    <div>
      <h3 className="text-[22px] font-bold text-[#1f2640]">
        กรอกข้อมูลผู้ใช้งาน
      </h3>
      {/* <p className="mt-1 text-[14px] text-[#7a849c]">
        กรอกข้อมูลตามที่ระบบต้องการเพื่อสร้างบัญชีผู้ดูแลระบบ
      </p> */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
            ชื่อที่แสดง
          </span>
          <div className="relative">
            <FiUser className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b93a7]" />
            <input
              type="text"
              value={form.display_name}
              onChange={(e) => {
                onClearFieldError("display_name");
                onFormChange({ display_name: e.target.value });
              }}
              className={getInputClass(
                Boolean(fieldErrors.display_name),
                "pl-10 pr-4"
              )}
            />
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
            อีเมล
          </span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => {
              onClearFieldError("email");
              onFormChange({ email: e.target.value });
            }}
            className={getInputClass(Boolean(fieldErrors.email), "px-4")}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
            {isEdit ? "รหัสผ่านใหม่ (ไม่บังคับ)" : "รหัสผ่าน"}
          </span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => {
                onClearFieldError("password");
                onFormChange({ password: e.target.value });
              }}
              className={getInputClass(
                Boolean(fieldErrors.password),
                "px-4 pr-11"
              )}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={onToggleShowPassword}
              className="absolute inset-y-0 right-0 z-10 flex cursor-pointer items-center pr-3.5 text-[#8b93a7] hover:text-[#1f2640]"
              aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <FiEye className="h-4 w-4" />
              ) : (
                <FiEyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="mt-3">
            {!isEdit || form.password.length > 0 ? (
              <PasswordPolicyChecklist password={form.password} />
            ) : (
              <p className="text-[12px] text-[#7a849c]">
                เว้นว่างไว้หากไม่ต้องการเปลี่ยนรหัสผ่าน
              </p>
            )}
          </div>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-[13px] font-semibold text-[#1f2640]">
            {isEdit ? "ยืนยันรหัสผ่านใหม่" : "ยืนยันรหัสผ่าน"}
          </span>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => {
                onClearFieldError("confirmPassword");
                onFormChange({ confirmPassword: e.target.value });
              }}
              className={getInputClass(
                Boolean(fieldErrors.confirmPassword),
                "px-4 pr-11"
              )}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={onToggleShowConfirmPassword}
              className="absolute inset-y-0 right-0 z-10 flex cursor-pointer items-center pr-3.5 text-[#8b93a7] hover:text-[#1f2640]"
              aria-label={
                showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"
              }
              aria-pressed={showConfirmPassword}
            >
              {showConfirmPassword ? (
                <FiEye className="h-4 w-4" />
              ) : (
                <FiEyeOff className="h-4 w-4" />
              )}
            </button>
          </div>
        </label>
      </div>
    </div>
  );
}

export function AdminPermissionStep({
  roleTitle,
  menuLoading,
  groupedTabs,
  actionColumns,
  permissions,
  role,
  onToggle,
}: {
  roleTitle: string;
  menuLoading: boolean;
  groupedTabs: GroupedTab[];
  actionColumns: readonly string[];
  permissions: PermissionMap;
  role: AdminRole | "";
  onToggle: (tabCode: string, actionCode: string) => void;
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-[22px] font-bold text-[#1f2640]">
            กำหนดขอบเขตสิทธิ์
          </h3>
          {/* <p className="mt-1 text-[14px] text-[#7a849c]">
            ติ๊กสิทธิ์ตามเมนูจากระบบ (ดึงจาก getMenuAll)
            {role === "owner"
              ? " — Owner มีสิทธิ์เต็มโดยอัตโนมัติ"
              : ""}
          </p> */}
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4ff] bg-[#f8faff] px-3 py-2 text-[13px] font-semibold text-[#2553D8]">
          <FiShield className="h-4 w-4" />
          {roleTitle || "-"}
        </div>
      </div>

      {menuLoading ? (
        <p className="py-10 text-center text-[14px] text-[#7a849c]">
          กำลังโหลดเมนูสิทธิ์...
        </p>
      ) : (
        <AdminPermissionTable
          groupedTabs={groupedTabs}
          actionColumns={actionColumns}
          permissions={permissions}
          disabled={role === "owner"}
          onToggle={onToggle}
        />
      )}
    </div>
  );
}

export function AdminConfirmStep({
  isEdit,
  selectedRoleTitle,
  selectedRoleSubtitle,
  form,
  groupedTabs,
  actionColumns,
  permissions,
}: {
  isEdit: boolean;
  selectedRoleTitle?: string;
  selectedRoleSubtitle?: string;
  form: AdminFormValues;
  groupedTabs: GroupedTab[];
  actionColumns: readonly string[];
  permissions: PermissionMap;
}) {
  return (
    <div>
      <h3 className="text-[22px] font-bold text-[#1f2640]">
        {isEdit ? "ตรวจสอบและยืนยันการแก้ไข" : "ตรวจสอบและยืนยันการสร้าง"}
      </h3>
      {/* <p className="mt-1 text-[14px] text-[#7a849c]">
        ตรวจทานข้อมูลก่อนสร้างบัญชีผู้ดูแลระบบ
      </p> */}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
          <p className="text-[12px] font-semibold text-[#7a849c]">ชื่อบทบาท</p>
          <p className="mt-1 text-[15px] font-bold text-[#1f2640]">
            {selectedRoleTitle} ({selectedRoleSubtitle})
          </p>
        </div>
        <div className="rounded-2xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3">
          <p className="text-[12px] font-semibold text-[#7a849c]">ชื่อที่แสดง</p>
          <p className="mt-1 text-[15px] font-bold text-[#1f2640]">
            {form.display_name.trim() || "-"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#e8ecf4] bg-[#f8faff] px-4 py-3 sm:col-span-2">
          <p className="text-[12px] font-semibold text-[#7a849c]">อีเมล</p>
          <p className="mt-1 text-[15px] font-bold text-[#1f2640]">
            {form.email.trim() || "-"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-[15px] font-bold text-[#1f2640]">
            สิทธิ์การเข้าถึงเมนู (สรุป)
          </h4>
          {/* <button
            type="button"
            onClick={() => setStep(3)}
            className="cursor-pointer text-[13px] font-semibold text-[#2553D8] hover:underline"
          >
            แก้ไข →
          </button> */}
        </div>

        <AdminPermissionTable
          groupedTabs={groupedTabs}
          actionColumns={actionColumns}
          permissions={permissions}
          disabled
          readOnly
          onToggle={() => undefined}
        />
      </div>
    </div>
  );
}
