import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "students"; // "students" | "applications"

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

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusConnect_Students_Report_${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  }

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

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="CampusConnect_Placements_Audit_${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  }

  return new NextResponse("Invalid report type", { status: 400 });
}
