import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const JobSchema = z.object({
  companyId: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(10),
  minCgpa: z.coerce.number().min(0).max(10),
  eligibleDepartments: z.string().min(2),
  graduationYear: z.coerce.number().int(),
  skills: z.string(),
  jobType: z.string(),
  location: z.string(),
  salary: z.string(),
  deadline: z.string(),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    include: {
      company: true,
      applications: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = JobSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const data = result.data;

    const job = await prisma.job.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        description: data.description,
        minCgpa: data.minCgpa,
        eligibleDepartments: data.eligibleDepartments,
        graduationYear: data.graduationYear,
        skills: data.skills,
        jobType: data.jobType,
        location: data.location,
        salary: data.salary,
        deadline: new Date(data.deadline),
      },
      include: { company: true }
    });

    // Notify all matching students about new job
    await prisma.announcement.create({
      data: {
        title: `New Campus Placement Drive: ${job.title} at ${job.company.name}`,
        content: `Application deadline is ${new Date(job.deadline).toLocaleDateString()}. Minimum required CGPA is ${job.minCgpa}. Eligible branches: ${job.eligibleDepartments}.`,
        priority: "HIGH",
        targetDept: job.eligibleDepartments,
        authorId: sessionUser.id
      }
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing job ID" }, { status: 400 });

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
