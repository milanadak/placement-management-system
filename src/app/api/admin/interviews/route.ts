import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const InterviewSchema = z.object({
  applicationId: z.string().min(1),
  roundName: z.string().min(2),
  interviewDate: z.string(),
  mode: z.string(),
  locationOrLink: z.string().min(2),
  notes: z.string().optional().default(""),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const interviews = await prisma.interview.findMany({
    include: {
      application: {
        include: {
          student: { include: { studentProfile: true } },
          job: { include: { company: true } }
        }
      }
    },
    orderBy: { interviewDate: "desc" }
  });

  return NextResponse.json({ interviews });
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = InterviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { applicationId, roundName, interviewDate, mode, locationOrLink, notes } = result.data;

    // Create interview
    const interview = await prisma.interview.create({
      data: {
        applicationId,
        roundName,
        interviewDate: new Date(interviewDate),
        mode,
        locationOrLink,
        notes,
        status: "Scheduled"
      },
      include: {
        application: {
          include: {
            job: { include: { company: true } },
            student: true
          }
        }
      }
    });

    // Update application status to "Interview Scheduled"
    await prisma.application.update({
      where: { id: applicationId },
      data: { status: "Interview Scheduled" }
    });

    // Notify student
    await prisma.notification.create({
      data: {
        userId: interview.application.studentId,
        title: `Interview Scheduled: ${interview.application.job.company.name}`,
        message: `Your ${roundName} has been scheduled for ${new Date(interviewDate).toLocaleString()}. Mode: ${mode}.`,
        link: "/student/interviews"
      }
    });

    return NextResponse.json({ success: true, interview });
  } catch (error: any) {
    console.error("Schedule interview error:", error);
    return NextResponse.json({ error: "Failed to schedule interview" }, { status: 500 });
  }
}
