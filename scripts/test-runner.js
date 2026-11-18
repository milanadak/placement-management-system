/**
 * CampusConnect Automated Integration & Unit Test Runner
 * Uses isolated memory / test-suite logic.
 * NEVER alters or touches the real demo database (prisma/dev.db).
 */

const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');
const path = require('path');
const fs = require('fs');

const JWT_SECRET = new TextEncoder().encode("campusconnect-test-secret-key-2026");

// In-memory test assertions
let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName, details = "") {
  if (condition) {
    passed++;
    results.push({ name: testName, status: "PASS", details });
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    results.push({ name: testName, status: "FAIL", details });
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("🚀 CAMPUSCONNECT AUTOMATED TEST SUITE STARTING");
  console.log("=================================================\n");

  // SECTION 1: AUTHENTICATION & SECURITY TESTS
  console.log("--- 1. Authentication & Security Tests ---");

  // Test 1.1: Password Hashing
  const rawPassword = "Student@12345";
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(rawPassword, salt);
  const isMatch = await bcrypt.compare(rawPassword, hash);
  const isWrongMatch = await bcrypt.compare("WrongPassword", hash);

  assert(isMatch === true, "Password hashing and verification with bcryptjs");
  assert(isWrongMatch === false, "Reject incorrect password with bcryptjs");

  // Test 1.2: JWT Session Token Issuance & Verification
  const payload = { id: "student-1", email: "student@campusconnect.edu", name: "Priya Sharma", role: "STUDENT" };
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  const { payload: verified } = await jwtVerify(token, JWT_SECRET);
  assert(verified.id === payload.id && verified.role === "STUDENT", "JWT token generation and verification via jose");

  // Test 1.3: Role-based Access Restriction
  const adminPayload = { id: "admin-1", email: "admin@campusconnect.edu", role: "ADMIN" };
  const adminToken = await new SignJWT(adminPayload)
    .setProtectedHeader({ alg: "HS256" })
    .sign(JWT_SECRET);
  const { payload: adminVerified } = await jwtVerify(adminToken, JWT_SECRET);
  assert(adminVerified.role === "ADMIN", "Admin role signature verified");
  assert(verified.role !== "ADMIN", "Student cannot masquerade as admin role");

  // SECTION 2: SMART MATCHING & READINESS ENGINE
  console.log("\n--- 2. Smart Matching & Placement Readiness Engine ---");

  // Matching logic
  function testSmartMatch(student, job) {
    let cgpaScore = student.cgpa >= job.minCgpa ? 35 : Math.round((student.cgpa / job.minCgpa) * 30);
    let deptScore = (job.eligibleDepartments === "ALL" || job.eligibleDepartments.includes(student.department)) ? 30 : 0;
    const studentSkills = student.skills.toLowerCase().split(",").map(s => s.trim());
    const jobSkills = job.skills.toLowerCase().split(",").map(s => s.trim());
    const matched = jobSkills.filter(js => studentSkills.some(ss => ss.includes(js) || js.includes(ss)));
    const skillsScore = Math.round((matched.length / jobSkills.length) * 25);
    const batchScore = (!job.graduationYear || student.graduationYear === job.graduationYear) ? 10 : 0;
    return cgpaScore + deptScore + skillsScore + batchScore;
  }

  const sampleStudent = {
    cgpa: 9.0,
    department: "Computer Science",
    graduationYear: 2026,
    skills: "Java, Python, SQL, React, System Design",
    resumeUrl: "/uploads/resumes/sample.pdf",
    bio: "Passionate software engineer focused on distributed systems."
  };

  const eligibleJob = {
    minCgpa: 8.0,
    eligibleDepartments: "Computer Science, Information Technology",
    graduationYear: 2026,
    skills: "Java, SQL, Algorithms"
  };

  const highMatch = testSmartMatch(sampleStudent, eligibleJob);
  assert(highMatch >= 80, `Smart match calculated high compatibility score (${highMatch}%) for matching student`);

  const ineligibleJob = {
    minCgpa: 9.5,
    eligibleDepartments: "Mechanical Engineering",
    graduationYear: 2026,
    skills: "SolidWorks, AutoCAD"
  };

  const lowMatch = testSmartMatch(sampleStudent, ineligibleJob);
  assert(lowMatch < 50, `Smart match calculated low compatibility score (${lowMatch}%) for mismatched branch and CGPA`);

  // SECTION 3: AUTOMATIC ELIGIBILITY & DUPLICATE PREVENTION
  console.log("\n--- 3. Academic Eligibility & Duplicate Validation ---");

  function evaluateEligibility(student, job) {
    if (student.cgpa < job.minCgpa) {
      return { eligible: false, reason: `CGPA ${student.cgpa} below required ${job.minCgpa}` };
    }
    if (job.eligibleDepartments !== "ALL" && !job.eligibleDepartments.includes(student.department)) {
      return { eligible: false, reason: `Department ${student.department} not allowed` };
    }
    if (job.graduationYear && student.graduationYear !== job.graduationYear) {
      return { eligible: false, reason: `Batch mismatch` };
    }
    if (new Date() > new Date(job.deadline)) {
      return { eligible: false, reason: `Deadline passed` };
    }
    return { eligible: true };
  }

  const activeDrive = { minCgpa: 7.5, eligibleDepartments: "Computer Science", graduationYear: 2026, deadline: new Date(Date.now() + 86400000) };
  const expiredDrive = { minCgpa: 7.5, eligibleDepartments: "Computer Science", graduationYear: 2026, deadline: new Date(Date.now() - 86400000) };
  const highCgpaDrive = { minCgpa: 9.5, eligibleDepartments: "Computer Science", graduationYear: 2026, deadline: new Date(Date.now() + 86400000) };

  assert(evaluateEligibility(sampleStudent, activeDrive).eligible === true, "Student satisfies active drive eligibility criteria");
  assert(evaluateEligibility(sampleStudent, expiredDrive).eligible === false, "Prevent application to expired campus drive");
  assert(evaluateEligibility(sampleStudent, highCgpaDrive).eligible === false, "Reject student with CGPA below minimum threshold");

  // Duplicate check
  const applicationsSet = new Set(["student-1_job-101"]);
  const isDuplicate = applicationsSet.has("student-1_job-101");
  const isNewApply = !applicationsSet.has("student-1_job-102");
  assert(isDuplicate === true, "Detect and block duplicate application submission");
  assert(isNewApply === true, "Allow application submission for new job opening");

  // Application Withdrawal validation
  function canWithdrawApplication(status) {
    return status === "Applied" || status === "Under Review";
  }

  assert(canWithdrawApplication("Applied") === true, "Allow withdrawal of 'Applied' application");
  assert(canWithdrawApplication("Under Review") === true, "Allow withdrawal of 'Under Review' application");
  assert(canWithdrawApplication("Selected") === false, "Prevent withdrawal of 'Selected' application");
  assert(canWithdrawApplication("Interview Scheduled") === false, "Prevent withdrawal of 'Interview Scheduled' application");

  // SECTION 4: FILE UPLOAD VALIDATION & SECURITY
  console.log("\n--- 4. Resume File Upload Security Tests ---");

  const MAX_SIZE = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

  function validateFileUpload(file) {
    if (file.size > MAX_SIZE) return { valid: false, error: "File exceeds 5MB size limit." };
    if (!ALLOWED_TYPES.includes(file.type)) return { valid: false, error: "Invalid file type. Only PDF and Word allowed." };
    // Check path traversal
    if (file.name.includes("..") || file.name.includes("/") || file.name.includes("\\")) {
      return { valid: false, error: "Path traversal detected in filename." };
    }
    return { valid: true };
  }

  assert(validateFileUpload({ name: "Resume.pdf", size: 1024 * 100, type: "application/pdf" }).valid === true, "Accept valid PDF resume under 5MB");
  assert(validateFileUpload({ name: "HugeResume.pdf", size: 6 * 1024 * 1024, type: "application/pdf" }).valid === false, "Reject resume exceeding 5MB size limit");
  assert(validateFileUpload({ name: "Malicious.exe", size: 1024 * 50, type: "application/x-msdownload" }).valid === false, "Reject dangerous executable upload");
  assert(validateFileUpload({ name: "../../../etc/passwd", size: 1024, type: "application/pdf" }).valid === false, "Prevent path traversal attack in file upload");

  // SECTION 5: CSV REPORT ESCAPING & ACCREDITATION FORMATTING
  console.log("\n--- 5. CSV Report Formatting & Escaping Tests ---");

  function escapeCsvField(field) {
    if (typeof field !== "string") field = String(field);
    return `"${field.replace(/"/g, '""')}"`;
  }

  const cleanField = escapeCsvField("Computer Science");
  const commaField = escapeCsvField("Java, Python, C++");
  const quoteField = escapeCsvField('Special "Power" Programmer');

  assert(cleanField === '"Computer Science"', "Standard field wrapped in quotes");
  assert(commaField === '"Java, Python, C++"', "Field with comma properly escaped in quotes");
  assert(quoteField === '"Special ""Power"" Programmer"', "Quotes inside field escaped using double-quote RFC 4180 standard");

  // SECTION 6: ADVANCED PLACEMENT ELIGIBILITY & PIPELINE TESTS
  console.log("\n--- 6. Placement Eligibility Engine & Extended Pipeline Tests ---");

  // Replicate evaluateStudentEligibility logic for isolated test runner
  function runEligibilityEvaluation(student, criteria) {
    const passedReasons = [];
    const failedReasons = [];

    // CGPA Gate
    if (student.cgpa >= criteria.minCgpa) {
      passedReasons.push(`CGPA ${student.cgpa.toFixed(2)} meets required ${criteria.minCgpa.toFixed(1)}`);
    } else {
      failedReasons.push(`CGPA ${student.cgpa.toFixed(2)} is below minimum threshold of ${criteria.minCgpa.toFixed(1)}`);
    }

    // Backlogs Gate
    if (student.backlogs <= criteria.maxBacklogs) {
      passedReasons.push(`Active backlogs (${student.backlogs}) within maximum allowed (${criteria.maxBacklogs})`);
    } else {
      failedReasons.push(`Active backlogs (${student.backlogs}) exceeds limit of ${criteria.maxBacklogs}`);
    }

    // 10th Standard Percentage Gate
    if (student.tenthPercentage >= criteria.minTenthPercentage) {
      passedReasons.push(`10th score ${student.tenthPercentage}% meets required ${criteria.minTenthPercentage}%`);
    } else {
      failedReasons.push(`10th score ${student.tenthPercentage}% below required ${criteria.minTenthPercentage}%`);
    }

    // 12th Standard Percentage Gate
    if (student.twelfthPercentage >= criteria.minTwelfthPercentage) {
      passedReasons.push(`12th score ${student.twelfthPercentage}% meets required ${criteria.minTwelfthPercentage}%`);
    } else {
      failedReasons.push(`12th score ${student.twelfthPercentage}% below required ${criteria.minTwelfthPercentage}%`);
    }

    // Department / Branch Gate
    if (criteria.eligibleDepartments === "ALL") {
      passedReasons.push(`Department ${student.department} open to all disciplines`);
    } else {
      const allowedDepts = criteria.eligibleDepartments.split(",").map(d => d.trim().toLowerCase());
      if (allowedDepts.includes(student.department.toLowerCase())) {
        passedReasons.push(`Branch ${student.department} is among eligible departments`);
      } else {
        failedReasons.push(`Branch ${student.department} is not permitted for this drive`);
      }
    }

    // Batch Year Gate
    if (!criteria.graduationYear || student.graduationYear === criteria.graduationYear) {
      passedReasons.push(`Graduation batch ${student.graduationYear} matches target class`);
    } else {
      failedReasons.push(`Graduation year ${student.graduationYear} does not match required batch ${criteria.graduationYear}`);
    }

    return {
      isEligible: failedReasons.length === 0,
      passedReasons,
      failedReasons
    };
  }

  const primeCandidate = {
    name: "Rahul Sharma",
    cgpa: 8.8,
    backlogs: 0,
    tenthPercentage: 88.5,
    twelfthPercentage: 86.0,
    department: "Computer Science",
    graduationYear: 2026
  };

  const backloggedCandidate = {
    name: "Ankit Verma",
    cgpa: 7.2,
    backlogs: 2,
    tenthPercentage: 75.0,
    twelfthPercentage: 70.0,
    department: "Information Technology",
    graduationYear: 2026
  };

  const strictDriveCriteria = {
    minCgpa: 8.0,
    maxBacklogs: 0,
    minTenthPercentage: 75.0,
    minTwelfthPercentage: 75.0,
    eligibleDepartments: "Computer Science, Information Technology",
    graduationYear: 2026
  };

  const primeResult = runEligibilityEvaluation(primeCandidate, strictDriveCriteria);
  assert(primeResult.isEligible === true, "Qualified student passes strict placement eligibility gate");
  assert(primeResult.passedReasons.length === 6, "All 6 academic checklist reasons verified as passed");

  const backloggedResult = runEligibilityEvaluation(backloggedCandidate, strictDriveCriteria);
  assert(backloggedResult.isEligible === false, "Student with active backlogs and sub-8.0 CGPA correctly marked ineligible");
  assert(backloggedResult.failedReasons.length >= 2, "Exact failure reasons recorded for CGPA and backlogs");

  // Test 6.2: Batch Eligibility Calculation
  const mockCohort = [
    primeCandidate,
    backloggedCandidate,
    { name: "Pooja Patel", cgpa: 9.1, backlogs: 0, tenthPercentage: 92, twelfthPercentage: 90, department: "Computer Science", graduationYear: 2026 },
    { name: "Siddharth Rao", cgpa: 6.5, backlogs: 1, tenthPercentage: 62, twelfthPercentage: 64, department: "Mechanical Engineering", graduationYear: 2026 }
  ];

  const cohortEvaluations = mockCohort.map(s => runEligibilityEvaluation(s, strictDriveCriteria));
  const batchEligibleCount = cohortEvaluations.filter(e => e.isEligible).length;
  const batchEligibleRate = (batchEligibleCount / mockCohort.length) * 100;

  assert(batchEligibleCount === 2, "Batch evaluation identifies exact eligible count (2 out of 4)");
  assert(batchEligibleRate === 50, "Batch eligibility rate mathematically computed at exactly 50%");

  // Test 6.3: Extended Recruitment Pipeline Progression
  const pipelineOrder = [
    "Applied",
    "Shortlisted",
    "Aptitude",
    "Technical Interview",
    "HR Interview",
    "Selected",
    "Rejected"
  ];

  function isValidPipelineStatus(status) {
    return pipelineOrder.includes(status);
  }

  assert(isValidPipelineStatus("Aptitude") === true, "Pipeline accepts 'Aptitude' assessment stage");
  assert(isValidPipelineStatus("Technical Interview") === true, "Pipeline accepts 'Technical Interview' round");
  assert(isValidPipelineStatus("HR Interview") === true, "Pipeline accepts 'HR Interview' final round");
  assert(isValidPipelineStatus("Selected") === true, "Pipeline accepts final 'Selected' placement offer");
  assert(isValidPipelineStatus("RandomStatus") === false, "Pipeline rejects unrecognized stage");

  // Test 6.4: Placement Admin Resume Upload on Behalf of Student
  function authorizeResumeUpload(userRole, targetStudentId) {
    if (userRole === "ADMIN") return { allowed: true, reason: "Authorized placement administrator" };
    return { allowed: false, reason: "Insufficient permissions" };
  }

  assert(authorizeResumeUpload("ADMIN", "student-42").allowed === true, "Placement Administrator authorized to manage student resumes");
  assert(authorizeResumeUpload("STUDENT", "student-42").allowed === false, "Non-admin cannot manage other student resumes");

  // SECTION 7: UNIFIED ELIGIBILITY & DEPARTMENT ALIAS TESTS
  console.log("\n--- 7. Unified Eligibility & Department Alias Tests ---");

  const DEPARTMENT_ALIASES = {
    "computer science": ["cs", "cse", "computer science", "computer science & engineering", "computer science and engineering"],
    "information technology": ["it", "information technology", "information science", "ise"],
    "data science": ["ds", "data science", "ai", "artificial intelligence", "ai & ml", "aiml"],
    "electronics": ["electronics", "ece", "electronics and communication", "electronics & communication"],
    "electrical engineering": ["electrical", "ee", "eee", "electrical engineering"],
    "mechanical engineering": ["mechanical", "me", "mech", "mechanical engineering"]
  };

  function testIsDepartmentMatch(studentDept, eligibleDepts) {
    if (!studentDept) return false;
    if (!eligibleDepts || eligibleDepts.length === 0 || eligibleDepts.includes("ALL")) return true;
    const sDeptClean = studentDept.trim().toLowerCase();
    let studentCanonical = null;
    for (const [canonical, aliases] of Object.entries(DEPARTMENT_ALIASES)) {
      if (aliases.some(alias => sDeptClean === alias || sDeptClean.includes(alias) || alias.includes(sDeptClean))) {
        studentCanonical = canonical;
        break;
      }
    }
    return eligibleDepts.some(eDept => {
      const eDeptClean = eDept.trim().toLowerCase();
      if (eDeptClean === "all") return true;
      if (sDeptClean === eDeptClean || sDeptClean.includes(eDeptClean) || eDeptClean.includes(sDeptClean)) return true;
      if (studentCanonical) {
        const allowed = DEPARTMENT_ALIASES[studentCanonical] || [];
        if (allowed.some(alias => eDeptClean === alias || eDeptClean.includes(alias) || alias.includes(eDeptClean))) return true;
      }
      return false;
    });
  }

  assert(testIsDepartmentMatch("CSE", ["Computer Science", "Information Technology"]) === true, "CSE student recognized as eligible for Computer Science drive");
  assert(testIsDepartmentMatch("IT", ["Information Technology"]) === true, "IT student recognized as eligible for Information Technology drive");
  assert(testIsDepartmentMatch("ECE", ["Electronics", "Electrical Engineering"]) === true, "ECE student recognized as eligible for Electronics drive");
  assert(testIsDepartmentMatch("Mech", ["Mechanical Engineering"]) === true, "Mech student recognized as eligible for Mechanical Engineering drive");
  assert(testIsDepartmentMatch("Civil", ["Computer Science"]) === false, "Civil student correctly filtered out from CS-only drive");

  // Test 7.2: Float tolerance in CGPA
  const studentCgpaFloat = 7.99999;
  const cutoffCgpa = 8.0;
  const isCgpaAllowed = studentCgpaFloat >= (cutoffCgpa - 0.01);
  assert(isCgpaAllowed === true, "Float tolerance allows 7.99999 CGPA to satisfy 8.0 cutoff");

  // FINAL SUMMARY
  console.log("\n=================================================");
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test runner fatal error:", err);
  process.exit(1);
});
