import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateStudentAdminSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2),
  department: z.string().min(2),
  graduationYear: z.coerce.number().int(),
  cgpa: z.coerce.number().min(0).max(10),
  phone: z.string().min(8),
  skills: z.string(),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: true,
      applications: {
        include: {
          job: { include: { company: true } }
        }
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

    const { id, name, department, graduationYear, cgpa, phone, skills } = result.data;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        studentProfile: {
          update: {
            department,
            graduationYear,
            cgpa,
            phone,
            skills
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
