import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Users,
  Building2,
  Briefcase,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  Download,
  Calendar,
  ArrowRight,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DepartmentPlacementChart, ApplicationStatusPieChart } from "@/components/admin/dashboard-charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") redirect("/login");

  // Parallel fetching of analytics
  const [
    totalStudents,
    totalCompanies,
    activeJobs,
    totalApplications,
    selectedApplications,
    studentsWithProfiles,
    applicationsList,
    recentApplications
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.company.count(),
    prisma.job.count({ where: { isActive: true } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "Selected" } }),
    prisma.studentProfile.findMany({
      include: {
        user: {
          include: {
            applications: true
          }
        }
      }
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { id: true }
    }),
    prisma.application.findMany({
      take: 6,
      orderBy: { appliedAt: "desc" },
      include: {
        student: { include: { studentProfile: true } },
        job: { include: { company: true } }
      }
    })
  ]);

  // Unique placed students count
  const placedUserIds = new Set(
    studentsWithProfiles
      .filter(p => p.user.applications.some(a => a.status === "Selected"))
      .map(p => p.userId)
  );
  const uniquePlacedCount = placedUserIds.size;
  const placementRate = totalStudents > 0 ? ((uniquePlacedCount / totalStudents) * 100).toFixed(1) : "0.0";

  // Branch-wise aggregation
  const deptCounts: Record<string, { total: number; placed: number }> = {
    "CSE": { total: 0, placed: 0 },
    "IT": { total: 0, placed: 0 },
    "Data Sci": { total: 0, placed: 0 },
    "ECE": { total: 0, placed: 0 },
    "EE": { total: 0, placed: 0 },
    "ME": { total: 0, placed: 0 },
  };

  studentsWithProfiles.forEach(sp => {
    let key = "Other";
    const d = sp.department.toLowerCase();
    if (d.includes("computer")) key = "CSE";
    else if (d.includes("information")) key = "IT";
    else if (d.includes("data")) key = "Data Sci";
    else if (d.includes("electronics")) key = "ECE";
    else if (d.includes("electrical")) key = "EE";
    else if (d.includes("mechanical")) key = "ME";

    if (deptCounts[key]) {
      deptCounts[key].total += 1;
      if (placedUserIds.has(sp.userId)) {
        deptCounts[key].placed += 1;
      }
    }
  });

  const departmentChartData = Object.entries(deptCounts).map(([department, val]) => ({
    department,
    students: val.total,
    placed: val.placed
  }));

  const applicationStatusData = applicationsList.map(a => ({
    name: a.status,
    value: a._count.id
  }));

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200/60">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Academic Year 2025-2026 Live Recruitment Cycle</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Placement Operations &amp; Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time metrics, corporate recruitment drives, and student placement pipeline.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/admin/jobs">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5">
              <Briefcase className="h-3.5 w-3.5" />
              <span>Post New Drive</span>
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button size="sm" variant="outline" className="text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" />
              <span>Audit Reports</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Students</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalStudents}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Enrolled candidates</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Recruiters</span>
            <Building2 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalCompanies}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Corporate partners</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Active Jobs</span>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{activeJobs}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Live campus drives</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Applications</span>
            <FileCheck className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalApplications}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Submitted entries</p>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Placed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{uniquePlacedCount}</div>
          <p className="text-[10px] text-slate-500 mt-0.5">Offers confirmed</p>
        </Card>

        <Card className="p-4 border-blue-200 bg-blue-50/50">
          <div className="text-blue-700 text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
            <span>Placement %</span>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2">{placementRate}%</div>
          <p className="text-[10px] text-blue-600 mt-0.5">Campus conversion</p>
        </Card>
      </div>

      {/* Visual Analytics Charts via Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 Cols): Placements by Department */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Branch-wise Placement Statistics</CardTitle>
              <CardDescription className="text-xs">
                Total enrolled candidates vs confirmed offers across engineering departments
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[11px]">Academic Year 2025-26</Badge>
          </CardHeader>
          <CardContent className="pt-4">
            <DepartmentPlacementChart data={departmentChartData} />
          </CardContent>
        </Card>

        {/* Right (1 Col): Application Status Breakdown */}
        <Card className="border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold">Application Status Flow</CardTitle>
            <CardDescription className="text-xs">
              Recruitment pipeline conversion distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ApplicationStatusPieChart data={applicationStatusData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications Feed & Operational Actions */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Live Application Activity</CardTitle>
            <CardDescription className="text-xs">Recent candidate submissions across all campus drives</CardDescription>
          </div>
          <Link href="/admin/applications" className="text-xs font-semibold text-blue-600 hover:underline">
            View All ({totalApplications}) →
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll Number</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">CGPA</th>
                  <th className="py-2.5 px-3">Company &amp; Role</th>
                  <th className="py-2.5 px-3">Applied</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{app.student.name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{app.student.studentProfile?.rollNo || "N/A"}</td>
                    <td className="py-2.5 px-3 text-slate-600">{app.student.studentProfile?.department}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800">{app.student.studentProfile?.cgpa?.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{app.job.title}</div>
                      <div className="text-[10px] text-slate-400">{app.job.company.name}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          app.status === "Selected"
                            ? "success"
                            : app.status === "Interview Scheduled"
                            ? "purple"
                            : app.status === "Shortlisted"
                            ? "info"
                            : app.status === "Rejected"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {app.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link href="/admin/applications">
                        <Button variant="ghost" size="sm" className="text-[11px] h-7 px-2 text-blue-600">
                          Review →
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
