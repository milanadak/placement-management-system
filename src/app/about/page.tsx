import { GraduationCap, Award, Building, Users, CheckCircle, ShieldCheck, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const steps = [
    { step: "01", title: "Registration & Profile Setup", desc: "Students upload their verified academic credentials, CGPA, department details, and updated resume." },
    { step: "02", title: "Drive Announcements & Pre-Placement Talk", desc: "Corporate recruiters publish role profiles, compensation structures, and eligibility criteria." },
    { step: "03", title: "Automated Screening & Shortlisting", desc: "CampusConnect filters candidates instantly against academic criteria with zero human bias." },
    { step: "04", title: "Online Assessment & Technical Interviews", desc: "Shortlisted candidates progress through coding evaluations, technical discussions, and HR rounds." },
    { step: "05", title: "Offer Letters & Final Placement", desc: "Selected students receive formal offer letters and join the university's placement honor roll." }
  ];

  return (
    <div className="py-12 md:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-3 px-3 py-1 text-blue-700 bg-blue-50 border-blue-200">
            About Our Placement Cell
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Nurturing Engineering Talent, Catalyzing Global Careers
          </h1>
          <p className="mt-4 text-base text-slate-600 leading-relaxed">
            The Training & Placement Cell at CampusConnect acts as the vital conduit between graduating engineers and the global technology ecosystem.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center p-6 border-slate-200">
            <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-slate-900">94.8%</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Placement Percentage</div>
          </Card>
          <Card className="text-center p-6 border-slate-200">
            <Building className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-slate-900">150+</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Active Recruiters</div>
          </Card>
          <Card className="text-center p-6 border-slate-200">
            <Users className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-slate-900">1,250+</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Offers Extended</div>
          </Card>
          <Card className="text-center p-6 border-slate-200">
            <ShieldCheck className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-slate-900">₹45.0 L</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Highest CTC Offered</div>
          </Card>
        </div>

        {/* Recruitment Workflow */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 mb-16 shadow-sm">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Campus Placement Process</h2>
            <p className="text-sm text-slate-600 mt-1">
              Standardized, transparent 5-stage recruitment workflow practiced by our Training & Placement Cell.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="relative flex flex-col justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-2xl font-black text-blue-600 font-mono">{s.step}</span>
                  <h3 className="font-bold text-slate-900 text-sm mt-2 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Placement Administration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <p>For recruitment invitations, MoUs, and campus recruitment scheduling, get in touch with our office:</p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-900">placements@campusconnect.edu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-slate-900">+91 98765 43210 / +91 (0) 1234-56789</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Placement Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-600">
              <p className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Dream Company Policy:</strong> Students holding an offer below 10 LPA are eligible to compete for Tier-1 Super Dream roles (&gt; 20 LPA).</span>
              </p>
              <p className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span><strong>Zero Malpractice:</strong> Falsification of CGPA or resume records leads to immediate disqualification from all campus drives.</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
