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
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit." }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and DOC/DOCX files are supported." }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "resumes");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const extension = path.extname(file.name) || ".pdf";
    const sanitizedBaseName = sessionUser.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${sanitizedBaseName}_${Date.now()}${extension}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/resumes/${filename}`;

    const updatedProfile = await prisma.studentProfile.update({
      where: { userId: sessionUser.id },
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
    console.error("Resume upload error:", error);
    return NextResponse.json({ error: "Failed to upload resume." }, { status: 500 });
  }
}

export async function DELETE() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: sessionUser.id }
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
      where: { userId: sessionUser.id },
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
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume." }, { status: 500 });
  }
}
