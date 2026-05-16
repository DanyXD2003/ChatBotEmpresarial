"use server";

import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  const hasToken = !!token;

  if (!hasToken) {
    throw new Error(
      "No has iniciado sesión. Inicia sesión nuevamente para continuar."
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}




async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Error ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.detail) {
        detail = errorBody.detail;
      }
    } catch {
      // ignore parse error
    }
    throw new Error(detail);
  }
  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export async function apiGet<T>(path: string, params?: Record<string, string | boolean | null | undefined>): Promise<T> {
  const headers = await getAuthHeaders();
  let url = `${BACKEND_URL}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }
  const response = await fetch(url, { headers });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiDelete(path: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  await handleResponse<void>(response);
}
