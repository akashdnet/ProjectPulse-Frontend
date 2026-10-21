"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { X, UserPlus, Edit3, ShieldAlert, Lock, Mail, User } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "MENTOR" | "ADMIN";
  status: "ACTIVE" | "PENDING" | "BLOCKED";
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser?: UserRecord | null;
}

const userFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  role: z.enum(["STUDENT", "MENTOR", "ADMIN"]),
  status: z.enum(["ACTIVE", "PENDING", "BLOCKED"]),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export function UserFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingUser,
}: UserFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!editingUser;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        role: editingUser.role,
        status: editingUser.status,
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        role: "STUDENT",
        status: "ACTIVE",
      });
    }
  }, [editingUser, reset]);

  if (!isOpen) return null;

  const onSubmit = async (values: UserFormValues) => {
    // If creating, password is required min 6 characters
    if (!isEditing && (!values.password || values.password.length < 6)) {
      toast.error("Password is required and must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: Record<string, unknown> = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
      };

      if (values.password && values.password.trim().length > 0) {
        if (values.password.length < 6) {
          toast.error("Password must be at least 6 characters");
          setIsSubmitting(false);
          return;
        }
        payload.password = values.password;
      }

      if (isEditing && editingUser) {
        const res = await axiosInstance.patch(`/users/${editingUser.id}`, payload);
        toast.success(res.data?.message || "User updated successfully!");
      } else {
        const res = await axiosInstance.post("/users", payload);
        toast.success(res.data?.message || "User created successfully!");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: { message?: string; errorDetails?: string[] | string };
        };
      };
      const rawMsg =
        axiosError.response?.data?.message ||
        (Array.isArray(axiosError.response?.data?.errorDetails)
          ? axiosError.response.data.errorDetails.join(", ")
          : "");
      toast.error(rawMsg || "Failed to save user. Please check the fields.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              {isEditing ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {isEditing ? `Edit User: ${editingUser.name}` : "Create New User"}
              </h2>
              <p className="text-xs text-zinc-500">
                {isEditing ? "Update account credentials and authorization status" : "Add a new student, mentor, or admin account"}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="form-name" required>
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                  id="form-name"
                  placeholder="e.g. Sarah Connor"
                  className="pl-9"
                  error={!!errors.name}
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <Label htmlFor="form-email" required>
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                  id="form-email"
                  type="email"
                  placeholder="user@example.com"
                  className="pl-9"
                  error={!!errors.email}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="form-password" required={!isEditing}>
                Password {isEditing && <span className="text-xs text-zinc-400 font-normal">(Leave blank to keep unchanged)</span>}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                <Input
                  id="form-password"
                  type="password"
                  placeholder={isEditing ? "•••••••• (Unchanged)" : "Min. 6 characters"}
                  className="pl-9"
                  error={!!errors.password}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Role & Status Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Role */}
              <div className="space-y-1.5">
                <Label htmlFor="form-role" required>
                  User Role
                </Label>
                <select
                  id="form-role"
                  className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer"
                  {...register("role")}
                >
                  <option value="STUDENT">STUDENT</option>
                  <option value="MENTOR">MENTOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <Label htmlFor="form-status" required>
                  Account Status
                </Label>
                <select
                  id="form-status"
                  className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs cursor-pointer"
                  {...register("status")}
                >
                  <option value="ACTIVE">ACTIVE (Full Access)</option>
                  <option value="PENDING">PENDING (Awaiting Approval)</option>
                  <option value="BLOCKED">BLOCKED (Access Denied)</option>
                </select>
              </div>
            </div>

            {isEditing && editingUser.email === "superadmin@admin.com" && (
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 flex items-start gap-2 text-xs text-purple-900 dark:text-purple-300">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
                <span>
                  This is the Primary Super Admin account. Deletion is restricted for system safety.
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              {isEditing ? "Save Changes" : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
