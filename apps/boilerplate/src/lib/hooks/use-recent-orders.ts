"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "recent_order";
const MAX_ORDERS = 5;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type RecentOrder = {
  orderNumber: string;
  placedAt: number;
  total: number;
};

export function getRecentOrders(): RecentOrder[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - MAX_AGE_MS;
    return parsed.filter((o) => o.placedAt > cutoff);
  } catch {
    return [];
  }
}

export function saveRecentOrder(order: RecentOrder) {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentOrders();
    const filtered = existing.filter(
      (o) => o.orderNumber !== order.orderNumber
    );
    const next = [order, ...filtered].slice(0, MAX_ORDERS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("recent-order-changed"));
  } catch {
    // localStorage might be disabled
  }
}

export function clearRecentOrders() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("recent-order-changed"));
}

/** React hook that stays in sync with recent orders */
export function useRecentOrders() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOrders(getRecentOrders());

    function handler() {
      setOrders(getRecentOrders());
    }
    window.addEventListener("recent-order-changed", handler);
    return () => window.removeEventListener("recent-order-changed", handler);
  }, []);

  return { orders, mounted };
}
