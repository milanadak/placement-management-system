"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Mail, Phone, MapPin, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/student") || pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand & Bio */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="font-bold text-lg text-slate-900">CampusConnect</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Official Placement Information System bridging collegiate talent with leading multinational corporations and innovative startups.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              College Examination Capstone Project
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/jobs" className="hover:text-blue-600 transition">
                  Browse Job Openings
                </Link>
              </li>
              <li>
                <Link href="/companies" className="hover:text-blue-600 transition">
                  Hiring Partners
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-blue-600 transition">
                  Placement Cell Statistics
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Students & Recruiters */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Portals
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/register" className="hover:text-blue-600 transition">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-blue-600 transition">
                  Administrator Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs">Interview Guidelines & Policy</span>
              </li>
              <li>
                <span className="text-slate-400 text-xs">Resume Format Rules</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Placement Cell Desk
            </h4>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                <span>Training & Placement Cell, Academic Block IV, Campus Center</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                <span>placements@campusconnect.edu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusConnect (Placement Information System). All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for Academic Innovation & Excellence
          </p>
        </div>
      </div>
    </footer>
  );
}
