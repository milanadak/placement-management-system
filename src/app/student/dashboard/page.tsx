import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import {
  Briefcase,
  FileCheck,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
  Building2,
  ExternalLink,
  Bell
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      studentProfile: true,
      applications: {
        include: {
          job: { include: { company: true } },
          interviews: true
        },
        orderBy: { appliedAt: "desc" }
      }
    }
  });

  if (!student) redirect("/login");

  const profile = student.studentProfile;
  const applications = student.applications || [];

  // Metrics
  const totalApplied = applications.length;
  const shortlisted = applications.filter(a => a.status === "Shortlisted").length;
  const interviewScheduled = applications.filter(a => a.status === "Interview Scheduled").length;
  const offersReceived = applications.filter(a => a.status === "Selected").length;

  // Upcoming Interviews
  const upcomingInterviews = applications
    .flatMap(a => a.interviews.map(i => ({ ...i, company: a.job.company.name, jobTitle: a.job.title })))
    .filter(i => i.status === "Scheduled")
    .sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime())
    .slice(0, 3);

  // Latest Announcements
  const announcements = await prisma.announcement.findMany({
    take: 3,
    orderBy: { createdAt: "desc" }
  });

  // Calculate Profile Completion %
  let completionPoints = 0;
  if (profile?.rollNo) completionPoints += 20;
  if (profile?.department) completionPoints += 20;
  if (profile?.cgpa && profile.cgpa > 0) completionPoints += 20;
  if (profile?.skills && profile.skills.length > 5) completionPoints += 20;
  if (profile?.resumeUrl) completionPoints += 20;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold mb-3">
              <span>{profile?.department || "Engineering"}</span>
              <span>•</span>
              <span>Batch of {profile?.graduationYear || 2026}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student.name}!
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-xl leading-relaxed">
              Your registered CGPA is <strong>{profile?.cgpa?.toFixed(2) || "0.00"}</strong>. You have <strong>{totalApplied} active applications</strong> across campus recruitment drives.
            </p>
          </div>

          <div className="flex gap-3">
            <Link href="/student/jobs">
              <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-sm">
                Explore Jobs
              </Button>
            </Link>
            <Link href="/student/profile">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10">
                Update Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Completion Bar (if < 100%) */}
      {completionPoints < 100 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-bold text-amber-900">
                Profile is {completionPoints}% complete
              </span>
            </div>
            <p className="text-xs text-amber-800">
              {!profile?.resumeUrl
                ? "Upload your resume file to unlock eligibility for top companies."
                : "Add additional technical skills and contact info to reach 100%."}
            </p>
          </div>
          <Link href="/student/profile">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs">
              Complete Profile Now
            </Button>
          </Link>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Applications
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <FileCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{totalApplied}</div>
          <p className="text-[11px] text-slate-500 mt-1">Submitted drives</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Shortlisted
            </span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{shortlisted}</div>
          <p className="text-[11px] text-slate-500 mt-1">Screening cleared</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Interviews
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{interviewScheduled}</div>
          <p className="text-[11px] text-slate-500 mt-1">Upcoming rounds</p>
        </Card>

        <Card className="p-5 border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Offers Received
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 text-emerald-600">{offersReceived}</div>
          <p className="text-[11px] text-slate-500 mt-1">Final selections</p>
        </Card>
      </div>

      {/* Main Grid: Upcoming Interviews & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Applications & Upcoming Interviews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Interviews Card */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Upcoming Interview Calls</CardTitle>
                <CardDescription className="text-xs">Scheduled technical and HR rounds</CardDescription>
              </div>
              <Link href="/student/interviews" className="text-xs font-semibold text-blue-600 hover:underline">
                View all →
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingInterviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No upcoming interview rounds currently scheduled.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingInterviews.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{item.company}</span>
                          <Badge variant="purple" className="text-[10px]">{item.mode}</Badge>
                        </div>
                        <div className="text-xs font-medium text-slate-700 mt-1">{item.roundName}</div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{new Date(item.interviewDate).toLocaleString()}</span>
                        </div>
                      </div>

                      {item.locationOrLink && (
                        <a
                          href={item.locationOrLink.startsWith("http") ? item.locationOrLink : "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0"
                        >
                          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                            <span>Join Meeting</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Applications Tracker */}
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Recent Applications</CardTitle>
                <CardDescription className="text-xs">Your live status in campus drives</CardDescription>
              </div>
              <Link href="/student/applications" className="text-xs font-semibold text-blue-600 hover:underline">
                View all ({totalApplied}) →
              </Link>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  You haven&apos;t applied for any positions yet.
                  <div className="mt-2">
                    <Link href="/student/jobs">
                      <Button size="sm" className="bg-blue-600 text-xs">Browse Eligible Jobs</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {applications.slice(0, 5).map((app) => (
                    <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{app.job.title}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{app.job.company.name}</span>
                          <span>•</span>
                          <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

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
                      >
                        {app.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Announcements & Quick Shortcuts */}
        <div className="space-y-6">
          {/* Announcements Card */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-base font-bold">Placement Cell Notices</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((an) => (
                <div key={an.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={an.priority === "HIGH" ? "destructive" : "secondary"}
                      className="text-[10px] uppercase font-bold"
                    >
                      {an.priority}
                    </Badge>
                    <span className="text-[10px] text-slate-400">
                      {new Date(an.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{an.title}</h4>
                  <p className="text-[11px] text-slate-600 line-clamp-2">{an.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Placement Guidelines Card */}
          <Card className="border-slate-200 bg-slate-900 text-white">
            <CardContent className="p-5 space-y-3">
              <h4 className="font-bold text-sm text-white">Placement Cell Guidelines</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ensure you carry two formal hardcopies of your verified resume, college ID, and dress in college formal attire for all offline interview rounds.
              </p>
              <div className="pt-2">
                <Link href="/about">
                  <Button size="sm" variant="outline" className="w-full text-xs border-slate-700 text-white hover:bg-slate-800">
                    Read Policy Documents
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
