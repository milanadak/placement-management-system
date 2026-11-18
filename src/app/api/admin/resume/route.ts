import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const studentId = formData.get("studentId") as string | null;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and DOC/DOCX files are supported." }, { status: 400 });
    }

    const student = await prisma.user.findUnique({
      where: { id: studentId },
      include: { studentProfile: true }
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let publicUrl = "";

    // In local environments or persistent servers, write to disk
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const extension = path.extname(file.name) || ".pdf";
      const sanitizedBaseName = student.name.replace(/[^a-zA-Z0-9]/g, "_");
      const filename = `${sanitizedBaseName}_admin_upload_${Date.now()}${extension}`;
      const filePath = path.join(uploadDir, filename);

      fs.writeFileSync(filePath, buffer);
      publicUrl = `/uploads/resumes/${filename}`;
    } catch (fsErr) {
      // In serverless / read-only filesystem environments (e.g. Vercel), store as persistent Data URI
      console.warn("Local storage write failed (serverless environment). Storing as persistent Data URI.", fsErr);
      const base64Data = buffer.toString("base64");
      publicUrl = `data:${file.type};base64,${base64Data}`;
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        resumeUrl: publicUrl,
        resumeName: file.name,
        resumeUploadDate: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      resumeUrl: publicUrl,
      resumeName: file.name,
      resumeUploadDate: new Date(),
      profile: updatedProfile
    });
  } catch (error: any) {
    console.error("Admin resume upload error:", error);
    return NextResponse.json({ error: "Failed to upload resume." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentId }
    });

    if (!profile || !profile.resumeUrl) {
      return NextResponse.json({ error: "No resume found to delete." }, { status: 404 });
    }

    if (profile.resumeUrl.startsWith("/uploads/resumes/")) {
      const filename = path.basename(profile.resumeUrl);
      const filePath = path.join(process.cwd(), "public", "uploads", "resumes", filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch {
          // ignore unlink error
        }
      }
    }

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: studentId },
      data: {
        resumeUrl: null,
        resumeName: null,
        resumeUploadDate: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Resume removed successfully",
      profile: updatedProfile
    });
  } catch (error: any) {
    console.error("Admin delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume." }, { status: 500 });
  }
}
