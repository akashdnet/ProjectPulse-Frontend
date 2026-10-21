"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
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
import { cn } from "@/lib/utils";

// 1. Zod Schema: Name, Email must be valid, Password minimum 6 chars, Role
const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters long"),
  role: z.enum(["STUDENT", "MENTOR"], {
    error: "Please select a valid role",
  }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "STUDENT",
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: SignupFormValues) => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.post("/auth/signup", values);

      toast.success(
        res.data?.message || "Account registered successfully! Please log in."
      );

      // Redirect to login page
      router.push("/login");
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

      if (axiosError.response?.status === 409) {
        toast.error(
          axiosError.response.data?.message || "An account with this email already exists."
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
            Create your account to get started
          </p>
        </div>

        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Get Started</CardTitle>
            <CardDescription>
              Join Project Pulse as a Student or Mentor
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit, (err) => console.error("Validation error:", err))}>
            <input type="hidden" {...register("role")} />
            <CardContent className="space-y-4">
              {/* Role selection tab pills */}
              <div className="space-y-2">
                <Label required>I am joining as a</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue("role", "STUDENT", { shouldValidate: true })}
                    className={cn(
                      "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                      selectedRole === "STUDENT"
                        ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-semibold"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <GraduationCap className="w-4 h-4" />
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("role", "MENTOR", { shouldValidate: true })}
                    className={cn(
                      "flex items-center justify-center gap-2 p-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                      selectedRole === "MENTOR"
                        ? "border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 font-semibold"
                        : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}
                  >
                    <Briefcase className="w-4 h-4" />
                    Mentor
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-9"
                    error={!!errors.name}
                    disabled={isLoading}
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Address */}
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

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" required>
                  Password (min. 6 characters)
                </Label>
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
                Create Account
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
