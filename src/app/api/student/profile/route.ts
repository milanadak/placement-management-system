import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const UpdateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  department: z.string().min(2),
  course: z.string().optional().default("B.Tech"),
  semester: z.coerce.number().int().min(1).max(8).optional().default(7),
  graduationYear: z.coerce.number().int(),
  cgpa: z.coerce.number().min(0).max(10),
  tenthPercentage: z.coerce.number().min(0).max(100).optional().default(85.0),
  twelfthPercentage: z.coerce.number().min(0).max(100).optional().default(82.0),
  backlogs: z.coerce.number().int().min(0).optional().default(0),
  skills: z.string(),
  softSkills: z.string().optional().default(""),
  certifications: z.string().optional().default(""),
  projects: z.string().optional().default("[]"),
  internships: z.string().optional().default("[]"),
  semesterMarks: z.string().optional().default("[]"),
  bio: z.string().optional().default(""),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      studentProfile: true,
      applications: {
        include: {
          job: {
            include: { company: true }
          },
          interviews: true
        },
        orderBy: { appliedAt: "desc" }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

export async function PUT(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = UpdateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const {
      name,
      phone,
      department,
      course,
      semester,
      graduationYear,
      cgpa,
      tenthPercentage,
      twelfthPercentage,
      backlogs,
      skills,
      softSkills,
      certifications,
      projects,
      internships,
      semesterMarks,
      bio
    } = result.data;

    // Update user name and studentProfile
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name,
        studentProfile: {
          upsert: {
            create: {
              rollNo: `STU-${Date.now().toString().slice(-6)}`,
              phone,
              department,
              course,
              semester,
              graduationYear,
              cgpa,
              tenthPercentage,
              twelfthPercentage,
              backlogs,
              skills,
              softSkills,
              certifications,
              projects,
              internships,
              semesterMarks,
              bio,
              isProfileComplete: Boolean(phone && department && cgpa > 0)
            },
            update: {
              phone,
              department,
              course,
              semester,
              graduationYear,
              cgpa,
              tenthPercentage,
              twelfthPercentage,
              backlogs,
              skills,
              softSkills,
              certifications,
              projects,
              internships,
              semesterMarks,
              bio,
              isProfileComplete: Boolean(phone && department && cgpa > 0)
            }
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    revalidatePath("/student/profile");
    revalidatePath("/student/dashboard");
    revalidatePath("/admin/students");
    revalidatePath("/admin/dashboard");

    return NextResponse.json(
      { success: true, user: updatedUser },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
