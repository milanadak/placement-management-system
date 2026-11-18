import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let user = await prisma.user.findUnique({
    where: { id: sessionUser.id }
  });

  if (!user && sessionUser.email) {
    user = await prisma.user.findUnique({
      where: { email: sessionUser.email }
    });
  }

  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { studentId: sessionUser.id },
        ...(user ? [{ studentId: user.id }] : [])
      ]
    },
    include: {
      job: {
        include: { company: true }
      },
      interviews: {
        orderBy: { interviewDate: "asc" }
      }
    },
    orderBy: { appliedAt: "desc" }
  });

  return NextResponse.json(
    { applications },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("id");

    if (!applicationId) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    // Verify ownership and allowed withdrawal status
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: { include: { company: true } }
      }
    });

    if (!app || app.studentId !== sessionUser.id) {
      return NextResponse.json({ error: "Application not found or unauthorized" }, { status: 404 });
    }

    if (app.status !== "Applied" && app.status !== "Under Review") {
      return NextResponse.json(
        { error: `Cannot withdraw application once status is ${app.status}. Please contact the Placement Cell.` },
        { status: 400 }
      );
    }

    // Delete application
    await prisma.application.delete({
      where: { id: applicationId }
    });

    // Notify student of withdrawal
    await prisma.notification.create({
      data: {
        userId: sessionUser.id,
        title: "Application Withdrawn",
        message: `Your application for ${app.job.title} at ${app.job.company.name} has been withdrawn successfully.`,
        link: "/student/applications"
      }
    });

    revalidatePath("/student/applications");
    revalidatePath("/admin/applications");
    revalidatePath("/student/dashboard");
    revalidatePath("/admin/dashboard");

    return NextResponse.json(
      { success: true, message: "Application withdrawn successfully." },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error: any) {
    console.error("Withdraw application error:", error);
    return NextResponse.json({ error: "Failed to withdraw application." }, { status: 500 });
  }
}
