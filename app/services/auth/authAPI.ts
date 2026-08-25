import apiServices from "../apiServices";
import { validateOrThrowApiResponse } from "../response-validator";

const authAPI = {

    login(email: string, password: string) {
        return apiServices
            .post(
                `auth/login`,
                { email, password },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error login:", err);
                return {
                    status: "failed",
                    errMessage:
                        err?.message ||
                        err?.errMessage ||
                        (typeof err === "string" ? err : null) ||
                        "การเข้าสู่ระบบล้มเหลว",
                    error: err,
                };
            });
    },

    getMe() {
        return apiServices
            .get(
                `auth/me`,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                }
            )
            .then((res) => validateOrThrowApiResponse(res))
            .catch((err) => {
                console.log("Error getMe:", err);
                return {
                    status: "failed",
                    errMessage:
                        err?.message ||
                        err?.errMessage ||
                        (typeof err === "string" ? err : null) ||
                        "การดึงข้อมูลผู้ใช้งานล้มเหลว",
                    error: err,
                };
            });
    },

}

export default authAPI;