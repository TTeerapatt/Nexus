import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

export type MenuLabel = {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MenuTabAction = {
  code: string;
  name: string;
  sort_order: number;
};

export type MenuTab = {
  id: number;
  menu_label_id: number;
  menu_label_code: string;
  menu_label_name: string;
  code: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  actions?: MenuTabAction[];
};

export type MenuAllResponse = {
  labels: MenuLabel[];
  tabs: MenuTab[];
};

const menuAPI = {
  getMenuAll() {
    return apiServices
      .get(`admin-menu`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getMenuAll:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลเมนูล้มเหลว",
          error: err,
        };
      });
  },

  getMenuLabel() {
    return apiServices
      .get(`admin-menu/labels`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getMenuLabel:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลเมนู label ล้มเหลว",
          error: err,
        };
      });
  },

  getMenuTab() {
    return apiServices
      .get(`admin-menu/tabs`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
      .then((res) => validateOrThrowApiResponse(res))
      .catch((err) => {
        console.log("Error getMenuTab:", err);
        return {
          status: "failed",
          errMessage:
            err?.message ||
            err?.errMessage ||
            (typeof err === "string" ? err : null) ||
            "การดึงข้อมูลเมนู tab ล้มเหลว",
          error: err,
        };
      });
  },
};

export default menuAPI;
