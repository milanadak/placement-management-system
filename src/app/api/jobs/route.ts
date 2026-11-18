import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      include: {
        company: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ jobs });
  } catch (error: any) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
