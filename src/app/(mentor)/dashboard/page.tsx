"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  GitBranch,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  FolderGit2,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
}

interface Submission {
  id: string;
  projectName: string;
  repoUrl: string;
  liveLink: string;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  student?: {
    name: string;
    email: string;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export default function MentorDashboardPage() {
  const router = useRouter();

  // Auth checking
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Stats State
  const [stats, setStats] = useState<DashboardStats>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Submissions Table State
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
  });

  // Action loading state: tracking specific submission id and action
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED" | null>(null);

  // 1. Role and Authentication Check
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please login to access mentor dashboard");
      router.push("/login");
      return;
    }

    const role = getUserRole();
    if (role && role.toUpperCase() === "STUDENT") {
      toast.error("Students do not have access to the mentor dashboard");
      router.push("/submit");
      return;
    }

    setIsAuthChecking(false);
  }, [router]);

  // 2. Fetch Dashboard Statistics
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const res = await axiosInstance.get("/dashboard/stats");
      if (res.data?.data) {
        setStats(res.data.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  // 3. Fetch Submissions with Pagination & Filter
  const fetchSubmissions = useCallback(async () => {
    try {
      setIsTableLoading(true);
      const params: Record<string, string | number> = {
        page,
        limit: 10,
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      const res = await axiosInstance.get("/dashboard/submissions", { params });

      if (res.data?.data) {
        setSubmissions(res.data.data);
      }
      if (res.data?.meta) {
        setMeta(res.data.meta);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "Failed to load submissions"
      );
    } finally {
      setIsTableLoading(false);
    }
  }, [page, statusFilter]);

  // Initial & Filter Change load
  useEffect(() => {
    if (!isAuthChecking) {
      fetchStats();
    }
  }, [isAuthChecking, fetchStats]);

  useEffect(() => {
    if (!isAuthChecking) {
      fetchSubmissions();
    }
  }, [isAuthChecking, fetchSubmissions]);

  // 4. Handle Status Update (Approve / Reject)
  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    try {
      setActionLoadingId(id);
      setActionType(status);

      const res = await axiosInstance.patch(
        `/dashboard/submissions/${id}/status`,
        { status }
      );

      toast.success(
        res.data?.message || `Project ${status.toLowerCase()} successfully!`
      );

      // Re-fetch both stats and table data
      await Promise.all([fetchStats(), fetchSubmissions()]);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(
        axiosError.response?.data?.message || "Failed to update project status"
      );
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  // Helper for status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="warning">Pending</Badge>;
      case "APPROVED":
        return <Badge variant="success">Approved</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalPages = Math.max(1, Math.ceil(meta.total / meta.limit));

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Verifying mentor credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-100 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-200/50 dark:border-blue-900/50">
              <Sparkles className="w-3.5 h-3.5" />
              Mentor Workspace
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Review Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Track student project submissions, review code repositories, and approve or reject deliverables.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStats();
              fetchSubmissions();
            }}
            className="gap-2 self-start sm:self-auto border-zinc-200 dark:border-zinc-800"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>

        {/* Phase 4: StatCards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Pending Reviews"
            value={stats.totalPending}
            icon={Clock}
            variant="pending"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Approved Projects"
            value={stats.totalApproved}
            icon={CheckCircle2}
            variant="approved"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Rejected Projects"
            value={stats.totalRejected}
            icon={XCircle}
            variant="rejected"
            isLoading={isStatsLoading}
          />
        </section>

        {/* Phase 5 & 6: Data Table & Actions */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-blue-600" />
                Submitted Projects
              </CardTitle>
              <CardDescription>
                Showing {submissions.length} of {meta.total} total submissions
              </CardDescription>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2.5">
              <Filter className="w-4 h-4 text-zinc-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1); // reset to page 1 on filter change
                }}
                className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Only</option>
                <option value="APPROVED">Approved Only</option>
                <option value="REJECTED">Rejected Only</option>
              </select>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Project Name</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTableLoading ? (
                    // Skeleton Rows while loading
                    Array.from({ length: 4 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-3.5 w-36 mt-1.5" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-48" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                          <Skeleton className="h-8 w-28 ml-auto rounded-lg" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                          <FolderGit2 className="w-10 h-10 stroke-1 text-zinc-400 mb-2" />
                          <p className="font-semibold text-sm">No submissions found</p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            {statusFilter === "ALL"
                              ? "Students have not submitted any projects yet."
                              : `No projects match status filter "${statusFilter}".`}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((sub) => {
                      const isRowLoading = actionLoadingId === sub.id;

                      return (
                        <TableRow key={sub.id} className="group">
                          {/* Project Name */}
                          <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {sub.projectName}
                            <p className="text-[11px] text-zinc-400 font-normal">
                              {new Date(sub.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </TableCell>

                          {/* Student Info */}
                          <TableCell>
                            <p className="font-medium text-zinc-800 dark:text-zinc-200">
                              {sub.student?.name || "Student"}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {sub.student?.email}
                            </p>
                          </TableCell>

                          {/* Repo and Live Links */}
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {sub.repoUrl && (
                                <a
                                  href={sub.repoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                                  title="Open GitHub Repository"
                                >
                                  <GitBranch className="w-3.5 h-3.5" />
                                  Repo
                                </a>
                              )}
                              {sub.liveLink && (
                                <a
                                  href={sub.liveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-xs font-medium text-blue-700 dark:text-blue-300 transition-colors"
                                  title="Open Live Preview"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  Live
                                </a>
                              )}
                            </div>
                          </TableCell>

                          {/* Description */}
                          <TableCell className="max-w-[260px] truncate text-xs text-zinc-600 dark:text-zinc-400">
                            <span title={sub.description}>{sub.description}</span>
                          </TableCell>

                          {/* Status */}
                          <TableCell>{renderStatusBadge(sub.status)}</TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            {sub.status === "PENDING" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  disabled={isRowLoading}
                                  isLoading={isRowLoading && actionType === "APPROVED"}
                                  onClick={() => handleUpdateStatus(sub.id, "APPROVED")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 gap-1 shadow-sm font-medium"
                                >
                                  {!isRowLoading && <Check className="w-3.5 h-3.5" />}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={isRowLoading}
                                  isLoading={isRowLoading && actionType === "REJECTED"}
                                  onClick={() => handleUpdateStatus(sub.id, "REJECTED")}
                                  className="h-8 px-3 gap-1 shadow-sm font-medium"
                                >
                                  {!isRowLoading && <X className="w-3.5 h-3.5" />}
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-400 italic">
                                Reviewed
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
              <div>
                Page <span className="font-semibold text-zinc-800 dark:text-zinc-200">{meta.page}</span> of{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalPages}</span> ({meta.total} total)
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isTableLoading}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  className="h-8 px-2.5 gap-1 text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isTableLoading}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="h-8 px-2.5 gap-1 text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
