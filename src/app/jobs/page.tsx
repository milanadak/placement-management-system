"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Briefcase, MapPin, Calendar, CheckCircle, AlertCircle, ArrowRight, Filter, Building2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function PublicJobsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");

  const jobs = [
    {
      id: "job-1",
      title: "Graduate Software Development Engineer (SDE-1)",
      company: "Google",
      location: "Bengaluru / Hyderabad",
      salary: "₹42.0 LPA",
      type: "Full-Time",
      deadline: "Dec 15, 2026",
      minCgpa: 8.0,
      departments: ["Computer Science", "Information Technology", "Data Science"],
      description: "Design high-scale distributed backend systems, low latency microservices, and modern web architectures.",
      skills: ["Java", "Distributed Systems", "Data Structures", "Algorithms"]
    },
    {
      id: "job-2",
      title: "Cloud Solutions & DevOps Engineer",
      company: "Microsoft",
      location: "Hyderabad",
      salary: "₹45.0 LPA",
      type: "Full-Time",
      deadline: "Dec 10, 2026",
      minCgpa: 7.5,
      departments: ["Computer Science", "Information Technology", "Electronics"],
      description: "Work on Azure Infrastructure, automated CI/CD pipelines, container orchestration, and cloud reliability engineering.",
      skills: ["Azure", "Kubernetes", "Linux", "Go / Python"]
    },
    {
      id: "job-3",
      title: "Software Development Engineer (Intern + FTE)",
      company: "Amazon",
      location: "Bengaluru",
      salary: "₹38.0 LPA",
      type: "Full-Time",
      deadline: "Nov 30, 2026",
      minCgpa: 7.0,
      departments: ["Computer Science", "Information Technology", "Electronics", "Electrical Engineering"],
      description: "Drive innovations in high-scale retail platforms, digital logistics, and cloud compute services.",
      skills: ["C++", "Java", "Object Oriented Design", "System Design"]
    },
    {
      id: "job-4",
      title: "Embedded Systems & Firmware Engineer",
      company: "Texas Instruments",
      location: "Bengaluru",
      salary: "₹24.0 LPA",
      type: "Full-Time",
      deadline: "Dec 05, 2026",
      minCgpa: 7.5,
      departments: ["Electronics", "Electrical Engineering"],
      description: "Architect micro-controller firmware, RTOS drivers, DSP algorithms, and hardware-software co-design.",
      skills: ["Embedded C", "ARM Architecture", "RTOS", "Verilog"]
    },
    {
      id: "job-5",
      title: "Technology Advisory Consultant",
      company: "Deloitte",
      location: "Mumbai / Gurugram",
      salary: "₹10.5 LPA",
      type: "Full-Time",
      deadline: "Dec 20, 2026",
      minCgpa: 6.5,
      departments: ["Computer Science", "Information Technology", "Electronics", "Mechanical Engineering"],
      description: "Deliver digital transformation, enterprise cloud adoption, and cyber security advisory for global 2000 enterprises.",
      skills: ["ERP", "Cloud Strategy", "Business Analytics", "SQL"]
    },
    {
      id: "job-6",
      title: "Robotics & Automation Trainee Engineer",
      company: "L&T Technology Services",
      location: "Vadodara",
      salary: "₹8.5 LPA",
      type: "Full-Time",
      deadline: "Dec 18, 2026",
      minCgpa: 6.5,
      departments: ["Mechanical Engineering", "Electrical Engineering"],
      description: "Develop automated robotic manufacturing simulations, PLC control logic, and industrial IoT solutions.",
      skills: ["PLC Programming", "SolidWorks", "Industrial IoT", "MATLAB"]
    },
    {
      id: "job-7",
      title: "Digital Software Specialist",
      company: "Tata Consultancy Services",
      location: "Kolkata / Pune",
      salary: "₹9.0 LPA",
      type: "Full-Time",
      deadline: "Dec 25, 2026",
      minCgpa: 6.0,
      departments: ["Computer Science", "Information Technology", "Data Science", "Electronics", "Electrical Engineering", "Mechanical Engineering"],
      description: "Contribute to enterprise modernization, agile engineering, full-stack microservices, and AI-enabled apps.",
      skills: ["JavaScript", "Python", "SQL", "React"]
    },
    {
      id: "job-8",
      title: "AI & Data Science Research Intern",
      company: "Google",
      location: "Bengaluru",
      salary: "₹1,20,000 / mo",
      type: "Internship",
      deadline: "Dec 08, 2026",
      minCgpa: 8.5,
      departments: ["Computer Science", "Data Science"],
      description: "Work with applied AI teams researching LLMs, computer vision algorithms, and multimodal neural networks.",
      skills: ["PyTorch", "TensorFlow", "Deep Learning", "Linear Algebra"]
    }
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDept =
      selectedDept === "ALL" ||
      job.departments.some(d => d.toLowerCase().includes(selectedDept.toLowerCase()));

    const matchesType =
      selectedType === "ALL" ||
      job.type.toLowerCase() === selectedType.toLowerCase();

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
            Explore Placement & Internship Openings
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
        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
              <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">No jobs match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1">Try resetting the department or search keywords.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <Card key={job.id} className="hover:border-blue-300 hover:shadow-md transition">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-lg">{job.title}</span>
                        <Badge variant="outline" className="font-semibold text-slate-700">
                          {job.company}
                        </Badge>
                        <Badge variant={job.type === "Full-Time" ? "secondary" : "purple"}>
                          {job.type}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          CTC: {job.salary}
                        </span>
                        <span className="flex items-center gap-1 text-amber-700">
                          <Calendar className="h-3.5 w-3.5" />
                          Apply by: {job.deadline}
                        </span>
                        <span className="text-slate-400">|</span>
                        <span>Min CGPA: <strong>{job.minCgpa.toFixed(1)}</strong></span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {job.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col items-stretch lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                      <div className="text-xs text-right hidden lg:block">
                        <div className="text-slate-400">Target Departments</div>
                        <div className="text-slate-700 font-medium text-[11px] max-w-[200px] truncate">
                          {job.departments.join(", ")}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
