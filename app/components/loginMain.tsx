"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { MdLocalLaundryService } from "react-icons/md";
import authAPI from "@/app/services/auth/authAPI";
import menuAPI from "@/app/services/menu/menuAPI";
import {
  ADMIN_PROFILE_KEY,
  ADMIN_TOKEN_KEY,
  clearAdminSession,
  type StoredMenuAll,
  type StoredPermissionMenu,
} from "@/app/lib/adminStorage";
import { popup } from "@/app/ui/popUp";

type LoginApiResult =
  | {
      success?: boolean;
      data?: {
        token?: string;
        admin?: {
          id: string | number;
          email: string;
          display_name: string;
          role: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

type AuthMeApiResult =
  | {
      success?: boolean;
      data?: {
        admin?: {
          id: string | number;
          email: string;
          display_name: string;
          role: string;
          created_at?: string;
          updated_at?: string;
          last_login_at?: string | null;
        };
        menu?: StoredPermissionMenu[];
      };
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

type MenuAllApiResult =
  | {
      success?: boolean;
      data?: StoredMenuAll;
      status?: string;
      errMessage?: string;
      message?: string;
    }
  | null
  | undefined;

function localizeLoginError(message: string): string {
  const normalized = message.trim().toLowerCase();
  if (normalized === "invalid email or password") {
    return "Invalid email or password";
  }
  return message;
}

function getErrorMessage(result: LoginApiResult, fallback: string): string {
  if (!result) return fallback;

  const raw =
    (typeof result.errMessage === "string" && result.errMessage.trim()) ||
    (typeof result.message === "string" && result.message.trim()) ||
    "";

  if (raw) return localizeLoginError(raw);
  return fallback;
}

function isFailedResult(
  result: { status?: string; success?: boolean } | null | undefined
): boolean {
  return !result || result.status === "failed" || result.success === false;
}

export default function LoginMain() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      await popup.warning(
        "Incomplete information",
        "Please enter email and password"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = (await authAPI.login(
        trimmedEmail,
        password
      )) as LoginApiResult;

      if (!result || result.status === "failed" || !result.success) {
        await popup.error(
          "Sign in failed",
          getErrorMessage(
            result,
            "Sign in failed. Please check your credentials"
          )
        );
        return;
      }

      const token = result.data?.token;
      const admin = result.data?.admin;
      if (!token) {
        await popup.error(
          "Sign in failed",
          "No token received from server"
        );
        return;
      }

      localStorage.setItem(ADMIN_TOKEN_KEY, token);
      if (admin) {
        localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(admin));
      }

      // Fetch permissions + menu master right after login for role-based UI rendering.
      const [meResult, menuResult] = (await Promise.all([
        authAPI.getMe(),
        menuAPI.getMenuAll(),
      ])) as [AuthMeApiResult, MenuAllApiResult];

      if (isFailedResult(meResult) || isFailedResult(menuResult)) {
        const message = getErrorMessage(
          meResult as LoginApiResult,
          "Unable to fetch permissions"
        );
        clearAdminSession();
        await popup.error("Sign in failed", localizeLoginError(message));
        return;
      }

      const mePayload = meResult?.data;
      const menuAllPayload = menuResult?.data;
      if (!mePayload?.menu || !menuAllPayload?.labels || !menuAllPayload?.tabs) {
        clearAdminSession();
        await popup.error(
          "Sign in failed",
          "Incomplete user permission data from server"
        );
        return;
      }

      if (mePayload.admin) {
        localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(mePayload.admin));
      }
      // permission_menu + menu_all reload in AdminSessionProvider (memory) after entering admin

      // Wait until success popup closes (timer bar finishes or user clicks OK), then redirect
      await popup.success(
        "Signed in successfully",
        "Welcome to the admin portal"
      );
      router.push("/");
    } catch (err: unknown) {
      const raw =
        err instanceof Error
          ? err.message || "Connection error"
          : "Connection error";

      await popup.error("Sign in failed", localizeLoginError(raw));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#242E42] px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="flex min-h-[700px] w-full max-w-[980px] overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(36,46,66,0.18)]">
        {/* Left brand panel */}
        <div
          className="relative hidden w-[40%] flex-col items-center justify-between bg-[#242E42] px-8 pb-10 pt-12 md:flex"
        >
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="flex h-[120px] w-[120px] items-center justify-center rounded-3xl bg-white/15 backdrop-blur-sm">
              <MdLocalLaundryService className="h-16 w-16 text-white" />
            </div>
            <p className="text-center text-[22px] font-bold tracking-wide">
              Nexus
            </p>
            <p className="text-center text-[14px] font-medium text-white/85">
              Laundry management system
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white/10 px-5 py-6 text-center text-white/90 backdrop-blur-sm">
            <p className="text-[15px] font-semibold">Admin Panel</p>
            <p className="mt-2 text-[13px] leading-relaxed text-white/80">
              Manage orders, customers, and laundry status in one place
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex w-full flex-col justify-center px-8 py-12 sm:px-12 md:w-[60%] md:px-16 md:py-14">
          <div className="mb-6 flex justify-center md:hidden">
            <div className="flex h-[88px] w-[88px] items-center justify-center rounded-2xl bg-white">
              <MdLocalLaundryService className="h-12 w-12 text-[#242E42]" />
            </div>
          </div>

          <h1 className="text-center text-[30px] font-bold leading-tight text-[#242E42] sm:text-[34px]">
            Sign in
          </h1>

          <form className="mt-12 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[14px] font-semibold text-[#242E42]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexus.com"
                className="h-12 w-full rounded-xl border border-[#d7dce7] bg-white px-4 text-[14px] text-[#242E42] placeholder-[#adb2ba] outline-none transition focus:border-[#242e42] focus:ring-2 focus:ring-[#242e42]/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[14px] font-semibold text-[#242E42]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-[#d7dce7] bg-white px-4 pr-11 text-[14px] text-[#242E42] placeholder-[#adb2ba] outline-none transition focus:border-[#242e42] focus:ring-2 focus:ring-[#242e42]/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 z-10 flex items-center pr-3.5 text-[#757d94] hover:text-[#242E42]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" aria-hidden />
                  ) : (
                    <FiEye className="h-5 w-5" aria-hidden />
                  )}
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    popup.info(
                      "Forgot password",
                      "Please contact the owner to reset your password"
                    )
                  }
                  className="cursor-pointer text-[13px] font-medium text-[#242E42] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#242E42] text-[15px] font-semibold text-white transition hover:bg-[#1b2333] focus:outline-none focus:ring-2 focus:ring-[#242e42]/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
