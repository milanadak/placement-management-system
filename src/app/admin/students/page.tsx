"use client";

import { useState, useEffect } from "react";
import { Users, Search, Download, FileText, CheckCircle2, XCircle, ArrowUpDown, ExternalLink, Loader2, Award, Phone, Mail, BookOpen, Edit2, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [cgpaSortOrder, setCgpaSortOrder] = useState<"desc" | "asc">("desc");

  // Modal and Edit states
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    department: "Computer Science",
    graduationYear: 2026,
    cgpa: 0,
    phone: "",
    skills: ""
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
    setIsEditing(false);
    setEditForm({
      name: s.name,
      department: s.studentProfile?.department || "Computer Science",
      graduationYear: s.studentProfile?.graduationYear || 2026,
      cgpa: s.studentProfile?.cgpa || 0,
      phone: s.studentProfile?.phone || "",
      skills: s.studentProfile?.skills || ""
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
      setSelectedStudent(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to update student.");
    } finally {
      setSavingEdit(false);
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
            Registered Student Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic profiles, edit candidate details, inspect resumes, and track individual drives.
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
              className="pl-9 h-10"
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
              onClick={() => setCgpaSortOrder(prev => prev === "desc" ? "asc" : "desc")}
              className="h-10 text-xs gap-1.5 border-slate-200 text-slate-700"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span>CGPA ({cgpaSortOrder === "desc" ? "Highest First" : "Lowest First"})</span>
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Displaying {filteredStudents.length} of {students.length} registered students</span>
          <span className="text-slate-400 text-[11px]">Click Review Dossier to inspect or edit academic records</span>
        </div>
      </div>

      {/* Students Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading student records...</span>
        </div>
      ) : (
        <Card className="border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll Number</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Batch</th>
                  <th className="py-3 px-4">CGPA</th>
                  <th className="py-3 px-4">Applications</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const p = s.studentProfile;
                  const isPlaced = s.applications.some((a: any) => a.status === "Selected");

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
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {p?.graduationYear || 2026}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                          {p?.cgpa?.toFixed(2) || "0.00"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="font-semibold text-blue-600">{s.applications.length}</span> applied
                      </td>
                      <td className="py-3 px-4">
                        {isPlaced ? (
                          <Badge variant="success" className="text-[10px]">
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
                          className="h-7 text-[11px] px-2.5 text-blue-600 hover:text-blue-700 border-blue-200"
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

      {/* Student Dossier & Edit Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedStudent.studentProfile?.rollNo} • {selectedStudent.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-8 text-xs gap-1"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>{isEditing ? "View Mode" : "Edit Academic Details"}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStudent(null)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Editable Form vs Dossier View */}
            {isEditing ? (
              <form onSubmit={handleSaveStudentEdit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sname">Full Name *</Label>
                    <Input
                      id="sname"
                      required
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sphone">Contact Phone *</Label>
                    <Input
                      id="sphone"
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="sdept">Department *</Label>
                    <select
                      id="sdept"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className="w-full h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <Label htmlFor="scgpa">CGPA (0 - 10) *</Label>
                    <Input
                      id="scgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      value={editForm.cgpa}
                      onChange={(e) => setEditForm({ ...editForm, cgpa: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="syear">Graduation Batch *</Label>
                    <Input
                      id="syear"
                      type="number"
                      required
                      value={editForm.graduationYear}
                      onChange={(e) => setEditForm({ ...editForm, graduationYear: parseInt(e.target.value) || 2026 })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="sskills">Technical Skills (Comma separated) *</Label>
                  <Input
                    id="sskills"
                    required
                    value={editForm.skills}
                    onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={savingEdit}
                    className="bg-blue-600 hover:bg-blue-700 gap-1.5"
                  >
                    {savingEdit && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <Save className="h-3.5 w-3.5" />
                    <span>Save Student Changes</span>
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Academic details grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.studentProfile?.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">CGPA</span>
                    <span className="font-bold text-emerald-600 text-sm">{selectedStudent.studentProfile?.cgpa?.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Batch Year</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.studentProfile?.graduationYear}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Contact</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.studentProfile?.phone || "N/A"}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-1.5">Technical Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedStudent.studentProfile?.skills || "").split(",").map((sk: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        {sk.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Resume file link */}
                {selectedStudent.studentProfile?.resumeUrl && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span>Verified Resume: {selectedStudent.studentProfile.resumeName || "Resume.pdf"}</span>
                    </div>
                    <a
                      href={selectedStudent.studentProfile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                    >
                      <span>Download File</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Applications history */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-2">
                    Placement Drive Applications ({selectedStudent.applications.length})
                  </span>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                    {selectedStudent.applications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-400">No applications yet.</div>
                    ) : (
                      selectedStudent.applications.map((app: any) => (
                        <div key={app.id} className="p-2.5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-900">{app.job.title}</div>
                            <div className="text-[10px] text-slate-500">{app.job.company.name}</div>
                          </div>
                          <Badge
                            variant={
                              app.status === "Selected"
                                ? "success"
                                : app.status === "Interview Scheduled"
                                ? "purple"
                                : app.status === "Shortlisted"
                                ? "info"
                                : app.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-[10px]"
                          >
                            {app.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
