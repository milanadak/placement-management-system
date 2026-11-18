"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Trash2, Calendar, MapPin, Building2, Users, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    companyId: "",
    title: "",
    description: "",
    minCgpa: 7.0,
    eligibleDepartments: "Computer Science, Information Technology, Data Science",
    graduationYear: 2026,
    skills: "Java, Python, SQL, Data Structures",
    jobType: "Full-Time",
    location: "Bengaluru / Hyderabad",
    salary: "₹12.0 LPA",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsRes, compRes] = await Promise.all([
        fetch("/api/admin/jobs"),
        fetch("/api/admin/companies")
      ]);
      const jobsData = await jobsRes.json();
      const compData = await compRes.json();

      if (jobsData?.jobs) setJobs(jobsData.jobs);
      if (compData?.companies) {
        setCompanies(compData.companies);
        if (compData.companies.length > 0 && !form.companyId) {
          setForm(f => ({ ...f, companyId: compData.companies[0].id }));
        }
      }
    } catch {
      toast.error("Failed to load drives.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.companyId) {
      toast.error("Please select a recruiter company.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create job");

      toast.success(`Drive for ${form.title} published and announced!`);
      setIsAddOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete ${title}?`)) return;

    try {
      const res = await fetch(`/api/admin/jobs?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Job opening deleted successfully.");
      loadData();
    } catch {
      toast.error("Failed to delete job.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Placement Drives &amp; Openings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure academic eligibility criteria, compensation packages, and application deadlines.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 h-9"
        >
          <Plus className="h-4 w-4" />
          <span>Post New Campus Drive</span>
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading campus drives...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="border-slate-200 hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{job.title}</span>
                      <Badge variant="outline" className="font-semibold text-slate-700">
                        {job.company?.name}
                      </Badge>
                      <Badge variant={job.jobType === "Full-Time" ? "secondary" : "purple"}>
                        {job.jobType}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        Package: {job.salary}
                      </span>
                      <span className="flex items-center gap-1 text-amber-700">
                        <Calendar className="h-3.5 w-3.5" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                      <span className="text-slate-400">|</span>
                      <span>Min CGPA: <strong>{job.minCgpa.toFixed(1)}</strong></span>
                      <span className="text-slate-400">|</span>
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {job.applications?.length || 0} Submissions
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 pt-1">
                      <span className="font-semibold text-slate-700">Eligible Branches:</span>{" "}
                      {job.eligibleDepartments}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(job.id, job.title)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Post Job Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Post New Campus Drive</h3>
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="jcompany">Recruiter Partner *</Label>
                  <select
                    id="jcompany"
                    value={form.companyId}
                    onChange={(e) => setForm({ ...form, companyId: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jtitle">Job Title *</Label>
                  <Input
                    id="jtitle"
                    required
                    placeholder="e.g. Graduate Software Engineer"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="jcgpa">Minimum CGPA *</Label>
                  <Input
                    id="jcgpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={form.minCgpa}
                    onChange={(e) => setForm({ ...form, minCgpa: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jyear">Batch Year *</Label>
                  <Input
                    id="jyear"
                    type="number"
                    required
                    value={form.graduationYear}
                    onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value) || 2026 })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jtype">Engagement Type *</Label>
                  <select
                    id="jtype"
                    value={form.jobType}
                    onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                    className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="jdepts">Eligible Departments (Comma separated) *</Label>
                <Input
                  id="jdepts"
                  required
                  placeholder="Computer Science, Information Technology, Data Science"
                  value={form.eligibleDepartments}
                  onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="jsalary">CTC Package / Stipend *</Label>
                  <Input
                    id="jsalary"
                    required
                    placeholder="e.g. ₹15.0 LPA or ₹50,000 / mo"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jdeadline">Deadline Date *</Label>
                  <Input
                    id="jdeadline"
                    type="date"
                    required
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="jskills">Desired Skills</Label>
                <Input
                  id="jskills"
                  placeholder="Java, Python, System Design, SQL"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="jdesc">Job Description &amp; Role Overview *</Label>
                <textarea
                  id="jdesc"
                  rows={3}
                  required
                  placeholder="Outline responsibilities, work location, and evaluation stages..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  <span>Publish Campus Drive</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
