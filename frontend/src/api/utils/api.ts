// utils/api.ts
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

interface SPParameters {
  [key: `@${string}`]: string | number | boolean | null | undefined;
}

export interface SPResponse<T = any> {
  IsSuccess: boolean;
  StatusCode: number;
  Message: string;
  Data: T[];
}

const api = axios.create({
  baseURL: "https://pool.techa.ir/api/ExecuteTSql/ExecuteStoredProcedure",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// اضافه کردن توکن
api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// حداقل مدیریت 401 (اگر refresh ندارید)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // اینجا می‌توانید logout کنید یا redirect
      Cookies.remove("token");
      Cookies.remove("user");
      // اگر از react-router استفاده می‌کنید:
      // window.location.href = "/login?session=expired";
      console.warn("Unauthorized → token removed");
    }
    return Promise.reject(error);
  }
);

export async function SP_fetch<T = any>(
  procedureName: string,
  parameters: SPParameters = {},
  hasDataTable: boolean = true
): Promise<SPResponse<T>> {
  // اطمینان از اینکه کلیدها با @ شروع می‌شوند
  const formattedParams = Object.fromEntries(
    Object.entries(parameters).map(([k, v]) => [k.startsWith("@") ? k : `@${k}`, String(v)])
  );

  const body = {
    ProcedureName: procedureName,
    ProjectId: 1016,
    HasDataTable: hasDataTable,
    Parameters: formattedParams,
  };

  try {
    const { data } = await api.post("", body); // چون baseURL کامل است

    let dataset: T[] = [];

    if (Array.isArray(data.Data)) {
      dataset = data.Data;
    } else if (typeof data.Data === "string") {
      try {
        const parsed = JSON.parse(data.Data);
        dataset = Array.isArray(parsed) ? parsed : [];
      } catch (parseErr) {
        console.warn("Failed to parse data.Data as JSON array", parseErr);
      }
    }

    return {
      IsSuccess: !!data.IsSuccess,
      StatusCode: Number(data.StatusCode) || -1,
      Message: String(data.Message || ""),
      Data: dataset,
    };
  } catch (error: unknown) {
    const err = error as AxiosError<any>;

    let message = err.message || "خطای ناشناخته در ارتباط با سرور";

    if (err.response?.data?.Message) {
      message = err.response.data.Message;
    } else if (typeof err.response?.data?.Data === "string") {
      try {
        const inner = JSON.parse(err.response.data.Data);
        if (inner?.Message) message = inner.Message;
      } catch {
        // ignore
      }
    }

    return {
      IsSuccess: false,
      StatusCode: err.response?.data?.StatusCode ?? -1,
      Message: message,
      Data: [],
    };
  }
}