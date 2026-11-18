"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Briefcase, MapPin, Calendar, CheckCircle, AlertCircle, ArrowRight, Filter, Building2, SlidersHorizontal, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch("/api/jobs");
        const data = await res.json();
        if (data?.jobs) {
          setJobs(data.jobs);
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const title = (job.title || "").toLowerCase();
    const company = typeof job.company === "string" ? job.company.toLowerCase() : (job.company?.name || "").toLowerCase();
    const skills = (job.skills || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = !search || title.includes(search) || company.includes(search) || skills.includes(search);

    const depts = (job.eligibleDepartments || job.departments || "ALL").toString().toLowerCase();
    const matchesDept = selectedDept === "ALL" || depts === "all" || depts.includes(selectedDept.toLowerCase());

    const type = (job.jobType || job.type || "Full-Time").toString();
    const matchesType = selectedType === "ALL" || type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesDept && matchesType;
  });

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-2 text-blue-700 bg-blue-50 border-blue-200">
            Live Recruitment Drives
          </Badge>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore Placement &amp; Internship Openings
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Browse verified campus opportunities. Log in to check your automatic eligibility and submit applications.
          </p>
        </div>

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-8 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search job title, skills, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
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

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Job Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Showing {filteredJobs.length} of {jobs.length} campus opportunities</span>
            <span className="text-blue-600 font-medium">Automatic eligibility verified upon sign-in</span>
          </div>
        </div>

        {/* Jobs list */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading active recruitment drives...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-700">No jobs match your criteria</h3>
                <p className="text-xs text-slate-500 mt-1">Try resetting the department or search keywords.</p>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const companyName = typeof job.company === "string" ? job.company : job.company?.name || "Corporate Recruiter";
                const jobType = job.jobType || job.type || "Full-Time";
                const skillList = Array.isArray(job.skills)
                  ? job.skills
                  : (job.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);
                const deadlineStr = job.deadline ? new Date(job.deadline).toLocaleDateString() : "Rolling";
                const deptsStr = job.eligibleDepartments || job.departments || "All Departments";

                return (
                  <Card key={job.id} className="hover:border-blue-300 hover:shadow-md transition">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-lg">{job.title}</span>
                            <Badge variant="outline" className="font-semibold text-slate-700">
                              {companyName}
                            </Badge>
                            <Badge variant={jobType === "Full-Time" ? "secondary" : "purple"}>
                              {jobType}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {job.location || "On-Campus / Hybrid"}
                            </span>
                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                              CTC: {job.salary}
                            </span>
                            <span className="flex items-center gap-1 text-amber-700">
                              <Calendar className="h-3.5 w-3.5" />
                              Apply by: {deadlineStr}
                            </span>
                            <span className="text-slate-400">|</span>
                            <span>Min CGPA: <strong>{Number(job.minCgpa || 0).toFixed(1)}</strong></span>
                          </div>

                          {skillList.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-2">
                              {skillList.map((s: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                          <div className="text-xs text-right hidden lg:block">
                            <div className="text-slate-400">Target Departments</div>
                            <div className="text-slate-700 font-medium text-[11px] max-w-[200px] truncate">
                              {deptsStr}
                            </div>
                          </div>

                          <Link href="/login">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs gap-1.5">
                              <span>Sign In to Check Eligibility</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
