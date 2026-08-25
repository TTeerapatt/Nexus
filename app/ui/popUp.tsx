"use client";

import Swal, { type SweetAlertIcon, type SweetAlertResult } from "sweetalert2";

const BLUE = "#2553D8";
const TEXT = "#163a7f";
const CANCEL_BG = "#e5e7eb";

const LAYOUT = {
  width: "360px",
  padding: "1.75rem 1.5rem 1.5rem",
  background: "#ffffff",
  color: TEXT,
  iconColor: BLUE,
  backdrop: `
    rgba(15, 23, 42, 0.42)
    left top
    no-repeat
  `,
} as const;

type StatusPopupOptions = {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  timer?: number;
  timerProgressBar?: boolean;
};

type ConfirmPopupOptions = {
  title?: string;
  text?: string;
  icon?: SweetAlertIcon;
  confirmText?: string;
  cancelText?: string;
};

const SUCCESS_TIMER_MS = 1000;

export function showStatusPopup({
  title = "สำเร็จ",
  text,
  icon = "info",
  confirmText = "ตกลง",
  timer,
  timerProgressBar = false,
}: StatusPopupOptions = {}): Promise<SweetAlertResult> {
  return Swal.fire({
    title,
    text: text || undefined,
    icon,
    showConfirmButton: true,
    showCancelButton: false,
    confirmButtonText: confirmText,
    allowOutsideClick: false,
    allowEscapeKey: true,
    timer,
    timerProgressBar: Boolean(timer) && timerProgressBar,
    width: LAYOUT.width,
    padding: LAYOUT.padding,
    background: LAYOUT.background,
    color: LAYOUT.color,
    iconColor: LAYOUT.iconColor,
    confirmButtonColor: BLUE,
    backdrop: LAYOUT.backdrop,
    customClass: {
      container: "app-swal-container",
      popup: "app-swal-popup",
      title: "app-swal-title",
      htmlContainer: "app-swal-text",
      icon: "app-swal-icon",
      actions: "app-swal-actions app-swal-actions-single",
      confirmButton: "app-swal-confirm-btn",
      timerProgressBar: "app-swal-timer-bar",
    },
  });
}

export async function showConfirmPopup({
  title = "ยืนยันการทำรายการ?",
  text,
  icon = "question",
  confirmText = "ตกลง",
  cancelText = "ยกเลิก",
}: ConfirmPopupOptions = {}): Promise<boolean> {
  const result = await Swal.fire({
    title,
    text: text || undefined,
    icon,
    showConfirmButton: true,
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    allowOutsideClick: false,
    allowEscapeKey: true,
    width: LAYOUT.width,
    padding: LAYOUT.padding,
    background: LAYOUT.background,
    color: LAYOUT.color,
    iconColor: LAYOUT.iconColor,
    confirmButtonColor: BLUE,
    cancelButtonColor: CANCEL_BG,
    backdrop: LAYOUT.backdrop,
    customClass: {
      container: "app-swal-container",
      popup: "app-swal-popup",
      title: "app-swal-title",
      htmlContainer: "app-swal-text",
      icon: "app-swal-icon",
      actions: "app-swal-actions",
      confirmButton: "app-swal-confirm-btn",
      cancelButton: "app-swal-cancel-btn",
    },
  });

  return result.isConfirmed;
}

export const popup = {
  success: (
    title = "สำเร็จ",
    text?: string,
    options?: Pick<StatusPopupOptions, "confirmText" | "timer" | "timerProgressBar">
  ) =>
    showStatusPopup({
      title,
      text,
      icon: "success",
      timer: SUCCESS_TIMER_MS,
      timerProgressBar: true,
      ...options,
    }),
  error: (title = "เกิดข้อผิดพลาด", text?: string) =>
    showStatusPopup({ title, text, icon: "error" }),
  warning: (title = "คำเตือน", text?: string) =>
    showStatusPopup({ title, text, icon: "warning" }),
  info: (title = "แจ้งเตือน", text?: string) =>
    showStatusPopup({ title, text, icon: "info" }),
  confirm: (options?: ConfirmPopupOptions) => showConfirmPopup(options),
  confirmDelete: (options?: ConfirmPopupOptions) =>
    showConfirmPopup({
      title: "ยืนยันการลบ?",
      text: "เมื่อลบแล้วจะไม่สามารถกู้คืนได้",
      icon: "warning",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
      ...options,
    }),
  logout: () =>
    showConfirmPopup({
      title: "ยืนยันออกจากระบบ",
      text: "คุณต้องการออกจากระบบหรือไม่?",
      icon: "question",
      confirmText: "ตกลง",
      cancelText: "ยกเลิก",
    }),
};

/** @deprecated ใช้ showStatusPopup หรือ popup.success แทน */
export function showAppPopupAnimation(
  options: StatusPopupOptions = {}
): Promise<SweetAlertResult> {
  return showStatusPopup(options);
}

export default popup;
