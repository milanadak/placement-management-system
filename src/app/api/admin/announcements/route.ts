import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AnnouncementSchema = z.object({
  title: z.string().min(5),
  content: z.string().min(10),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  targetDept: z.string().default("ALL"),
});

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = AnnouncementSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { title, content, priority, targetDept } = result.data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        priority,
        targetDept,
        authorId: sessionUser.id
      }
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to publish announcement" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });

    const result = AnnouncementSchema.safeParse(rest);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: {
        title: result.data.title,
        content: result.data.content,
        priority: result.data.priority,
        targetDept: result.data.targetDept
      }
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing announcement ID" }, { status: 400 });

    await prisma.announcement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }
}
