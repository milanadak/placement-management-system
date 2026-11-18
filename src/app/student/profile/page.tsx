"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Award,
  BookOpen,
  Calendar,
  Phone,
  Code2,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download,
  Trash2,
  Sparkles,
  TrendingUp,
  Target,
  Briefcase,
  Layers,
  ExternalLink,
  Edit2,
  Save,
  X,
  Plus,
  Eye,
  Check,
  Building,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { calculateReadinessScore } from "@/lib/matching";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [deletingResume, setDeletingResume] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "academics" | "skills" | "resume" | "applications">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNo: "",
    regNo: "",
    department: "Computer Science",
    course: "B.Tech",
    semester: 7,
    graduationYear: 2026,
    cgpa: 0,
    tenthPercentage: 85.0,
    twelfthPercentage: 82.0,
    backlogs: 0,
    phone: "",
    skills: "",
    softSkills: "Communication, Problem Solving, Leadership, Teamwork",
    certifications: "",
    projects: "[]",
    internships: "[]",
    semesterMarks: "[]",
    bio: ""
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/student/profile");
      const data = await res.json();
      if (data?.user) {
        setUserData(data.user);
        const p = data.user.studentProfile || {};
        setForm({
          name: data.user.name || "",
          email: data.user.email || "",
          rollNo: p.rollNo || "",
          regNo: p.regNo || `REG-${p.rollNo || "2026"}`,
          department: p.department || "Computer Science",
          course: p.course || "B.Tech",
          semester: p.semester || 7,
          graduationYear: p.graduationYear || 2026,
          cgpa: p.cgpa || 0,
          tenthPercentage: p.tenthPercentage || 85.0,
          twelfthPercentage: p.twelfthPercentage || 82.0,
          backlogs: p.backlogs || 0,
          phone: p.phone || "",
          skills: p.skills || "",
          softSkills: p.softSkills || "Communication, Problem Solving, Leadership, Teamwork",
          certifications: p.certifications || "",
          projects: p.projects || "[]",
          internships: p.internships || "[]",
          semesterMarks: p.semesterMarks || "[]",
          bio: p.bio || ""
        });
      }
    } catch {
      toast.error("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      toast.success("Academic dossier updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) return;

    if (resumeFile.size > 5 * 1024 * 1024) {
      toast.error("Resume file exceeds 5MB size limit.");
      return;
    }

    setUploadingResume(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const res = await fetch("/api/student/resume", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      toast.success("Verified resume uploaded successfully!");
      setResumeFile(null);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!confirm("Are you sure you want to delete your uploaded resume?")) return;
    setDeletingResume(true);
    try {
      const res = await fetch("/api/student/resume", {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      toast.success("Resume deleted successfully!");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resume.");
    } finally {
      setDeletingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-500 font-medium">Loading academic profile & dossier...</p>
      </div>
    );
  }

  const p = userData?.studentProfile || {};
  const applications = userData?.applications || [];
  const readiness = calculateReadinessScore(p);

  // Parse JSON data safely
  let semesterMarksList: { sem: number; sgpa: number }[] = [];
  try {
    semesterMarksList = JSON.parse(p.semesterMarks || "[]");
  } catch {
    semesterMarksList = [];
  }

  let projectsList: any[] = [];
  try {
    projectsList = JSON.parse(p.projects || "[]");
  } catch {
    projectsList = [];
  }

  let internshipsList: any[] = [];
  try {
    internshipsList = JSON.parse(p.internships || "[]");
  } catch {
    internshipsList = [];
  }

  const skillsList = p.skills ? p.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
  const softSkillsList = p.softSkills ? p.softSkills.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
  const certsList = p.certifications ? p.certifications.split(",").map((s: string) => s.trim()).filter(Boolean) : [];

  const isPlaced = applications.some((a: any) => a.status === "Selected");
  const selectedApps = applications.filter((a: any) => a.status === "Selected");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Profile Header Dossier Banner */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 relative">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="bg-white/95 hover:bg-white text-slate-800 shadow-sm font-medium gap-1.5 text-xs"
            >
              <Edit2 className="h-3.5 w-3.5 text-blue-600" />
              {isEditing ? "Close Editor" : "Edit Profile"}
            </Button>
          </div>
        </div>

        <div className="px-6 pb-6 pt-0 sm:flex sm:items-end sm:justify-between -mt-12 sm:-mt-16">
          <div className="sm:flex sm:items-end sm:gap-5">
            <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl bg-white p-1.5 shadow-md shrink-0">
              <div className="h-full w-full rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-inner">
                {userData?.name?.charAt(0) || "S"}
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{userData?.name}</h1>
                {isPlaced ? (
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 text-xs py-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Placed ({selectedApps.map((a: any) => a.job?.company?.name).join(", ")})
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 text-xs py-0.5">
                    <Target className="h-3 w-3" /> Active Placement Candidate
                  </Badge>
                )}
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-xs">
                  {p.course || "B.Tech"} · Sem {p.semester || 7}
                </Badge>
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Roll No: {p.rollNo}</span>
                <span>•</span>
                <span>Reg No: {p.regNo || `REG-${p.rollNo}`}</span>
                <span>•</span>
                <span>{p.department}</span>
                <span>•</span>
                <span>Batch of {p.graduationYear}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-0 flex items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Cumulative CGPA</span>
              <span className="text-xl font-bold text-blue-700">{Number(p.cgpa || 0).toFixed(2)}</span>
              <span className="text-xs text-slate-500"> / 10.0</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-right">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Readiness Score</span>
              <span className="text-xl font-bold text-emerald-600">{readiness.score}</span>
              <span className="text-xs text-slate-500"> / 100</span>
            </div>
          </div>
        </div>

        {/* 5 Tabs Header */}
        <div className="flex border-t border-slate-200 bg-slate-50/70 px-6 gap-2 overflow-x-auto">
          {[
            { id: "overview", label: "Overview", icon: User },
            { id: "academics", label: "Academics", icon: GraduationCap },
            { id: "skills", label: "Skills & Projects", icon: Code2 },
            { id: "resume", label: "Resume", icon: FileText },
            { id: "applications", label: `Applications (${applications.length})`, icon: Briefcase }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-700 bg-white shadow-sm -mb-[1px] rounded-t-lg"
                    : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Form Drawer/Section */}
      {isEditing && (
        <Card className="border-blue-200 shadow-md bg-blue-50/20">
          <CardHeader className="pb-3 border-b border-blue-100 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-blue-600" />
                Edit Student Profile & Academic Dossier
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Update your verified academic metrics, skills, projects, and personal contact info.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <form onSubmit={handleProfileSubmit}>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Full Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Phone / WhatsApp *</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 9876543210"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs">Department *</Label>
                <select
                  id="department"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="course" className="text-xs">Course / Degree</Label>
                <Input
                  id="course"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  placeholder="B.Tech"
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester" className="text-xs">Current Semester</Label>
                <Input
                  id="semester"
                  type="number"
                  min="1"
                  max="8"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) || 7 })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cgpa" className="text-xs">Cumulative CGPA (0 - 10) *</Label>
                <Input
                  id="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={form.cgpa}
                  onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) || 0 })}
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tenth" className="text-xs">10th Standard Percentage (%)</Label>
                <Input
                  id="tenth"
                  type="number"
                  step="0.1"
                  value={form.tenthPercentage}
                  onChange={(e) => setForm({ ...form, tenthPercentage: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="twelfth" className="text-xs">12th Standard Percentage (%)</Label>
                <Input
                  id="twelfth"
                  type="number"
                  step="0.1"
                  value={form.twelfthPercentage}
                  onChange={(e) => setForm({ ...form, twelfthPercentage: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="backlogs" className="text-xs">Active Backlogs Count</Label>
                <Input
                  id="backlogs"
                  type="number"
                  min="0"
                  value={form.backlogs}
                  onChange={(e) => setForm({ ...form, backlogs: parseInt(e.target.value) || 0 })}
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <Label htmlFor="skills" className="text-xs">Technical Skills (Comma separated) *</Label>
                <Input
                  id="skills"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  placeholder="Java, Python, React, Node.js, SQL, Docker"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <Label htmlFor="softSkills" className="text-xs">Soft Skills</Label>
                <Input
                  id="softSkills"
                  value={form.softSkills}
                  onChange={(e) => setForm({ ...form, softSkills: e.target.value })}
                  placeholder="Communication, Team Leadership, Problem Solving"
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <Label htmlFor="certifications" className="text-xs">Certifications & Honors</Label>
                <Input
                  id="certifications"
                  value={form.certifications}
                  onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                  placeholder="AWS Solutions Architect, Oracle Java SE, HackerRank 5-Star"
                  className="h-9 text-xs"
                />
              </div>

              <div className="md:col-span-3 space-y-1.5">
                <Label htmlFor="bio" className="text-xs">Professional Bio & Career Objective</Label>
                <textarea
                  id="bio"
                  rows={2}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Aspiring Software Engineer passionate about full stack architectures and distributed cloud systems..."
                  className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 border-t border-blue-100 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Quick Profile Summary Card */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Student Overview & Credentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                {p.bio && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed italic">
                    "{p.bio}"
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">University Roll No</span>
                    <span className="text-sm font-bold text-slate-800">{p.rollNo}</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Registration ID</span>
                    <span className="text-sm font-bold text-slate-800">{p.regNo || `REG-${p.rollNo}`}</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Department</span>
                    <span className="text-sm font-bold text-slate-800">{p.department}</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Current Semester</span>
                    <span className="text-sm font-bold text-slate-800">Semester {p.semester || 7}</span>
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Active Backlogs</span>
                    <span className={`text-sm font-bold ${(p.backlogs || 0) === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {(p.backlogs || 0) === 0 ? "0 (None)" : `${p.backlogs} Active`}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Graduation Batch</span>
                    <span className="text-sm font-bold text-slate-800">Class of {p.graduationYear}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{userData?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{p.phone || "Not provided"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Eligibility Status Card */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Academic Standing & Eligibility Verification
                </CardTitle>
                <CardDescription className="text-xs text-slate-600">
                  Verified criteria used by campus recruiters during drive shortlisting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-emerald-50/40">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">CGPA Threshold (9.25 / 10.0)</p>
                      <p className="text-[11px] text-slate-600">Qualifies for Tier-1 Super Dream packages (&gt; 20 LPA).</p>
                    </div>
                  </div>
                  <div className={`flex items-start gap-2.5 p-3 rounded-lg border ${(p.backlogs || 0) === 0 ? "border-slate-100 bg-emerald-50/40" : "border-amber-200 bg-amber-50/50"}`}>
                    {(p.backlogs || 0) === 0 ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800">Backlogs Status ({(p.backlogs || 0)} Backlogs)</p>
                      <p className="text-[11px] text-slate-600">
                        {(p.backlogs || 0) === 0 ? "Satisfies zero-backlog criteria for all top MNC drives." : "Requires clearing backlog before interview round."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-emerald-50/40">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Secondary (10th) Record: {p.tenthPercentage || 85}%</p>
                      <p className="text-[11px] text-slate-600">Meets standard 60% minimum aggregate cutoff.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-100 bg-emerald-50/40">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Higher Sec (12th) Record: {p.twelfthPercentage || 82}%</p>
                      <p className="text-[11px] text-slate-600">Meets standard 60% minimum aggregate cutoff.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Readiness Index & Resume Status */}
          <div className="space-y-6">
            {/* Readiness Index */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Placement Readiness
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                    {readiness.tier}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-3xl font-extrabold text-slate-900">{readiness.score}</span>
                  <span className="text-xs text-slate-500"> / 100</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Calculated Employability Index</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Academics (CGPA &ge; 7.5)</span>
                    <span className="font-semibold text-slate-900">{readiness.breakdown.academics} / 25 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(readiness.breakdown.academics / 25) * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Verified Resume File</span>
                    <span className="font-semibold text-slate-900">{readiness.breakdown.resume} / 25 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(readiness.breakdown.resume / 25) * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Technical Competencies</span>
                    <span className="font-semibold text-slate-900">{readiness.breakdown.skills} / 25 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(readiness.breakdown.skills / 25) * 100}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Profile Completeness & Bio</span>
                    <span className="font-semibold text-slate-900">{readiness.breakdown.profile} / 25 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(readiness.breakdown.profile / 25) * 100}%` }} />
                  </div>
                </div>

                {readiness.suggestions && readiness.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-700 mb-1">Improvement Advice:</p>
                    <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5">
                      {readiness.suggestions.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resume Quick Widget */}
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Active Placement Resume
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                {p.resumeUrl ? (
                  <div className="space-y-2.5">
                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                      <div className="truncate mr-2">
                        <p className="font-semibold text-slate-800 truncate">{p.resumeName || "Student_Resume.pdf"}</p>
                        <p className="text-[10px] text-slate-500">Verified institutional format</p>
                      </div>
                      <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-300 text-[10px]">
                        Active
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPreviewPdfOpen(true)}
                        className="flex-1 text-xs gap-1 border-slate-200 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-600" />
                        Preview
                      </Button>
                      <a href={p.resumeUrl} download className="flex-1">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1 border-slate-200 hover:bg-slate-50">
                          <Download className="h-3.5 w-3.5 text-slate-600" />
                          Download
                        </Button>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-500 space-y-2">
                    <p className="text-xs">No resume uploaded yet.</p>
                    <Button size="sm" onClick={() => setActiveTab("resume")} className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                      Upload Resume
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: ACADEMICS */}
      {activeTab === "academics" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                Comprehensive Academic Standing & History
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Semester-by-semester Grade Point Averages and standard eligibility benchmarks.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                  <span className="text-[11px] text-slate-600 uppercase font-semibold block">Cumulative CGPA</span>
                  <span className="text-2xl font-bold text-blue-700">{Number(p.cgpa || 0).toFixed(2)}</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Scale of 10.0</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-600 uppercase font-semibold block">Active Backlogs</span>
                  <span className={`text-2xl font-bold ${(p.backlogs || 0) === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {p.backlogs || 0}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{(p.backlogs || 0) === 0 ? "Clean record" : "Backlog pending"}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-600 uppercase font-semibold block">10th Standard</span>
                  <span className="text-2xl font-bold text-slate-800">{p.tenthPercentage || 85}%</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Board Aggregate</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-600 uppercase font-semibold block">12th Standard / Diploma</span>
                  <span className="text-2xl font-bold text-slate-800">{p.twelfthPercentage || 82}%</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Higher Secondary</span>
                </div>
              </div>

              {/* Semester-wise SGPA Progress Table */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2.5">Semester-wise SGPA Progression</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Semester</th>
                        <th className="px-4 py-2.5">Coursework Credits</th>
                        <th className="px-4 py-2.5">SGPA Obtained</th>
                        <th className="px-4 py-2.5">Academic Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {semesterMarksList.length > 0 ? (
                        semesterMarksList.map((sem, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-2.5 font-medium text-slate-800">Semester {sem.sem}</td>
                            <td className="px-4 py-2.5 text-slate-600">22 Credits</td>
                            <td className="px-4 py-2.5 font-bold text-blue-700">{Number(sem.sgpa).toFixed(2)}</td>
                            <td className="px-4 py-2.5">
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                                Passed
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-4 py-4 text-center text-slate-500">
                            Semester breakdown synchronized with college examination records.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: SKILLS & PROJECTS */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          {/* Technical and Soft Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-blue-600" />
                  Technical Competencies & Stack
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1">
                      {skill}
                    </Badge>
                  ))}
                  {skillsList.length === 0 && <span className="text-xs text-slate-400">No technical skills added yet.</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-indigo-600" />
                  Professional Soft Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {softSkillsList.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs px-2.5 py-1">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Projects Section */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600" />
                Featured Technical Projects
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Capstone, semester, and personal open source engineering projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {projectsList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectsList.map((proj: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-200 transition space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-slate-900 text-sm">{proj.title}</h4>
                        {proj.link && (
                          <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {proj.tech?.split(",").map((t: string, i: number) => (
                          <span key={i} className="text-[10px] bg-slate-200/80 text-slate-700 font-medium px-2 py-0.5 rounded-md">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No projects added yet. Click "Edit Profile" above to add your engineering projects.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Internships & Certifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-emerald-600" />
                  Industry Internships & Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {internshipsList.length > 0 ? (
                  internshipsList.map((intern: any, idx: number) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-900">{intern.company}</span>
                        <span className="text-[11px] text-slate-500">{intern.duration}</span>
                      </div>
                      <p className="text-blue-600 font-medium text-[11px]">{intern.role}</p>
                      <p className="text-slate-600 text-[11px]">{intern.description}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No internship experience logged.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Certifications & Recognitions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {certsList.length > 0 ? (
                  certsList.map((cert: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 bg-slate-50/70">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span className="text-slate-800 font-medium">{cert}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No certifications recorded.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 4: RESUME MANAGEMENT */}
      {activeTab === "resume" && (
        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                Resume Upload & Verification Management
              </CardTitle>
              <CardDescription className="text-xs text-slate-600">
                Upload your official college-approved resume in PDF or Word format (Max 5MB).
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5 space-y-6">
              {p.resumeUrl ? (
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{p.resumeName || "Verified_Resume.pdf"}</h4>
                      <p className="text-xs text-slate-500">
                        {p.resumeUploadDate ? `Uploaded on ${new Date(p.resumeUploadDate).toLocaleDateString()}` : "Active placement document"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewPdfOpen(true)}
                      className="text-xs gap-1.5 border-slate-200 hover:bg-slate-100"
                    >
                      <Eye className="h-3.5 w-3.5 text-blue-600" />
                      Preview PDF
                    </Button>
                    <a href={p.resumeUrl} download>
                      <Button size="sm" variant="outline" className="text-xs gap-1.5 border-slate-200 hover:bg-slate-100">
                        <Download className="h-3.5 w-3.5 text-slate-600" />
                        Download
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deletingResume}
                      onClick={handleResumeDelete}
                      className="text-xs gap-1.5 bg-red-600 hover:bg-red-700"
                    >
                      {deletingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>No verified resume found. Please upload a resume to become eligible for campus recruitment drives.</span>
                </div>
              )}

              {/* Upload or Replace Form */}
              <form onSubmit={handleResumeUpload} className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 text-center transition bg-slate-50/50">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800">
                    {p.resumeUrl ? "Upload replacement resume" : "Select or drag & drop resume file"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">PDF, DOC, or DOCX formats supported. Maximum size 5MB.</p>
                  <div className="mt-4 flex items-center justify-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>
                  {resumeFile && (
                    <p className="text-xs font-semibold text-blue-700 mt-2">
                      Selected: {resumeFile.name} ({(resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!resumeFile || uploadingResume}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5"
                  >
                    {uploadingResume ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {p.resumeUrl ? "Confirm & Replace Resume" : "Upload Verified Resume"}
                  </Button>
                </div>
              </form>

              {/* Embedded PDF Preview Modal / Viewer */}
              {p.resumeUrl && previewPdfOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200">
                    <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-slate-900 text-sm">Resume Preview: {p.resumeName || "Verified_Resume.pdf"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a href={p.resumeUrl} download>
                          <Button size="sm" variant="outline" className="text-xs gap-1 h-8">
                            <Download className="h-3.5 w-3.5" /> Download
                          </Button>
                        </a>
                        <Button size="sm" variant="ghost" onClick={() => setPreviewPdfOpen(false)} className="h-8 w-8 p-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1 bg-slate-100 p-2">
                      <iframe
                        src={p.resumeUrl}
                        title="Resume Preview"
                        className="w-full h-full rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 5: APPLICATIONS HISTORY */}
      {activeTab === "applications" && (
        <Card className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-600" />
              Placement Application History & Pipeline Status
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              Live tracking of your submissions across visiting corporate recruiters.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app: any) => {
                  const company = app.job?.company?.name || "Corporate Recruiter";
                  const statusColors: Record<string, string> = {
                    Applied: "bg-blue-50 text-blue-700 border-blue-200",
                    Shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
                    Aptitude: "bg-amber-50 text-amber-700 border-amber-200",
                    "Technical Interview": "bg-indigo-50 text-indigo-700 border-indigo-200",
                    "HR Interview": "bg-cyan-50 text-cyan-700 border-cyan-200",
                    Selected: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    Rejected: "bg-rose-50 text-rose-700 border-rose-200"
                  };

                  return (
                    <div key={app.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{app.job?.title}</h4>
                          <p className="text-xs text-slate-600">
                            {company} · Package: <span className="font-semibold text-blue-700">{app.job?.salary}</span> · Location: {app.job?.location}
                          </p>
                        </div>
                        <Badge className={`${statusColors[app.status] || "bg-slate-100 text-slate-700"} text-xs py-1 px-2.5 font-medium border`}>
                          {app.status}
                        </Badge>
                      </div>

                      {/* Recruitment Stages Mini Tracker */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 overflow-x-auto gap-2">
                        {["Applied", "Shortlisted", "Aptitude", "Technical Interview", "HR Interview", "Selected"].map((st, i) => {
                          const stages = ["Applied", "Shortlisted", "Aptitude", "Technical Interview", "HR Interview", "Selected"];
                          const currentIdx = stages.indexOf(app.status);
                          const isDone = currentIdx >= i && app.status !== "Rejected";
                          const isCurrent = app.status === st;

                          return (
                            <div key={st} className="flex items-center gap-1 shrink-0">
                              <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                isCurrent
                                  ? "bg-blue-600 text-white"
                                  : isDone
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-200 text-slate-600"
                              }`}>
                                {isDone ? "✓" : i + 1}
                              </span>
                              <span className={isCurrent ? "font-bold text-blue-700" : isDone ? "text-slate-800" : "text-slate-400"}>
                                {st}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {app.interviews && app.interviews.length > 0 && (
                        <div className="mt-2 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100 text-xs">
                          <p className="font-semibold text-blue-900 mb-1">Scheduled Interview Rounds:</p>
                          {app.interviews.map((iv: any) => (
                            <div key={iv.id} className="text-[11px] text-slate-700 flex justify-between">
                              <span>• {iv.roundName} ({iv.mode})</span>
                              <span>{new Date(iv.interviewDate).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                You have not applied for any placement drives yet.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
