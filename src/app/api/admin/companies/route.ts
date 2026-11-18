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
  hrName: z.string().optional().default(""),
  hrPhone: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.company.findMany({
    include: {
      jobs: {
        include: {
          applications: true
        }
      }
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

    const { name, website, description, location, industry, contactEmail, hrName, hrPhone, address } = result.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Date.now();

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        website: website || null,
        description,
        location,
        industry,
        contactEmail: contactEmail || null,
        hrName: hrName || null,
        hrPhone: hrPhone || null,
        address: address || null
      }
    });

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error("Create company error:", error);
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "Company ID is required" }, { status: 400 });

    const result = CompanySchema.safeParse(rest);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0]?.message || "Invalid input" }, { status: 400 });
    }

    const { name, website, description, location, industry, contactEmail, hrName, hrPhone, address } = result.data;

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        website: website || null,
        description,
        location,
        industry,
        contactEmail: contactEmail || null,
        hrName: hrName || null,
        hrPhone: hrPhone || null,
        address: address || null
      }
    });

    return NextResponse.json({ success: true, company });
  } catch (error: any) {
    console.error("Update company error:", error);
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "Company ID is required" }, { status: 400 });

    await prisma.company.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: "Company deleted successfully" });
  } catch (error: any) {
    console.error("Delete company error:", error);
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 });
  }
}
