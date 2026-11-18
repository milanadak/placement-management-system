import Link from "next/link";
import { Building2, Globe, MapPin, Briefcase, ExternalLink, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function CompaniesPage() {
  const companies = [
    {
      name: "Google",
      industry: "Information Technology & Cloud",
      location: "Mountain View / Bengaluru",
      website: "https://careers.google.com",
      description: "Leading multinational technology company specializing in internet-related services, cloud computing, and AI.",
      openings: 2,
      tier: "Super Dream",
      initials: "G",
      accent: "bg-blue-600"
    },
    {
      name: "Microsoft",
      industry: "Enterprise Software & Cloud",
      location: "Redmond / Hyderabad",
      website: "https://careers.microsoft.com",
      description: "Empowers every person and organization on the planet to achieve more through Azure, AI, and developer tools.",
      openings: 2,
      tier: "Super Dream",
      initials: "M",
      accent: "bg-indigo-600"
    },
    {
      name: "Amazon",
      industry: "E-Commerce & AWS Cloud",
      location: "Seattle / Bengaluru",
      website: "https://amazon.jobs",
      description: "World leader in e-commerce, cloud computing infrastructure, digital streaming, and artificial intelligence.",
      openings: 1,
      tier: "Super Dream",
      initials: "A",
      accent: "bg-amber-600"
    },
    {
      name: "Deloitte",
      industry: "Consulting & Financial Advisory",
      location: "Mumbai / Gurugram",
      website: "https://deloitte.com/careers",
      description: "Global consulting provider offering audit, technology consulting, and corporate financial advisory.",
      openings: 2,
      tier: "Dream",
      initials: "D",
      accent: "bg-emerald-600"
    },
    {
      name: "Texas Instruments",
      industry: "Semiconductors & VLSI",
      location: "Bengaluru",
      website: "https://ti.com/careers",
      description: "Pioneering semiconductor design and manufacturing company providing analog and embedded processing chips.",
      openings: 1,
      tier: "Super Dream",
      initials: "TI",
      accent: "bg-red-600"
    },
    {
      name: "Tata Consultancy Services",
      industry: "IT Services & Solutions",
      location: "Kolkata / Mumbai",
      website: "https://tcs.com/careers",
      description: "Global leader in IT consulting and business solutions partnering with world's largest businesses in their transformation journeys.",
      openings: 2,
      tier: "Core / Mass",
      initials: "TCS",
      accent: "bg-purple-600"
    },
    {
      name: "Infosys",
      industry: "Digital Services & Consulting",
      location: "Bengaluru / Pune",
      website: "https://infosys.com/careers",
      description: "Next-generation digital services firm enabling enterprise clients in 50+ countries to navigate digital transformation.",
      openings: 1,
      tier: "Core / Mass",
      initials: "INF",
      accent: "bg-sky-600"
    },
    {
      name: "L&T Technology Services",
      industry: "Engineering R&D Services",
      location: "Vadodara / Chennai",
      website: "https://ltts.com/careers",
      description: "Premier engineering services company focused on engineering, design, and software for medical, industrial, and telecom clients.",
      openings: 1,
      tier: "Core",
      initials: "LTTS",
      accent: "bg-slate-700"
    }
  ];

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-blue-700 bg-blue-50 border-blue-200">
              Campus Recruiters
            </Badge>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Participating Corporate Partners
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Explore leading organizations visiting our campus for full-time graduate hires and summer internships.
            </p>
          </div>
          <Link href="/jobs">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Browse Open Positions
            </Button>
          </Link>
        </div>

        {/* Company Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c, idx) => (
            <Card key={idx} className="hover:shadow-md transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-xl text-white font-bold flex items-center justify-center text-base shadow-sm ${c.accent}`}>
                      {c.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-tight">{c.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{c.industry}</p>
                    </div>
                  </div>
                  <Badge variant={c.tier === "Super Dream" ? "purple" : c.tier === "Dream" ? "info" : "secondary"}>
                    {c.tier}
                  </Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                  {c.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500 mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{c.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5 text-blue-500" />
                    <span className="font-semibold text-blue-600">{c.openings} Active Openings</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <span>Careers Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700 h-8 px-2">
                      View Drives →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
