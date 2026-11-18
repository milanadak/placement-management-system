import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await prisma.application.findMany({
    include: {
      student: {
        include: { studentProfile: true }
      },
      job: {
        include: { company: true }
      },
      interviews: true
    },
    orderBy: { appliedAt: "desc" }
  });

  return NextResponse.json({ applications });
}

export async function PATCH(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { applicationId, status } = await req.json();

    if (!applicationId || !status) {
      return NextResponse.json({ error: "Missing applicationId or status" }, { status: 400 });
    }

    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: { include: { company: true } }
      }
    });

    // Send notification to the student about status change
    await prisma.notification.create({
      data: {
        userId: application.studentId,
        title: `Application Status Updated: ${status}`,
        message: `Your application status for ${application.job.title} at ${application.job.company.name} has been updated to "${status}".`,
        link: "/student/applications"
      }
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("Update application error:", error);
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
