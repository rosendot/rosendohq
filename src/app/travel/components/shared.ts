import {
  Plane,
  MapPin,
  Car,
  Hotel,
  Utensils,
  ListTodo,
  MoreHorizontal,
} from "lucide-react";
import type { ItineraryType, TripStatus } from "@/types/database.types";

export const OWNER_ID = "e2b952a0-c81a-4ff0-b362-82f906e02094";

export const STATUS_COLORS: Record<TripStatus, string> = {
  planning: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  upcoming: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  active: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  completed: "text-gray-400 bg-gray-500/10 border-gray-500/20",
};

export const TYPE_ICONS: Record<ItineraryType, typeof Plane> = {
  flight: Plane,
  accommodation: Hotel,
  activity: MapPin,
  transport: Car,
  dining: Utensils,
  todo: ListTodo,
  other: MoreHorizontal,
};

export const TYPE_COLORS: Record<ItineraryType, string> = {
  flight: "text-blue-400 bg-blue-500/10",
  accommodation: "text-purple-400 bg-purple-500/10",
  activity: "text-emerald-400 bg-emerald-500/10",
  transport: "text-orange-400 bg-orange-500/10",
  dining: "text-red-400 bg-red-500/10",
  todo: "text-yellow-400 bg-yellow-500/10",
  other: "text-gray-400 bg-gray-500/10",
};

export function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCents(cents: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
