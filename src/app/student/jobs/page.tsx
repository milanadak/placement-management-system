"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Send,
  Loader2,
  Bookmark,
  Sparkles,
  ArrowUpDown,
  SlidersHorizontal
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { calculateSmartMatch, checkDetailedEligibility } from "@/lib/matching";

export default function StudentJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Map<string, string>>(new Map());
  const [bookmarkedJobIds, setBookmarkedJobIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [cgpaFilter, setCgpaFilter] = useState("ALL"); // ALL | 6.5 | 7.5 | 8.0
  const [statusView, setStatusView] = useState("ALL"); // ALL | ELIGIBLE | APPLIED | BOOKMARKS
  const [sortBy, setSortBy] = useState<"newest" | "salary_desc" | "deadline">("newest");

  // Modal State for Apply
  const [selectedJobForApply, setSelectedJobForApply] = useState<any | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [submittingApply, setSubmittingApply] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, jobsRes, bookmarksRes] = await Promise.all([
        fetch("/api/student/profile"),
        fetch("/api/jobs"),
        fetch("/api/student/bookmarks")
      ]);

      const profileData = await profileRes.json();
      const jobsData = await jobsRes.json();
      const bookmarksData = await bookmarksRes.json();

      if (profileData?.user) {
        setStudent(profileData.user);
        const map = new Map<string, string>();
        profileData.user.applications?.forEach((app: any) => {
          map.set(app.jobId, app.status);
        });
        setAppliedJobIds(map);
      }

      if (jobsData?.jobs) {
        setJobs(jobsData.jobs);
      }

      if (bookmarksData?.bookmarks) {
        const bSet = new Set<string>();
        bookmarksData.bookmarks.forEach((b: any) => bSet.add(b.jobId));
        setBookmarkedJobIds(bSet);
      }
    } catch {
      toast.error("Failed to load campus drives.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Bookmark update failed");

      setBookmarkedJobIds(prev => {
        const next = new Set(prev);
        if (data.bookmarked) next.add(jobId);
        else next.delete(jobId);
        return next;
      });

      toast.success(data.bookmarked ? "Job saved to your bookmarks!" : "Job removed from bookmarks.");
    } catch {
      toast.error("Could not update bookmark.");
    }
  };

  const handleApply = async () => {
    if (!selectedJobForApply) return;
    setSubmittingApply(true);

    try {
      const res = await fetch("/api/student/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJobForApply.id,
          coverNote
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application submission failed.");

      toast.success(`Application for ${selectedJobForApply.title} submitted successfully!`);
      setSelectedJobForApply(null);
      setCoverNote("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application.");
    } finally {
      setSubmittingApply(false);
    }
  };

  const profile = student?.studentProfile || {
    cgpa: 0,
    department: "",
    graduationYear: 2026,
    skills: ""
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.skills?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept =
        deptFilter === "ALL" ||
        job.eligibleDepartments === "ALL" ||
        job.eligibleDepartments.toLowerCase().includes(deptFilter.toLowerCase());

      const matchesType = typeFilter === "ALL" || job.jobType === typeFilter;

      const minCgpaNum = parseFloat(cgpaFilter);
      const matchesCgpa = cgpaFilter === "ALL" || job.minCgpa <= minCgpaNum;

      const checklist = checkDetailedEligibility(profile, job);
      const hasApplied = appliedJobIds.has(job.id);
      const isBookmarked = bookmarkedJobIds.has(job.id);

      let matchesStatus = true;
      if (statusView === "ELIGIBLE") {
        matchesStatus = checklist.isOverallEligible && !hasApplied;
      } else if (statusView === "APPLIED") {
        matchesStatus = hasApplied;
      } else if (statusView === "BOOKMARKS") {
        matchesStatus = isBookmarked;
      }

      return matchesSearch && matchesDept && matchesType && matchesCgpa && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "salary_desc") {
        const getVal = (s: string) => {
          const m = s.match(/([0-9.]+)/);
          return m ? parseFloat(m[1]) : 0;
        };
        return getVal(b.salary) - getVal(a.salary);
      }
      if (sortBy === "deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      {/* Top Banner: Academic Summary */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            {profile?.department ? profile.department[0] : "C"}
          </div>
          <div>
            <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <span>Automatic Eligibility Engine &amp; Smart Matching Active</span>
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="text-xs text-slate-600">
              Candidate: <strong>{profile.department || "Dept"}</strong> • CGPA: <strong>{profile.cgpa?.toFixed(2) || "0.00"}</strong> • Batch: <strong>{profile.graduationYear || 2026}</strong>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/student/profile">
            <Button size="sm" variant="outline" className="text-xs bg-white text-blue-700 border-blue-200">
              Profile &amp; Readiness Score
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by job title, company, skills, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Data Science">Data Science</option>
              <option value="Electronics">Electronics</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Job Types</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
            </select>

            <select
              value={cgpaFilter}
              onChange={(e) => setCgpaFilter(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Any CGPA Threshold</option>
              <option value="6.5">Min CGPA ≤ 6.5</option>
              <option value="7.5">Min CGPA ≤ 7.5</option>
              <option value="8.0">Min CGPA ≤ 8.0</option>
            </select>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="salary_desc">Sort: Highest Package</option>
              <option value="deadline">Sort: Deadline Soonest</option>
            </select>
          </div>
        </div>

        {/* Status view tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusView("ALL")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                statusView === "ALL" ? "bg-slate-900 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Campus Drives ({jobs.length})
            </button>
            <button
              onClick={() => setStatusView("ELIGIBLE")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                statusView === "ELIGIBLE" ? "bg-blue-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Eligible to Apply
            </button>
            <button
              onClick={() => setStatusView("APPLIED")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                statusView === "APPLIED" ? "bg-emerald-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Applied Drives ({appliedJobIds.size})
            </button>
            <button
              onClick={() => setStatusView("BOOKMARKS")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
                statusView === "BOOKMARKS" ? "bg-amber-600 text-white font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Bookmark className="h-3 w-3" />
              <span>Saved Bookmarks ({bookmarkedJobIds.size})</span>
            </button>
          </div>

          <span className="text-xs text-slate-500">
            Showing {filteredJobs.length} opportunities
          </span>
        </div>
      </div>

      {/* Jobs Listing */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Evaluating opportunities...</span>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
          <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No matching campus drives found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the department, status, or search filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => {
            const checklist = checkDetailedEligibility(profile, job);
            const matchResult = calculateSmartMatch(profile, job);
            const hasApplied = appliedJobIds.has(job.id);
            const appliedStatus = appliedJobIds.get(job.id);
            const isBookmarked = bookmarkedJobIds.has(job.id);

            return (
              <Card
                key={job.id}
                className={`transition-all ${
                  hasApplied
                    ? "border-blue-200 bg-blue-50/20"
                    : checklist.isOverallEligible
                    ? "border-slate-200 hover:border-blue-300 hover:shadow-md"
                    : "border-slate-200/60 bg-slate-50/50 opacity-90"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Job Meta */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/student/jobs/${job.id}`}
                          className="font-bold text-slate-900 text-lg hover:text-blue-600 transition"
                        >
                          {job.title}
                        </Link>
                        <Badge variant="outline" className="font-semibold text-slate-700 bg-white">
                          {job.company?.name}
                        </Badge>
                        <Badge variant={job.jobType === "Full-Time" ? "secondary" : "purple"}>
                          {job.jobType}
                        </Badge>

                        {/* FEATURE 1: Smart Match Badge */}
                        <Badge
                          variant={matchResult.matchPercentage >= 75 ? "success" : "secondary"}
                          className="text-[11px] font-bold gap-1"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>{matchResult.matchPercentage}% Match</span>
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl line-clamp-2">
                        {job.description}
                      </p>

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
                      </div>

                      {/* Skills */}
                      {job.skills && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {job.skills.split(",").map((s: string, sIdx: number) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Eligibility Banner */}
                      <div className="pt-1.5 flex items-center gap-2">
                        {checklist.isOverallEligible ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>Eligible to apply</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
                            <XCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
                            <span>
                              Not eligible: {!checklist.cgpa.pass ? checklist.cgpa.message : !checklist.department.pass ? checklist.department.message : !checklist.deadline.pass ? "Application deadline has expired." : "Batch criteria not met."}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0 shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleBookmark(job.id, e)}
                          title={isBookmarked ? "Remove bookmark" : "Save job"}
                          className={`p-2 rounded-lg border transition ${
                            isBookmarked
                              ? "bg-amber-50 border-amber-300 text-amber-600"
                              : "bg-white border-slate-200 text-slate-400 hover:text-slate-700"
                          }`}
                        >
                          <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
                        </button>

                        <Link href={`/student/jobs/${job.id}`}>
                          <Button variant="outline" size="sm" className="text-xs">
                            Details
                          </Button>
                        </Link>
                      </div>

                      {hasApplied ? (
                        <div className="flex flex-col items-center sm:items-end gap-1">
                          <Button disabled variant="outline" className="w-full sm:w-auto bg-slate-100 text-slate-600 text-xs gap-1.5 cursor-not-allowed">
                            <Check className="h-4 w-4 text-emerald-600" />
                            <span>Already Applied</span>
                          </Button>
                          <span className="text-[11px] font-semibold text-blue-600">
                            Status: {appliedStatus}
                          </span>
                        </div>
                      ) : checklist.isOverallEligible ? (
                        <Button
                          onClick={() => setSelectedJobForApply(job)}
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 font-semibold shadow-sm"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Apply Now</span>
                        </Button>
                      ) : (
                        <Button
                          disabled
                          variant="secondary"
                          className="w-full sm:w-auto text-xs cursor-not-allowed text-slate-400"
                        >
                          Ineligible
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Application Submission Modal Dialog */}
      {selectedJobForApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="purple" className="text-xs">
                  {selectedJobForApply.company?.name}
                </Badge>
                <span className="text-xs text-slate-500 font-medium">
                  {selectedJobForApply.salary}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-2">
                Apply for {selectedJobForApply.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your academic credentials ({profile?.department}, CGPA {profile?.cgpa}) and verified resume will be shared with the recruiter.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Cover Note / Message to Recruiter (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="Highlight your key projects, algorithmic abilities, or specific interest..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                disabled={submittingApply}
                onClick={() => setSelectedJobForApply(null)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={submittingApply}
                onClick={handleApply}
                className="bg-blue-600 hover:bg-blue-700 gap-1.5"
              >
                {submittingApply ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Confirm Application</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
