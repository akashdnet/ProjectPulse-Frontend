"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UserCheck,
  CheckCircle2,
  Ban,
  Search,
  RefreshCw,
  Mail,
  Calendar,
  Eye,
  Trash2,
  AlertCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRecord } from "@/components/admin/UserFormModal";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";
import { UserStatusBadge } from "@/components/admin/StatusBadge";

export default function PendingTeachersPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Mentor list state
  const [mentors, setMentors] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("PENDING");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Loading states for actions
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"ACTIVE" | "BLOCKED" | "DELETE" | null>(null);

  // Modal
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    const role = getUserRole();
    if (role?.toUpperCase() !== "ADMIN") {
      toast.error("Admin access required");
      router.push(role?.toUpperCase() === "MENTOR" ? "/dashboard" : "/submit");
      return;
    }
    setIsAuthChecking(false);
  }, [router]);

  // Fetch Mentors
  const fetchMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number> = {
        role: "MENTOR",
        page,
        limit: 10,
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }
      if (searchTerm.trim().length > 0) {
        params.searchTerm = searchTerm.trim();
      }

      const res = await axiosInstance.get("/users", { params });

      if (res.data?.data) {
        setMentors(res.data.data);
      }
      if (res.data?.meta) {
        setTotalCount(res.data.meta.total || 0);
        setTotalPages(res.data.meta.totalPages || 1);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to load mentor applications");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    if (!isAuthChecking) {
      fetchMentors();
    }
  }, [isAuthChecking, fetchMentors]);

  // Handle Approve / Block
  const handleUpdateStatus = async (user: UserRecord, nextStatus: "ACTIVE" | "BLOCKED") => {
    try {
      setActionLoadingId(user.id);
      setActionType(nextStatus);

      const res = await axiosInstance.patch(`/users/${user.id}/status`, { status: nextStatus });

      if (nextStatus === "ACTIVE") {
        toast.success(`Mentor "${user.name}" approved! They can now log in and review submissions.`);
      } else {
        toast.info(`Mentor "${user.name}" status updated to ${nextStatus}.`);
      }

      fetchMentors();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to update mentor status");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  // Handle Soft Delete
  const handleDeleteUser = async (user: UserRecord) => {
    if (!confirm(`Are you sure you want to delete account for "${user.name}"?`)) return;

    try {
      setActionLoadingId(user.id);
      setActionType("DELETE");

      await axiosInstance.delete(`/users/${user.id}`);
      toast.success(`Account for "${user.name}" deactivated.`);
      fetchMentors();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to delete account");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-100 to-amber-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-amber-950/20 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-2 border border-amber-200/50 dark:border-amber-900/50">
              <UserCheck className="w-3.5 h-3.5" />
              Teacher & Mentor Verification
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Teacher Pending Approvals
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Review instructor applications, approve credentials, and activate mentor review portal access.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchMentors}
              className="gap-2 border-zinc-200 dark:border-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Link href="/admin/users">
              <Button size="sm" variant="secondary" className="gap-2 text-xs">
                All Users Directory
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="Search mentors by name or email address..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-10"
                />
              </div>

              {/* Status tabs */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs cursor-pointer w-full sm:w-44"
                >
                  <option value="PENDING">Pending Approval (Default)</option>
                  <option value="ACTIVE">Approved / Active Mentors</option>
                  <option value="BLOCKED">Suspended / Blocked</option>
                  <option value="ALL">All Mentors</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mentors Feed / Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-9 w-28 rounded-lg" />
                  <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
              </Card>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {statusFilter === "PENDING"
                ? "No Pending Mentor Applications"
                : "No Mentors Match This Filter"}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto mt-1">
              {statusFilter === "PENDING"
                ? "All registered mentors have been reviewed and activated. New mentor signups will appear here immediately."
                : "Try selecting a different status filter or clear your search query."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {mentors.map((m) => {
              const isRowLoading = actionLoadingId === m.id;

              return (
                <Card
                  key={m.id}
                  className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all bg-white dark:bg-zinc-900 overflow-hidden flex flex-col justify-between"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-base shadow-xs">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            {m.name}
                          </CardTitle>
                          <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="w-3.5 h-3.5" />
                            {m.email}
                          </p>
                        </div>
                      </div>

                      <UserStatusBadge status={m.status} isDeleted={m.isDeleted} />
                    </div>

                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Registered {new Date(m.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Briefcase className="w-3.5 h-3.5" />
                        Role: Mentor
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-2 pb-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUserId(m.id);
                        setIsDetailsModalOpen(true);
                      }}
                      className="h-8 px-2.5 text-xs gap-1 border-zinc-200 dark:border-zinc-800"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Button>

                    <div className="flex items-center gap-2">
                      {m.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            disabled={isRowLoading}
                            isLoading={isRowLoading && actionType === "ACTIVE"}
                            onClick={() => handleUpdateStatus(m, "ACTIVE")}
                            className="h-8 px-3 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-xs"
                          >
                            {!isRowLoading && <CheckCircle2 className="w-3.5 h-3.5" />}
                            Approve & Activate
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isRowLoading}
                            isLoading={isRowLoading && actionType === "BLOCKED"}
                            onClick={() => handleUpdateStatus(m, "BLOCKED")}
                            className="h-8 px-2.5 text-xs gap-1 font-medium shadow-xs"
                          >
                            {!isRowLoading && <Ban className="w-3.5 h-3.5" />}
                            Reject
                          </Button>
                        </>
                      )}

                      {m.status === "ACTIVE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isRowLoading}
                          isLoading={isRowLoading && actionType === "BLOCKED"}
                          onClick={() => handleUpdateStatus(m, "BLOCKED")}
                          className="h-8 px-2.5 text-xs gap-1 text-zinc-600 hover:text-red-600 border-zinc-200"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Suspend Account
                        </Button>
                      )}

                      {m.status === "BLOCKED" && (
                        <Button
                          size="sm"
                          disabled={isRowLoading}
                          isLoading={isRowLoading && actionType === "ACTIVE"}
                          onClick={() => handleUpdateStatus(m, "ACTIVE")}
                          className="h-8 px-3 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Re-activate
                        </Button>
                      )}

                      {!m.isDeleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isRowLoading}
                          onClick={() => handleDeleteUser(m)}
                          className="h-8 w-8 p-0 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                          title="Soft Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-2 text-xs text-zinc-500">
            <div>
              Showing page <span className="font-semibold text-zinc-800 dark:text-zinc-200">{page}</span> of{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalPages}</span> ({totalCount} total mentors)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="h-8 px-2.5 gap-1 text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((prev) => prev + 1)}
                className="h-8 px-2.5 gap-1 text-xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Details Modal */}
      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        userId={selectedUserId}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}
