import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Download, FileText, CheckCircle2, ShieldCheck, Database, FileSpreadsheet, Sparkles } from "lucide-react";
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

  return (
    <div className="space-y-8">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Audit &amp; Accreditation Reporting
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Export standardized CSV reports for college management, university accreditation, and placement compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report 1: Students Master Directory */}
        <Card className="border-slate-200 hover:shadow-md transition">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="text-xs font-mono">
                {studentCount} Records
              </Badge>
            </div>
            <CardTitle className="text-lg">Student Master Dossier Report</CardTitle>
            <CardDescription className="text-xs">
              Complete student census including University Roll Numbers, engineering branch, verified CGPA, contact numbers, technical skill tags, total applications, and current placed outcome.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Included Columns:</div>
              <div className="text-[11px] text-slate-500">
                Roll Number, Full Name, Email, Department, CGPA, Graduation Year, Phone, Skills, Total Applications, Placed Status
              </div>
            </div>

            <a
              href="/api/admin/reports?type=students"
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2 text-xs">
                <Download className="h-4 w-4" />
                <span>Export Students Directory (CSV)</span>
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Report 2: Placements & Applications Audit */}
        <Card className="border-slate-200 hover:shadow-md transition">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <Badge variant="success" className="text-xs font-mono">
                {applicationCount} Applications
              </Badge>
            </div>
            <CardTitle className="text-lg">Recruitment &amp; Selection Audit</CardTitle>
            <CardDescription className="text-xs">
              Detailed breakdown of every application submitted, corporate recruiter partner, role offered, CTC compensation package, submission timestamp, and candidate outcome status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">Included Columns:</div>
              <div className="text-[11px] text-slate-500">
                Application ID, Student Name, Roll No, Department, CGPA, Company, Job Title, Package, Status, Applied Date
              </div>
            </div>

            <a
              href="/api/admin/reports?type=applications"
              target="_blank"
              rel="noreferrer"
              className="block"
            >
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2 text-xs">
                <Download className="h-4 w-4" />
                <span>Export Placements Audit Report (CSV)</span>
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Information Box */}
      <Card className="border-slate-200 bg-slate-900 text-white">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h3 className="font-bold text-base text-white">University Accreditation Ready</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All generated reports follow the standardized criteria for official NIRF, NAAC, and NBA college accreditation data filings. All records are backed by the relational database with unique application keys and academic timestamps.
          </p>
          <div className="flex items-center gap-6 text-xs text-slate-400 pt-2 border-t border-slate-800 font-mono">
            <span>Total Recruiter Drives: {jobCount}</span>
            <span>Total Applications: {applicationCount}</span>
            <span>Total Confirmed Offers: {selectedCount}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
