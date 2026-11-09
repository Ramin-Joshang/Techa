import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: "https://pool.techa.ir/api",
    timeout: 15000,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
});

let storeRef = null; // ← store اینجا inject می‌شود

export const injectStore = (store) => {
    storeRef = store;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
    failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
    failedQueue = [];
};

// Request interceptor
api.interceptors.request.use((config) => {
    const token = Cookies.get("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Response interceptor
api.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            storeRef
        ) {
            const { refreshToken } = await import(
                "../../features/auth/authActions"
            );
            const { logout } = await import(
                "../../features/auth/authSlice"
            );

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshResult = await storeRef.dispatch(refreshToken());

                if (refreshResult.meta.requestStatus === "fulfilled") {
                    processQueue(null);
                    return api(originalRequest);
                }

                throw new Error("Refresh failed");
            } catch (err) {
                processQueue(err);
                storeRef.dispatch(logout());
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;