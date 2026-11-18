import { isDepartmentMatch } from "@/lib/eligibility";

export interface StudentMatchProfile {
  cgpa: number;
  department: string;
  graduationYear: number;
  skills: string;
  resumeUrl?: string | null;
  bio?: string | null;
  phone?: string | null;
}

export interface JobMatchCriteria {
  minCgpa: number;
  eligibleDepartments: string;
  graduationYear: number;
  skills: string;
  deadline: Date | string;
  isActive?: boolean;
}

export interface SmartMatchResult {
  matchPercentage: number;
  breakdown: {
    cgpaScore: number;
    deptScore: number;
    skillsScore: number;
    batchScore: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  explanation: string;
}

export interface EligibilityChecklist {
  cgpa: { pass: boolean; required: number; actual: number; message: string };
  department: { pass: boolean; required: string; actual: string; message: string };
  batch: { pass: boolean; required: number; actual: number; message: string };
  deadline: { pass: boolean; deadline: string; message: string };
  isOverallEligible: boolean;
}

export interface PlacementReadinessResult {
  score: number;
  tier: "Elite Ready" | "Placement Ready" | "Competitive Candidate" | "Needs Profile Action";
  suggestions: string[];
  breakdown: {
    academics: number;
    resume: number;
    skills: number;
    profile: number;
  };
}

/**
 * FEATURE 1: Smart Job Matching Algorithm (Transparent, Rule-based compatibility)
 */
export function calculateSmartMatch(
  student: StudentMatchProfile,
  job: JobMatchCriteria
): SmartMatchResult {
  // 1. CGPA Component (35% weight)
  let cgpaScore = 0;
  if (student.cgpa >= job.minCgpa) {
    cgpaScore = 35;
  } else {
    const ratio = Math.max(0, student.cgpa / Math.max(1, job.minCgpa));
    cgpaScore = Math.round(ratio * 30);
  }

  // 2. Department Component (30% weight)
  let deptScore = 0;
  const jobDepts = job.eligibleDepartments.toLowerCase();
  const studentDept = student.department.toLowerCase();

  if (jobDepts === "all" || jobDepts.includes(studentDept) || studentDept.includes(jobDepts)) {
    deptScore = 30;
  } else {
    // Circuital partial overlap
    const circuital = ["computer science", "information technology", "data science", "electronics"];
    if (circuital.includes(studentDept) && circuital.some(c => jobDepts.includes(c))) {
      deptScore = 15;
    } else {
      deptScore = 0;
    }
  }

  // 3. Skills Overlap Component (25% weight)
  const studentSkillTokens = (student.skills || "")
    .toLowerCase()
    .split(/[,;|]/)
    .map(s => s.trim())
    .filter(Boolean);

  const jobSkillTokens = (job.skills || "")
    .toLowerCase()
    .split(/[,;|]/)
    .map(s => s.trim())
    .filter(Boolean);

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  jobSkillTokens.forEach(js => {
    const isMatch = studentSkillTokens.some(ss => ss.includes(js) || js.includes(ss));
    if (isMatch) matchedSkills.push(js);
    else missingSkills.push(js);
  });

  const skillMatchRatio = jobSkillTokens.length > 0 ? (matchedSkills.length / jobSkillTokens.length) : 1;
  const skillsScore = Math.round(skillMatchRatio * 25);

  // 4. Batch Component (10% weight)
  const batchScore = (!job.graduationYear || student.graduationYear === job.graduationYear) ? 10 : 0;

  const total = cgpaScore + deptScore + skillsScore + batchScore;

  let explanation = "";
  if (total >= 85) {
    explanation = "Strong candidate profile: CGPA satisfies requirements with high technical skills alignment.";
  } else if (total >= 70) {
    explanation = "Good alignment: eligible with partial skill overlap. Recommended to apply.";
  } else if (total >= 50) {
    explanation = "Moderate compatibility: review specific requirements and key missing skills.";
  } else {
    explanation = "Low compatibility: academic criteria or department restrictions do not match.";
  }

  return {
    matchPercentage: Math.min(100, Math.max(0, total)),
    breakdown: { cgpaScore, deptScore, skillsScore, batchScore },
    matchedSkills,
    missingSkills,
    explanation
  };
}

/**
 * FEATURE 2: Placement Readiness Score (0 to 100 with actionable feedback)
 */
export function calculateReadinessScore(student: StudentMatchProfile): PlacementReadinessResult {
  const suggestions: string[] = [];

  // Academics (25 max)
  let academics = 0;
  if (student.cgpa >= 8.5) {
    academics = 25;
  } else if (student.cgpa >= 7.5) {
    academics = 20;
    suggestions.push("Aim to elevate CGPA above 8.5 to unlock Tier-1 Super Dream packages (>20 LPA).");
  } else if (student.cgpa >= 6.5) {
    academics = 15;
    suggestions.push("Target core drives and improve academic standing to cross the 7.5 CGPA threshold.");
  } else {
    academics = 10;
    suggestions.push("Review backlog policies and maintain minimum CGPA for mass recruitment eligibility.");
  }

  // Resume (25 max)
  let resume = 0;
  if (student.resumeUrl) {
    resume = 25;
  } else {
    suggestions.push("Upload your verified PDF resume to enable 1-click campus applications.");
  }

  // Skills (25 max)
  let skills = 0;
  const skillCount = (student.skills || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean).length;

  if (skillCount >= 5) {
    skills = 25;
  } else if (skillCount >= 3) {
    skills = 18;
    suggestions.push("Add 2 or more specialized skills (e.g. Cloud, Docker, System Design) to stand out.");
  } else {
    skills = 10;
    suggestions.push("List at least 5 industry-relevant technical competencies in your profile.");
  }

  // Profile Bio & Contact (25 max)
  let profile = 0;
  if (student.phone && student.phone.length >= 8) profile += 10;
  else suggestions.push("Provide a verified WhatsApp/contact phone number for interview notifications.");

  if (student.bio && student.bio.length >= 20) profile += 15;
  else suggestions.push("Write a clear 2-3 sentence career summary in your profile.");

  const total = academics + resume + skills + profile;

  let tier: PlacementReadinessResult["tier"] = "Needs Profile Action";
  if (total >= 90) tier = "Elite Ready";
  else if (total >= 75) tier = "Placement Ready";
  else if (total >= 60) tier = "Competitive Candidate";

  return {
    score: total,
    tier,
    suggestions,
    breakdown: { academics, resume, skills, profile }
  };
}

/**
 * FEATURE 3: Eligibility Transparency Checklist
 */
export function checkDetailedEligibility(
  student: StudentMatchProfile,
  job: JobMatchCriteria
): EligibilityChecklist {
  const sCgpa = parseFloat(String(student?.cgpa || 0));
  const jMinCgpa = parseFloat(String(job?.minCgpa || 0));
  const isCgpaPass = sCgpa >= (jMinCgpa - 0.01);

  const eligibleDeptsList = (job.eligibleDepartments || "ALL")
    .split(",")
    .map(d => d.trim());
  const isDeptPass = isDepartmentMatch(student?.department || "", eligibleDeptsList);

  const studentBatch = Number(student?.graduationYear || 2026);
  const jobBatch = Number(job?.graduationYear || 2026);
  const isBatchPass = !job.graduationYear || studentBatch === jobBatch || Math.abs(studentBatch - jobBatch) <= 1;

  const now = new Date();
  const deadlineDate = new Date(job.deadline);
  deadlineDate.setHours(23, 59, 59, 999);
  const isDeadlinePass = now.getTime() <= deadlineDate.getTime();

  return {
    cgpa: {
      pass: isCgpaPass,
      required: jMinCgpa,
      actual: sCgpa,
      message: isCgpaPass
        ? `Meets minimum CGPA of ${jMinCgpa.toFixed(1)} (Your CGPA: ${sCgpa.toFixed(2)})`
        : `Required CGPA is ${jMinCgpa.toFixed(1)}, but your CGPA is ${sCgpa.toFixed(2)}`
    },
    department: {
      pass: isDeptPass,
      required: job.eligibleDepartments,
      actual: student?.department || "Unspecified",
      message: isDeptPass
        ? `Department eligible (${student?.department || "Eligible"})`
        : `Department restricted: Only ${job.eligibleDepartments} eligible`
    },
    batch: {
      pass: isBatchPass,
      required: job.graduationYear,
      actual: student?.graduationYear || 2026,
      message: isBatchPass
        ? `Eligible graduation batch (${student?.graduationYear || 2026})`
        : `Open only for ${job.graduationYear} batch`
    },
    deadline: {
      pass: isDeadlinePass,
      deadline: deadlineDate.toLocaleDateString(),
      message: isDeadlinePass
        ? `Application window active until ${deadlineDate.toLocaleDateString()}`
        : `Application deadline expired on ${deadlineDate.toLocaleDateString()}`
    },
    isOverallEligible: isCgpaPass && isDeptPass && isBatchPass && isDeadlinePass
  };
}
