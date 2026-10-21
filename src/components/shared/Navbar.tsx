"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut, User, Sparkles } from "lucide-react";
import { getCurrentUser, removeAuthToken, DecodedToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link
          href={role === "MENTOR" ? "/dashboard" : "/submit"}
          className="flex items-center gap-2.5 group transition-transform active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              Project Pulse
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                Portal
              </span>
            </span>
          </div>
        </Link>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-zinc-200/60 dark:border-zinc-800">
              <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-semibold">
                {currentUser.name ? currentUser.name[0].toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="text-left text-xs">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                  {currentUser.name || currentUser.email}
                </p>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize">
                  {role ? role.toLowerCase() : "User"}
                </p>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 border-zinc-200 dark:border-zinc-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
