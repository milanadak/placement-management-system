"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  XCircle,
  Bookmark,
  Send,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  Loader2,
  Share2,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { calculateSmartMatch, checkDetailedEligibility } from "@/lib/matching";

export default function StudentJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any | null>(null);
  const [student, setStudent] = useState<any | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Application modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [submittingApply, setSubmittingApply] = useState(false);

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      const [jobRes, profileRes, bookmarksRes] = await Promise.all([
        fetch(`/api/jobs/${jobId}`),
        fetch("/api/student/profile"),
        fetch("/api/student/bookmarks")
      ]);

      const jobData = await jobRes.json();
      const profileData = await profileRes.json();
      const bookmarksData = await bookmarksRes.json();

      if (jobData?.job) {
        setJob(jobData.job);
      }

      if (profileData?.user) {
        setStudent(profileData.user);
        const existingApp = profileData.user.applications?.find((a: any) => a.jobId === jobId);
        if (existingApp) {
          setHasApplied(true);
          setAppliedStatus(existingApp.status);
        }
      }

      if (bookmarksData?.bookmarks) {
        const found = bookmarksData.bookmarks.some((b: any) => b.jobId === jobId);
        setIsBookmarked(found);
      }
    } catch {
      toast.error("Failed to load job details.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await fetch("/api/student/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to update bookmark");

      setIsBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Job saved to your bookmarks!" : "Job removed from bookmarks.");
    } catch {
      toast.error("Could not update bookmark.");
    }
  };

  const handleApply = async () => {
    setSubmittingApply(true);
    try {
      const res = await fetch("/api/student/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverNote })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");

      toast.success("Application successfully submitted!");
      setHasApplied(true);
      setAppliedStatus("Applied");
      setIsApplyModalOpen(false);
      setCoverNote("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application.");
    } finally {
      setSubmittingApply(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span>Loading drive details...</span>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-2" />
        <h3 className="font-bold text-slate-800">Job Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">This campus drive may have been removed or closed.</p>
        <Link href="/student/jobs" className="mt-4 inline-block">
          <Button size="sm">Back to Jobs</Button>
        </Link>
      </div>
    );
  }

  const profile = student?.studentProfile || {
    cgpa: 0,
    department: "",
    graduationYear: 2026,
    skills: ""
  };

  const matchResult = calculateSmartMatch(profile, job);
  const checklist = checkDetailedEligibility(profile, job);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Campus Drives</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleBookmark}
            className={`text-xs gap-1.5 ${isBookmarked ? "border-amber-300 bg-amber-50 text-amber-800" : ""}`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? "fill-amber-500 text-amber-500" : ""}`} />
            <span>{isBookmarked ? "Bookmarked" : "Save Job"}</span>
          </Button>
        </div>
      </div>

      {/* Main Header Card */}
      <Card className="border-slate-200">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-bold text-slate-800 bg-white text-xs px-2.5 py-1">
                  {job.company.name}
                </Badge>
                <Badge variant={job.jobType === "Full-Time" ? "secondary" : "purple"}>
                  {job.jobType}
                </Badge>
                <Badge variant="success" className="font-mono text-xs">
                  {job.salary}
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {job.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1 text-amber-700 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  Apply Deadline: {new Date(job.deadline).toLocaleDateString()}
                </span>
                <span className="text-slate-400">|</span>
                <span>Minimum CGPA: <strong>{job.minCgpa.toFixed(1)}</strong></span>
              </div>
            </div>

            {/* Application Action Button */}
            <div className="flex flex-col sm:flex-row md:flex-col items-stretch md:items-end gap-2 shrink-0">
              {hasApplied ? (
                <div className="text-right space-y-1">
                  <Button disabled variant="outline" className="w-full bg-slate-100 text-slate-600 text-xs gap-1.5 cursor-not-allowed">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Already Applied</span>
                  </Button>
                  <div className="text-[11px] font-semibold text-blue-600">
                    Pipeline Status: {appliedStatus}
                  </div>
                </div>
              ) : checklist.isOverallEligible ? (
                <Button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-xs font-semibold gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Apply for this Position</span>
                </Button>
              ) : (
                <Button disabled variant="secondary" className="w-full text-xs text-slate-400 cursor-not-allowed">
                  Not Eligible to Apply
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Left: Smart Match & Eligibility Transparency | Right: Role Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1 Col): Smart Match & Eligibility Checklist */}
        <div className="space-y-6">
          {/* FEATURE 1: Smart Job Match Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  Smart Job Match
                </span>
                <Badge variant={matchResult.matchPercentage >= 75 ? "success" : "secondary"} className="text-xs font-bold">
                  {matchResult.matchPercentage}% Match
                </Badge>
              </div>
              <CardDescription className="text-xs text-blue-800/80">
                Transparent compatibility index based on academic standing, branch, and technical skill overlap.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Academic CGPA (35%):</span>
                  <span className="font-bold text-slate-900">{matchResult.breakdown.cgpaScore} / 35</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Department Alignment (30%):</span>
                  <span className="font-bold text-slate-900">{matchResult.breakdown.deptScore} / 30</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Skill Compatibility (25%):</span>
                  <span className="font-bold text-slate-900">{matchResult.breakdown.skillsScore} / 25</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-600">Batch Eligibility (10%):</span>
                  <span className="font-bold text-slate-900">{matchResult.breakdown.batchScore} / 10</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white border border-blue-200/60 text-[11px] text-slate-700 italic">
                &ldquo;{matchResult.explanation}&rdquo;
              </div>

              {matchResult.missingSkills.length > 0 && (
                <div className="text-[11px] text-slate-500 pt-1">
                  <span className="font-semibold text-slate-700">Missing skills to learn:</span>{" "}
                  {matchResult.missingSkills.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* FEATURE 3: Eligibility Transparency Checklist */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-sm font-bold">Eligibility Transparency</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Criteria verified automatically by the placement engine
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              {/* CGPA */}
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                {checklist.cgpa.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-800">Minimum CGPA (≥ {checklist.cgpa.required})</div>
                  <div className="text-[11px] text-slate-500">{checklist.cgpa.message}</div>
                </div>
              </div>

              {/* Department */}
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                {checklist.department.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-800">Target Department</div>
                  <div className="text-[11px] text-slate-500">{checklist.department.message}</div>
                </div>
              </div>

              {/* Batch Year */}
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                {checklist.batch.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-800">Graduation Batch</div>
                  <div className="text-[11px] text-slate-500">{checklist.batch.message}</div>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100">
                {checklist.deadline.pass ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-slate-800">Application Deadline</div>
                  <div className="text-[11px] text-slate-500">{checklist.deadline.message}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (2 Cols): Job Details, Requirements & Recruiter Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold">Role Description &amp; Responsibilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-700 leading-relaxed">
              <p className="whitespace-pre-line text-sm text-slate-800 font-normal">
                {job.description}
              </p>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs">Required Technical Competencies</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(job.skills || "").split(",").map((sk: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {sk.trim()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 text-xs mb-2">Eligible Engineering Branches</h4>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                  {job.eligibleDepartments}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recruiter Profile */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-bold">About {job.company.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600">
              <p className="leading-relaxed">{job.company.description}</p>
              <div className="flex flex-wrap items-center gap-4 pt-2 text-slate-500">
                <span>Sector: <strong>{job.company.industry}</strong></span>
                <span>Headquarters: <strong>{job.company.location}</strong></span>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <span>Corporate Careers Site</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Application Confirmation Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base text-slate-900">Confirm Job Application</h3>
                <p className="text-xs text-slate-500 mt-0.5">{job.title} at {job.company.name}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsApplyModalOpen(false)}
                className="h-7 w-7 p-0"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/70 text-blue-900 space-y-1">
                <div className="font-semibold">Candidate Credentials to be Submitted:</div>
                <div className="text-[11px] text-blue-800">
                  {student?.name} • {profile.department} • CGPA: {profile.cgpa?.toFixed(2)} • Batch {profile.graduationYear}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Cover Note / Key Projects (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Summarize your relevant domain projects, algorithmic problem solving, or motivation..."
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={submittingApply}
                  onClick={handleApply}
                  className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                >
                  {submittingApply && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Submit Application</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
