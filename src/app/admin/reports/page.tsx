import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  Sparkles,
  Briefcase,
  Award,
  Layers
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") redirect("/login");

  const [studentCount, jobCount, applicationCount, selectedCount] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.job.count(),
    prisma.application.count(),
    prisma.application.count({ where: { status: "Selected" } })
  ]);

  const reports = [
    {
      title: "Student Census & Academic Directory",
      desc: "Full roster including Roll Numbers, engineering branch, verified CGPAs, contact numbers, skills, and current placement outcome.",
      countBadge: `${studentCount} Students`,
      href: "/api/admin/reports?type=students",
      color: "bg-blue-50 text-blue-600",
      icon: FileSpreadsheet,
      buttonText: "Export Students Directory (CSV)"
    },
    {
      title: "Recruitment & Selection Audit Log",
      desc: "Complete chronological log of every application submitted, company, package, screening stage, and candidate outcome.",
      countBadge: `${applicationCount} Applications`,
      href: "/api/admin/reports?type=applications",
      color: "bg-emerald-50 text-emerald-600",
      icon: ShieldCheck,
      buttonText: "Export Applications Audit (CSV)"
    },
    {
      title: "Campus Drives & Job Postings Catalog",
      desc: "Comprehensive register of visiting recruiters, offered roles, CTC compensation tiers, eligibility rules, and applicant counts.",
      countBadge: `${jobCount} Drives`,
      href: "/api/admin/reports?type=jobs",
      color: "bg-purple-50 text-purple-600",
      icon: Briefcase,
      buttonText: "Export Drives Catalog (CSV)"
    },
    {
      title: "Placed Candidates Honor Roll",
      desc: "Official list of all candidates with confirmed job offers, hiring partner names, designations, and offered salary packages.",
      countBadge: `${selectedCount} Offers`,
      href: "/api/admin/reports?type=placed",
      color: "bg-amber-50 text-amber-600",
      icon: Award,
      buttonText: "Export Placed Honor Roll (CSV)"
    },
    {
      title: "Department-wise Placement Summary",
      desc: "Institutional summary table aggregating total enrollment, placed candidate count, and percentage conversion per department.",
      countBadge: "6 Departments",
      href: "/api/admin/reports?type=departments",
      color: "bg-cyan-50 text-cyan-600",
      icon: Layers,
      buttonText: "Export Branch Summary (CSV)"
    }
  ];

  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Audit &amp; Accreditation Reporting Hub
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Export standardized CSV reports for college management, university accreditation, and placement audit compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((r, idx) => {
          const Icon = r.icon;
          return (
            <Card key={idx} className="border-slate-200 hover:shadow-md transition flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${r.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {r.countBadge}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900">{r.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed text-slate-500">
                  {r.desc}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <a href={r.href} target="_blank" rel="noreferrer" className="block">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 gap-2 text-xs font-semibold h-9">
                    <Download className="h-4 w-4" />
                    <span>{r.buttonText}</span>
                  </Button>
                </a>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Compliance Box */}
      <Card className="border-slate-200 bg-slate-900 text-white">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">Accreditation Data Standard Compliant</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All generated reports follow the standardized criteria required for official NIRF, NAAC, and NBA university accreditation data filings. All records are backed by the relational database with unique application keys and academic timestamps.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
            <span>Total Recruiter Drives: {jobCount}</span>
            <span>Total Applications: {applicationCount}</span>
            <span>Total Confirmed Offers: {selectedCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
