import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "students";
  const dateStr = new Date().toISOString().slice(0, 10);

  // 1. Students Master Report
  if (type === "students") {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        studentProfile: true,
        applications: true
      },
      orderBy: { name: "asc" }
    });

    const headers = ["Roll Number", "Full Name", "Email", "Department", "CGPA", "Graduation Year", "Phone", "Skills", "Total Applications", "Placed Status"];
    const rows = students.map((s) => {
      const p = s.studentProfile;
      const isPlaced = s.applications.some(a => a.status === "Selected");
      return [
        `"${p?.rollNo || "N/A"}"`,
        `"${s.name}"`,
        `"${s.email}"`,
        `"${p?.department || "N/A"}"`,
        p?.cgpa?.toFixed(2) || "0.00",
        p?.graduationYear || "2026",
        `"${p?.phone || "N/A"}"`,
        `"${(p?.skills || "").replace(/"/g, '""')}"`,
        s.applications.length,
        isPlaced ? "Placed" : "In Progress"
      ].join(",");
    });

    return new NextResponse([headers.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusConnect_Students_Census_${dateStr}.csv"`
      }
    });
  }

  // 2. Applications Audit Report
  if (type === "applications") {
    const applications = await prisma.application.findMany({
      include: {
        student: { include: { studentProfile: true } },
        job: { include: { company: true } }
      },
      orderBy: { appliedAt: "desc" }
    });

    const headers = ["Application ID", "Student Name", "Roll No", "Department", "CGPA", "Company", "Job Title", "Package", "Status", "Applied Date"];
    const rows = applications.map((a) => {
      return [
        `"${a.id}"`,
        `"${a.student.name}"`,
        `"${a.student.studentProfile?.rollNo || "N/A"}"`,
        `"${a.student.studentProfile?.department || "N/A"}"`,
        a.student.studentProfile?.cgpa?.toFixed(2) || "0.00",
        `"${a.job.company.name}"`,
        `"${a.job.title}"`,
        `"${a.job.salary}"`,
        `"${a.status}"`,
        new Date(a.appliedAt).toISOString().slice(0, 10)
      ].join(",");
    });

    return new NextResponse([headers.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusConnect_Placements_Audit_${dateStr}.csv"`
      }
    });
  }

  // 3. Campus Drives / Jobs Catalog
  if (type === "jobs") {
    const jobs = await prisma.job.findMany({
      include: {
        company: true,
        applications: true
      },
      orderBy: { createdAt: "desc" }
    });

    const headers = ["Job ID", "Company", "Job Title", "Type", "Package", "Min CGPA", "Eligible Branches", "Location", "Deadline", "Total Applicants", "Status"];
    const rows = jobs.map((j) => {
      return [
        `"${j.id}"`,
        `"${j.company.name}"`,
        `"${j.title}"`,
        `"${j.jobType}"`,
        `"${j.salary}"`,
        j.minCgpa.toFixed(1),
        `"${j.eligibleDepartments.replace(/"/g, '""')}"`,
        `"${j.location}"`,
        new Date(j.deadline).toISOString().slice(0, 10),
        j.applications.length,
        j.isActive ? "Active" : "Closed"
      ].join(",");
    });

    return new NextResponse([headers.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusConnect_Drives_Catalog_${dateStr}.csv"`
      }
    });
  }

  // 4. Placed Candidates Honor Roll
  if (type === "placed") {
    const placedApps = await prisma.application.findMany({
      where: { status: "Selected" },
      include: {
        student: { include: { studentProfile: true } },
        job: { include: { company: true } }
      },
      orderBy: { appliedAt: "desc" }
    });

    const headers = ["Student Name", "Roll Number", "Department", "Graduation Year", "CGPA", "Hiring Company", "Designation", "Package Offered", "Selection Date"];
    const rows = placedApps.map((a) => {
      const p = a.student.studentProfile;
      return [
        `"${a.student.name}"`,
        `"${p?.rollNo || "N/A"}"`,
        `"${p?.department || "N/A"}"`,
        p?.graduationYear || 2026,
        p?.cgpa?.toFixed(2) || "0.00",
        `"${a.job.company.name}"`,
        `"${a.job.title}"`,
        `"${a.job.salary}"`,
        new Date(a.updatedAt).toISOString().slice(0, 10)
      ].join(",");
    });

    return new NextResponse([headers.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusConnect_Placed_Honor_Roll_${dateStr}.csv"`
      }
    });
  }

  // 5. Department-wise Summary
  if (type === "departments") {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          include: {
            applications: {
              where: { status: "Selected" }
            }
          }
        }
      }
    });

    const summary: Record<string, { total: number; placed: number }> = {};
    students.forEach((s) => {
      const d = s.department || "Other";
      if (!summary[d]) summary[d] = { total: 0, placed: 0 };
      summary[d].total += 1;
      if (s.user.applications.length > 0) summary[d].placed += 1;
    });

    const headers = ["Department", "Total Students", "Placed Students", "Placement Percentage"];
    const rows = Object.entries(summary).map(([dept, data]) => {
      const rate = data.total > 0 ? ((data.placed / data.total) * 100).toFixed(1) : "0.0";
      return [
        `"${dept}"`,
        data.total,
        data.placed,
        `"${rate}%"`
      ].join(",");
    });

    return new NextResponse([headers.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusConnect_Branchwise_Summary_${dateStr}.csv"`
      }
    });
  }

  return new NextResponse("Invalid report type", { status: 400 });
}
