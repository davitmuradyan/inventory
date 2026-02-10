// In dev with Vite proxy we use same origin (no CORS). In production build, use env or default.
const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "" : "http://localhost:8080");
const API_BASE = API_ORIGIN ? `${API_ORIGIN}/api` : "/api";

/** Normalize any thrown value to a user-facing error message. */
export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string") {
    return (err as { message: string }).message;
  }
  return "Something went wrong. Please try again.";
}

async function request<T>(
  path: string,
  options?: RequestInit & { params?: Record<string, string | number | undefined> }
): Promise<T> {
  const { params, headers: initHeaders, ...init } = options ?? {};
  const base = API_ORIGIN || (typeof location !== "undefined" ? location.origin : "http://localhost:8080");
  const url = new URL(path, base);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
    });
  }
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (initHeaders) {
    if (initHeaders instanceof Headers) {
      initHeaders.forEach((v, k) => {
        headers[k] = v;
      });
    } else if (Array.isArray(initHeaders)) {
      initHeaders.forEach(([k, v]) => {
        headers[k] = v;
      });
    } else {
      Object.assign(headers, initHeaders);
    }
  }
  const fetchOptions: RequestInit = {
    method: init.method ?? "GET",
    headers: headers as HeadersInit,
  };
  if (init.body !== undefined) fetchOptions.body = init.body;
  if (init.credentials !== undefined) fetchOptions.credentials = init.credentials;
  if (init.cache !== undefined) fetchOptions.cache = init.cache;
  if (init.mode !== undefined) fetchOptions.mode = init.mode;

  const requestUrl = url.toString();
  let res: Response;
  try {
    res = await globalThis.fetch(requestUrl, fetchOptions as RequestInit);
  } catch (err) {
    const message = getErrorMessage(err);
    const hint =
      message.includes("fetch") || message.includes("Failed")
        ? " Open the API URL in a new tab (e.g. http://localhost:8080/api/health). If that fails, the API is not reachable; if it works, the issue may be CORS."
        : "";
    throw new Error(`Request failed: ${message}.${hint}`);
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? res.statusText ?? "Request failed";
    throw new Error(msg);
  }
  return data as T;
} 

export const api = {
  stores: {
    list: () => request<import("./types").Store[]>(`${API_BASE}/stores`),
    get: (id: string) => request<import("./types").Store>(`${API_BASE}/stores/${id}`),
    create: (body: { name: string }) =>
      request<import("./types").Store>(`${API_BASE}/stores`, { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { name?: string }) =>
      request<import("./types").Store>(`${API_BASE}/stores/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) =>
      request<void>(`${API_BASE}/stores/${id}`, { method: "DELETE" }),
    products: (storeId: string, params?: import("./types").ProductListParams) =>
      request<import("./types").ProductListResponse>(
        `${API_BASE}/stores/${storeId}/products`,
        { params: params as Record<string, string | number | undefined> }
      ),
    summary: (storeId: string, lowStockThreshold?: number) =>
      request<import("./types").StoreSummary>(
        `${API_BASE}/stores/${storeId}/summary`,
        { params: lowStockThreshold != null ? { lowStockThreshold } : undefined }
      ),
  },
  products: {
    list: (params?: import("./types").ProductListParams) =>
      request<import("./types").ProductListResponse>(`${API_BASE}/products`, {
        params: (params ?? {}) as Record<string, string | number | undefined>,
      }),
    get: (id: string) => request<import("./types").Product>(`${API_BASE}/products/${id}`),
    create: (body: {
      storeId: string;
      name: string;
      category: string;
      price: number;
      quantityInStock: number;
    }) =>
      request<import("./types").Product>(`${API_BASE}/products`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (
      id: string,
      body: { name?: string; category?: string; price?: number; quantityInStock?: number }
    ) =>
      request<import("./types").Product>(`${API_BASE}/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
      }),
    delete: (id: string) =>
      request<void>(`${API_BASE}/products/${id}`, { method: "DELETE" }),
  },
};
