import { useAuthStore } from "../stores/authStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function request(path, options = {}) {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

//Backwards compatible: http("/path") still works
export function http(path, options) {
  return request(path, options);
}

// also supports http.get/post/patch/delete
http.get = (path, options = {}) => request(path, { ...options, method: "GET" });

http.post = (path, body, options = {}) =>
  request(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });

http.patch = (path, body, options = {}) =>
  request(path, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });

http.delete = (path, options = {}) =>
  request(path, { ...options, method: "DELETE" });
