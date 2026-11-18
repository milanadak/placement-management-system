"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Globe, MapPin, Briefcase, ExternalLink, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch("/api/companies");
        const data = await res.json();
        if (data?.companies) {
          setCompanies(data.companies);
        }
      } catch (err) {
        console.error("Failed to load companies:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompanies();
  }, []);

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.industry || "").toLowerCase().includes(q) ||
      (c.location || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <Badge variant="outline" className="mb-2 text-blue-700 bg-blue-50 border-blue-200">
            Corporate Alliances
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Prestigious Hiring Partners
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            CampusConnect collaborates with Fortune 500 multinationals and innovative technology leaders to offer tier-1 recruitment drives for our graduates.
          </p>

          <div className="mt-6 max-w-md mx-auto relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search companies by name or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-white"
            />
          </div>
        </div>

        {/* Company Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span>Loading corporate partners...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <h3 className="font-semibold text-slate-700">No partner companies found</h3>
                <p className="text-xs text-slate-500 mt-1">Try another search keyword.</p>
              </div>
            ) : (
              filtered.map((company, idx) => {
                const colors = [
                  "bg-blue-600",
                  "bg-indigo-600",
                  "bg-amber-600",
                  "bg-emerald-600",
                  "bg-red-600",
                  "bg-purple-600",
                  "bg-sky-600",
                  "bg-slate-700"
                ];
                const accentColor = colors[idx % colors.length];

                return (
                  <Card key={company.id || idx} className="hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`h-12 w-12 rounded-xl ${accentColor} text-white flex items-center justify-center font-bold text-lg shadow-sm`}>
                          {company.initials || company.name[0]}
                        </div>
                        <Badge variant="outline" className="text-[10px] font-semibold text-blue-700 bg-blue-50 border-blue-200">
                          {company.tier}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{company.name}</h3>
                        <p className="text-xs text-blue-600 font-medium">{company.industry}</p>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {company.description}
                      </p>

                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{company.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-emerald-700">
                          <Briefcase className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{company.openings} Active Drive{company.openings === 1 ? "" : "s"}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link href="/jobs">
                          <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-8">
                            <span>View Drives</span>
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
