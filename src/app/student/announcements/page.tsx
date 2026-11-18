import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Bell, Calendar, ShieldAlert, Award, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function StudentAnnouncementsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  let student = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: { studentProfile: true }
  });

  if (!student && sessionUser.email) {
    student = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      include: { studentProfile: true }
    });
  }

  const department = student?.studentProfile?.department || "Computer Science";

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { targetDept: "ALL" },
        { targetDept: { contains: department } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Placement Cell Announcements
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Official recruitment circulars, company test schedules, and placement guidelines.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <Card
            key={item.id}
            className={`border transition ${
              item.priority === "HIGH"
                ? "border-amber-300 bg-amber-50/20"
                : "border-slate-200 bg-white"
            }`}
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      item.priority === "HIGH"
                        ? "destructive"
                        : item.priority === "MEDIUM"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px] font-bold uppercase"
                  >
                    {item.priority} Priority
                  </Badge>
                  <span className="text-xs font-semibold text-slate-500">
                    Target: {item.targetDept}
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{item.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {item.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
