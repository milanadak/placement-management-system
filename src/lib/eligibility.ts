export interface EligibilityCriteria {
  minCgpa: number;
  maxBacklogs: number;
  minTenthPercentage?: number;
  minTwelfthPercentage?: number;
  eligibleDepartments: string | string[]; // "ALL" or ["Computer Science", ...] or comma string
  graduationYear?: number;
  requiredSkills?: string;
}

export interface StudentAcademicData {
  id: string;
  name: string;
  email: string;
  rollNo?: string;
  department: string;
  cgpa: number;
  tenthPercentage?: number;
  twelfthPercentage?: number;
  backlogs?: number;
  graduationYear?: number;
  skills?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  scorePercentage: number;
  reasons: {
    criterion: string;
    passed: boolean;
    message: string;
  }[];
}

export function evaluateStudentEligibility(
  student: StudentAcademicData,
  criteria: EligibilityCriteria
): EligibilityResult {
  const reasons: EligibilityResult["reasons"] = [];

  // 1. CGPA Criterion
  const minCgpa = criteria.minCgpa || 6.0;
  const studentCgpa = student.cgpa || 0.0;
  if (studentCgpa >= minCgpa) {
    reasons.push({
      criterion: "CGPA Requirement",
      passed: true,
      message: `CGPA satisfies cutoff (Required: ≥ ${minCgpa.toFixed(1)}, Candidate: ${studentCgpa.toFixed(2)})`
    });
  } else {
    reasons.push({
      criterion: "CGPA Requirement",
      passed: false,
      message: `CGPA below cutoff (Required: ≥ ${minCgpa.toFixed(1)}, Candidate: ${studentCgpa.toFixed(2)})`
    });
  }

  // 2. Backlogs Criterion
  const maxBacklogs = criteria.maxBacklogs ?? 0;
  const studentBacklogs = student.backlogs ?? 0;
  if (studentBacklogs <= maxBacklogs) {
    reasons.push({
      criterion: "Backlog Restriction",
      passed: true,
      message: studentBacklogs === 0
        ? "No active backlogs (Clean academic record)"
        : `Active backlogs (${studentBacklogs}) within acceptable ceiling (Max: ${maxBacklogs})`
    });
  } else {
    reasons.push({
      criterion: "Backlog Restriction",
      passed: false,
      message: `Active backlogs (${studentBacklogs}) exceeds allowed limit (Max: ${maxBacklogs})`
    });
  }

  // 3. Department / Branch Criterion
  let eligibleDepts: string[] = [];
  if (Array.isArray(criteria.eligibleDepartments)) {
    eligibleDepts = criteria.eligibleDepartments.map(d => d.trim());
  } else if (typeof criteria.eligibleDepartments === "string") {
    if (criteria.eligibleDepartments === "ALL") {
      eligibleDepts = ["ALL"];
    } else {
      try {
        const parsed = JSON.parse(criteria.eligibleDepartments);
        eligibleDepts = Array.isArray(parsed) ? parsed : [criteria.eligibleDepartments];
      } catch {
        eligibleDepts = criteria.eligibleDepartments.split(",").map(d => d.trim());
      }
    }
  }

  const isAllDepts = eligibleDepts.includes("ALL") || eligibleDepts.length === 0;
  const isBranchMatched = isAllDepts || eligibleDepts.some(d => d.toLowerCase() === student.department.toLowerCase());

  if (isBranchMatched) {
    reasons.push({
      criterion: "Branch / Discipline",
      passed: true,
      message: isAllDepts
        ? `Open to all engineering departments (${student.department})`
        : `Branch matches eligible disciplines (${student.department})`
    });
  } else {
    reasons.push({
      criterion: "Branch / Discipline",
      passed: false,
      message: `Department not eligible (${student.department}). Eligible branches: ${eligibleDepts.join(", ")}`
    });
  }

  // 4. 10th Standard Percentage
  if (criteria.minTenthPercentage && criteria.minTenthPercentage > 0) {
    const student10th = student.tenthPercentage ?? 85.0;
    if (student10th >= criteria.minTenthPercentage) {
      reasons.push({
        criterion: "10th Standard Marks",
        passed: true,
        message: `10th marks satisfy requirement (Required: ≥ ${criteria.minTenthPercentage}%, Candidate: ${student10th.toFixed(1)}%)`
      });
    } else {
      reasons.push({
        criterion: "10th Standard Marks",
        passed: false,
        message: `10th marks below cutoff (Required: ≥ ${criteria.minTenthPercentage}%, Candidate: ${student10th.toFixed(1)}%)`
      });
    }
  }

  // 5. 12th Standard Percentage
  if (criteria.minTwelfthPercentage && criteria.minTwelfthPercentage > 0) {
    const student12th = student.twelfthPercentage ?? 82.0;
    if (student12th >= criteria.minTwelfthPercentage) {
      reasons.push({
        criterion: "12th Standard Marks",
        passed: true,
        message: `12th marks satisfy requirement (Required: ≥ ${criteria.minTwelfthPercentage}%, Candidate: ${student12th.toFixed(1)}%)`
      });
    } else {
      reasons.push({
        criterion: "12th Standard Marks",
        passed: false,
        message: `12th marks below cutoff (Required: ≥ ${criteria.minTwelfthPercentage}%, Candidate: ${student12th.toFixed(1)}%)`
      });
    }
  }

  // 6. Graduation Year
  if (criteria.graduationYear) {
    const studentYear = student.graduationYear ?? 2026;
    if (studentYear === criteria.graduationYear) {
      reasons.push({
        criterion: "Passing Out Batch",
        passed: true,
        message: `Eligible graduation batch (${studentYear})`
      });
    } else {
      reasons.push({
        criterion: "Passing Out Batch",
        passed: false,
        message: `Graduation year mismatch (Required: ${criteria.graduationYear}, Candidate: ${studentYear})`
      });
    }
  }

  const passedCount = reasons.filter(r => r.passed).length;
  const isEligible = reasons.every(r => r.passed);
  const scorePercentage = Math.round((passedCount / reasons.length) * 100);

  return {
    isEligible,
    scorePercentage,
    reasons
  };
}
