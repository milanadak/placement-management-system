import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateStudentEligibility, EligibilityCriteria } from "@/lib/eligibility";

export async function GET(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const batchYear = searchParams.get("batch") ? parseInt(searchParams.get("batch")!) : 2026;

  // Fetch all students with profiles
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: true,
      applications: {
        include: { job: true }
      }
    },
    orderBy: { name: "asc" }
  });

  // Fetch all active campus drives for preset selection
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    include: { company: true },
    orderBy: { title: "asc" }
  });

  let defaultCriteria: EligibilityCriteria = {
    minCgpa: 7.0,
    maxBacklogs: 0,
    minTenthPercentage: 60.0,
    minTwelfthPercentage: 60.0,
    eligibleDepartments: "ALL",
    graduationYear: batchYear
  };

  if (jobId) {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      defaultCriteria = {
        minCgpa: job.minCgpa,
        maxBacklogs: job.maxBacklogs || 0,
        minTenthPercentage: job.minTenthPercentage || 60.0,
        minTwelfthPercentage: job.minTwelfthPercentage || 60.0,
        eligibleDepartments: job.eligibleDepartments,
        graduationYear: job.graduationYear
      };
    }
  }

  // Evaluate every student
  const evaluatedStudents = students.map(s => {
    const p = s.studentProfile;
    const academicData = {
      id: s.id,
      name: s.name,
      email: s.email,
      rollNo: p?.rollNo || "N/A",
      department: p?.department || "General",
      cgpa: p?.cgpa || 0,
      tenthPercentage: p?.tenthPercentage || 85.0,
      twelfthPercentage: p?.twelfthPercentage || 82.0,
      backlogs: p?.backlogs || 0,
      graduationYear: p?.graduationYear || 2026,
      skills: p?.skills || ""
    };

    const evaluation = evaluateStudentEligibility(academicData, defaultCriteria);
    const isPlaced = s.applications.some(a => a.status === "Selected");

    return {
      ...academicData,
      isPlaced,
      evaluation
    };
  });

  const totalStudents = evaluatedStudents.length;
  const eligibleStudents = evaluatedStudents.filter(s => s.evaluation.isEligible);
  const eligibleCount = eligibleStudents.length;
  const eligiblePercentage = totalStudents > 0 ? +((eligibleCount / totalStudents) * 100).toFixed(1) : 0;
  const eligibleUnplacedCount = eligibleStudents.filter(s => !s.isPlaced).length;

  return NextResponse.json({
    criteria: defaultCriteria,
    totalStudents,
    eligibleCount,
    eligiblePercentage,
    eligibleUnplacedCount,
    jobs,
    evaluatedStudents
  });
}

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const criteria: EligibilityCriteria = {
      minCgpa: typeof body.minCgpa === "number" ? body.minCgpa : 6.0,
      maxBacklogs: typeof body.maxBacklogs === "number" ? body.maxBacklogs : 0,
      minTenthPercentage: typeof body.minTenthPercentage === "number" ? body.minTenthPercentage : 0,
      minTwelfthPercentage: typeof body.minTwelfthPercentage === "number" ? body.minTwelfthPercentage : 0,
      eligibleDepartments: body.eligibleDepartments || "ALL",
      graduationYear: body.graduationYear ? parseInt(body.graduationYear) : undefined,
      requiredSkills: body.requiredSkills || ""
    };

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        studentProfile: true,
        applications: {
          include: { job: true }
        }
      },
      orderBy: { name: "asc" }
    });

    const evaluatedStudents = students.map(s => {
      const p = s.studentProfile;
      const academicData = {
        id: s.id,
        name: s.name,
        email: s.email,
        rollNo: p?.rollNo || "N/A",
        department: p?.department || "General",
        cgpa: p?.cgpa || 0,
        tenthPercentage: p?.tenthPercentage || 85.0,
        twelfthPercentage: p?.twelfthPercentage || 82.0,
        backlogs: p?.backlogs || 0,
        graduationYear: p?.graduationYear || 2026,
        skills: p?.skills || ""
      };

      const evaluation = evaluateStudentEligibility(academicData, criteria);
      const isPlaced = s.applications.some(a => a.status === "Selected");

      return {
        ...academicData,
        isPlaced,
        evaluation
      };
    });

    const totalStudents = evaluatedStudents.length;
    const eligibleStudents = evaluatedStudents.filter(s => s.evaluation.isEligible);
    const eligibleCount = eligibleStudents.length;
    const eligiblePercentage = totalStudents > 0 ? +((eligibleCount / totalStudents) * 100).toFixed(1) : 0;
    const eligibleUnplacedCount = eligibleStudents.filter(s => !s.isPlaced).length;

    return NextResponse.json({
      success: true,
      criteria,
      totalStudents,
      eligibleCount,
      eligiblePercentage,
      eligibleUnplacedCount,
      evaluatedStudents
    });
  } catch (err: any) {
    console.error("Eligibility calculation error:", err);
    return NextResponse.json({ error: "Failed to evaluate eligibility" }, { status: 500 });
  }
}
