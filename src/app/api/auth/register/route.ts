import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

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
    const body = await req.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { name, email, password, rollNo, department, graduationYear, cgpa, phone, skills } = result.data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { studentProfile: { rollNo: rollNo.toUpperCase() } }
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
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNo: rollNo.toUpperCase(),
            department,
            graduationYear,
            cgpa,
            phone,
            skills: skills || "",
            isProfileComplete: Boolean(rollNo && department && phone && cgpa > 0),
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

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.studentProfile
      }
    });

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
