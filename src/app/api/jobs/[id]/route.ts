import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
      include: {
        company: true,
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: "Job opening not found." }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch job details." }, { status: 500 });
  }
}
