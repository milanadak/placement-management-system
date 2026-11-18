"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Trash2, ExternalLink, Globe, MapPin, Mail, Briefcase, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    website: "",
    industry: "Information Technology",
    location: "Bengaluru",
    description: "",
    contactEmail: ""
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
        contactEmail: ""
      });
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Failed to add company.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}? Associated jobs and applications will also be affected.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/companies?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success(`${name} removed successfully.`);
      fetchCompanies();
    } catch {
      toast.error("Failed to delete company.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Corporate Recruitment Partners
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage visiting companies, recruiter contacts, and campus drive partnerships.
          </p>
        </div>

        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-xs gap-1.5 h-9"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Recruiter</span>
        </Button>
      </div>

      {/* Companies Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading recruiter catalog...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((c) => (
            <Card key={c.id} className="border-slate-200 hover:shadow-md transition">
              <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">{c.industry}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-semibold">
                      {c.jobs?.length || 0} Drives
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {c.description}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.location}</span>
                    </div>
                    {c.contactEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  {c.website ? (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Careers Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : <span />}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(c.id, c.name)}
                    className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Company Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Add Corporate Recruiter</h3>
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
                <Label htmlFor="cname">Company Name *</Label>
                <Input
                  id="cname"
                  required
                  placeholder="e.g. Cisco Systems"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cindustry">Industry / Sector *</Label>
                  <Input
                    id="cindustry"
                    required
                    placeholder="Networking & Cloud"
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="clocation">Corporate Location *</Label>
                  <Input
                    id="clocation"
                    required
                    placeholder="Bengaluru / San Jose"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="cwebsite">Careers URL</Label>
                  <Input
                    id="cwebsite"
                    type="url"
                    placeholder="https://..."
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cemail">Campus Contact Email</Label>
                  <Input
                    id="cemail"
                    type="email"
                    placeholder="campus@company.com"
                    value={form.contactEmail}
                    onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cdesc">Description *</Label>
                <textarea
                  id="cdesc"
                  rows={3}
                  required
                  placeholder="Company overview, domain focus, and recruitment details..."
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
                  <span>Save Recruiter</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
