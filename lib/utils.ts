import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatCurrency(amount: number | null) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export const PLATFORMS = ["google_ads", "meta", "email"] as const;
export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_LABELS: Record<Platform, string> = {
  google_ads: "Google Ads",
  meta: "Meta",
  email: "Email",
};

export const PLATFORM_COLORS: Record<Platform, string> = {
  google_ads: "bg-blue-100 text-blue-800",
  meta: "bg-indigo-100 text-indigo-800",
  email: "bg-green-100 text-green-800",
};

export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  pending: "bg-gray-100 text-gray-700",
  running: "bg-blue-100 text-blue-800",
  passed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  blocked: "bg-red-100 text-red-800",
  not_started: "bg-gray-100 text-gray-700",
};
