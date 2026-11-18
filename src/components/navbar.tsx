"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Briefcase, Building2, Info, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();

  // If inside student or admin dashboard portal, dashboard provides its own custom layout
  if (pathname.startsWith("/student") || pathname.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { name: "Explore Jobs", href: "/jobs", icon: Briefcase },
    { name: "Recruiters", href: "/companies", icon: Building2 },
    { name: "About Placement Cell", href: "/about", icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              CampusConnect
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200/60">
                PIS
              </span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
              Placement Information System
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50/80"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-700">
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="gap-1.5 bg-blue-600 hover:bg-blue-700 shadow-sm">
              <UserPlus className="h-4 w-4" />
              <span>Student Register</span>
              <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
