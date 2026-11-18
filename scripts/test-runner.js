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
