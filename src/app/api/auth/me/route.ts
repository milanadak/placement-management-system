import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json(
      { user: null },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      studentProfile: true,
      notifications: {
        where: { isRead: false },
        take: 5,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  return NextResponse.json(
    { user },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
