"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

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
      if (role === "STUDENT") {
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

      if (axiosError.response?.status === 401) {
        toast.error(
          axiosError.response.data?.message || "Invalid credentials. Please verify your email and password."
        );
      } else if (axiosError.response?.status === 404) {
        toast.error(
          axiosError.response.data?.message || "Account not found. Please register first."
        );
      } else {
        const rawMsg =
          axiosError.response?.data?.message ||
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
      </div>
    </main>
  );
}
