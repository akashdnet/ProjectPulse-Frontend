"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  RefreshCw,
  Edit,
  Trash2,
  RotateCcw,
  Eye,
  CheckCircle2,
  Ban,
  Clock,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
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

export default function AdminUsersCrudPage() {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Users data state
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Action loading state
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // 1. Auth Guard
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please login to access the admin portal");
      router.push("/login");
      return;
    }

    const role = getUserRole();
    if (role?.toUpperCase() !== "ADMIN") {
      toast.error("Admin permissions required");
      router.push(role?.toUpperCase() === "MENTOR" ? "/dashboard" : "/submit");
      return;
    }

    setIsAuthChecking(false);
  }, [router]);

  // 2. Fetch Users with Filters & Pagination
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string | number | boolean> = {
        page,
        limit,
      };

      if (roleFilter !== "ALL") params.role = roleFilter;
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (includeDeleted) params.includeDeleted = "true";
      if (searchTerm.trim().length > 0) params.searchTerm = searchTerm.trim();

      const res = await axiosInstance.get("/users", { params });

      if (res.data?.data) {
        setUsers(res.data.data);
      }
      if (res.data?.meta) {
        setTotalCount(res.data.meta.total || 0);
        setTotalPages(res.data.meta.totalPages || 1);
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, roleFilter, statusFilter, includeDeleted, searchTerm]);

  useEffect(() => {
    if (!isAuthChecking) {
      fetchUsers();
    }
  }, [isAuthChecking, fetchUsers]);

  // Soft Delete User
  const handleSoftDelete = async (user: UserRecord) => {
    if (user.email === "superadmin@admin.com") {
      toast.error("Cannot delete the primary Super Admin account!");
      return;
    }

    if (!confirm(`Are you sure you want to soft-delete user "${user.name}"? The account will be deactivated.`)) {
      return;
    }

    try {
      setActionLoadingId(user.id);
      const res = await axiosInstance.delete(`/users/${user.id}`);
      toast.success(res.data?.message || "User soft-deleted successfully!");
      fetchUsers();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Restore User
  const handleRestoreUser = async (user: UserRecord) => {
    try {
      setActionLoadingId(user.id);
      const res = await axiosInstance.patch(`/users/${user.id}/restore`);
      toast.success(res.data?.message || "User restored successfully!");
      fetchUsers();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to restore user");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Quick Status Update
  const handleStatusUpdate = async (user: UserRecord, status: "ACTIVE" | "PENDING" | "BLOCKED") => {
    try {
      setActionLoadingId(user.id);
      const res = await axiosInstance.patch(`/users/${user.id}/status`, { status });
      toast.success(res.data?.message || `Status updated to ${status}`);
      fetchUsers();
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoadingId(null);
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
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-100 to-purple-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950/20 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2 border border-purple-200/50 dark:border-purple-900/50">
              <Users className="w-3.5 h-3.5" />
              User Management
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              User Directory & CRUD
            </h1>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Create, edit, inspect, deactivate, and restore user profiles across all roles and permission levels.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchUsers}
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
              Add New User
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-sm bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
          <CardContent className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Search */}
              <div className="sm:col-span-5 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                  placeholder="Search by name or email address..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 h-10"
                />
              </div>

              {/* Role Filter */}
              <div className="sm:col-span-3">
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Student Only</option>
                  <option value="MENTOR">Mentor Only</option>
                  <option value="ADMIN">Admin Only</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="sm:col-span-4">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Accounts</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="BLOCKED">Blocked Accounts</option>
                </select>
              </div>
            </div>

            {/* Toggle Include Deleted */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
              <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeDeleted}
                  onChange={(e) => {
                    setIncludeDeleted(e.target.checked);
                    setPage(1);
                  }}
                  className="rounded border-zinc-300 dark:border-zinc-700 text-purple-600 focus:ring-purple-500 h-4 w-4 cursor-pointer"
                />
                <span>Include soft-deleted / deactivated accounts</span>
              </label>

              <div className="text-zinc-500">
                Found <span className="font-semibold text-zinc-900 dark:text-zinc-100">{totalCount}</span> registered users
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <Skeleton className="h-5 w-36" />
                          <Skeleton className="h-3.5 w-44 mt-1.5" />
                        </TableCell>
                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-44 ml-auto rounded-lg" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <div className="flex flex-col items-center justify-center text-zinc-500">
                          <Users className="w-10 h-10 stroke-1 text-zinc-400 mb-2" />
                          <p className="font-semibold text-sm">No users found</p>
                          <p className="text-xs text-zinc-400 mt-0.5">
                            Try adjusting your search criteria or role filters.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((u) => {
                      const isRowLoading = actionLoadingId === u.id;

                      return (
                        <TableRow
                          key={u.id}
                          className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 ${
                            u.isDeleted ? "opacity-60 bg-red-50/20 dark:bg-red-950/10" : ""
                          }`}
                        >
                          {/* Name & Email */}
                          <TableCell>
                            <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                              {u.name}
                              {u.email === "superadmin@admin.com" && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded">
                                  Primary SuperAdmin
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-zinc-500">{u.email}</div>
                          </TableCell>

                          {/* Role */}
                          <TableCell>
                            <UserRoleBadge role={u.role} />
                          </TableCell>

                          {/* Status */}
                          <TableCell>
                            <UserStatusBadge status={u.status} isDeleted={u.isDeleted} />
                          </TableCell>

                          {/* Created Date */}
                          <TableCell className="text-xs text-zinc-500">
                            {new Date(u.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* View Details */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs text-zinc-600 hover:text-zinc-900"
                                onClick={() => {
                                  setSelectedUserId(u.id);
                                  setIsDetailsModalOpen(true);
                                }}
                                title="View User Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>

                              {/* Edit User */}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs text-blue-600 hover:text-blue-700"
                                onClick={() => {
                                  setEditingUser(u);
                                  setIsFormModalOpen(true);
                                }}
                                title="Edit User Credentials"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>

                              {/* Status Quick Actions */}
                              {u.status === "PENDING" && (
                                <Button
                                  size="sm"
                                  disabled={isRowLoading}
                                  className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                                  onClick={() => handleStatusUpdate(u, "ACTIVE")}
                                  title="Approve User"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Approve
                                </Button>
                              )}

                              {u.status === "ACTIVE" && u.role !== "ADMIN" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isRowLoading}
                                  className="h-8 px-2 text-xs text-amber-600 hover:text-amber-700"
                                  onClick={() => handleStatusUpdate(u, "BLOCKED")}
                                  title="Suspend Account"
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                </Button>
                              )}

                              {u.status === "BLOCKED" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isRowLoading}
                                  className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700"
                                  onClick={() => handleStatusUpdate(u, "ACTIVE")}
                                  title="Reactivate Account"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </Button>
                              )}

                              {/* Soft Delete or Restore */}
                              {u.isDeleted ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isRowLoading}
                                  className="h-8 px-2 text-xs text-emerald-600 hover:text-emerald-700 border-emerald-200"
                                  onClick={() => handleRestoreUser(u)}
                                  title="Restore Deleted User"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </Button>
                              ) : (
                                u.email !== "superadmin@admin.com" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isRowLoading}
                                    className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-zinc-200 dark:border-zinc-800"
                                    onClick={() => handleSoftDelete(u)}
                                    title="Soft-Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500">
              <div>
                Page <span className="font-semibold text-zinc-800 dark:text-zinc-200">{page}</span> of{" "}
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{totalPages}</span> ({totalCount} total users)
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
          </CardContent>
        </Card>
      </main>

      {/* Form Modal */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchUsers}
        editingUser={editingUser}
      />

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
