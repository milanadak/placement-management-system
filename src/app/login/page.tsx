"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "ADMIN">("STUDENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickLogin = async (demoEmail: string, demoPass: string, demoRole: "STUDENT" | "ADMIN") => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setRole(demoRole);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: demoPass, role: demoRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoStudent = () => {
    quickLogin("aravind.sharma@campusconnect.edu", "Student@12345", "STUDENT");
  };

  const fillDemoAdmin = () => {
    quickLogin("admin@campusconnect.edu", "Admin@12345", "ADMIN");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to sign in.");
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to CampusConnect
          </h2>
          <p className="mt-1.5 text-xs text-slate-500">
            Select your role to access your personalized placement portal
          </p>
        </div>

        {/* Demo Fast Login Helpers */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              1-Click Instant Login
            </span>
            <span className="text-[11px] text-blue-700 font-medium">Click to log in immediately</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={fillDemoStudent}
              className="text-left p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:shadow-xs transition text-xs cursor-pointer"
            >
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Demo Student</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded font-normal">Student</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">aravind.sharma@...</div>
              <div className="text-[9px] text-blue-600 font-medium mt-1">⚡ Click to Login</div>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={fillDemoAdmin}
              className="text-left p-2.5 rounded-lg bg-white border border-blue-200 hover:border-blue-400 hover:shadow-xs transition text-xs cursor-pointer"
            >
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>Demo Administrator</span>
                <span className="text-[10px] bg-slate-900 text-white px-1 rounded font-normal">Admin</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">admin@campusconnect...</div>
              <div className="text-[9px] text-emerald-600 font-medium mt-1">⚡ Click to Login</div>
            </button>
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            {/* Role selector tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`py-1.5 text-xs font-semibold rounded-md transition ${
                  role === "STUDENT"
                    ? "bg-white text-blue-600 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Student Portal
              </button>
              <button
                type="button"
                onClick={() => setRole("ADMIN")}
                className={`py-1.5 text-xs font-semibold rounded-md transition ${
                  role === "ADMIN"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Administrator
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">College Email or Username</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="text"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    placeholder={role === "ADMIN" ? "admin@campusconnect.edu or admin" : "student@campusconnect.edu"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <span className="text-[11px] text-slate-500 font-mono">Admin@12345</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5">
                  Admin login: <span className="text-slate-600 font-mono">admin@campusconnect.edu</span> / <span className="text-slate-600 font-mono">Admin@12345</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className={`w-full ${role === "ADMIN" ? "bg-slate-900 hover:bg-slate-800" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Sign In to {role === "ADMIN" ? "Admin Console" : "Student Hub"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="pt-0 flex flex-col items-center justify-center text-xs text-slate-500 border-t border-slate-100 p-4">
            <p>
              New student eligible for placements?{" "}
              <Link href="/register" className="font-semibold text-blue-600 hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
