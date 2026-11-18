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
  Target
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
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    rollNo: "",
    department: "",
    graduationYear: 2026,
    cgpa: 0,
    phone: "",
    skills: "",
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
          department: p.department || "Computer Science",
          graduationYear: p.graduationYear || 2026,
          cgpa: p.cgpa || 0,
          phone: p.phone || "",
          skills: p.skills || "",
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
      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error("Please select a resume file first.");
      return;
    }

    if (resumeFile.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB size limit.");
      return;
    }

    setUploadingResume(true);
    const data = new FormData();
    data.append("resume", resumeFile);

    try {
      const res = await fetch("/api/student/resume", {
        method: "POST",
        body: data
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to upload resume");
      toast.success("Resume uploaded successfully!");
      setResumeFile(null);
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Resume upload failed.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm("Are you sure you want to delete your uploaded resume?")) return;

    setDeletingResume(true);
    try {
      const res = await fetch("/api/student/resume", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete resume");

      toast.success("Resume deleted from student record.");
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Could not delete resume.");
    } finally {
      setDeletingResume(false);
    }
  };

  const profile = userData?.studentProfile;
  const readiness = calculateReadinessScore({
    cgpa: form.cgpa,
    department: form.department,
    graduationYear: form.graduationYear,
    skills: form.skills,
    resumeUrl: profile?.resumeUrl,
    bio: form.bio,
    phone: form.phone
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500 gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Profile &amp; Readiness</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your academic credentials, verified resume, and review your placement readiness score.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={readiness.score >= 80 ? "success" : readiness.score >= 60 ? "info" : "warning"}
            className="text-xs font-bold gap-1 px-3 py-1"
          >
            <Sparkles className="h-3 w-3" />
            <span>Readiness Score: {readiness.score}/100 ({readiness.tier})</span>
          </Badge>
        </div>
      </div>

      {/* FEATURE 2: Placement Readiness Score Banner */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Placement Readiness Index: <span className="text-blue-600">{readiness.score} / 100</span>
                </h3>
                <Badge variant={readiness.score >= 80 ? "success" : "purple"} className="text-xs">
                  {readiness.tier}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 text-[11px]">Academic CGPA</span>
                  <div className="font-bold text-slate-900">{readiness.breakdown.academics} / 25 pts</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Resume Verified</span>
                  <div className="font-bold text-slate-900">{readiness.breakdown.resume} / 25 pts</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Technical Skills</span>
                  <div className="font-bold text-slate-900">{readiness.breakdown.skills} / 25 pts</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Contact &amp; Bio</span>
                  <div className="font-bold text-slate-900">{readiness.breakdown.profile} / 25 pts</div>
                </div>
              </div>

              {readiness.suggestions.length > 0 && (
                <div className="pt-2 text-xs text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800 text-[11px]">Actionable Steps to Reach 100%:</span>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-blue-800">
                    {readiness.suggestions.map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="text-center shrink-0">
              <div className="inline-flex h-20 w-20 rounded-full border-4 border-blue-600 items-center justify-center font-extrabold text-2xl text-blue-700 bg-white shadow-sm">
                {readiness.score}%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Academic summary card & Resume upload */}
        <div className="space-y-6">
          {/* Card: Student Identity */}
          <Card className="border-slate-200">
            <CardHeader className="text-center pb-2">
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 font-extrabold text-xl flex items-center justify-center mx-auto mb-2 border-2 border-blue-200 shadow-xs">
                {form.name ? form.name[0] : "S"}
              </div>
              <CardTitle className="text-base">{form.name}</CardTitle>
              <CardDescription className="text-xs font-mono">{form.rollNo}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5 pt-2 text-xs text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Department</span>
                <span className="font-semibold text-slate-800">{form.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Current CGPA</span>
                <span className="font-bold text-emerald-600">{Number(form.cgpa).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Batch Year</span>
                <span className="font-semibold text-slate-800">{form.graduationYear}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Email</span>
                <span className="font-medium text-slate-800 truncate max-w-[140px]">{form.email}</span>
              </div>
            </CardContent>
          </Card>

          {/* Card: Resume Upload & Management */}
          <Card className="border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm font-bold">Verified Resume</CardTitle>
              </div>
              <CardDescription className="text-[11px]">
                PDF or Word format (Max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.resumeUrl ? (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate">{profile.resumeName || "Resume.pdf"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </a>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={deletingResume}
                      onClick={handleDeleteResume}
                      className="h-6 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-100/50 p-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      <span>Delete File</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>No verified resume attached.</span>
                </div>
              )}

              <form onSubmit={handleResumeUpload} className="space-y-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="text-xs file:text-xs"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={uploadingResume || !resumeFile}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-xs gap-1.5"
                >
                  {uploadingResume ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      Upload / Replace Resume
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Side (2 Cols): Edit Academic Credentials */}
        <div className="md:col-span-2">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base font-bold">Edit Academic Profile</CardTitle>
              <CardDescription className="text-xs">
                Accurate information ensures automated eligibility matching during campus recruitment.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">College Email (Read-only)</Label>
                    <Input
                      id="email"
                      disabled
                      value={form.email}
                      className="bg-slate-100 cursor-not-allowed text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="rollNo">University Roll Number (Unique ID)</Label>
                    <Input
                      id="rollNo"
                      disabled
                      value={form.rollNo}
                      className="bg-slate-100 cursor-not-allowed font-mono text-slate-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone / WhatsApp *</Label>
                    <Input
                      id="phone"
                      required
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="department">Department *</Label>
                    <select
                      id="department"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <Label htmlFor="graduationYear">Graduation Batch *</Label>
                    <select
                      id="graduationYear"
                      value={form.graduationYear}
                      onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value) })}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cgpa">Current Cumulative CGPA (0 - 10) *</Label>
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={form.cgpa}
                      onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="skills">Technical Skills (Comma separated) *</Label>
                  <Input
                    id="skills"
                    required
                    placeholder="Java, Python, C++, React, Node.js, SQL"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {form.skills.split(",").filter(s => s.trim().length > 0).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 border border-blue-200">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Professional Bio &amp; Career Summary</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    placeholder="Briefly state your technical aspirations, domain focus, and key project outcomes..."
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 gap-2 h-10 px-6 font-semibold"
                  >
                    {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Save Changes</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
