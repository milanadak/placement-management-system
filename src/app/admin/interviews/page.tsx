"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, Video, MapPin, Search, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AdminInterviewsPage() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const res = await fetch("/api/admin/interviews");
      const data = await res.json();
      if (data?.interviews) setInterviews(data.interviews);
    } catch {
      toast.error("Failed to load interview rounds.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = interviews.filter((i) => {
    const sName = i.application?.student?.name?.toLowerCase() || "";
    const cName = i.application?.job?.company?.name?.toLowerCase() || "";
    const rName = i.roundName?.toLowerCase() || "";
    return sName.includes(search.toLowerCase()) || cName.includes(search.toLowerCase()) || rName.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Recruitment Interview Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee all scheduled coding tests, technical interviews, and HR rounds.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search candidate, recruiter, or round title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <div className="text-xs text-slate-500">
          Total {filtered.length} Interview Rounds
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading interview schedule...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inv) => (
            <Card key={inv.id} className="border-slate-200 hover:shadow-md transition">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="font-semibold text-slate-700 mb-1">
                      {inv.application?.job?.company?.name}
                    </Badge>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {inv.application?.student?.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {inv.application?.student?.studentProfile?.rollNo} ({inv.application?.student?.studentProfile?.department?.split(" ")[0]})
                    </p>
                  </div>
                  <Badge variant={inv.status === "Completed" ? "success" : "purple"} className="text-[10px]">
                    {inv.status}
                  </Badge>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800">{inv.roundName}</div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{new Date(inv.interviewDate).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    {inv.mode === "ONLINE" ? <Video className="h-3.5 w-3.5 text-blue-500" /> : <MapPin className="h-3.5 w-3.5 text-amber-500" />}
                    <span className="truncate">{inv.locationOrLink}</span>
                  </div>
                </div>

                {inv.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                    &ldquo;{inv.notes}&rdquo;
                  </p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400">Mode: {inv.mode}</span>
                  {inv.locationOrLink.startsWith("http") && (
                    <a href={inv.locationOrLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                      <span>Open Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
