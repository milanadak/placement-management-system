import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: { jobs: { where: { isActive: true } } }
        }
      },
      orderBy: { name: "asc" }
    });

    const formatted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      industry: c.industry,
      location: c.address || "Bengaluru / Hyderabad / Mumbai",
      website: `https://${c.slug}.com`,
      description: `Premier multinational partner participating in CampusConnect placement drives across engineering disciplines.`,
      openings: c._count.jobs,
      tier: c._count.jobs > 1 ? "Super Dream" : "Dream",
      initials: c.name[0] || "C"
    }));

    return NextResponse.json(
      { companies: formatted },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (error: any) {
    console.error("Fetch companies error:", error);
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 });
  }
}
