import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.jobBookmark.findMany({
    where: { studentId: sessionUser.id },
    include: {
      job: {
        include: { company: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(
    { bookmarks },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    // Check if already bookmarked
    const existing = await prisma.jobBookmark.findUnique({
      where: {
        studentId_jobId: {
          studentId: sessionUser.id,
          jobId
        }
      }
    });

    if (existing) {
      // Toggle off / remove bookmark
      await prisma.jobBookmark.delete({
        where: { id: existing.id }
      });
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      // Add bookmark
      await prisma.jobBookmark.create({
        data: {
          studentId: sessionUser.id,
          jobId
        }
      });
      return NextResponse.json({ success: true, bookmarked: true });
    }
  } catch (error: any) {
    console.error("Bookmark toggle error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
