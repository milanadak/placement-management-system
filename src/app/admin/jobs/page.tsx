"use client";

import { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  MapPin,
  Building2,
  Users,
  Loader2,
  Power,
  UserCheck,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Layers
} from "lucide-react";
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
  const [editJob, setEditJob] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Eligible modal state
  const [eligibleJob, setEligibleJob] = useState<any | null>(null);
  const [eligibleLoading, setEligibleLoading] = useState(false);
  const [eligibleData, setEligibleData] = useState<any | null>(null);
  const [eligibleSearch, setEligibleSearch] = useState("");

  const defaultForm = {
    companyId: "",
    title: "",
    description: "",
    minCgpa: 7.0,
    maxBacklogs: 0,
    minTenthPercentage: 60.0,
    minTwelfthPercentage: 60.0,
    eligibleDepartments: "Computer Science, Information Technology, Data Science",
    graduationYear: 2026,
    skills: "Java, Python, SQL, Data Structures",
    jobType: "Full-Time",
    location: "Bengaluru / Hyderabad",
    salary: "₹12.0 LPA",
    vacancies: 5,
    driveDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    interviewRounds: "Online Assessment, Technical Interview, HR Round",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  };

  const [form, setForm] = useState(defaultForm);

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
      setForm(defaultForm);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create job.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (job: any) => {
    setEditJob(job);
    setForm({
      companyId: job.companyId,
      title: job.title,
      description: job.description,
      minCgpa: job.minCgpa,
      maxBacklogs: job.maxBacklogs ?? 0,
      minTenthPercentage: job.minTenthPercentage ?? 60.0,
      minTwelfthPercentage: job.minTwelfthPercentage ?? 60.0,
      eligibleDepartments: job.eligibleDepartments,
      graduationYear: job.graduationYear,
      skills: job.skills,
      jobType: job.jobType,
      location: job.location,
      salary: job.salary,
      vacancies: job.vacancies ?? 5,
      driveDate: job.driveDate ? new Date(job.driveDate).toISOString().slice(0, 10) : "",
      interviewRounds: job.interviewRounds || "Online Assessment, Technical Interview, HR Round",
      deadline: new Date(job.deadline).toISOString().slice(0, 10),
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editJob) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editJob.id, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success(`Job opening "${form.title}" updated successfully!`);
      setEditJob(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update job.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (job: any) => {
    setTogglingId(job.id);
    const newStatus = !job.isActive;
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: job.id, isActive: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Toggle status failed");

      toast.success(`Drive "${job.title}" is now ${newStatus ? "Active" : "Closed / Inactive"}.`);
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isActive: newStatus } : j));
    } catch {
      toast.error("Could not update drive status.");
    } finally {
      setTogglingId(null);
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

  const handleOpenEligible = async (job: any) => {
    setEligibleJob(job);
    setEligibleLoading(true);
    setEligibleData(null);
    setEligibleSearch("");
    try {
      const res = await fetch(`/api/admin/eligibility?jobId=${job.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to calculate eligibility");
      setEligibleData(data);
    } catch (err: any) {
      toast.error(err.message || "Could not fetch eligible candidates");
    } finally {
      setEligibleLoading(false);
    }
  };

  const exportEligibleCsv = () => {
    if (!eligibleData?.evaluatedStudents || !eligibleJob) return;

    const qualifying = eligibleData.evaluatedStudents.filter((s: any) => s.evaluation.isEligible);
    if (qualifying.length === 0) {
      toast.info("No eligible candidates found to export.");
      return;
    }

    const headers = [
      "Student Name",
      "Roll Number",
      "Department",
      "CGPA",
      "10th %",
      "12th %",
      "Backlogs",
      "Email",
      "Placement Status",
      "Drive Title",
      "Company"
    ];

    const rows = qualifying.map((s: any) => [
      `"${s.name}"`,
      `"${s.rollNo}"`,
      `"${s.department}"`,
      s.cgpa,
      s.tenthPercentage,
      s.twelfthPercentage,
      s.backlogs,
      `"${s.email}"`,
      s.isPlaced ? "Placed" : "Unplaced",
      `"${eligibleJob.title}"`,
      `"${eligibleJob.company?.name || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Eligible_Candidates_${eligibleJob.title.replace(/[^a-zA-Z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${qualifying.length} eligible candidates to CSV.`);
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
            Configure academic eligibility criteria, vacancies, interview schedules, and inspect qualifying candidates.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditJob(null);
            setForm(defaultForm);
            setIsAddOpen(true);
          }}
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
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">{job.title}</span>
                      <Badge variant="outline" className="font-semibold text-slate-700 bg-slate-50">
                        {job.company?.name}
                      </Badge>
                      <Badge variant={job.jobType === "Full-Time" ? "secondary" : "purple"}>
                        {job.jobType}
                      </Badge>
                      <Badge variant={job.isActive ? "success" : "destructive"} className="text-[10px]">
                        {job.isActive ? "Active Drive" : "Closed / Inactive"}
                      </Badge>
                      {job.vacancies && (
                        <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50/50">
                          {job.vacancies} Vacancies
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {job.location}
                      </span>
                      <span className="font-bold text-emerald-700">
                        Package: {job.salary}
                      </span>
                      <span className="flex items-center gap-1 text-amber-700 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        Deadline: {new Date(job.deadline).toLocaleDateString()}
                      </span>
                      {job.driveDate && (
                        <span className="flex items-center gap-1 text-purple-700 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          Drive Date: {new Date(job.driveDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-slate-300">|</span>
                      <span>Min CGPA: <strong className="text-slate-900">{job.minCgpa.toFixed(1)}</strong></span>
                      <span>Max Backlogs: <strong className="text-slate-900">{job.maxBacklogs ?? 0}</strong></span>
                      <span>10th / 12th: <strong className="text-slate-900">{job.minTenthPercentage ?? 60}% / {job.minTwelfthPercentage ?? 60}%</strong></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                      <div>
                        <span className="font-semibold text-slate-700">Eligible Branches:</span>{" "}
                        <span className="text-slate-600">{job.eligibleDepartments}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Selection Pipeline:</span>{" "}
                        <span className="text-slate-600">{job.interviewRounds || "Aptitude, Tech Interview, HR"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap lg:flex-col items-end gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEligible(job)}
                      className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 text-xs h-8 gap-1.5 font-semibold"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                      <span>View Eligible Students</span>
                    </Button>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={togglingId === job.id}
                        onClick={() => handleToggleActive(job)}
                        className={`text-xs h-8 gap-1 ${job.isActive ? "border-amber-300 text-amber-800 hover:bg-amber-50" : "border-emerald-300 text-emerald-800 hover:bg-emerald-50"}`}
                      >
                        <Power className="h-3 w-3" />
                        <span>{job.isActive ? "Deactivate" : "Activate"}</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOpen(job)}
                        className="text-slate-700 hover:bg-slate-100 text-xs h-8 gap-1"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(job.id, job.title)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 text-xs h-8 px-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Eligible Students Modal */}
      {eligibleJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">
                    Eligible Students for {eligibleJob.title}
                  </h3>
                  <Badge variant="outline" className="font-semibold text-slate-700">
                    {eligibleJob.company?.name}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Criteria: Min CGPA {eligibleJob.minCgpa} | Max Backlogs {eligibleJob.maxBacklogs ?? 0} | 10th &amp; 12th &ge; {eligibleJob.minTenthPercentage ?? 60}% | Batch {eligibleJob.graduationYear}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={exportEligibleCsv}
                  disabled={eligibleLoading || !eligibleData?.evaluatedStudents}
                  size="sm"
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 text-xs h-8 gap-1 font-semibold"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEligibleJob(null);
                    setEligibleData(null);
                  }}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
            </div>

            {eligibleLoading ? (
              <div className="py-16 text-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
                <span className="text-xs">Evaluating student eligibility matrix...</span>
              </div>
            ) : eligibleData ? (
              <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                {/* Stats Header */}
                <div className="grid grid-cols-4 gap-3 shrink-0">
                  <div className="bg-blue-50/70 border border-blue-200/60 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-blue-700">Total Evaluated</p>
                    <p className="text-lg font-black text-blue-950 mt-0.5">{eligibleData.totalStudents}</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-emerald-700">Eligible Students</p>
                    <p className="text-lg font-black text-emerald-950 mt-0.5">{eligibleData.eligibleCount}</p>
                  </div>
                  <div className="bg-purple-50/70 border border-purple-200/60 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-purple-700">Eligibility Rate</p>
                    <p className="text-lg font-black text-purple-950 mt-0.5">{eligibleData.eligiblePercentage}%</p>
                  </div>
                  <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl text-center">
                    <p className="text-[11px] font-semibold text-amber-700">Eligible &amp; Unplaced</p>
                    <p className="text-lg font-black text-amber-950 mt-0.5">{eligibleData.eligibleUnplacedCount}</p>
                  </div>
                </div>

                {/* Filter and Search */}
                <div className="shrink-0 flex items-center justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Filter by student name, roll number, department..."
                      value={eligibleSearch}
                      onChange={(e) => setEligibleSearch(e.target.value)}
                      className="pl-8 h-8 text-xs bg-slate-50 border-slate-200"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Showing qualifying candidates who pass all academic gates
                  </p>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3">Candidate</th>
                        <th className="p-3">Roll No</th>
                        <th className="p-3">Department</th>
                        <th className="p-3 text-center">CGPA</th>
                        <th className="p-3 text-center">10th / 12th</th>
                        <th className="p-3 text-center">Backlogs</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3">Verification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {eligibleData.evaluatedStudents
                        .filter((s: any) => s.evaluation.isEligible)
                        .filter((s: any) =>
                          eligibleSearch === "" ||
                          s.name.toLowerCase().includes(eligibleSearch.toLowerCase()) ||
                          s.rollNo.toLowerCase().includes(eligibleSearch.toLowerCase()) ||
                          s.department.toLowerCase().includes(eligibleSearch.toLowerCase())
                        )
                        .map((s: any) => (
                          <tr key={s.id} className="hover:bg-slate-50/70 transition">
                            <td className="p-3">
                              <p className="font-semibold text-slate-900">{s.name}</p>
                              <p className="text-[11px] text-slate-500">{s.email}</p>
                            </td>
                            <td className="p-3 font-mono text-[11px] font-medium text-slate-700">
                              {s.rollNo}
                            </td>
                            <td className="p-3 text-slate-700">
                              {s.department}
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-bold text-slate-900">{s.cgpa.toFixed(2)}</span>
                            </td>
                            <td className="p-3 text-center text-slate-700">
                              {s.tenthPercentage}% / {s.twelfthPercentage}%
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.backlogs === 0 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                                {s.backlogs}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              {s.isPlaced ? (
                                <Badge variant="success" className="text-[10px]">Placed</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px]">Unplaced</Badge>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                <span>Meets all drive criteria</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Post / Edit Job Modal */}
      {(isAddOpen || editJob) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">
                {editJob ? `Edit Placement Drive: ${editJob.title}` : "Post New Campus Drive"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditJob(null);
                }}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={editJob ? handleUpdate : handleCreate} className="space-y-3.5 text-xs">
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

              {/* Eligibility Gates */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  Academic Eligibility Gates
                </p>
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="jcgpa">Min CGPA *</Label>
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
                    <Label htmlFor="jbacklogs">Max Backlogs *</Label>
                    <Input
                      id="jbacklogs"
                      type="number"
                      min="0"
                      max="10"
                      required
                      value={form.maxBacklogs}
                      onChange={(e) => setForm({ ...form, maxBacklogs: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="jtenth">Min 10th %</Label>
                    <Input
                      id="jtenth"
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={form.minTenthPercentage}
                      onChange={(e) => setForm({ ...form, minTenthPercentage: parseFloat(e.target.value) || 60 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="jtwelfth">Min 12th %</Label>
                    <Input
                      id="jtwelfth"
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={form.minTwelfthPercentage}
                      onChange={(e) => setForm({ ...form, minTwelfthPercentage: parseFloat(e.target.value) || 60 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <Label htmlFor="jyear">Batch Graduation Year *</Label>
                    <Input
                      id="jyear"
                      type="number"
                      required
                      value={form.graduationYear}
                      onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value) || 2026 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="jdepts">Eligible Departments *</Label>
                    <Input
                      id="jdepts"
                      required
                      placeholder="Computer Science, Information Technology"
                      value={form.eligibleDepartments}
                      onChange={(e) => setForm({ ...form, eligibleDepartments: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Drive Details & Logistics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="jvacancies">Open Vacancies</Label>
                  <Input
                    id="jvacancies"
                    type="number"
                    min="1"
                    required
                    value={form.vacancies}
                    onChange={(e) => setForm({ ...form, vacancies: parseInt(e.target.value) || 1 })}
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
                <div className="space-y-1">
                  <Label htmlFor="jsalary">CTC Package / Stipend *</Label>
                  <Input
                    id="jsalary"
                    required
                    placeholder="e.g. ₹15.0 LPA"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="jlocation">Location *</Label>
                  <Input
                    id="jlocation"
                    required
                    placeholder="Bengaluru / Hybrid"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jdrivedate">Drive Date</Label>
                  <Input
                    id="jdrivedate"
                    type="date"
                    value={form.driveDate}
                    onChange={(e) => setForm({ ...form, driveDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="jdeadline">Application Deadline *</Label>
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
                <Label htmlFor="jrounds">Selection Pipeline / Interview Rounds</Label>
                <Input
                  id="jrounds"
                  placeholder="Online Assessment, Technical Interview, HR Round"
                  value={form.interviewRounds}
                  onChange={(e) => setForm({ ...form, interviewRounds: e.target.value })}
                />
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
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditJob(null);
                  }}
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
                  <span>{editJob ? "Save Changes" : "Publish Campus Drive"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
