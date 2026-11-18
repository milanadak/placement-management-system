import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { jobId, coverNote } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // 1. Fetch Job
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    });

    if (!job || !job.isActive) {
      return NextResponse.json({ error: "Job opening is no longer accepting applications." }, { status: 404 });
    }

    if (new Date() > new Date(job.deadline)) {
      return NextResponse.json({ error: "The application deadline for this position has passed." }, { status: 400 });
    }

    // 2. Fetch Student Profile
    const student = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { studentProfile: true }
    });

    if (!student || !student.studentProfile) {
      return NextResponse.json({ error: "Please complete your student profile before applying." }, { status: 400 });
    }

    const profile = student.studentProfile;

    // 3. Automatic Eligibility Evaluation
    // CGPA check
    if (profile.cgpa < job.minCgpa) {
      return NextResponse.json(
        {
          error: `Not eligible: Required CGPA is ${job.minCgpa.toFixed(1)}, your CGPA is ${profile.cgpa.toFixed(1)}.`
        },
        { status: 403 }
      );
    }

    // Department check
    if (job.eligibleDepartments !== "ALL") {
      const allowedDepts = job.eligibleDepartments
        .split(",")
        .map(d => d.trim().toLowerCase());
      
      const studentDept = profile.department.trim().toLowerCase();
      const isDeptAllowed = allowedDepts.some(d => d === studentDept || studentDept.includes(d) || d.includes(studentDept));

      if (!isDeptAllowed) {
        return NextResponse.json(
          {
            error: `Not eligible: Your department (${profile.department}) is not among the eligible departments (${job.eligibleDepartments}).`
          },
          { status: 403 }
        );
      }
    }

    // Graduation Year check
    if (job.graduationYear && profile.graduationYear !== job.graduationYear) {
      return NextResponse.json(
        {
          error: `Not eligible: Position is open for ${job.graduationYear} batch graduates. Your registered batch is ${profile.graduationYear}.`
        },
        { status: 403 }
      );
    }

    // 4. Duplicate Application Prevention
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: sessionUser.id,
          jobId: job.id
        }
      }
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already submitted an application for this position." },
        { status: 409 }
      );
    }

    // 5. Create Application
    const application = await prisma.application.create({
      data: {
        studentId: sessionUser.id,
        jobId: job.id,
        status: "Applied",
        coverNote: coverNote || null
      },
      include: {
        job: {
          include: { company: true }
        }
      }
    });

    // 6. Send in-app notification
    await prisma.notification.create({
      data: {
        userId: sessionUser.id,
        title: "Application Submitted Successfully",
        message: `Your application for ${job.title} at ${job.company.name} has been received and is under review.`,
        link: "/student/applications"
      }
    });

    return NextResponse.json({
      success: true,
      application
    });
  } catch (error: any) {
    console.error("Job application error:", error);
    return NextResponse.json({ error: "Failed to submit application. Please try again." }, { status: 500 });
  }
}
