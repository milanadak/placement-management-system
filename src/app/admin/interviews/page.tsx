"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Video, MapPin, Search, ExternalLink, Loader2, Edit2, Trash2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit/Reschedule state
  const [editInterview, setEditInterview] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    roundName: "",
    interviewDate: "",
    mode: "ONLINE",
    locationOrLink: "",
    notes: "",
    status: "Scheduled"
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await fetch("/api/admin/interviews");
      const data = await res.json();
      if (data?.interviews) setInterviews(data.interviews);
    } catch {
      toast.error("Failed to load interview rounds.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (inv: any) => {
    setEditInterview(inv);
    setEditForm({
      roundName: inv.roundName,
      interviewDate: new Date(inv.interviewDate).toISOString().slice(0, 16),
      mode: inv.mode,
      locationOrLink: inv.locationOrLink,
      notes: inv.notes || "",
      status: inv.status
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInterview) return;

    setSubmittingEdit(true);
    try {
      const res = await fetch("/api/admin/interviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editInterview.id, ...editForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success("Interview round rescheduled & candidate notified!");
      setEditInterview(null);
      fetchInterviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to update interview.");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleCancelInterview = async (id: string, roundName: string) => {
    if (!confirm(`Are you sure you want to cancel "${roundName}"? The candidate will be notified.`)) return;

    try {
      const res = await fetch(`/api/admin/interviews?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Cancel failed");

      toast.success("Interview round cancelled.");
      fetchInterviews();
    } catch {
      toast.error("Failed to cancel interview round.");
    }
  };

  const filtered = interviews.filter((i) => {
    const sName = i.application?.student?.name?.toLowerCase() || "";
    const cName = i.application?.job?.company?.name?.toLowerCase() || "";
    const rName = i.roundName?.toLowerCase() || "";
    return sName.includes(search.toLowerCase()) || cName.includes(search.toLowerCase()) || rName.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Recruitment Interview Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee, reschedule, or cancel technical screenings, coding evaluations, and HR discussions.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidate, recruiter, or round title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total {filtered.length} Interview Rounds
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading interview schedule...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inv) => (
            <Card key={inv.id} className="border-slate-200 hover:shadow-md transition">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="font-semibold text-slate-700 mb-1">
                      {inv.application?.job?.company?.name}
                    </Badge>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {inv.application?.student?.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {inv.application?.student?.studentProfile?.rollNo} ({inv.application?.student?.studentProfile?.department?.split(" ")[0]})
                    </p>
                  </div>
                  <Badge variant={inv.status === "Completed" ? "success" : "purple"} className="text-[10px]">
                    {inv.status}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800">{inv.roundName}</div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(inv.interviewDate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {inv.mode === "ONLINE" ? <Video className="h-3.5 w-3.5 text-blue-500" /> : <MapPin className="h-3.5 w-3.5 text-amber-500" />}
                    <span className="truncate">{inv.locationOrLink}</span>
                  </div>
                </div>

                {inv.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                    &ldquo;{inv.notes}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(inv)}
                      className="h-7 text-[11px] px-2 text-slate-700 gap-1"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Reschedule</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInterview(inv.id, inv.roundName)}
                      className="h-7 text-[11px] px-2 text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                    >
                      <XCircle className="h-3 w-3" />
                      <span>Cancel</span>
                    </Button>
                  </div>

                  {inv.locationOrLink.startsWith("http") && (
                    <a href={inv.locationOrLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                      <span>Open Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit / Reschedule Modal */}
      {editInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Reschedule Interview Round</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditInterview(null)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="eround">Round Title *</Label>
                <Input
                  id="eround"
                  required
                  value={editForm.roundName}
                  onChange={(e) => setEditForm({ ...editForm, roundName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="edate">Date &amp; Time *</Label>
                  <Input
                    id="edate"
                    type="datetime-local"
                    required
                    value={editForm.interviewDate}
                    onChange={(e) => setEditForm({ ...editForm, interviewDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emode">Mode *</Label>
                  <select
                    id="emode"
                    value={editForm.mode}
                    onChange={(e) => setEditForm({ ...editForm, mode: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="OFFLINE">OFFLINE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="elink">Location or Meeting Link *</Label>
                <Input
                  id="elink"
                  required
                  value={editForm.locationOrLink}
                  onChange={(e) => setEditForm({ ...editForm, locationOrLink: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="estatus">Status *</Label>
                <select
                  id="estatus"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="enotes">Candidate Preparation Notes</Label>
                <textarea
                  id="enotes"
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditInterview(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submittingEdit}
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                >
                  {submittingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save &amp; Notify Candidate</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
