"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  ExternalLink,
  Loader2,
  Award,
  Phone,
  Mail,
  BookOpen,
  Edit2,
  Save,
  GraduationCap,
  Code2,
  Briefcase,
  Layers,
  Upload,
  Eye,
  Trash2,
  AlertCircle,
  Sparkles,
  Check,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { calculateReadinessScore } from "@/lib/matching";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [cgpaSortOrder, setCgpaSortOrder] = useState<"desc" | "asc">("desc");

  // Dossier modal states
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [dossierTab, setDossierTab] = useState<"overview" | "academics" | "skills" | "resume" | "applications">("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [adminResumeFile, setAdminResumeFile] = useState<File | null>(null);
  const [uploadingAdminResume, setUploadingAdminResume] = useState(false);
  const [previewPdfOpen, setPreviewPdfOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
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
    softSkills: "",
    certifications: "",
    bio: ""
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      if (data?.students) {
        setStudents(data.students);
      }
    } catch {
      toast.error("Failed to load students list.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDossier = (s: any) => {
    setSelectedStudent(s);
    setDossierTab("overview");
    setIsEditing(false);
    setAdminResumeFile(null);
    const p = s.studentProfile || {};
    setEditForm({
      name: s.name,
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
      bio: p.bio || ""
    });
  };

  const handleSaveStudentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStudent.id,
          ...editForm
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success("Student academic record updated!");
      setIsEditing(false);
      
      // Update local state
      const updatedList = students.map(st => st.id === selectedStudent.id ? { ...st, ...data.user } : st);
      setStudents(updatedList);
      setSelectedStudent(data.user);
    } catch (err: any) {
      toast.error(err.message || "Failed to update student.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleAdminResumeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminResumeFile || !selectedStudent) return;

    if (adminResumeFile.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB size limit.");
      return;
    }

    setUploadingAdminResume(true);
    const formData = new FormData();
    formData.append("resume", adminResumeFile);
    formData.append("studentId", selectedStudent.id);

    try {
      const res = await fetch("/api/admin/resume", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      toast.success(`Resume uploaded for ${selectedStudent.name}!`);
      setAdminResumeFile(null);
      
      // Refresh student
      fetchStudents();
      setSelectedStudent({
        ...selectedStudent,
        studentProfile: {
          ...selectedStudent.studentProfile,
          ...data.profile
        }
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload resume.");
    } finally {
      setUploadingAdminResume(false);
    }
  };

  const handleAdminResumeDelete = async () => {
    if (!selectedStudent || !confirm(`Delete verified resume for ${selectedStudent.name}?`)) return;

    try {
      const res = await fetch(`/api/admin/resume?studentId=${selectedStudent.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      toast.success("Resume deleted successfully!");
      fetchStudents();
      setSelectedStudent({
        ...selectedStudent,
        studentProfile: {
          ...selectedStudent.studentProfile,
          resumeUrl: null,
          resumeName: null,
          resumeUploadDate: null
        }
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to delete resume.");
    }
  };

  const filteredStudents = students
    .filter((s) => {
      const p = s.studentProfile;
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        (p?.rollNo && p.rollNo.toLowerCase().includes(search.toLowerCase())) ||
        (p?.skills && p.skills.toLowerCase().includes(search.toLowerCase()));

      const matchesDept =
        selectedDept === "ALL" ||
        (p?.department && p.department.toLowerCase().includes(selectedDept.toLowerCase()));

      return matchesSearch && matchesDept;
    })
    .sort((a, b) => {
      const cgpaA = a.studentProfile?.cgpa || 0;
      const cgpaB = b.studentProfile?.cgpa || 0;
      return cgpaSortOrder === "desc" ? cgpaB - cgpaA : cgpaA - cgpaB;
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Registered Student Records & Dossiers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic profiles, edit candidate details, inspect verified resumes, and evaluate recruitment status.
          </p>
        </div>

        <a href="/api/admin/reports?type=students" target="_blank" rel="noreferrer">
          <Button size="sm" variant="outline" className="text-xs gap-1.5 h-9">
            <Download className="h-3.5 w-3.5" />
            <span>Download Students CSV</span>
          </Button>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by student name, roll number, email, or skill..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 text-xs"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCgpaSortOrder(cgpaSortOrder === "desc" ? "asc" : "desc")}
              className="h-10 text-xs gap-1.5"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
              <span>CGPA {cgpaSortOrder === "desc" ? "(High to Low)" : "(Low to High)"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs text-slate-500">Loading student directory...</p>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Backlogs</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Placement Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const p = s.studentProfile;
                  const isPlaced = s.applications?.some((a: any) => a.status === "Selected");
                  const backlogs = p?.backlogs || 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[11px] text-slate-400">{s.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {p?.rollNo || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {p?.department || "Unassigned"}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${backlogs === 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                          {backlogs === 0 ? "0 (Clean)" : `${backlogs} Active`}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {p?.cgpa?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-blue-600">{s.applications?.length || 0}</span> applied
                      </td>
                      <td className="py-3 px-4">
                        {isPlaced ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Placed
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            In Process
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDossier(s)}
                          className="h-7 text-[11px] px-2.5 text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          Review Dossier
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

      {/* Complete 5-Tab Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-white/20 text-white font-bold text-xl flex items-center justify-center shadow-inner">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">{selectedStudent.name}</h3>
                    {selectedStudent.applications?.some((a: any) => a.status === "Selected") && (
                      <Badge className="bg-emerald-500 text-white text-[10px] border-0">
                        Placed Candidate
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-blue-100 font-mono">
                    {selectedStudent.studentProfile?.rollNo} • {selectedStudent.email} • {selectedStudent.studentProfile?.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-white/90 hover:bg-white text-slate-800 text-xs h-8 gap-1.5 font-medium border-0 shadow-sm"
                >
                  <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                  {isEditing ? "View Dossier" : "Edit Academic Record"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-5 gap-1 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: Users },
                { id: "academics", label: "Academics", icon: GraduationCap },
                { id: "skills", label: "Skills & Projects", icon: Code2 },
                { id: "resume", label: "Resume", icon: FileText },
                { id: "applications", label: `Applications (${selectedStudent.applications?.length || 0})`, icon: Briefcase }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = dossierTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setDossierTab(tab.id as any)}
                    className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                      isActive
                        ? "border-blue-600 text-blue-700 bg-white -mb-[1px] rounded-t-lg shadow-xs"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {isEditing ? (
                /* Edit Form for Administrator */
                <form onSubmit={handleSaveStudentEdit} className="space-y-4">
                  <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl text-blue-800 text-xs flex items-center gap-2">
                    <Edit2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Administrator Mode: You are modifying official institutional records for this student.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="ename">Candidate Name *</Label>
                      <Input
                        id="ename"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ephone">Contact Phone</Label>
                      <Input
                        id="ephone"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="edept">Department *</Label>
                      <select
                        id="edept"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs"
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Electrical Engineering">Electrical Engineering</option>
                        <option value="Mechanical Engineering">Mechanical Engineering</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="ecgpa">CGPA (0 - 10) *</Label>
                      <Input
                        id="ecgpa"
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={editForm.cgpa}
                        onChange={(e) => setEditForm({ ...editForm, cgpa: parseFloat(e.target.value) || 0 })}
                        required
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="etenth">10th Standard (%)</Label>
                      <Input
                        id="etenth"
                        type="number"
                        step="0.1"
                        value={editForm.tenthPercentage}
                        onChange={(e) => setEditForm({ ...editForm, tenthPercentage: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="etwelfth">12th Standard (%)</Label>
                      <Input
                        id="etwelfth"
                        type="number"
                        step="0.1"
                        value={editForm.twelfthPercentage}
                        onChange={(e) => setEditForm({ ...editForm, twelfthPercentage: parseFloat(e.target.value) || 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="ebacklogs">Active Backlogs</Label>
                      <Input
                        id="ebacklogs"
                        type="number"
                        min="0"
                        value={editForm.backlogs}
                        onChange={(e) => setEditForm({ ...editForm, backlogs: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="esem">Semester</Label>
                      <Input
                        id="esem"
                        type="number"
                        min="1"
                        max="8"
                        value={editForm.semester}
                        onChange={(e) => setEditForm({ ...editForm, semester: parseInt(e.target.value) || 7 })}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="eyear">Graduation Year</Label>
                      <Input
                        id="eyear"
                        type="number"
                        value={editForm.graduationYear}
                        onChange={(e) => setEditForm({ ...editForm, graduationYear: parseInt(e.target.value) || 2026 })}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="eskills">Technical Skills (Comma separated)</Label>
                    <Input
                      id="eskills"
                      value={editForm.skills}
                      onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="ebio">Career Bio</Label>
                    <textarea
                      id="ebio"
                      rows={2}
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full rounded-md border border-slate-200 bg-white p-2 text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" disabled={savingEdit} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
                      {savingEdit ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Save Updates
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  {/* TAB: OVERVIEW */}
                  {dossierTab === "overview" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Roll Number</span>
                          <span className="text-sm font-bold text-slate-900">{selectedStudent.studentProfile?.rollNo}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Current CGPA</span>
                          <span className="text-sm font-bold text-blue-700">{Number(selectedStudent.studentProfile?.cgpa || 0).toFixed(2)}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Active Backlogs</span>
                          <span className={`text-sm font-bold ${(selectedStudent.studentProfile?.backlogs || 0) === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                            {(selectedStudent.studentProfile?.backlogs || 0) === 0 ? "0 (None)" : `${selectedStudent.studentProfile?.backlogs} Pending`}
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Passing Batch</span>
                          <span className="text-sm font-bold text-slate-900">{selectedStudent.studentProfile?.graduationYear || 2026}</span>
                        </div>
                      </div>

                      {selectedStudent.studentProfile?.bio && (
                        <div className="p-3 bg-blue-50/40 rounded-xl border border-blue-100 text-slate-700 italic">
                          "{selectedStudent.studentProfile?.bio}"
                        </div>
                      )}

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                        <span className="text-xs font-semibold text-slate-800">Contact & Verification Details</span>
                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          <div>Email: <span className="text-slate-900 font-medium">{selectedStudent.email}</span></div>
                          <div>Phone: <span className="text-slate-900 font-medium">{selectedStudent.studentProfile?.phone || "N/A"}</span></div>
                          <div>Course: <span className="text-slate-900 font-medium">{selectedStudent.studentProfile?.course || "B.Tech"} (Sem {selectedStudent.studentProfile?.semester || 7})</span></div>
                          <div>Registration ID: <span className="text-slate-900 font-medium">{selectedStudent.studentProfile?.regNo || `REG-${selectedStudent.studentProfile?.rollNo}`}</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: ACADEMICS */}
                  {dossierTab === "academics" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">Cumulative CGPA</span>
                          <span className="text-xl font-bold text-blue-700">{Number(selectedStudent.studentProfile?.cgpa || 0).toFixed(2)}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">10th Standard Marks</span>
                          <span className="text-xl font-bold text-slate-800">{selectedStudent.studentProfile?.tenthPercentage || 85}%</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] uppercase font-semibold text-slate-500 block">12th Standard Marks</span>
                          <span className="text-xl font-bold text-slate-800">{selectedStudent.studentProfile?.twelfthPercentage || 82}%</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Semester Performance Record</h4>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-600 uppercase">
                              <tr>
                                <th className="px-3 py-2">Semester</th>
                                <th className="px-3 py-2">Credits</th>
                                <th className="px-3 py-2">SGPA</th>
                                <th className="px-3 py-2">Result</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {(() => {
                                try {
                                  const marks = JSON.parse(selectedStudent.studentProfile?.semesterMarks || "[]");
                                  return marks.map((m: any, idx: number) => (
                                    <tr key={idx}>
                                      <td className="px-3 py-2 font-medium">Semester {m.sem}</td>
                                      <td className="px-3 py-2 text-slate-500">22 Credits</td>
                                      <td className="px-3 py-2 font-bold text-blue-700">{Number(m.sgpa).toFixed(2)}</td>
                                      <td className="px-3 py-2 text-emerald-600 font-semibold">Passed</td>
                                    </tr>
                                  ));
                                } catch {
                                  return <tr><td colSpan={4} className="p-2 text-center text-slate-400">No semester breakdown available.</td></tr>;
                                }
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: SKILLS & PROJECTS */}
                  {dossierTab === "skills" && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-2">Technical Skills & Stacks</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedStudent.studentProfile?.skills?.split(",").map((sk: string, i: number) => (
                            <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-xs">
                              {sk.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {selectedStudent.studentProfile?.softSkills && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Soft Skills</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedStudent.studentProfile.softSkills.split(",").map((sk: string, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs">
                                {sk.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedStudent.studentProfile?.certifications && (
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">Certifications</h4>
                          <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                            {selectedStudent.studentProfile.certifications}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: RESUME MANAGEMENT (STUDENT & ADMIN) */}
                  {dossierTab === "resume" && (
                    <div className="space-y-4">
                      {selectedStudent.studentProfile?.resumeUrl ? (
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-600" />
                            <div>
                              <p className="font-semibold text-slate-900 text-xs">{selectedStudent.studentProfile.resumeName || "Verified_Resume.pdf"}</p>
                              <p className="text-[11px] text-slate-500">
                                {selectedStudent.studentProfile.resumeUploadDate
                                  ? `Uploaded on ${new Date(selectedStudent.studentProfile.resumeUploadDate).toLocaleDateString()}`
                                  : "Institutional record verified"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewPdfOpen(true)}
                              className="text-xs h-8 gap-1"
                            >
                              <Eye className="h-3.5 w-3.5 text-blue-600" />
                              Preview
                            </Button>
                            <a href={selectedStudent.studentProfile.resumeUrl} download>
                              <Button size="sm" variant="outline" className="text-xs h-8 gap-1">
                                <Download className="h-3.5 w-3.5 text-slate-600" />
                                Download
                              </Button>
                            </a>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={handleAdminResumeDelete}
                              className="text-xs h-8 gap-1 bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 text-xs text-amber-800 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                          <span>No resume uploaded for this student yet. As an administrator, you may upload a resume on their behalf below.</span>
                        </div>
                      )}

                      {/* Administrator Upload on Behalf of Student */}
                      <form onSubmit={handleAdminResumeUpload} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                        <span className="font-semibold text-slate-800 block text-xs">
                          Upload / Replace Verified Resume on Behalf of Student
                        </span>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => setAdminResumeFile(e.target.files?.[0] || null)}
                            className="text-xs text-slate-600 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer flex-1"
                          />
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!adminResumeFile || uploadingAdminResume}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 shrink-0 gap-1.5"
                          >
                            {uploadingAdminResume ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                            Upload Resume
                          </Button>
                        </div>
                      </form>

                      {/* PDF Preview Modal */}
                      {selectedStudent.studentProfile?.resumeUrl && previewPdfOpen && (
                        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden border border-slate-200">
                            <div className="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                              <span className="font-semibold text-slate-900 text-xs">
                                Resume Preview: {selectedStudent.name}
                              </span>
                              <Button size="sm" variant="ghost" onClick={() => setPreviewPdfOpen(false)} className="h-7 w-7 p-0">
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex-1 bg-slate-100 p-2">
                              <iframe
                                src={selectedStudent.studentProfile.resumeUrl}
                                title="Resume Preview"
                                className="w-full h-full rounded-lg border border-slate-200 bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: APPLICATIONS */}
                  {dossierTab === "applications" && (
                    <div className="space-y-3">
                      {selectedStudent.applications?.length > 0 ? (
                        selectedStudent.applications.map((app: any) => (
                          <div key={app.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{app.job?.title}</p>
                              <p className="text-[11px] text-slate-500">
                                {app.job?.company?.name} • Package: {app.job?.salary} • Applied on {new Date(app.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge className={`${
                              app.status === "Selected" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              app.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                              "bg-blue-50 text-blue-700 border-blue-200"
                            } text-[10px]`}>
                              {app.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-center py-4 text-slate-400">No applications submitted yet.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
