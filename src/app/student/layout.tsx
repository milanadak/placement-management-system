"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Briefcase,
  FileCheck,
  Calendar,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentUser, setStudentUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setStudentUser(data.user);
        }
      })
      .catch(() => {});

    fetch("/api/student/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data?.unreadCount === "number") {
          setUnreadNotifications(data.unreadCount);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Signed out successfully.");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
    { name: "Explore Jobs", href: "/student/jobs", icon: Briefcase },
    { name: "My Applications", href: "/student/applications", icon: FileCheck },
    { name: "Interview Schedule", href: "/student/interviews", icon: Calendar },
    { name: "Notifications", href: "/student/notifications", icon: Bell, badge: unreadNotifications },
    { name: "Announcements", href: "/student/announcements", icon: Sparkles },
    { name: "My Profile", href: "/student/profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
        <Link href="/student/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-base">CampusConnect</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col md:min-h-screen ${
          mobileOpen ? "translate-x-0" : "-translate-x-0 hidden md:flex"
        }`}
      >
        {/* Sidebar Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/student/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                CampusConnect
              </div>
              <div className="text-[11px] text-blue-400 font-medium">Student Portal</div>
            </div>
          </Link>
        </div>

        {/* Student Profile Quick View */}
        {studentUser && (
          <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
            <div className="text-xs font-semibold text-white truncate">{studentUser.name}</div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {studentUser.studentProfile?.rollNo || "Roll No Pending"}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50 text-[11px]">
              <span className="text-slate-400">{studentUser.studentProfile?.department?.split(" ")[0]}</span>
              <span className="font-bold text-emerald-400">CGPA: {studentUser.studentProfile?.cgpa?.toFixed(2) || "0.00"}</span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Student Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Public Campus Portal</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Student Portal</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900 capitalize">
              {pathname.replace("/student/", "").replace("-", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/student/notifications">
              <Button variant="ghost" size="icon" className="relative text-slate-600 hover:text-slate-900">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                )}
              </Button>
            </Link>
            <Link href="/student/profile">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                {studentUser?.name ? studentUser.name[0] : "S"}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
