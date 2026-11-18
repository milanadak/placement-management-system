import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateStudentAdminSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  department: z.string().min(2),
  course: z.string().optional().default("B.Tech"),
  semester: z.coerce.number().int().min(1).max(8).optional().default(7),
  graduationYear: z.coerce.number().int(),
  cgpa: z.coerce.number().min(0).max(10),
  tenthPercentage: z.coerce.number().min(0).max(100).optional().default(85.0),
  twelfthPercentage: z.coerce.number().min(0).max(100).optional().default(82.0),
  backlogs: z.coerce.number().int().min(0).optional().default(0),
  phone: z.string().min(8),
  skills: z.string(),
  softSkills: z.string().optional().default(""),
  certifications: z.string().optional().default(""),
  projects: z.string().optional().default("[]"),
  internships: z.string().optional().default("[]"),
  semesterMarks: z.string().optional().default("[]"),
  bio: z.string().optional().default(""),
});

export async function GET(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("id");

  if (studentId) {
    const student = await prisma.user.findFirst({
      where: { id: studentId, role: "STUDENT" },
      include: {
        studentProfile: true,
        applications: {
          include: {
            job: { include: { company: true } },
            interviews: true
          },
          orderBy: { appliedAt: "desc" }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: true,
      applications: {
        include: {
          job: { include: { company: true } },
          interviews: true
        },
        orderBy: { appliedAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ students });
}

export async function PUT(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = UpdateStudentAdminSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const {
      id,
      name,
      department,
      course,
      semester,
      graduationYear,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      backlogs,
      phone,
      skills,
      softSkills,
      certifications,
      projects,
      internships,
      semesterMarks,
      bio
    } = result.data;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        studentProfile: {
          update: {
            department,
            course,
            semester,
            graduationYear,
            cgpa,
            tenthPercentage,
            twelfthPercentage,
            backlogs,
            phone,
            skills,
            softSkills,
            certifications,
            projects,
            internships,
            semesterMarks,
            bio
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Admin student update error:", error);
    return NextResponse.json({ error: "Failed to update student record" }, { status: 500 });
  }
}
