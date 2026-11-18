"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Trash2,
  Loader2,
  Undo2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/student/applications");
      const data = await res.json();
      if (data?.applications) {
        setApplications(data.applications);
      }
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string, jobTitle: string) => {
    if (!confirm(`Are you sure you want to withdraw your application for "${jobTitle}"? This cannot be undone.`)) {
      return;
    }

    setWithdrawingId(applicationId);
    try {
      const res = await fetch(`/api/student/applications?id=${applicationId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to withdraw application");

      toast.success("Application withdrawn successfully.");
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Could not withdraw application.");
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Selected":
        return <Badge variant="success">Selected / Offer Extended</Badge>;
      case "Interview Scheduled":
        return <Badge variant="purple">Interview Scheduled</Badge>;
      case "Shortlisted":
        return <Badge variant="info">Shortlisted</Badge>;
      case "Under Review":
        return <Badge variant="warning">Under Review</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Application Not Pursued</Badge>;
      default:
        return <Badge variant="secondary">Applied</Badge>;
    }
  };

  const stages = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Selected"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            My Placement Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time recruitment progression, screening results, and interview calls.
          </p>
        </div>
        <Link href="/student/jobs">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs">
            Explore More Jobs
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading applications pipeline...</span>
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <FileCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No applications submitted yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse campus job openings and check your automated academic eligibility to apply.
          </p>
          <div className="mt-4">
            <Link href="/student/jobs">
              <Button size="sm" className="bg-blue-600">Browse Campus Drives</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentStageIndex = stages.indexOf(app.status);
            const isRejected = app.status === "Rejected";
            const canWithdraw = app.status === "Applied" || app.status === "Under Review";

            return (
              <Card key={app.id} className="border-slate-200 hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/student/jobs/${app.job.id}`}
                          className="font-bold text-slate-900 text-lg hover:text-blue-600 transition"
                        >
                          {app.job.title}
                        </Link>
                        <Badge variant="outline" className="font-semibold text-slate-700">
                          {app.job.company.name}
                        </Badge>
                        <Badge variant={app.job.jobType === "Full-Time" ? "secondary" : "purple"}>
                          {app.job.jobType}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                        <span>Location: <strong>{app.job.location}</strong></span>
                        <span>Package: <strong className="text-emerald-700">{app.job.salary}</strong></span>
                        <span>Applied on: <strong>{new Date(app.appliedAt).toLocaleDateString()}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getStatusBadge(app.status)}

                      {canWithdraw && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={withdrawingId === app.id}
                          onClick={() => handleWithdraw(app.id, app.job.title)}
                          className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                        >
                          {withdrawingId === app.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Undo2 className="h-3.5 w-3.5" />
                          )}
                          <span>Withdraw</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Stage Progress Bar (unless rejected) */}
                  {!isRejected ? (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-500 mb-2 uppercase tracking-wider">
                        Recruitment Pipeline Stage
                      </div>
                      <div className="grid grid-cols-5 gap-2 text-center">
                        {stages.map((stg, sIdx) => {
                          const isComplete = currentStageIndex >= sIdx;
                          const isCurrent = currentStageIndex === sIdx;
                          return (
                            <div key={stg} className="flex flex-col items-center">
                              <div
                                className={`w-full h-2 rounded-full mb-1.5 transition-colors ${
                                  isCurrent
                                    ? "bg-blue-600"
                                    : isComplete
                                    ? "bg-emerald-500"
                                    : "bg-slate-200"
                                }`}
                              />
                              <span
                                className={`text-[10px] truncate max-w-[100px] ${
                                  isCurrent
                                    ? "font-bold text-blue-700"
                                    : isComplete
                                    ? "font-medium text-slate-700"
                                    : "text-slate-400"
                                }`}
                              >
                                {stg}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>The recruitment team has closed this application for the current season.</span>
                    </div>
                  )}

                  {/* Scheduled Interviews attached */}
                  {app.interviews && app.interviews.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>Interview Rounds for this Application</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {app.interviews.map((inv: any) => (
                          <div
                            key={inv.id}
                            className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between font-bold text-slate-900">
                              <span>{inv.roundName}</span>
                              <Badge variant={inv.status === "Completed" ? "success" : "purple"} className="text-[10px]">
                                {inv.status}
                              </Badge>
                            </div>
                            <div className="text-slate-500 text-[11px] flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(inv.interviewDate).toLocaleString()}</span>
                            </div>
                            <div className="text-slate-600 text-[11px]">
                              Mode: <strong>{inv.mode}</strong> ({inv.locationOrLink})
                            </div>
                            {inv.notes && (
                              <div className="text-slate-500 text-[11px] italic bg-white p-1.5 rounded border border-slate-200/60 mt-1">
                                {inv.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
