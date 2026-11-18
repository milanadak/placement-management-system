import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CompanySchema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().min(5),
  location: z.string().min(2),
  industry: z.string().min(2),
  contactEmail: z.string().email().optional().or(z.literal("")),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    include: {
      jobs: true
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ companies });
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const result = CompanySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { name, website, description, location, industry, contactEmail } = result.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        website: website || null,
        description,
        location,
        industry,
        contactEmail: contactEmail || null
      }
    });

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error("Create company error:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "Missing company ID" }, { status: 400 });

    await prisma.company.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
