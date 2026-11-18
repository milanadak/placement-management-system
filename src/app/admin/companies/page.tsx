"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Globe,
  MapPin,
  Mail,
  Briefcase,
  Loader2,
  AlertCircle,
  Eye,
  User,
  Phone,
  X,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<any | null>(null);
  const [viewCompany, setViewCompany] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    website: "",
    industry: "Information Technology",
    location: "Bengaluru",
    description: "",
    contactEmail: "",
    hrName: "",
    hrPhone: "",
    address: ""
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/admin/companies");
      const data = await res.json();
      if (data?.companies) {
        setCompanies(data.companies);
      }
    } catch {
      toast.error("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create company");

      toast.success(`${form.name} added to recruiter directory!`);
      setIsAddOpen(false);
      setForm({
        name: "",
        website: "",
        industry: "Information Technology",
        location: "Bengaluru",
        description: "",
        contactEmail: "",
        hrName: "",
        hrPhone: "",
        address: ""
      });
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Failed to add company.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditOpen = (c: any) => {
    setEditCompany(c);
    setForm({
      name: c.name || "",
      website: c.website || "",
      industry: c.industry || "Information Technology",
      location: c.location || "",
      description: c.description || "",
      contactEmail: c.contactEmail || "",
      hrName: c.hrName || "",
      hrPhone: c.hrPhone || "",
      address: c.address || ""
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCompany) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editCompany.id, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      toast.success(`${form.name} profile updated!`);
      setEditCompany(null);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Failed to update company.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the placement system? This will delete all associated campus drives.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/companies?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      toast.success(`${name} deleted.`);
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete company.");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Corporate Recruiter Partners &amp; Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage participating multinational corporations, review HR point-of-contacts, and coordinate hiring pipelines.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setForm({
              name: "",
              website: "",
              industry: "Information Technology",
              location: "Bengaluru",
              description: "",
              contactEmail: "",
              hrName: "",
              hrPhone: "",
              address: ""
            });
            setIsAddOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>Add Corporate Recruiter</span>
        </Button>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs text-slate-500">Loading corporate partners directory...</p>
        </div>
      ) : companies.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-800 text-sm">No corporate partners registered yet.</p>
          <p className="text-xs text-slate-500 mt-1">Click "Add Corporate Recruiter" above to register visiting hiring partners.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c) => (
            <Card key={c.id} className="border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between">
              <div>
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-bold text-lg flex items-center justify-center shrink-0">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                          {c.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 font-medium mt-1">
                          {c.industry}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3.5 space-y-3 text-xs">
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </div>

                    {c.hrName && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>HR: <strong className="text-slate-800">{c.hrName}</strong></span>
                      </div>
                    )}

                    {c.hrPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{c.hrPhone}</span>
                      </div>
                    )}

                    {c.contactEmail && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.contactEmail}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[11px] text-slate-500">
                      Active Drives: <strong className="text-blue-700 font-bold">{c.jobs?.length || 0}</strong>
                    </span>
                    {c.website && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-medium"
                      >
                        <Globe className="h-3 w-3" />
                        Visit Website
                      </a>
                    )}
                  </div>
                </CardContent>
              </div>

              <div className="p-3 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewCompany(c)}
                  className="text-xs h-7 px-2.5 gap-1 border-slate-200 hover:bg-slate-100"
                >
                  <Eye className="h-3 w-3 text-blue-600" />
                  Profile
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditOpen(c)}
                    className="h-7 text-xs text-slate-700 hover:text-blue-600 gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(c.id, c.name)}
                    className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Company Profile Modal */}
      {viewCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center">
                  {viewCompany.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{viewCompany.name}</h3>
                  <Badge variant="outline" className="text-xs bg-slate-50 text-slate-600">
                    {viewCompany.industry}
                  </Badge>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewCompany(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Company Overview</h4>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {viewCompany.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">HR Contact Person</span>
                  <span className="font-bold text-slate-800 text-xs">{viewCompany.hrName || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">HR Direct Phone</span>
                  <span className="font-bold text-slate-800 text-xs">{viewCompany.hrPhone || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Official Email</span>
                  <span className="font-medium text-slate-800 text-xs">{viewCompany.contactEmail || "Not specified"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Headquarters / Office</span>
                  <span className="font-medium text-slate-800 text-xs">{viewCompany.location}</span>
                </div>
              </div>

              {viewCompany.address && (
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-0.5">Campus Drive Venue / Address</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {viewCompany.address}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Registered Campus Drives ({viewCompany.jobs?.length || 0})</h4>
                {viewCompany.jobs && viewCompany.jobs.length > 0 ? (
                  <div className="space-y-2">
                    {viewCompany.jobs.map((job: any) => (
                      <div key={job.id} className="p-3 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">{job.title}</p>
                          <p className="text-[11px] text-slate-500">
                            Package: <span className="font-semibold text-blue-700">{job.salary}</span> • Min CGPA: {job.minCgpa} • {job.jobType}
                          </p>
                        </div>
                        <Badge variant="outline" className={`text-[10px] ${job.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {job.isActive ? "Active" : "Closed"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic">No active campus drives posted for this recruiter yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Company Modal */}
      {(isAddOpen || editCompany) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editCompany ? "Edit Corporate Partner Details" : "Register New Corporate Partner"}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddOpen(false);
                  setEditCompany(null);
                }}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={editCompany ? handleUpdate : handleCreate} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cname">Company Name *</Label>
                  <Input
                    id="cname"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Google, Microsoft, Infosys"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cindustry">Industry Sector *</Label>
                  <select
                    id="cindustry"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="w-full h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
                  >
                    <option value="Information Technology">Information Technology</option>
                    <option value="Financial Technology (FinTech)">Financial Technology (FinTech)</option>
                    <option value="Engineering & Core">Engineering &amp; Core</option>
                    <option value="Management Consulting">Management Consulting</option>
                    <option value="Semiconductors & VLSI">Semiconductors &amp; VLSI</option>
                    <option value="Automotive & Robotics">Automotive &amp; Robotics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="clocation">Corporate Office / City *</Label>
                  <Input
                    id="clocation"
                    required
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Bengaluru / Hyderabad"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cwebsite">Official Website URL</Label>
                  <Input
                    id="cwebsite"
                    type="url"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                    placeholder="https://company.com"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <Label htmlFor="chrName">HR Contact Person</Label>
                  <Input
                    id="chrName"
                    value={form.hrName}
                    onChange={(e) => setForm({ ...form, hrName: e.target.value })}
                    placeholder="Vikram Singhania"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="chrPhone">HR Contact Phone</Label>
                  <Input
                    id="chrPhone"
                    value={form.hrPhone}
                    onChange={(e) => setForm({ ...form, hrPhone: e.target.value })}
                    placeholder="+91 98200 11111"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cemail">Corporate Email</Label>
                  <Input
                    id="cemail"
                    type="email"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                    placeholder="campus@company.com"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="caddress">Campus Drive Venue / Full Address</Label>
                <Input
                  id="caddress"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Sector 62, Electronic City, Bengaluru"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cdesc">Company Overview & Description *</Label>
                <textarea
                  id="cdesc"
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Provide recruitment overview, hiring philosophies, and company background..."
                  className="w-full rounded-md border border-slate-200 bg-white p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddOpen(false);
                    setEditCompany(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5">
                  {submitting ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  {editCompany ? "Save Updates" : "Register Recruiter"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
