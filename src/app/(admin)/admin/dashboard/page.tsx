"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  UserCheck,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FolderGit2,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Crown,
  Eye,
  CheckCircle2,
  Ban,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";
import { StatCard } from "@/components/shared/StatCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { UserRoleBadge, UserStatusBadge } from "@/components/admin/StatusBadge";
import { UserFormModal, UserRecord } from "@/components/admin/UserFormModal";
import { UserDetailsModal } from "@/components/admin/UserDetailsModal";

interface AdminStats {
  totalUsers: number;
  pendingMentors: number;
  activeMentors: number;
  activeStudents: number;
  blockedUsers: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Stats state
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingMentors: 0,
    activeMentors: 0,
    activeStudents: 0,
    blockedUsers: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // Recent users
  const [recentUsers, setRecentUsers] = useState<UserRecord[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // 1. Auth Guard for Admin
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please login to access the admin portal");
      router.push("/login");
      return;
    }

    const role = getUserRole();
    if (role?.toUpperCase() !== "ADMIN") {
      toast.error("Access denied. Admin privileges required.");
      if (role?.toUpperCase() === "MENTOR") {
        router.push("/dashboard");
      } else {
        router.push("/submit");
      }
      return;
    }

    setIsAuthChecking(false);
  }, [router]);

  // 2. Fetch Aggregated Admin Stats
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      setIsUsersLoading(true);

      // Fetch users with different filters to compute accurate stats
      const [allRes, pendingMentorsRes, mentorsRes, studentsRes, blockedRes] =
        await Promise.all([
          axiosInstance.get("/users?limit=5"), // Top 5 recent
          axiosInstance.get("/users?role=MENTOR&status=PENDING&limit=1"),
          axiosInstance.get("/users?role=MENTOR&status=ACTIVE&limit=1"),
          axiosInstance.get("/users?role=STUDENT&status=ACTIVE&limit=1"),
          axiosInstance.get("/users?status=BLOCKED&includeDeleted=true&limit=1"),
        ]);

      setStats({
        totalUsers: allRes.data?.meta?.total || 0,
        pendingMentors: pendingMentorsRes.data?.meta?.total || 0,
        activeMentors: mentorsRes.data?.meta?.total || 0,
        activeStudents: studentsRes.data?.meta?.total || 0,
        blockedUsers: blockedRes.data?.meta?.total || 0,
      });

      if (allRes.data?.data) {
        setRecentUsers(allRes.data.data);
      }
    } catch (err: unknown) {
      console.error("Failed to load admin stats", err);
      toast.error("Failed to fetch dashboard metrics");
    } finally {
      setIsStatsLoading(false);
      setIsUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthChecking) {
      fetchDashboardData();
    }
  }, [isAuthChecking, fetchDashboardData]);

  // Quick Status Toggle Handler (Approve / Block)
  const handleQuickStatus = async (user: UserRecord, nextStatus: "ACTIVE" | "BLOCKED") => {
    try {
      await axiosInstance.patch(`/users/${user.id}/status`, { status: nextStatus });
      toast.success(`User status updated to ${nextStatus}!`);
      fetchDashboardData();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to update status");
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Verifying admin permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-100 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950/20 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2 border border-purple-200/50 dark:border-purple-900/50">
              <Crown className="w-3.5 h-3.5 text-purple-600" />
              Administrative Command Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Admin Overview
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Monitor platform metrics, approve instructor/mentor accounts, and manage system users.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="gap-2 border-zinc-200 dark:border-zinc-800"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingUser(null);
                setIsFormModalOpen(true);
              }}
              className="gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              <PlusCircle className="w-4 h-4" />
              Create User
            </Button>
          </div>
        </div>

        {/* Action Required: Pending Mentors Alert Banner */}
        {stats.pendingMentors > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 border border-amber-300 dark:border-amber-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                  <span>{stats.pendingMentors} Teacher / Mentor Accounts Pending Approval</span>
                  <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                    Action Required
                  </span>
                </h3>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/80 mt-0.5">
                  Newly registered mentors cannot log in until verified and activated by an administrator.
                </p>
              </div>
            </div>

            <Link href="/admin/pending-teachers">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs font-semibold shrink-0 cursor-pointer shadow-sm"
              >
                Review Applications
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}

        {/* High-Level StatCards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            variant="default"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Pending Mentors"
            value={stats.pendingMentors}
            icon={Clock}
            variant="pending"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Active Mentors"
            value={stats.activeMentors}
            icon={UserCheck}
            variant="approved"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Active Students"
            value={stats.activeStudents}
            icon={ShieldCheck}
            variant="approved"
            isLoading={isStatsLoading}
          />
          <StatCard
            title="Suspended / Blocked"
            value={stats.blockedUsers}
            icon={Ban}
            variant="rejected"
            isLoading={isStatsLoading}
          />
        </section>

        {/* Quick Shortcut Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link href="/admin/pending-teachers" className="group">
            <Card className="h-full border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700/60 transition-all bg-white/90 dark:bg-zinc-900/90">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
                  <UserCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-base flex items-center justify-between">
                  Pending Mentor Approvals
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-xs">
                  Inspect teacher credentials, verify email domains, and grant instant dashboard access.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/users" className="group">
            <Card className="h-full border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700/60 transition-all bg-white/90 dark:bg-zinc-900/90">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <Users className="w-5 h-5" />
                </div>
                <CardTitle className="text-base flex items-center justify-between">
                  User Management (CRUD)
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-xs">
                  Create, edit, search, filter, soft-delete, and restore user accounts across all roles.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/dashboard" className="group">
            <Card className="h-full border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/60 transition-all bg-white/90 dark:bg-zinc-900/90">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <CardTitle className="text-base flex items-center justify-between">
                  Mentor Submission Review
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </CardTitle>
                <CardDescription className="text-xs">
                  Jump directly to the project submission review feed to view student project deliverables.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Registered Users Table */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Recent User Registrations
              </CardTitle>
              <CardDescription>
                Latest accounts created or registered on the platform
              </CardDescription>
            </div>

            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                View All Users
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Quick Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isUsersLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : recentUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-zinc-500 text-sm">
                        No registered users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40">
                        <TableCell>
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</div>
                          <div className="text-xs text-zinc-500">{u.email}</div>
                        </TableCell>
                        <TableCell>
                          <UserRoleBadge role={u.role} />
                        </TableCell>
                        <TableCell>
                          <UserStatusBadge status={u.status} isDeleted={u.isDeleted} />
                        </TableCell>
                        <TableCell className="text-xs text-zinc-500">
                          {new Date(u.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2.5 text-xs gap-1"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setIsDetailsModalOpen(true);
                              }}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View
                            </Button>

                            {u.status === "PENDING" && (
                              <Button
                                size="sm"
                                className="h-8 px-2.5 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => handleQuickStatus(u, "ACTIVE")}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Approve
                              </Button>
                            )}

                            {u.status === "ACTIVE" && u.role !== "ADMIN" && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2.5 text-xs gap-1 text-zinc-600 hover:text-red-600 border-zinc-200"
                                onClick={() => handleQuickStatus(u, "BLOCKED")}
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Block
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Create / Edit User Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchDashboardData}
        editingUser={editingUser}
      />

      {/* User Details Modal */}
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
