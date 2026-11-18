"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Users,
  Briefcase,
  Sliders,
  RefreshCw,
  Sparkles,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminEligibilityPage() {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [evaluatedStudents, setEvaluatedStudents] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  // Criteria state
  const [minCgpa, setMinCgpa] = useState<number>(7.0);
  const [maxBacklogs, setMaxBacklogs] = useState<number>(0);
  const [minTenth, setMinTenth] = useState<number>(60.0);
  const [minTwelfth, setMinTwelfth] = useState<number>(60.0);
  const [graduationYear, setGraduationYear] = useState<number>(2026);
  const [selectedDepts, setSelectedDepts] = useState<string[]>(["ALL"]);
  const [requiredSkills, setRequiredSkills] = useState<string>("");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterEligibility, setFilterEligibility] = useState<"all" | "eligible" | "ineligible">("all");
  const [selectedSimStudent, setSelectedSimStudent] = useState<any | null>(null);

  const departmentsList = [
    "Computer Science",
    "Information Technology",
    "Data Science",
    "Electronics",
    "Electrical Engineering",
    "Mechanical Engineering"
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/eligibility");
      const data = await res.json();
      if (data?.evaluatedStudents) {
        setEvaluatedStudents(data.evaluatedStudents);
        setJobs(data.jobs || []);
        if (data.evaluatedStudents.length > 0) {
          setSelectedSimStudent(data.evaluatedStudents[0]);
        }
      }
    } catch {
      toast.error("Failed to load eligibility data.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async (overrideCriteria?: any) => {
    setCalculating(true);
    try {
      const criteriaPayload = overrideCriteria || {
        minCgpa,
        maxBacklogs,
        minTenthPercentage: minTenth,
        minTwelfthPercentage: minTwelfth,
        graduationYear,
        eligibleDepartments: selectedDepts.includes("ALL") ? "ALL" : selectedDepts,
        requiredSkills
      };

      const res = await fetch("/api/admin/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(criteriaPayload)
      });
      const data = await res.json();
      if (data?.evaluatedStudents) {
        setEvaluatedStudents(data.evaluatedStudents);
        toast.success("Eligibility recalculated immediately!");
        
        // Update selected simulator student
        if (selectedSimStudent) {
          const updated = data.evaluatedStudents.find((s: any) => s.id === selectedSimStudent.id);
          if (updated) setSelectedSimStudent(updated);
        }
      }
    } catch {
      toast.error("Recalculation failed.");
    } finally {
      setCalculating(false);
    }
  };

  const handleSelectJobPreset = (jobId: string) => {
    setSelectedJobId(jobId);
    if (!jobId) {
      // Reset to default
      setMinCgpa(7.0);
      setMaxBacklogs(0);
      setMinTenth(60.0);
      setMinTwelfth(60.0);
      setSelectedDepts(["ALL"]);
      handleRecalculate({
        minCgpa: 7.0,
        maxBacklogs: 0,
        minTenthPercentage: 60.0,
        minTwelfthPercentage: 60.0,
        graduationYear: 2026,
        eligibleDepartments: "ALL"
      });
      return;
    }

    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setMinCgpa(job.minCgpa || 6.0);
      setMaxBacklogs(job.maxBacklogs ?? 0);
      setMinTenth(job.minTenthPercentage || 60.0);
      setMinTwelfth(job.minTwelfthPercentage || 60.0);
      setGraduationYear(job.graduationYear || 2026);

      let depts = ["ALL"];
      if (job.eligibleDepartments && job.eligibleDepartments !== "ALL") {
        try {
          const parsed = JSON.parse(job.eligibleDepartments);
          depts = Array.isArray(parsed) ? parsed : [job.eligibleDepartments];
        } catch {
          depts = job.eligibleDepartments.split(",").map((d: string) => d.trim());
        }
      }
      setSelectedDepts(depts);

      handleRecalculate({
        minCgpa: job.minCgpa || 6.0,
        maxBacklogs: job.maxBacklogs ?? 0,
        minTenthPercentage: job.minTenthPercentage || 60.0,
        minTwelfthPercentage: job.minTwelfthPercentage || 60.0,
        graduationYear: job.graduationYear || 2026,
        eligibleDepartments: depts
      });
    }
  };

  const toggleDept = (dept: string) => {
    let next: string[];
    if (dept === "ALL") {
      next = ["ALL"];
    } else {
      const withoutAll = selectedDepts.filter((d) => d !== "ALL");
      if (withoutAll.includes(dept)) {
        next = withoutAll.filter((d) => d !== dept);
        if (next.length === 0) next = ["ALL"];
      } else {
        next = [...withoutAll, dept];
      }
    }
    setSelectedDepts(next);
  };

  const handleExportEligibleCsv = () => {
    const eligibleOnly = evaluatedStudents.filter((s) => s.evaluation?.isEligible);
    if (eligibleOnly.length === 0) {
      toast.error("No eligible students to export under current criteria.");
      return;
    }

    const headers = [
      "Student Name",
      "Roll Number",
      "Department",
      "CGPA",
      "Active Backlogs",
      "10th Standard %",
      "12th Standard %",
      "Email",
      "Placement Status",
      "Eligibility Status"
    ];

    const rows = eligibleOnly.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${(s.rollNo || "").replace(/"/g, '""')}"`,
      `"${(s.department || "").replace(/"/g, '""')}"`,
      s.cgpa.toFixed(2),
      s.backlogs ?? 0,
      (s.tenthPercentage || 85).toFixed(1),
      (s.twelfthPercentage || 82).toFixed(1),
      `"${s.email.replace(/"/g, '""')}"`,
      s.isPlaced ? "Placed" : "Unplaced",
      "ELIGIBLE"
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Eligible_Students_Criteria_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${eligibleOnly.length} eligible students to CSV!`);
  };

  const totalCount = evaluatedStudents.length;
  const eligibleCount = evaluatedStudents.filter((s) => s.evaluation?.isEligible).length;
  const eligiblePercentage = totalCount > 0 ? +((eligibleCount / totalCount) * 100).toFixed(1) : 0;
  const unplacedEligibleCount = evaluatedStudents.filter((s) => s.evaluation?.isEligible && !s.isPlaced).length;

  const filteredStudents = evaluatedStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(search.toLowerCase())) ||
      (s.department && s.department.toLowerCase().includes(search.toLowerCase()));

    const matchesEligibility =
      filterEligibility === "all" ||
      (filterEligibility === "eligible" && s.evaluation?.isEligible) ||
      (filterEligibility === "ineligible" && !s.evaluation?.isEligible);

    return matchesSearch && matchesEligibility;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
            Placement Eligibility Engine & Candidate Screening
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic academic eligibility benchmarks, evaluate batch qualification rates, and export verified candidate registries.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleExportEligibleCsv}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 gap-1.5 shadow-sm"
        >
          <Download className="h-3.5 w-3.5" />
          Export Eligible List (CSV)
        </Button>
      </div>

      {/* Batch Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Batch Size</span>
          <span className="text-2xl font-extrabold text-slate-900">{totalCount}</span>
          <span className="text-xs text-slate-500 block mt-0.5">Enrolled candidates</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Eligible Students</span>
          <span className="text-2xl font-extrabold text-emerald-600">{eligibleCount}</span>
          <span className="text-xs text-emerald-600 font-medium block mt-0.5">{eligiblePercentage}% of batch qualifies</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-xs bg-blue-50/20">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">Eligible &amp; Unplaced</span>
          <span className="text-2xl font-extrabold text-blue-700">{unplacedEligibleCount}</span>
          <span className="text-xs text-blue-600 font-medium block mt-0.5">High priority job seekers</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Ineligible Candidates</span>
          <span className="text-2xl font-extrabold text-rose-600">{totalCount - eligibleCount}</span>
          <span className="text-xs text-slate-500 block mt-0.5">{+(100 - eligiblePercentage).toFixed(1)}% excluded by rules</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Criteria Control Panel */}
        <Card className="border-slate-200 shadow-sm lg:col-span-1">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" />
                Configurable Rule Engine
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRecalculate()}
                disabled={calculating}
                className="h-7 text-xs text-blue-600 hover:text-blue-700 gap-1 px-2"
              >
                <RefreshCw className={`h-3 w-3 ${calculating ? "animate-spin" : ""}`} />
                Recalculate
              </Button>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Tune parameters to immediately recalculate candidate qualification.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4 text-xs">
            {/* Drive Preset Selector */}
            <div className="space-y-1.5 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <Label htmlFor="preset" className="text-xs font-semibold text-blue-900">
                Preset by Visiting Company Drive
              </Label>
              <select
                id="preset"
                value={selectedJobId}
                onChange={(e) => handleSelectJobPreset(e.target.value)}
                className="w-full h-8 rounded-lg border border-blue-200 bg-white px-2.5 text-xs text-slate-800 font-medium"
              >
                <option value="">-- Custom Institutional Rules --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company?.name}: {j.title} (Min CGPA: {j.minCgpa})
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum CGPA */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="cgpaInput" className="text-xs font-medium text-slate-700">Minimum CGPA Cutoff</Label>
                <span className="font-bold text-blue-700 text-sm">{minCgpa.toFixed(1)}</span>
              </div>
              <input
                id="cgpaInput"
                type="range"
                min="5.0"
                max="9.5"
                step="0.1"
                value={minCgpa}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setMinCgpa(val);
                }}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>5.0</span>
                <span>7.0</span>
                <span>8.5</span>
                <span>9.5</span>
              </div>
            </div>

            {/* Maximum Active Backlogs */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">Maximum Active Backlogs Permitted</Label>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setMaxBacklogs(b)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition ${
                      maxBacklogs === b
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {b === 0 ? "0 (Clean)" : `Max ${b}`}
                  </button>
                ))}
              </div>
            </div>

            {/* 10th and 12th Cutoffs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="tenthCutoff" className="text-xs font-medium text-slate-700">Min 10th %</Label>
                <Input
                  id="tenthCutoff"
                  type="number"
                  step="5"
                  value={minTenth}
                  onChange={(e) => setMinTenth(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="twelfthCutoff" className="text-xs font-medium text-slate-700">Min 12th %</Label>
                <Input
                  id="twelfthCutoff"
                  type="number"
                  step="5"
                  value={minTwelfth}
                  onChange={(e) => setMinTwelfth(parseFloat(e.target.value) || 0)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            {/* Graduation Batch */}
            <div className="space-y-1.5">
              <Label htmlFor="batchYear" className="text-xs font-medium text-slate-700">Graduation Batch Year</Label>
              <select
                id="batchYear"
                value={graduationYear}
                onChange={(e) => setGraduationYear(parseInt(e.target.value) || 2026)}
                className="w-full h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-800"
              >
                <option value={2025}>Class of 2025</option>
                <option value={2026}>Class of 2026 (Current Final Year)</option>
                <option value={2027}>Class of 2027 (Pre-final Year)</option>
              </select>
            </div>

            {/* Eligible Branches */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-medium text-slate-700">Eligible Engineering Branches</Label>
                <button
                  type="button"
                  onClick={() => setSelectedDepts(["ALL"])}
                  className="text-[11px] text-blue-600 hover:underline font-medium"
                >
                  Reset to All
                </button>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto p-2 rounded-lg border border-slate-200 bg-slate-50/50">
                {departmentsList.map((dept) => {
                  const isChecked = selectedDepts.includes("ALL") || selectedDepts.includes(dept);
                  return (
                    <label key={dept} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleDept(dept)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>{dept}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button
              type="button"
              onClick={() => handleRecalculate()}
              disabled={calculating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 font-semibold gap-1.5 shadow-sm"
            >
              {calculating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Apply Rules &amp; Recompute
            </Button>
          </CardContent>
        </Card>

        {/* Right: Individual Simulator & Candidate List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Individual Candidate Inspector Simulator */}
          {selectedSimStudent && (
            <Card className={`border ${selectedSimStudent.evaluation?.isEligible ? "border-emerald-200 bg-emerald-50/20" : "border-rose-200 bg-rose-50/20"} shadow-sm`}>
              <CardHeader className="pb-3 border-b border-slate-200/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0">
                      {selectedSimStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base font-bold text-slate-900">{selectedSimStudent.name}</CardTitle>
                        <span className="text-xs text-slate-500 font-mono">({selectedSimStudent.rollNo})</span>
                      </div>
                      <CardDescription className="text-xs text-slate-600">
                        {selectedSimStudent.department} • CGPA: <span className="font-bold text-slate-900">{selectedSimStudent.cgpa?.toFixed(2)}</span> • Backlogs: <span className="font-bold">{selectedSimStudent.backlogs ?? 0}</span>
                      </CardDescription>
                    </div>
                  </div>

                  <Badge className={`text-xs py-1 px-3 ${
                    selectedSimStudent.evaluation?.isEligible
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-rose-600 text-white hover:bg-rose-600"
                  }`}>
                    {selectedSimStudent.evaluation?.isEligible ? "✓ ELIGIBLE TO APPLY" : "✕ NOT ELIGIBLE"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-3.5 space-y-2">
                <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
                  Automated Criterion Validation Breakdown:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {selectedSimStudent.evaluation?.reasons?.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                        r.passed
                          ? "bg-white border-emerald-200 text-emerald-900"
                          : "bg-white border-rose-200 text-rose-900"
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{r.criterion}</p>
                        <p className="text-[11px] opacity-80">{r.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  Evaluated Candidate Pool ({filteredStudents.length} Students)
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Click on any candidate row to simulate and review their exact pass/fail reasons.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search candidate..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-8 text-xs w-44"
                  />
                </div>

                <div className="flex border border-slate-200 rounded-lg p-0.5 bg-slate-50 text-[11px]">
                  <button
                    onClick={() => setFilterEligibility("all")}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      filterEligibility === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterEligibility("eligible")}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      filterEligibility === "eligible" ? "bg-white text-emerald-700 shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    Eligible ({eligibleCount})
                  </button>
                  <button
                    onClick={() => setFilterEligibility("ineligible")}
                    className={`px-2 py-1 rounded-md font-medium transition ${
                      filterEligibility === "ineligible" ? "bg-white text-rose-700 shadow-xs font-bold" : "text-slate-600"
                    }`}
                  >
                    Ineligible
                  </button>
                </div>
              </div>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Branch</th>
                    <th className="py-2.5 px-3">CGPA</th>
                    <th className="py-2.5 px-3">Backlogs</th>
                    <th className="py-2.5 px-3">10th / 12th</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => {
                    const isEligible = s.evaluation?.isEligible;
                    const isSelected = selectedSimStudent?.id === s.id;

                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelectedSimStudent(s)}
                        className={`cursor-pointer transition ${
                          isSelected ? "bg-blue-50/80 font-medium" : "hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900">{s.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{s.rollNo}</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{s.department}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                            {s.cgpa?.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            (s.backlogs || 0) === 0 ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                          }`}>
                            {s.backlogs ?? 0}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 text-[11px]">
                          {s.tenthPercentage || 85}% / {s.twelfthPercentage || 82}%
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge className={`text-[10px] py-0.5 px-2 font-medium ${
                            isEligible
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}>
                            {isEligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-blue-600">
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
