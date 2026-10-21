"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  X,
  User,
  Mail,
  Calendar,
  FolderGit2,
  ExternalLink,
  GitBranch,
  ShieldAlert,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRoleBadge, UserStatusBadge } from "./StatusBadge";

interface SubmissionSummary {
  id: string;
  projectName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  repoUrl: string;
  liveLink: string;
  createdAt: string;
}

interface DetailedUser {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  status: "ACTIVE" | "PENDING" | "BLOCKED";
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  submissions?: SubmissionSummary[];
}

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ userId, isOpen, onClose }: UserDetailsModalProps) {
  const [user, setUser] = useState<DetailedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !userId) {
      setUser(null);
      return;
    }

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get(`/users/${userId}`);
        if (res.data?.data) {
          setUser(res.data.data);
        }
      } catch (err: unknown) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || "Failed to load user details");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [userId, isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                User Details & Profile
              </h2>
              <p className="text-xs text-zinc-500">
                ID: {userId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            </div>
          ) : user ? (
            <>
              {/* Profile Card */}
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      {user.name}
                    </h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserRoleBadge role={user.role} />
                    <UserStatusBadge status={user.status} isDeleted={user.isDeleted} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Registered: {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Last Updated: {new Date(user.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {user.isDeleted && (
                  <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-800 dark:text-red-300 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" />
                    <span>This user was soft-deleted on {user.deletedAt ? new Date(user.deletedAt).toLocaleString() : "Unknown"}.</span>
                  </div>
                )}
              </div>

              {/* Submissions (If Student) */}
              <div>
                <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 mb-3">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  Submitted Projects ({user.submissions?.length || 0})
                </h4>

                {(!user.submissions || user.submissions.length === 0) ? (
                  <p className="text-xs text-zinc-400 italic bg-zinc-50 dark:bg-zinc-950/40 p-4 rounded-xl text-center border border-dashed border-zinc-200 dark:border-zinc-800">
                    No project submissions recorded for this user.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {user.submissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">{sub.projectName}</p>
                          <p className="text-[11px] text-zinc-400">Submitted {new Date(sub.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {sub.repoUrl && (
                            <a
                              href={sub.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                              title="Repository"
                            >
                              <GitBranch className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {sub.liveLink && (
                            <a
                              href={sub.liveLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-blue-600 dark:text-blue-400"
                              title="Live Link"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sub.status === "APPROVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : sub.status === "REJECTED"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-500 text-center">User not found</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
