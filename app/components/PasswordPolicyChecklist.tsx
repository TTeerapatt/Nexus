"use client";

import { FiCheckCircle, FiCircle } from "react-icons/fi";
import { evaluatePasswordPolicy } from "@/app/lib/passwordPolicy";

type PasswordPolicyChecklistProps = {
  password: string;
};

function PolicyRow({ label, passed }: { label: string; passed: boolean }) {
  return (
    <li className={`text-xs ${passed ? "text-[#4BB47E]" : "text-slate-500"}`}>
      <span className="inline-flex items-center gap-1.5">
        {passed ? (
          <FiCheckCircle
            className="h-4 w-4 shrink-0 text-[#4BB47E]"
            aria-hidden
          />
        ) : (
          <FiCircle className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
        )}
        {label}
      </span>
    </li>
  );
}

export function PasswordPolicyChecklist({
  password,
}: PasswordPolicyChecklistProps) {
  const result = evaluatePasswordPolicy(password);

  return (
    <ul className="w-full space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-3 font-normal">
      <PolicyRow label="อย่างน้อย 12 ตัวอักษร" passed={result.minLength} />
      <PolicyRow label="มีตัวเลขอย่างน้อย 1 ตัว" passed={result.hasNumber} />
      <PolicyRow
        label="มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว"
        passed={result.hasUppercase}
      />
      <PolicyRow
        label="มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว"
        passed={result.hasLowercase}
      />
      <PolicyRow
        label="มีอักขระพิเศษอย่างน้อย 1 ตัว"
        passed={result.hasSpecial}
      />
    </ul>
  );
}

export default PasswordPolicyChecklist;
