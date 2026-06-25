import type { Comparison, ComparisonPayload, Item } from "../types";

const API_PREFIX = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_PREFIX}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function listItems(): Promise<Item[]> {
  return request<Item[]>("/items");
}

export function createManualItem(text: string): Promise<Item> {
  return request<Item>("/items/manual", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export function createUrlItem(url: string): Promise<Item> {
  return request<Item>("/items/url", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function createImageItem(imageUrl: string): Promise<Item> {
  return request<Item>("/items/image", {
    method: "POST",
    body: JSON.stringify({ image_url: imageUrl }),
  });
}

export function createComparison(payload: ComparisonPayload): Promise<Comparison> {
  return request<Comparison>("/compare", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
