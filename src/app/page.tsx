import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Award,
  Users,
  Search,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Sparkles,
  FileCheck,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const stats = [
    { label: "Placement Rate", value: "94.8%", sub: "Academic Year 2025-26", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
    { label: "Highest Package", value: "₹45.0 LPA", sub: "Offered by Microsoft & Google", icon: Award, color: "text-amber-600 bg-amber-50" },
    { label: "Average Package", value: "₹9.2 LPA", sub: "Across All Engineering Depts", icon: Sparkles, color: "text-blue-600 bg-blue-50" },
    { label: "Hiring Partners", value: "150+", sub: "Tier-1 Tech & Fortune 500", icon: Building2, color: "text-purple-600 bg-purple-50" },
  ];

  const featuredCompanies = [
    { name: "Google", role: "Software Engineer", stipend: "₹42 LPA", tags: ["CSE", "IT", "DS"], logo: "G" },
    { name: "Microsoft", role: "Cloud Solutions Eng.", stipend: "₹45 LPA", tags: ["CSE", "ECE", "IT"], logo: "M" },
    { name: "Amazon", role: "SDE - I", stipend: "₹38 LPA", tags: ["All Branches"], logo: "A" },
    { name: "Deloitte", role: "Technology Analyst", stipend: "₹10 LPA", tags: ["Circuital"], logo: "D" },
    { name: "Texas Instruments", role: "Embedded Systems Eng.", stipend: "₹24 LPA", tags: ["ECE", "EE"], logo: "TI" },
    { name: "Tata Consultancy Services", role: "Digital Innovator", stipend: "₹9 LPA", tags: ["All Branches"], logo: "TCS" },
  ];

  const features = [
    {
      icon: FileCheck,
      title: "Smart Eligibility Verification",
      description: "Immediate automated evaluation against minimum CGPA, specific departments, and graduation batch rules before submission."
    },
    {
      icon: Calendar,
      title: "Live Interview Pipeline",
      description: "Direct view of scheduled technical rounds, coding tests, HR discussions, and virtual meeting links."
    },
    {
      icon: ShieldAlert,
      title: "Zero Duplicate Applications",
      description: "Guaranteed single-entry validation prevents spam while providing transparent application status updates."
    },
    {
      icon: TrendingUp,
      title: "Administrative Analytics",
      description: "Placement officers get dynamic visual analytics, branch-wise statistics, and single-click CSV reporting."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-slate-50 to-white pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/60">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold mb-6 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Campus Placement Season 2025–2026 is Live</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Connecting Students With{" "}
              <span className="text-blue-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Career Opportunities
              </span>
            </h1>

            {/* Subtext */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed font-normal">
              CampusConnect is the premier Placement Information System for our university. Explore verified openings, check academic eligibility automatically, and track recruitment rounds in real-time.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-base">
                  <GraduationCap className="h-5 w-5" />
                  Student Portal Access
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-slate-300 hover:bg-slate-100 text-base">
                  <Building2 className="h-5 w-5 text-slate-600" />
                  Administrator Login
                </Button>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 w-full flex flex-wrap justify-center items-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Automated CGPA & Dept Eligibility</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Verified Recruiter Direct Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Real-Time Status Notifications</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg hover:border-slate-200 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-slate-600">{s.label}</span>
                    <div className={`p-2.5 rounded-xl ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{s.value}</div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{s.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Features Overview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs uppercase tracking-widest text-blue-600 font-bold mb-2">
              End-to-End System
            </h2>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Designed For High-Stakes Campus Drives
            </h3>
            <p className="mt-3 text-slate-600 text-sm md:text-base">
              Eliminating spreadsheet chaos and manual screening through rule-based automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{f.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs Preview */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 mb-2">
                <Briefcase className="h-3.5 w-3.5" />
                <span>Featured Openings</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
                Current Opportunities On Campus
              </h3>
            </div>
            <Link href="/jobs">
              <Button variant="outline" className="gap-2 text-slate-700">
                View All 12+ Openings
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCompanies.map((job, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      {job.logo}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{job.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">On-Campus Recruitment</p>
                    </div>
                  </div>
                  <Badge variant="success" className="font-mono text-xs font-semibold">
                    {job.stipend}
                  </Badge>
                </div>

                <h5 className="font-semibold text-slate-800 text-sm mb-3">
                  {job.role}
                </h5>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {job.tags.map((t, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Min CGPA: 7.5+</span>
                  <Link href="/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    Details & Apply <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Decision Cards */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Card */}
            <div className="rounded-2xl bg-white p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">For Enrolled Students</h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Create your placement profile, upload your resume, automatically assess your eligibility for campus drives, and manage scheduled interview rounds.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Upload resume with format and size validation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>1-click application with instant eligibility checking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Live interview call letters and announcements</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Link href="/register" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Register as Student</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
              </div>
            </div>

            {/* Admin Card */}
            <div className="rounded-2xl bg-slate-900 text-white p-8 border border-slate-800 shadow-md flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center mb-6">
                  <Building2 className="h-7 w-7" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">For Placement Cell Admins</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Manage recruiting companies, publish job criteria, review candidate profiles, coordinate interview stages, and generate placement audit reports.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Real-time placement analytics and charts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Bulk candidate shortlisting and interview scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>Export audit-ready CSV reports for college accreditation</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Link href="/login" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                    Administrator Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
