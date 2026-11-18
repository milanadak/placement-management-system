const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing data...");
  await prisma.notification.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log("🔑 Hashing passwords...");
  const adminPasswordHash = await bcrypt.hash("Admin@12345", 10);
  const studentPasswordHash = await bcrypt.hash("Student@12345", 10);

  console.log("👤 Creating Admin user...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Dr. Rajeshwar Rao",
      email: "admin@campusconnect.edu",
      password: adminPasswordHash,
      role: "ADMIN"
    }
  });

  console.log("🏢 Creating 8 Companies...");
  const companiesData = [
    {
      name: "Google",
      slug: "google",
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop",
      website: "https://careers.google.com",
      description: "Multinational technology company focusing on search, cloud computing, software, and artificial intelligence.",
      location: "Bengaluru / Hyderabad",
      industry: "Software & Cloud",
      contactEmail: "university-india@google.com"
    },
    {
      name: "Microsoft",
      slug: "microsoft",
      logo: "https://images.unsplash.com/photo-1642132652803-02f5e3e23055?w=100&h=100&fit=crop",
      website: "https://careers.microsoft.com",
      description: "Global cloud platform, productivity solutions, and enterprise software provider.",
      location: "Hyderabad / Noida",
      industry: "Enterprise Software",
      contactEmail: "campus-recruitment@microsoft.com"
    },
    {
      name: "Amazon",
      slug: "amazon",
      logo: "https://images.unsplash.com/photo-1523474253246-77884d9f67a2?w=100&h=100&fit=crop",
      website: "https://amazon.jobs",
      description: "Global leader in e-commerce, cloud infrastructure (AWS), streaming services, and AI.",
      location: "Bengaluru / Chennai",
      industry: "E-Commerce & Cloud",
      contactEmail: "india-campus@amazon.com"
    },
    {
      name: "Deloitte",
      slug: "deloitte",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      website: "https://deloitte.com/careers",
      description: "Global consulting provider offering technology advisory, cyber security, and financial strategy.",
      location: "Mumbai / Gurugram",
      industry: "Management & Tech Consulting",
      contactEmail: "campusdeloitte@deloitte.com"
    },
    {
      name: "Texas Instruments",
      slug: "texas-instruments",
      logo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop",
      website: "https://ti.com/careers",
      description: "Semiconductor design leader developing analog ICs, microprocessors, and embedded systems.",
      location: "Bengaluru",
      industry: "Semiconductors & Hardware",
      contactEmail: "univ-relations@ti.com"
    },
    {
      name: "Tata Consultancy Services",
      slug: "tcs",
      logo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
      website: "https://tcs.com/careers",
      description: "Pioneering IT services, digital business solutions, and engineering consulting partner.",
      location: "Kolkata / Pune / Mumbai",
      industry: "IT Services",
      contactEmail: "campus.talent@tcs.com"
    },
    {
      name: "Infosys",
      slug: "infosys",
      logo: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
      website: "https://infosys.com/careers",
      description: "Global consulting and IT transformation leader powering enterprise digital modernization.",
      location: "Bengaluru / Pune",
      industry: "Digital Services",
      contactEmail: "talent.bridge@infosys.com"
    },
    {
      name: "L&T Technology Services",
      slug: "ltts",
      logo: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=100&h=100&fit=crop",
      website: "https://ltts.com/careers",
      description: "Engineering research and development services, industrial IoT, and embedded robotics.",
      location: "Vadodara / Chennai",
      industry: "Engineering & R&D",
      contactEmail: "careers@ltts.com"
    }
  ];

  const createdCompanies = {};
  for (const c of companiesData) {
    const comp = await prisma.company.create({ data: c });
    createdCompanies[c.slug] = comp;
  }

  console.log("💼 Creating 12 Job Postings...");
  const jobsData = [
    {
      companySlug: "google",
      title: "Graduate Software Development Engineer (SDE-1)",
      description: "Build robust distributed storage systems, high-throughput RPC microservices, and AI-driven web architectures. Requires exceptional grasp of data structures, algorithms, and modular design.",
      minCgpa: 8.0,
      eligibleDepartments: "Computer Science, Information Technology, Data Science",
      graduationYear: 2026,
      skills: "C++, Java, Distributed Systems, Algorithms, SQL",
      jobType: "Full-Time",
      location: "Bengaluru / Hyderabad",
      salary: "₹42.0 LPA",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "google",
      title: "AI & Machine Learning Research Intern",
      description: "Collaborate with research teams to develop novel deep learning models for NLP, computer vision, and multimodal inference pipelines.",
      minCgpa: 8.5,
      eligibleDepartments: "Computer Science, Data Science",
      graduationYear: 2026,
      skills: "PyTorch, TensorFlow, Python, Linear Algebra, Deep Learning",
      jobType: "Internship",
      location: "Bengaluru",
      salary: "₹1,20,000 / mo",
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "microsoft",
      title: "Cloud Solutions & DevOps Engineer",
      description: "Design automated CI/CD infrastructure on Microsoft Azure, containerize enterprise workloads using Kubernetes, and optimize zero-trust security postures.",
      minCgpa: 7.5,
      eligibleDepartments: "Computer Science, Information Technology, Electronics",
      graduationYear: 2026,
      skills: "Azure, Docker, Kubernetes, Python, Linux, Bash",
      jobType: "Full-Time",
      location: "Hyderabad",
      salary: "₹45.0 LPA",
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "microsoft",
      title: "Full Stack Engineer (Web Experiences)",
      description: "Craft performant, accessible web apps powering millions of global daily users on Microsoft 365. Expertise in TypeScript, React, and GraphQL required.",
      minCgpa: 7.0,
      eligibleDepartments: "Computer Science, Information Technology, Data Science, Electronics",
      graduationYear: 2026,
      skills: "TypeScript, React, Next.js, Node.js, REST APIs",
      jobType: "Full-Time",
      location: "Noida / Hyderabad",
      salary: "₹36.0 LPA",
      deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "amazon",
      title: "Software Development Engineer - I (AWS)",
      description: "Scale high-performance distributed backend architectures supporting global cloud customers with sub-millisecond latency SLAs.",
      minCgpa: 7.0,
      eligibleDepartments: "Computer Science, Information Technology, Electronics, Electrical Engineering",
      graduationYear: 2026,
      skills: "Java, AWS Services, DynamoDB, Microservices, System Design",
      jobType: "Full-Time",
      location: "Bengaluru / Chennai",
      salary: "₹38.0 LPA",
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "texas-instruments",
      title: "Embedded Systems & Firmware Engineer",
      description: "Develop firmware, peripheral device drivers, DSP algorithms, and hardware test harnesses for cutting-edge ARM Cortex MCUs.",
      minCgpa: 7.5,
      eligibleDepartments: "Electronics, Electrical Engineering",
      graduationYear: 2026,
      skills: "Embedded C, ARM Architecture, RTOS, Verilog, Circuit Analysis",
      jobType: "Full-Time",
      location: "Bengaluru",
      salary: "₹24.0 LPA",
      deadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "deloitte",
      title: "Technology Advisory Consultant",
      description: "Deliver digital architecture evaluations, ERP integrations, cloud migration strategies, and technology risk assessments for Fortune 500 corporations.",
      minCgpa: 6.5,
      eligibleDepartments: "Computer Science, Information Technology, Electronics, Mechanical Engineering",
      graduationYear: 2026,
      skills: "SQL, Cloud Strategy, Business Process Analysis, Python",
      jobType: "Full-Time",
      location: "Mumbai / Gurugram",
      salary: "₹10.5 LPA",
      deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "deloitte",
      title: "Cyber Security Analyst",
      description: "Perform penetration testing, identity governance assessments, SIEM log monitoring, and regulatory compliance audits.",
      minCgpa: 6.8,
      eligibleDepartments: "Computer Science, Information Technology, Electronics",
      graduationYear: 2026,
      skills: "Network Security, SIEM, Linux, Cryptography, OWASP",
      jobType: "Full-Time",
      location: "Gurugram",
      salary: "₹11.0 LPA",
      deadline: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "ltts",
      title: "Robotics & Automation Trainee Engineer",
      description: "Program PLC industrial automation logic, simulate robotic arms, and connect industrial telemetry through IoT gateways.",
      minCgpa: 6.5,
      eligibleDepartments: "Mechanical Engineering, Electrical Engineering, Electronics",
      graduationYear: 2026,
      skills: "PLC Programming, SolidWorks, MATLAB, IoT, Sensors",
      jobType: "Full-Time",
      location: "Vadodara / Chennai",
      salary: "₹8.5 LPA",
      deadline: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "tcs",
      title: "Digital Software Specialist (Prime & Digital)",
      description: "Modernize legacy mainframe and monolithic workflows with modern reactive microservices, cloud data lakes, and container platforms.",
      minCgpa: 6.0,
      eligibleDepartments: "Computer Science, Information Technology, Data Science, Electronics, Electrical Engineering, Mechanical Engineering",
      graduationYear: 2026,
      skills: "Java, Spring Boot, React, SQL, Agile",
      jobType: "Full-Time",
      location: "Kolkata / Pune",
      salary: "₹9.0 LPA",
      deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "tcs",
      title: "Ninja Trainee Engineer",
      description: "Comprehensive software engineering onboarding covering full stack development, cloud foundations, testing, and operations.",
      minCgpa: 6.0,
      eligibleDepartments: "Computer Science, Information Technology, Data Science, Electronics, Electrical Engineering, Mechanical Engineering",
      graduationYear: 2026,
      skills: "Python, C++, Java, DBMS, HTML/CSS",
      jobType: "Full-Time",
      location: "Pan India",
      salary: "₹4.5 LPA",
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
    },
    {
      companySlug: "infosys",
      title: "Specialist Programmer (Power Programmer)",
      description: "Work as an elite core developer solving complex algorithmic challenges, big data ingestion pipelines, and distributed ledger integrations.",
      minCgpa: 7.0,
      eligibleDepartments: "Computer Science, Information Technology, Data Science, Electronics",
      graduationYear: 2026,
      skills: "Data Structures, Python, Go, Docker, Apache Kafka",
      jobType: "Full-Time",
      location: "Bengaluru / Pune",
      salary: "₹9.5 LPA",
      deadline: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000)
    }
  ];

  const createdJobs = [];
  for (const j of jobsData) {
    const company = createdCompanies[j.companySlug];
    const { companySlug, ...rest } = j;
    const job = await prisma.job.create({
      data: {
        ...rest,
        companyId: company.id
      }
    });
    createdJobs.push(job);
  }

  console.log("🎓 Creating 30 Students across 6 Departments...");
  const departments = [
    "Computer Science",
    "Information Technology",
    "Data Science",
    "Electronics",
    "Electrical Engineering",
    "Mechanical Engineering"
  ];

  const studentProfilesSeed = [
    { name: "Aravind Sharma", email: "aravind.sharma@campusconnect.edu", dept: "Computer Science", cgpa: 9.25, roll: "2022CS001", skills: "C++, Python, React, System Design, SQL", phone: "+91 98765 00001" },
    { name: "Priya Patel", email: "priya.patel@campusconnect.edu", dept: "Computer Science", cgpa: 8.85, roll: "2022CS002", skills: "Java, Spring Boot, Microservices, Docker, Kubernetes", phone: "+91 98765 00002" },
    { name: "Rohan Mukherjee", email: "rohan.mukherjee@campusconnect.edu", dept: "Computer Science", cgpa: 7.80, roll: "2022CS003", skills: "TypeScript, Next.js, Node.js, PostgreSQL", phone: "+91 98765 00003" },
    { name: "Sneha Nair", email: "sneha.nair@campusconnect.edu", dept: "Computer Science", cgpa: 9.40, roll: "2022CS004", skills: "Python, PyTorch, Algorithms, Machine Learning", phone: "+91 98765 00004" },
    { name: "Aditya Verma", email: "aditya.verma@campusconnect.edu", dept: "Computer Science", cgpa: 6.85, roll: "2022CS005", skills: "Java, MySQL, HTML, CSS, JavaScript", phone: "+91 98765 00005" },

    { name: "Ananya Deshmukh", email: "ananya.deshmukh@campusconnect.edu", dept: "Information Technology", cgpa: 8.60, roll: "2022IT001", skills: "AWS, Python, React, Docker, Linux", phone: "+91 98765 00006" },
    { name: "Vikram Sengupta", email: "vikram.sengupta@campusconnect.edu", dept: "Information Technology", cgpa: 7.90, roll: "2022IT002", skills: "C#, .NET Core, Azure, SQL Server", phone: "+91 98765 00007" },
    { name: "Kavya Reddy", email: "kavya.reddy@campusconnect.edu", dept: "Information Technology", cgpa: 8.20, roll: "2022IT003", skills: "Flutter, Dart, Firebase, REST APIs", phone: "+91 98765 00008" },
    { name: "Manish Kumar", email: "manish.kumar@campusconnect.edu", dept: "Information Technology", cgpa: 6.95, roll: "2022IT004", skills: "JavaScript, PHP, MySQL, Apache", phone: "+91 98765 00009" },
    { name: "Divya Iyer", email: "divya.iyer@campusconnect.edu", dept: "Information Technology", cgpa: 9.10, roll: "2022IT005", skills: "Go, Kubernetes, Cloud Architecture, Python", phone: "+91 98765 00010" },

    { name: "Karan Johar", email: "karan.johar@campusconnect.edu", dept: "Data Science", cgpa: 8.90, roll: "2022DS001", skills: "Python, R, Pandas, PyTorch, PowerBI", phone: "+91 98765 00011" },
    { name: "Meera Krishnan", email: "meera.krishnan@campusconnect.edu", dept: "Data Science", cgpa: 9.30, roll: "2022DS002", skills: "Deep Learning, NLP, Transformers, SQL, Tableau", phone: "+91 98765 00012" },
    { name: "Abhishek Jain", email: "abhishek.jain@campusconnect.edu", dept: "Data Science", cgpa: 7.40, roll: "2022DS003", skills: "Python, Scikit-Learn, Statistics, Excel", phone: "+91 98765 00013" },
    { name: "Tanvi Agarwal", email: "tanvi.agarwal@campusconnect.edu", dept: "Data Science", cgpa: 8.15, roll: "2022DS004", skills: "Spark, Hadoop, Data Lakes, Kafka, Python", phone: "+91 98765 00014" },
    { name: "Nikhil Joshi", email: "nikhil.joshi@campusconnect.edu", dept: "Data Science", cgpa: 6.70, roll: "2022DS005", skills: "SQL, Python, Data Visualization, EDA", phone: "+91 98765 00015" },

    { name: "Siddharth Rao", email: "siddharth.rao@campusconnect.edu", dept: "Electronics", cgpa: 8.75, roll: "2022EC001", skills: "Embedded C, Verilog, FPGA, Microcontrollers, RTOS", phone: "+91 98765 00016" },
    { name: "Pooja Hegde", email: "pooja.hegde@campusconnect.edu", dept: "Electronics", cgpa: 8.25, roll: "2022EC002", skills: "VLSI, Cadence, Digital Electronics, C++", phone: "+91 98765 00017" },
    { name: "Rahul Nambiar", email: "rahul.nambiar@campusconnect.edu", dept: "Electronics", cgpa: 7.60, roll: "2022EC003", skills: "IoT, Arduino, Raspberry Pi, Python, MQTT", phone: "+91 98765 00018" },
    { name: "Swati Bose", email: "swati.bose@campusconnect.edu", dept: "Electronics", cgpa: 6.80, roll: "2022EC004", skills: "Signal Processing, MATLAB, PCB Design", phone: "+91 98765 00019" },
    { name: "Gaurav Malhotra", email: "gaurav.malhotra@campusconnect.edu", dept: "Electronics", cgpa: 7.95, roll: "2022EC005", skills: "Embedded Linux, ARM Architecture, C, Python", phone: "+91 98765 00020" },

    { name: "Harish Pillai", email: "harish.pillai@campusconnect.edu", dept: "Electrical Engineering", cgpa: 8.40, roll: "2022EE001", skills: "Power Systems, MATLAB, Simulink, SCADA, Python", phone: "+91 98765 00021" },
    { name: "Deepa Menon", email: "deepa.menon@campusconnect.edu", dept: "Electrical Engineering", cgpa: 7.90, roll: "2022EE002", skills: "Renewable Energy, Microgrids, PLC, C++", phone: "+91 98765 00022" },
    { name: "Varun Mehta", email: "varun.mehta@campusconnect.edu", dept: "Electrical Engineering", cgpa: 6.80, roll: "2022EE003", skills: "Electrical Machines, Power Electronics, AutoCAD", phone: "+91 98765 00023" },
    { name: "Shruti Saxena", email: "shruti.saxena@campusconnect.edu", dept: "Electrical Engineering", cgpa: 8.65, roll: "2022EE004", skills: "Electric Vehicles, Battery Management, Python", phone: "+91 98765 00024" },
    { name: "Arjun Kapoor", email: "arjun.kapoor@campusconnect.edu", dept: "Electrical Engineering", cgpa: 7.20, roll: "2022EE005", skills: "Control Systems, Embedded Sensors, C", phone: "+91 98765 00025" },

    { name: "Rishabh Tripathi", email: "rishabh.tripathi@campusconnect.edu", dept: "Mechanical Engineering", cgpa: 8.30, roll: "2022ME001", skills: "SolidWorks, ANSYS, GD&T, Finite Element Analysis", phone: "+91 98765 00026" },
    { name: "Neha Chawla", email: "neha.chawla@campusconnect.edu", dept: "Mechanical Engineering", cgpa: 7.90, roll: "2022ME002", skills: "Robotics, Mechatronics, AutoCAD, Python", phone: "+91 98765 00027" },
    { name: "Kunal Ghosh", email: "kunal.ghosh@campusconnect.edu", dept: "Mechanical Engineering", cgpa: 6.90, roll: "2022ME003", skills: "Thermal Engineering, CFD, Manufacturing Processes", phone: "+91 98765 00028" },
    { name: "Bhavna Yadav", email: "bhavna.yadav@campusconnect.edu", dept: "Mechanical Engineering", cgpa: 8.50, roll: "2022ME004", skills: "Automotive Engineering, MATLAB, 3D Printing", phone: "+91 98765 00029" },
    { name: "Tushar Singhania", email: "tushar.singhania@campusconnect.edu", dept: "Mechanical Engineering", cgpa: 6.40, roll: "2022ME005", skills: "Quality Control, Lean Manufacturing, Six Sigma", phone: "+91 98765 00030" }
  ];

  const createdStudents = [];
  for (const s of studentProfilesSeed) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        password: studentPasswordHash,
        role: "STUDENT",
        studentProfile: {
          create: {
            rollNo: s.roll,
            department: s.dept,
            graduationYear: 2026,
            cgpa: s.cgpa,
            skills: s.skills,
            phone: s.phone,
            resumeName: `${s.name.replace(/\s+/g, '_')}_Resume.pdf`,
            resumeUrl: `/uploads/resumes/${s.roll.toLowerCase()}.pdf`,
            bio: `Pre-final year B.Tech student in ${s.dept} enthusiastic about building scalable technology solutions.`,
            isProfileComplete: true
          }
        },
        notifications: {
          create: [
            {
              title: "Recruitment Season Live",
              message: "Google, Microsoft, and Amazon have announced campus recruitment drives for your batch.",
              link: "/student/jobs"
            }
          ]
        }
      },
      include: {
        studentProfile: true
      }
    });
    createdStudents.push(user);
  }

  console.log("📝 Generating 40 Realistic Applications across States...");
  const applicationStatuses = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Selected",
    "Rejected"
  ];

  // Specific high-profile applications
  const targetedApplications = [
    { studentIndex: 0, jobIndex: 0, status: "Selected", note: "Honored to interview with Google SDE team." },
    { studentIndex: 0, jobIndex: 2, status: "Selected", note: "Applied for Microsoft Cloud role." },
    { studentIndex: 1, jobIndex: 0, status: "Interview Scheduled", note: "Strong interest in Google infrastructure." },
    { studentIndex: 1, jobIndex: 4, status: "Selected", note: "Applied for Amazon SDE." },
    { studentIndex: 2, jobIndex: 3, status: "Shortlisted", note: "Full stack engineering portfolio attached." },
    { studentIndex: 3, jobIndex: 1, status: "Selected", note: "Google AI research candidate." },
    { studentIndex: 5, jobIndex: 2, status: "Interview Scheduled", note: "Cloud practitioner certified." },
    { studentIndex: 7, jobIndex: 9, status: "Selected", note: "TCS Prime candidate." },
    { studentIndex: 10, jobIndex: 1, status: "Interview Scheduled", note: "Data science NLP thesis attached." },
    { studentIndex: 15, jobIndex: 5, status: "Selected", note: "Texas Instruments Embedded engineer candidate." },
    { studentIndex: 16, jobIndex: 5, status: "Interview Scheduled", note: "VLSI fabrication project completed." },
    { studentIndex: 20, jobIndex: 8, status: "Selected", note: "L&T Automation team enthusiast." },
    { studentIndex: 25, jobIndex: 8, status: "Selected", note: "Robotics arm simulation experience." },
    { studentIndex: 26, jobIndex: 6, status: "Under Review", note: "Deloitte consulting case study submitted." },
  ];

  const createdApplications = [];

  // Track applied pairs to enforce uniqueness
  const appliedPairs = new Set();

  for (const t of targetedApplications) {
    const student = createdStudents[t.studentIndex];
    const job = createdJobs[t.jobIndex];
    const pairKey = `${student.id}_${job.id}`;

    if (!appliedPairs.has(pairKey)) {
      appliedPairs.add(pairKey);
      const app = await prisma.application.create({
        data: {
          studentId: student.id,
          jobId: job.id,
          status: t.status,
          coverNote: t.note
        }
      });
      createdApplications.push(app);
    }
  }

  // Populate remaining applications up to 40
  let studentCursor = 0;
  let jobCursor = 0;
  while (createdApplications.length < 40) {
    const student = createdStudents[studentCursor % createdStudents.length];
    const job = createdJobs[jobCursor % createdJobs.length];
    const pairKey = `${student.id}_${job.id}`;

    if (!appliedPairs.has(pairKey)) {
      appliedPairs.add(pairKey);
      const randomStatus = applicationStatuses[createdApplications.length % applicationStatuses.length];
      const app = await prisma.application.create({
        data: {
          studentId: student.id,
          jobId: job.id,
          status: randomStatus,
          coverNote: `Application submitted for ${job.title} role at campus drive.`
        }
      });
      createdApplications.push(app);
    }

    studentCursor++;
    if (studentCursor % 3 === 0) jobCursor++;
  }

  console.log("🎤 Scheduling Interviews for Interview Scheduled & Selected candidates...");
  const interviewApplications = createdApplications.filter(
    a => a.status === "Interview Scheduled" || a.status === "Selected"
  );

  for (let i = 0; i < interviewApplications.length; i++) {
    const app = interviewApplications[i];
    const isSelected = app.status === "Selected";

    await prisma.interview.create({
      data: {
        applicationId: app.id,
        roundName: i % 2 === 0 ? "Technical Round 1 (Data Structures & Coding)" : "System Architecture & Problem Solving",
        interviewDate: new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000 + (10 * 3600 * 1000)),
        mode: i % 3 === 0 ? "OFFLINE" : "ONLINE",
        locationOrLink: i % 3 === 0 ? "Placement Cell Interview Suite 3B" : "https://meet.google.com/xyz-placement-mock",
        notes: isSelected ? "Candidate cleared with outstanding technical review score." : "Please be ready 10 minutes prior with ID card.",
        status: isSelected ? "Completed" : "Scheduled"
      }
    });

    if (isSelected) {
      await prisma.interview.create({
        data: {
          applicationId: app.id,
          roundName: "HR & Leadership Behavioral Fit Round",
          interviewDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          mode: "ONLINE",
          locationOrLink: "https://meet.google.com/hr-discussion-round",
          notes: "Official selection confirmed. Offer package communicated.",
          status: "Completed"
        }
      });
    }
  }

  console.log("📢 Publishing Announcements...");
  const announcements = [
    {
      title: "Google Campus Recruitment Drive 2026 - Registration Deadline",
      content: "All eligible CSE, IT, and Data Science students with CGPA >= 8.0 must submit their applications by Dec 15, 2026. Mock tests will be conducted this Saturday.",
      priority: "HIGH",
      targetDept: "ALL"
    },
    {
      title: "Resume Verification and ATS Formatting Workshop",
      content: "Mandatory resume formatting workshop for all final year B.Tech students on Thursday at 3:00 PM in the Main Auditorium. Bring printed copies of your resume.",
      priority: "MEDIUM",
      targetDept: "ALL"
    },
    {
      title: "Microsoft Cloud Solutions - Online Coding Assessment Link",
      content: "Candidates shortlisted for Microsoft DevOps and Cloud roles have been sent online HackerRank test links to their registered college email address.",
      priority: "HIGH",
      targetDept: "Computer Science"
    },
    {
      title: "Texas Instruments Embedded Systems Drive Notification",
      content: "Shortlisted candidates from ECE and EE branches are requested to review ARM Cortex microcontroller concepts and basic RTOS for upcoming technical rounds.",
      priority: "MEDIUM",
      targetDept: "Electronics"
    },
    {
      title: "Deloitte Consulting Pre-Placement Talk",
      content: "Deloitte Leadership will conduct their virtual PPT on Tuesday, Dec 02 at 5:00 PM. Link will be active on your student dashboard.",
      priority: "LOW",
      targetDept: "ALL"
    }
  ];

  for (const an of announcements) {
    await prisma.announcement.create({
      data: {
        ...an,
        authorId: adminUser.id
      }
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log("📊 Summary of generated data:");
  console.log(`- 1 Administrator (${adminUser.email})`);
  console.log(`- ${createdStudents.length} Students across 6 departments`);
  console.log(`- ${Object.keys(createdCompanies).length} Companies`);
  console.log(`- ${createdJobs.length} Jobs`);
  console.log(`- ${createdApplications.length} Applications`);
  console.log(`- ${announcements.length} Announcements`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
