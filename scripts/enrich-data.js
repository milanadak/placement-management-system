const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Enriching existing records with detailed academic, company, and drive data...');

  const profiles = await prisma.studentProfile.findMany({
    include: { user: true }
  });

  for (let i = 0; i < profiles.length; i++) {
    const p = profiles[i];
    const deptPrefix = p.department.replace(/[^A-Z]/g, '').slice(0, 2) || 'CS';
    const regNo = `REG2022${deptPrefix}${String(i + 1).padStart(3, '0')}`;
    
    // Calculate realistic semester marks based on CGPA
    const baseCgpa = p.cgpa || 7.5;
    const semesterMarks = [
      { sem: 1, sgpa: +(baseCgpa - 0.3 + (i % 3) * 0.1).toFixed(2) },
      { sem: 2, sgpa: +(baseCgpa - 0.2 + (i % 2) * 0.15).toFixed(2) },
      { sem: 3, sgpa: +(baseCgpa + 0.1 - (i % 3) * 0.1).toFixed(2) },
      { sem: 4, sgpa: +(baseCgpa + 0.2).toFixed(2) },
      { sem: 5, sgpa: +(baseCgpa + 0.15).toFixed(2) },
      { sem: 6, sgpa: +(baseCgpa + 0.05).toFixed(2) },
    ];

    // Give 2 students active backlogs to test backlog failure criteria
    const backlogs = (p.rollNo === '2022ME005' || p.rollNo === '2022EE004') ? 1 : 0;
    const tenthPercentage = +(80 + (p.cgpa ? p.cgpa * 1.6 : 10) + (i % 5)).toFixed(1);
    const twelfthPercentage = +(78 + (p.cgpa ? p.cgpa * 1.5 : 10) + (i % 4)).toFixed(1);

    const sampleProjects = [
      {
        id: 'proj-1',
        title: `${p.department} Analytics & Monitoring Suite`,
        description: 'Engineered an end-to-end full stack analytics dashboard with real-time telemetry and microservices architecture.',
        tech: p.skills ? p.skills.split(',').slice(0, 3).join(', ') : 'Node.js, React, PostgreSQL',
        link: 'https://github.com/campusconnect/analytics-project'
      },
      {
        id: 'proj-2',
        title: 'High-Throughput Distributed Cache',
        description: 'Implemented an in-memory caching layer with LRU eviction policy, replication, and sub-millisecond response latency.',
        tech: 'C++, Redis, Docker, gRPC',
        link: 'https://github.com/campusconnect/distributed-cache'
      }
    ];

    const sampleInternships = [
      {
        id: 'intern-1',
        company: i % 2 === 0 ? 'Amazon Development Center' : 'Tata Consultancy Services',
        role: 'Software Development Intern',
        duration: 'June 2025 - August 2025 (3 months)',
        description: 'Built scalable API microservices, improved unit test code coverage to 92%, and optimized SQL queries reducing latency by 35%.'
      }
    ];

    const certifications = i % 2 === 0 
      ? 'AWS Certified Solutions Architect Associate, Oracle Certified Professional: Java SE 11'
      : 'Microsoft Certified: Azure Fundamentals (AZ-900), Google Cloud Associate Cloud Engineer';

    await prisma.studentProfile.update({
      where: { id: p.id },
      data: {
        regNo,
        course: 'B.Tech',
        semester: 7,
        tenthPercentage: Math.min(tenthPercentage, 98.5),
        twelfthPercentage: Math.min(twelfthPercentage, 97.0),
        backlogs,
        semesterMarks: JSON.stringify(semesterMarks),
        projects: JSON.stringify(sampleProjects),
        internships: JSON.stringify(sampleInternships),
        certifications,
        softSkills: 'Technical Writing, Agile Methodology, Critical Thinking, Team Collaboration',
        resumeUploadDate: p.resumeUrl ? new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) : null
      }
    });
  }

  // Enrich Companies with HR details & address
  const companies = await prisma.company.findMany();
  for (let i = 0; i < companies.length; i++) {
    const c = companies[i];
    await prisma.company.update({
      where: { id: c.id },
      data: {
        hrName: ['Vikram Singhania', 'Anjali Nair', 'Suresh Menon', 'Neha Agarwal', 'Pooja Kulkarni', 'Aditya Roy', 'Deepak Mehta', 'Ritu Chopra'][i % 8],
        hrPhone: `+91 98200 ${String(11111 + i * 222).slice(0, 5)}`,
        address: `${c.location} Corporate Park, Tech Zone IV, Sector 62`,
      }
    });
  }

  // Enrich Jobs with drive dates, vacancies, backlog limits
  const jobs = await prisma.job.findMany();
  for (let i = 0; i < jobs.length; i++) {
    const j = jobs[i];
    await prisma.job.update({
      where: { id: j.id },
      data: {
        maxBacklogs: 0,
        minTenthPercentage: 60.0,
        minTwelfthPercentage: 60.0,
        vacancies: 5 + (i % 6) * 3,
        driveDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * (10 + i * 3)),
        interviewRounds: 'Online Assessment, Technical Interview Round 1, Technical Round 2, HR & Culture Fit Round'
      }
    });
  }

  console.log(`Successfully enriched ${profiles.length} student profiles, ${companies.length} companies, and ${jobs.length} campus drives.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
