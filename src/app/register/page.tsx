"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, User, Mail, Lock, Phone, BookOpen, Calendar, Award, Code2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNo: "",
    department: "Computer Science",
    graduationYear: "2026",
    cgpa: "8.5",
    phone: "",
    skills: "JavaScript, TypeScript, React, Node.js, SQL"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const parsedCgpa = parseFloat(formData.cgpa);
    if (isNaN(parsedCgpa) || parsedCgpa < 0 || parsedCgpa > 10) {
      setError("Please provide a valid CGPA between 0.0 and 10.0.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      toast.success("Account successfully registered! Logging you in...");
      router.push("/student/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to register.");
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-blue-600 text-white items-center justify-center shadow-lg shadow-blue-500/20 mb-3">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Student Placement Registration
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create your placement profile to unlock verified job drives and automated eligibility
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Academic & Contact Information</CardTitle>
            <CardDescription className="text-xs">
              All details will be matched against company criteria for automated shortlisting
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">College Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="student@campusconnect.edu"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="rollNo">University Roll Number *</Label>
                  <Input
                    id="rollNo"
                    name="rollNo"
                    required
                    placeholder="e.g. 2022CS014"
                    value={formData.rollNo}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="department">Engineering Department *</Label>
                  <select
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="graduationYear">Graduation Batch *</Label>
                  <select
                    id="graduationYear"
                    name="graduationYear"
                    value={formData.graduationYear}
                    onChange={handleChange}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cgpa">Current Cumulative CGPA (0.0 - 10.0) *</Label>
                  <div className="relative">
                    <Award className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="cgpa"
                      name="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      required
                      placeholder="e.g. 8.75"
                      value={formData.cgpa}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone / WhatsApp Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      required
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="skills">Technical Skills (Comma separated) *</Label>
                <div className="relative">
                  <Code2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="skills"
                    name="skills"
                    required
                    placeholder="Java, Python, C++, React, SQL, Cloud"
                    value={formData.skills}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 h-11"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Student Profile...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Complete Registration & Go To Portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="pt-0 flex justify-center text-xs text-slate-500 border-t border-slate-100 p-4">
            <p>
              Already registered?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:underline">
                Sign in to your account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
