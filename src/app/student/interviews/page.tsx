import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, Clock, MapPin, Video, Building2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function StudentInterviewsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  // Fetch interviews connected to applications of this student
  let student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      applications: {
        include: {
          job: { include: { company: true } },
          interviews: {
            orderBy: { interviewDate: "asc" }
          }
        }
      }
    }
  });

  if (!student && sessionUser.email) {
    student = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      include: {
        applications: {
          include: {
            job: { include: { company: true } },
            interviews: {
              orderBy: { interviewDate: "asc" }
            }
          }
        }
      }
    });
  }

  const allInterviews = (student?.applications || []).flatMap(app =>
    app.interviews.map(inv => ({
      ...inv,
      jobTitle: app.job.title,
      companyName: app.job.company.name,
      salary: app.job.salary
    }))
  ).sort((a, b) => new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime());

  const upcoming = allInterviews.filter(i => i.status === "Scheduled");
  const past = allInterviews.filter(i => i.status !== "Scheduled");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Recruitment Interview Schedule
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Stay on top of technical screenings, coding evaluations, and HR discussions.
        </p>
      </div>

      {allInterviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No interview calls scheduled yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once companies shortlist your profile, your interview call letters and meeting links will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="purple" className="px-2.5 py-0.5 text-xs font-bold">
                Upcoming Rounds ({upcoming.length})
              </Badge>
            </div>

            {upcoming.length === 0 ? (
              <div className="p-6 bg-white rounded-xl border border-slate-200 text-xs text-slate-400 text-center">
                No pending upcoming interview rounds.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcoming.map((inv) => (
                  <Card key={inv.id} className="border-blue-200 bg-white shadow-sm hover:shadow-md transition">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="font-semibold text-slate-700 mb-1">
                            {inv.companyName}
                          </Badge>
                          <h3 className="font-bold text-slate-900 text-base">{inv.jobTitle}</h3>
                        </div>
                        <Badge variant="purple" className="text-[11px]">
                          {inv.mode}
                        </Badge>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs space-y-1.5">
                        <div className="font-bold text-blue-900">{inv.roundName}</div>
                        <div className="flex items-center gap-1.5 text-blue-800">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <span>{new Date(inv.interviewDate).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          {inv.mode === "ONLINE" ? (
                            <Video className="h-3.5 w-3.5 text-slate-500" />
                          ) : (
                            <MapPin className="h-3.5 w-3.5 text-slate-500" />
                          )}
                          <span className="truncate">{inv.locationOrLink}</span>
                        </div>
                      </div>

                      {inv.notes && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic">
                          &ldquo;{inv.notes}&rdquo;
                        </p>
                      )}

                      {inv.locationOrLink && (
                        <div className="pt-2 flex justify-end">
                          <a
                            href={inv.locationOrLink.startsWith("http") ? inv.locationOrLink : "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 h-8">
                              <span>Join / Access Venue</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Past Rounds Section */}
          {past.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-2.5 py-0.5 text-xs font-bold">
                  Completed / Historical Rounds ({past.length})
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {past.map((inv) => (
                  <Card key={inv.id} className="border-slate-200 bg-slate-50/50">
                    <CardContent className="p-5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{inv.companyName}</span>
                        <Badge variant="success" className="text-[10px]">
                          {inv.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600 font-medium">{inv.roundName}</div>
                      <div className="text-[11px] text-slate-500">
                        Conducted on: {new Date(inv.interviewDate).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
