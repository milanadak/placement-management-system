"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  FileCheck,
  Calendar,
  Bell,
  Download,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      toast.success("Administrator session closed.");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const navItems = [
    { name: "Executive Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Student Records", href: "/admin/students", icon: Users },
    { name: "Corporate Recruiters", href: "/admin/companies", icon: Building2 },
    { name: "Job Postings & Drives", href: "/admin/jobs", icon: Briefcase },
    { name: "Applications Hub", href: "/admin/applications", icon: FileCheck },
    { name: "Interview Management", href: "/admin/interviews", icon: Calendar },
    { name: "Announcements", href: "/admin/announcements", icon: Bell },
    { name: "Export & Audit Reports", href: "/admin/reports", icon: Download },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white border-b border-slate-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="font-bold text-base">CampusConnect Admin</span>
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
        {/* Brand */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                CampusConnect
              </div>
              <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>Admin Console</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Administrator Badge */}
        <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-800/70 border border-slate-700/60">
          <div className="text-xs font-semibold text-white">Dr. Rajeshwar Rao</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Head, Training &amp; Placement</div>
          <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px]">
            <Badge variant="success" className="text-[10px] px-1.5 py-0">Online</Badge>
            <span className="text-slate-400 font-mono">T&amp;P Block IV</span>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Operations Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
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
            <span>Public University Portal</span>
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

      {/* Main Content View */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Admin Console</span>
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-900 capitalize">
              {pathname.replace("/admin/", "").replace("-", " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/reports">
              <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                <Download className="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </Button>
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
