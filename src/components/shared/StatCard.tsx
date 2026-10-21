import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

export interface StatCardProps {
  title: string;
  value?: number;
  icon: LucideIcon;
  variant?: "pending" | "approved" | "rejected" | "purple" | "default";
  isLoading?: boolean;
}

export function StatCard({
  title,
  value = 0,
  icon: Icon,
  variant = "pending",
  isLoading = false,
}: StatCardProps) {
  const styles = {
    pending: {
      bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/40",
      accent: "from-amber-500 to-amber-600",
      badge: "Pending",
    },
    approved: {
      bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/40",
      accent: "from-emerald-500 to-emerald-600",
      badge: "Active",
    },
    rejected: {
      bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-900/40",
      accent: "from-rose-500 to-rose-600",
      badge: "Blocked",
    },
    purple: {
      bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-900/40",
      accent: "from-purple-500 to-purple-600",
      badge: "Admin",
    },
    default: {
      bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/40",
      accent: "from-blue-500 to-blue-600",
      badge: "Total",
    },
  };

  const currentStyle = styles[variant] || styles.default;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mt-2 rounded-lg" />
          ) : (
            <p className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
              {value}
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl border transition-transform duration-200 hover:scale-105",
            currentStyle.bg
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

export default StatCard;
