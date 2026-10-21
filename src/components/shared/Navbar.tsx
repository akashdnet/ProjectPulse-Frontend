"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheck,
  LogOut,
  User,
  Users,
  UserCheck,
  LayoutDashboard,
  FolderGit2,
  Crown,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { getCurrentUser, removeAuthToken, DecodedToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const role = currentUser?.role?.toUpperCase() || "";
  const brandHref =
    role === "ADMIN"
      ? "/admin/dashboard"
      : role === "MENTOR"
      ? "/dashboard"
      : "/submit";

  const adminNavLinks = [
    { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/pending-teachers", label: "Pending Mentors", icon: UserCheck },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/dashboard", label: "Mentor Reviews", icon: FolderGit2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Left Nav */}
        <div className="flex items-center gap-6">
          <Link
            href={brandHref}
            className="flex items-center gap-2.5 group transition-transform active:scale-95 shrink-0"
          >
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-colors",
              role === "ADMIN"
                ? "bg-purple-600 shadow-purple-500/20 group-hover:bg-purple-700"
                : "bg-blue-600 shadow-blue-500/20 group-hover:bg-blue-700"
            )}>
              {role === "ADMIN" ? (
                <Crown className="w-5 h-5" />
              ) : (
                <ShieldCheck className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Project Pulse
                <span className={cn(
                  "text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full border",
                  role === "ADMIN"
                    ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200/60 dark:border-blue-800/60"
                )}>
                  {role === "ADMIN" ? "Admin" : "Portal"}
                </span>
              </span>
            </div>
          </Link>

          {/* Admin Navigation Menu */}
          {role === "ADMIN" && (
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-zinc-200 dark:border-zinc-800">
              {adminNavLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                      isActive
                        ? "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold",
                role === "ADMIN"
                  ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                  : role === "MENTOR"
                  ? "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              )}>
                {currentUser.name ? currentUser.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                  {currentUser.name || currentUser.email}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize flex items-center gap-1">
                  {role === "ADMIN" && <Crown className="w-2.5 h-2.5 text-purple-600" />}
                  {role === "MENTOR" && <Briefcase className="w-2.5 h-2.5 text-blue-600" />}
                  {role === "STUDENT" && <GraduationCap className="w-2.5 h-2.5 text-emerald-600" />}
                  {role ? role.toLowerCase() : "User"}
                </p>
              </div>
            </div>
          )}

          <Button
            id="logout-btn"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border-zinc-200 dark:border-zinc-800 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>

      {/* Mobile Admin Navigation Bar */}
      {role === "ADMIN" && (
        <div className="md:hidden border-t border-zinc-200/60 dark:border-zinc-800 px-4 py-2 flex items-center justify-around bg-zinc-50/50 dark:bg-zinc-900/50 text-xs">
          {adminNavLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1 py-1 px-2 rounded-md font-medium text-[11px]",
                  isActive
                    ? "bg-purple-100/70 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400"
                )}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}

export default Navbar;
