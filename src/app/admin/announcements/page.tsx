"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Calendar, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    targetDept: "ALL"
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/announcements");
      const data = await res.json();
      if (data?.announcements) setAnnouncements(data.announcements);
    } catch {
      toast.error("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to publish");

      toast.success("Notice broadcasted to students successfully!");
      setIsAddOpen(false);
      setForm({ title: "", content: "", priority: "MEDIUM", targetDept: "ALL" });
      fetchAnnouncements();
    } catch (err: any) {
      toast.error(err.message || "Failed to publish notice.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Notice removed.");
      fetchAnnouncements();
    } catch {
      toast.error("Failed to delete notice.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Broadcast Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish circulars, test schedules, and placement guidelines to students.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 h-9"
        >
          <Plus className="h-4 w-4" />
          <span>Publish Notice</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading notices...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <Card key={item.id} className="border-slate-200 hover:shadow-sm transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          item.priority === "HIGH"
                            ? "destructive"
                            : item.priority === "MEDIUM"
                            ? "warning"
                            : "secondary"
                        }
                        className="text-[10px] font-bold uppercase"
                      >
                        {item.priority} Priority
                      </Badge>
                      <span className="text-xs font-semibold text-slate-600">
                        Target: {item.targetDept}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.content}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 h-8 px-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Publish Notice Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Broadcast Campus Notice</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="atitle">Announcement Headline *</Label>
                <Input
                  id="atitle"
                  required
                  placeholder="e.g. Google Written Coding Assessment Link Issued"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="apriority">Priority Level *</Label>
                  <select
                    id="apriority"
                    value={form.priority}
                    onChange={(e: any) => setForm({ ...form, priority: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH (Urgent)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="adept">Target Engineering Branch *</Label>
                  <select
                    id="adept"
                    value={form.targetDept}
                    onChange={(e) => setForm({ ...form, targetDept: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="acontent">Announcement Body &amp; Instructions *</Label>
                <textarea
                  id="acontent"
                  rows={4}
                  required
                  placeholder="Detail test dates, links, preparation instructions, or mandatory venues..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Broadcast Notice</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
