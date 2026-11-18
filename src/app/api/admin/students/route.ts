import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: true,
      applications: {
        include: {
          job: { include: { company: true } }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ students });
}
