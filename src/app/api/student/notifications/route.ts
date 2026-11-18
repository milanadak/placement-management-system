import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: sessionUser.id },
      orderBy: { createdAt: "desc" },
      take: 30
    }),
    prisma.notification.count({
      where: { userId: sessionUser.id, isRead: false }
    })
  ]);

  return NextResponse.json(
    { notifications, unreadCount },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}

export async function PATCH(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, markAll } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: sessionUser.id, isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true, message: "All notifications marked as read." });
    }

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Missing notification id or markAll flag" }, { status: 400 });
  } catch (error: any) {
    console.error("Notification update error:", error);
    return NextResponse.json({ error: "Failed to update notification." }, { status: 500 });
  }
}
