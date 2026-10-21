import React from "react";
import { Badge } from "@/components/ui/badge";
import { Crown, Briefcase, GraduationCap, CheckCircle, Clock, Ban, Trash2 } from "lucide-react";

interface StatusBadgeProps {
  status?: string;
  isDeleted?: boolean;
}

export function UserStatusBadge({ status, isDeleted }: StatusBadgeProps) {
  if (isDeleted) {
    return (
      <Badge variant="destructive" className="gap-1 bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-900">
        <Trash2 className="w-3 h-3" />
        Soft-Deleted
      </Badge>
    );
  }

  switch (status?.toUpperCase()) {
    case "ACTIVE":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          Active
        </Badge>
      );
    case "PENDING":
      return (
        <Badge variant="warning" className="gap-1 animate-pulse">
          <Clock className="w-3 h-3" />
          Pending Approval
        </Badge>
      );
    case "BLOCKED":
      return (
        <Badge variant="destructive" className="gap-1">
          <Ban className="w-3 h-3" />
          Blocked
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  }
}

interface RoleBadgeProps {
  role?: string;
}

export function UserRoleBadge({ role }: RoleBadgeProps) {
  switch (role?.toUpperCase()) {
    case "ADMIN":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60">
          <Crown className="w-3 h-3 text-purple-600 dark:text-purple-400" />
          Admin
        </span>
      );
    case "MENTOR":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
          <Briefcase className="w-3 h-3 text-blue-600 dark:text-blue-400" />
          Mentor
        </span>
      );
    case "STUDENT":
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
          <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Student
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {role || "Unknown"}
        </span>
      );
  }
}
