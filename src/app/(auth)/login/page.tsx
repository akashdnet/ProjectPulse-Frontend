"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { decodeToken, setAuthToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 1. Zod Schema: Email must be valid, Password minimum 6 chars
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const fillCredentials = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
    setAccountNotice(null);
  };

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/login", values);

      // Support common backend response structures
      const token =
        res.data?.data?.accessToken ||
        res.data?.accessToken ||
        res.data?.data?.token ||
        res.data?.token;

      if (!token) {
        throw new Error("No authentication token received from server");
      }

      // Save token in localStorage and Cookies
      setAuthToken(token);

      // Decode token to determine user role
      const decoded = decodeToken(token);
      const role = (decoded?.role || "").toUpperCase();

      toast.success(res.data?.message || "Login successful! Welcome back.");

      // Role-based redirection
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "STUDENT") {
        router.push("/submit");
      } else if (role === "MENTOR") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            errorDetails?: string[] | string;
          };
        };
        message?: string;
      };

      const backendMessage = axiosError.response?.data?.message || "";

      if (axiosError.response?.status === 403) {
        // Pending mentor approval, suspended/blocked, or deactivated
        setAccountNotice(backendMessage || "Access forbidden. Your account may be pending approval or blocked.");
        toast.error(backendMessage || "Access forbidden. Your account is not currently active.");
      } else if (axiosError.response?.status === 401) {
        toast.error(
          backendMessage || "Invalid credentials. Please verify your email and password."
        );
      } else if (axiosError.response?.status === 404) {
        toast.error(
          backendMessage || "Account not found. Please register first."
        );
      } else {
        const rawMsg =
          backendMessage ||
          (Array.isArray(axiosError.response?.data?.errorDetails)
            ? axiosError.response.data.errorDetails.join(", ")
            : "");
        const errorMsg =
          rawMsg && rawMsg.length < 150 && !rawMsg.includes("prisma")
            ? rawMsg
            : "Server error: Backend database connection issue. Please verify backend environment.";
        toast.error(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-linear-to-br from-zinc-50 via-zinc-100 to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20">
      <div className="w-full max-w-md">
        {/* Branding header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/25 mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Project Pulse
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Student Submission & Mentor Review Portal
          </p>
        </div>

        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Welcome back</CardTitle>
            <CardDescription>
              Sign in with your email and password to access your portal
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Account Status Notice (e.g. Mentor Pending or Blocked) */}
              {accountNotice && (
                <div className="rounded-xl p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div className="flex-1">
                    <p className="font-semibold mb-0.5">Account Notice</p>
                    <p className="leading-relaxed">{accountNotice}</p>
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email" required>
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-9"
                    error={!!errors.email}
                    disabled={isLoading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" required>
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-10"
                    error={!!errors.password}
                    disabled={isLoading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                className="w-full gap-2 font-medium"
                isLoading={isLoading}
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Create one now
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Quick Demo Credentials Autofill */}
        <div className="mt-6 p-4 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            Quick Demo Autofill:
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials("superadmin@admin.com", "adminadmin")}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 hover:bg-purple-100 transition-colors cursor-pointer text-center"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("lead_mentor@example.com", "password123")}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 hover:bg-blue-100 transition-colors cursor-pointer text-center"
            >
              💼 Mentor
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("teststudent_auto@test.com", "password123")}
              className="px-2 py-1.5 text-[11px] font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 transition-colors cursor-pointer text-center"
            >
              🎓 Student
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
