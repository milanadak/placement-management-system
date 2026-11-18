import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid college email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rollNo: z.string().min(3, "Roll number is required"),
  department: z.string().min(2, "Department is required"),
  graduationYear: z.coerce.number().int().min(2020).max(2035),
  cgpa: z.coerce.number().min(0).max(10),
  phone: z.string().min(8, "Valid contact number required"),
  skills: z.string().optional().default(""),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    // Trim string fields
    const sanitizedBody = {
      ...rawBody,
      email: typeof rawBody.email === "string" ? rawBody.email.trim() : rawBody.email,
      name: typeof rawBody.name === "string" ? rawBody.name.trim() : rawBody.name,
      rollNo: typeof rawBody.rollNo === "string" ? rawBody.rollNo.trim().toUpperCase() : rawBody.rollNo,
      phone: typeof rawBody.phone === "string" ? rawBody.phone.trim() : rawBody.phone,
      department: typeof rawBody.department === "string" ? rawBody.department.trim() : rawBody.department,
    };

    const result = RegisterSchema.safeParse(sanitizedBody);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, email, password, rollNo, department, graduationYear, cgpa, phone, skills } = result.data;
    const cleanEmail = email.toLowerCase().trim();
    const cleanRollNo = rollNo.toUpperCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { studentProfile: { rollNo: cleanRollNo } }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A student with this email address or roll number already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    // Create user and profile transactionally
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNo: cleanRollNo,
            department,
            graduationYear,
            cgpa,
            phone,
            skills: skills || "",
            isProfileComplete: Boolean(cleanRollNo && department && phone && cgpa > 0),
          }
        },
        notifications: {
          create: {
            title: "Welcome to CampusConnect!",
            message: "Your student profile is active. You can now browse job opportunities and track application stages.",
            link: "/student/profile"
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: "STUDENT"
    });

    // Invalidate caches across the platform so newly registered student appears immediately
    try {
      revalidatePath("/admin/students");
      revalidatePath("/admin/dashboard");
      revalidatePath("/admin/eligibility");
      revalidatePath("/student/dashboard");
      revalidatePath("/student/profile");
    } catch (e) {
      // In case of non-critical revalidate error
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.studentProfile
        }
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
        }
      }
    );

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
