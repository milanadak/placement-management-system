"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Clock, ExternalLink, Calendar, FileCheck, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/student/notifications");
      const data = await res.json();
      if (data?.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, link?: string | null) => {
    try {
      await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // continue
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      const res = await fetch("/api/student/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to mark all as read");

      toast.success("All notifications marked as read.");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Failed to mark notifications.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Recruitment Notification Center
            </h1>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs font-bold px-2">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status updates on shortlisting, interviews, and drive deadlines.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            disabled={markingAll}
            onClick={handleMarkAllRead}
            className="text-xs gap-1.5 h-8 border-slate-200 text-slate-700"
          >
            <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-blue-600" />
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Bell className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No notifications yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Status changes, new drives, and interview call letters will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => handleMarkAsRead(n.id)}
              className={`transition cursor-pointer border ${
                !n.isRead
                  ? "border-blue-200 bg-blue-50/30 hover:border-blue-400 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    !n.isRead ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm ${!n.isRead ? "font-bold text-slate-900" : "font-semibold text-slate-800"}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {n.link && (
                  <Link href={n.link} onClick={() => handleMarkAsRead(n.id)}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-blue-600 hover:text-blue-700 gap-1 shrink-0">
                      <span>View</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
