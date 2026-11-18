import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateProfileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(8),
  department: z.string().min(2),
  graduationYear: z.coerce.number().int(),
  cgpa: z.coerce.number().min(0).max(10),
  skills: z.string(),
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

  return NextResponse.json({ user });
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

    const { name, phone, department, graduationYear, cgpa, skills, bio } = result.data;

    // Update user name and studentProfile
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        name,
        studentProfile: {
          upsert: {
            create: {
              rollNo: "TBD",
              phone,
              department,
              graduationYear,
              cgpa,
              skills,
              bio,
              isProfileComplete: Boolean(phone && department && cgpa > 0)
            },
            update: {
              phone,
              department,
              graduationYear,
              cgpa,
              skills,
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

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
