"use client";

import { useState, useEffect } from "react";
import { FileCheck, Search, Filter, Calendar, CheckCircle2, AlertCircle, Clock, ExternalLink, Loader2, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Interview scheduling modal state
  const [scheduleModalApp, setScheduleModalApp] = useState<any | null>(null);
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    roundName: "Technical Interview Round 1",
    interviewDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    mode: "ONLINE",
    locationOrLink: "https://meet.google.com/placement-round",
    notes: "Review core computer science fundamentals and candidate project work."
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/admin/applications");
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

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId);
    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");

      toast.success(`Application status updated to "${newStatus}"!`);
      // Update locally
      setApplications(prev =>
        prev.map(a => a.id === applicationId ? { ...a, status: newStatus } : a)
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update application status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModalApp) return;

    setScheduleSubmitting(true);
    try {
      const res = await fetch("/api/admin/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: scheduleModalApp.id,
          ...scheduleForm
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to schedule interview");

      toast.success(`Interview scheduled and notification dispatched to ${scheduleModalApp.student.name}!`);
      setScheduleModalApp(null);
      fetchApplications();
    } catch (err: any) {
      toast.error(err.message || "Failed to schedule interview.");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const sName = app.student?.name?.toLowerCase() || "";
    const sRoll = app.student?.studentProfile?.rollNo?.toLowerCase() || "";
    const jTitle = app.job?.title?.toLowerCase() || "";
    const cName = app.job?.company?.name?.toLowerCase() || "";

    const matchesSearch =
      sName.includes(search.toLowerCase()) ||
      sRoll.includes(search.toLowerCase()) ||
      jTitle.includes(search.toLowerCase()) ||
      cName.includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Applications Management Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Shortlist candidates, update recruitment progression stages, and schedule interview rounds.
          </p>
        </div>

        <a href="/api/admin/reports?type=applications" target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-9">
            <span>Export Placements CSV</span>
          </Button>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search candidate name, roll number, role, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Application Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Aptitude">Aptitude</option>
              <option value="Technical Interview">Technical Interview</option>
              <option value="HR Interview">HR Interview</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview Scheduled">Interview Scheduled</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Found {filteredApplications.length} candidate applications</span>
          <span className="text-slate-400 text-[11px]">Status changes notify students in real time</span>
        </div>
      </div>

      {/* Applications Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading recruitment submissions...</span>
        </div>
      ) : (
        <Card className="border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Department &amp; CGPA</th>
                  <th className="py-3 px-4">Campus Drive</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Change Status</th>
                  <th className="py-3 px-4 text-right">Interviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.map((app) => {
                  const p = app.student?.studentProfile;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{app.student.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{p?.rollNo || "N/A"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{p?.department || "N/A"}</div>
                        <div className="text-[11px] font-bold text-emerald-600">CGPA: {p?.cgpa?.toFixed(2) || "0.00"}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{app.job.title}</div>
                        <div className="text-[11px] text-slate-500">{app.job.company.name} • {app.job.salary}</div>
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        {app.status === "Selected" ? (
                          <Badge variant="success" className="text-[10px]">Selected</Badge>
                        ) : app.status === "Shortlisted" ? (
                          <Badge variant="info" className="text-[10px]">Shortlisted</Badge>
                        ) : app.status === "Aptitude" ? (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-[10px]">Aptitude</Badge>
                        ) : app.status === "Technical Interview" ? (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px]">Technical Round</Badge>
                        ) : app.status === "HR Interview" ? (
                          <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px]">HR Interview</Badge>
                        ) : app.status === "Rejected" ? (
                          <Badge variant="destructive" className="text-[10px]">Rejected</Badge>
                        ) : app.status === "Interview Scheduled" ? (
                          <Badge variant="purple" className="text-[10px]">Interview Scheduled</Badge>
                        ) : app.status === "Under Review" ? (
                          <Badge variant="warning" className="text-[10px]">Under Review</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">Applied</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          disabled={updatingId === app.id}
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                          <option value="Applied">Applied</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Aptitude">Aptitude</option>
                          <option value="Technical Interview">Technical Interview</option>
                          <option value="HR Interview">HR Interview</option>
                          <option value="Selected">Selected</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Interview Scheduled">Interview Scheduled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setScheduleModalApp(app)}
                          className="h-7 text-[11px] px-2.5 text-blue-600 hover:text-blue-700 border-blue-200"
                        >
                          Schedule Round
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Schedule Interview Modal */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Schedule Interview Call</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate: {scheduleModalApp.student.name} ({scheduleModalApp.job.company.name})
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setScheduleModalApp(null)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="iround">Round Title *</Label>
                <Input
                  id="iround"
                  required
                  placeholder="e.g. Technical Round 1: Coding & Algorithms"
                  value={scheduleForm.roundName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, roundName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="idate">Date &amp; Time *</Label>
                  <Input
                    id="idate"
                    type="datetime-local"
                    required
                    value={scheduleForm.interviewDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, interviewDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="imode">Interview Mode *</Label>
                  <select
                    id="imode"
                    value={scheduleForm.mode}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="ilink">Location / Google Meet Link *</Label>
                <Input
                  id="ilink"
                  required
                  placeholder="https://meet.google.com/... or Placement Room 402"
                  value={scheduleForm.locationOrLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, locationOrLink: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="inotes">Preparation Notes for Candidate</Label>
                <textarea
                  id="inotes"
                  rows={2}
                  placeholder="e.g. Please be ready with college ID and IDE prepared..."
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setScheduleModalApp(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={scheduleSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                >
                  {scheduleSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Confirm Schedule</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
