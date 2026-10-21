"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  FolderGit2,
  GitBranch,
  Globe,
  FileText,
  Send,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { isAuthenticated, getUserRole } from "@/lib/auth";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// 1. Zod Validation Schema
const submissionSchema = z.object({
  projectName: z
    .string()
    .min(3, "Project name must be at least 3 characters long"),
  repoUrl: z
    .string()
    .min(1, "Repository URL is required")
    .url("Please enter a valid URL (e.g. https://github.com/user/project)"),
  liveLink: z
    .string()
    .min(1, "Live link is required")
    .url("Please enter a valid URL (e.g. https://project.vercel.app)"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters long"),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

export default function SubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Client-side authentication & role check
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error("Please login to access the submission portal");
      router.push("/login");
      return;
    }

    const role = getUserRole();
    if (role && role.toUpperCase() === "MENTOR") {
      router.push("/dashboard");
      return;
    }

    setIsAuthChecking(false);
  }, [router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      projectName: "",
      repoUrl: "",
      liveLink: "",
      description: "",
    },
  });

  const onSubmit = async (values: SubmissionFormValues) => {
    try {
      setIsSubmitting(true);
      const res = await axiosInstance.post("/submissions", values);

      toast.success(
        res.data?.message || "Project submitted successfully for mentor review!"
      );

      // Reset form upon successful submission
      reset();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: {
          status?: number;
          data?: {
            message?: string;
            errorDetails?: string[] | { message: string }[];
          };
        };
        message?: string;
      };

      if (axiosError.response?.status === 409) {
        toast.error("You have already submitted this repository");
      } else if (axiosError.response?.status === 401) {
        toast.error("Session expired. Please log in again.");
        router.push("/login");
      } else if (axiosError.response?.status === 429) {
        toast.error("Too many submissions. Please wait a moment before trying again.");
      } else {
        const rawMsg =
          axiosError.response?.data?.message ||
          (Array.isArray(axiosError.response?.data?.errorDetails)
            ? axiosError.response.data.errorDetails
                .map((d) => (typeof d === "string" ? d : d.message))
                .join(", ")
            : "");
        toast.error(rawMsg || "Failed to submit project. Please verify inputs.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-zinc-500 font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-zinc-50 via-zinc-100 to-blue-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-blue-950/20 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3 border border-blue-200/50 dark:border-blue-900/50">
            <Sparkles className="w-3.5 h-3.5" />
            Student Submission Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-4xl">
            Submit Your Project
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            Submit your GitHub repository and live deployment link for mentor review and grading.
          </p>
        </div>

        {/* Submission Card */}
        <Card className="border border-zinc-200/80 dark:border-zinc-800 shadow-xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Project Details</CardTitle>
            <CardDescription>
              All fields are required. Please ensure the repository is public and the live link is accessible.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-5">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName" required>
                  Project Name
                </Label>
                <div className="relative">
                  <FolderGit2 className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="projectName"
                    type="text"
                    placeholder="e.g. E-Commerce Platform"
                    className="pl-9"
                    error={!!errors.projectName}
                    disabled={isSubmitting}
                    {...register("projectName")}
                  />
                </div>
                {errors.projectName && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.projectName.message}
                  </p>
                )}
              </div>

              {/* GitHub Repository URL */}
              <div className="space-y-2">
                <Label htmlFor="repoUrl" required>
                  GitHub Repository URL
                </Label>
                <div className="relative">
                  <GitBranch className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder="https://github.com/username/project"
                    className="pl-9"
                    error={!!errors.repoUrl}
                    disabled={isSubmitting}
                    {...register("repoUrl")}
                  />
                </div>
                {errors.repoUrl && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.repoUrl.message}
                  </p>
                )}
              </div>

              {/* Live Deployment Link */}
              <div className="space-y-2">
                <Label htmlFor="liveLink" required>
                  Live Deployment URL
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    id="liveLink"
                    type="url"
                    placeholder="https://my-project.vercel.app"
                    className="pl-9"
                    error={!!errors.liveLink}
                    disabled={isSubmitting}
                    {...register("liveLink")}
                  />
                </div>
                {errors.liveLink && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.liveLink.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" required>
                  Project Description
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Textarea
                    id="description"
                    placeholder="Briefly describe features, tech stack used, and key challenges solved (min 10 characters)..."
                    className="pl-9 min-h-30"
                    error={!!errors.description}
                    disabled={isSubmitting}
                    {...register("description")}
                  />
                </div>
                {errors.description && (
                  <p className="text-xs text-red-500 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>

              {/* Info Notice */}
              <div className="rounded-xl p-3.5 bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300">
                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  Once submitted, mentors will review your code quality, architecture, and live application. You cannot submit the same repository link twice.
                </span>
              </div>
            </CardContent>

            <CardFooter className="pt-2">
              <Button
                type="submit"
                className="w-full gap-2 font-medium"
                isLoading={isSubmitting}
              >
                Submit for Review
                <Send className="w-4 h-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
