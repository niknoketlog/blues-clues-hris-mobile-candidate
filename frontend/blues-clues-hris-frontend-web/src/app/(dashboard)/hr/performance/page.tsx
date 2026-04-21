"use client";

import { useState } from "react";
import { BarChart2, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type CycleStage = "Goal Setting" | "Mid-Year" | "Year-End";
type Outcome = "Pass" | "Fail" | "Pending";

type EmployeePerformanceRow = {
  id: string;
  name: string;
  department: string;
  stage: CycleStage;
  rating: number | null;
  outcome: Outcome;
  pipCount: number;
};

const MOCK_EMPLOYEES: EmployeePerformanceRow[] = [
  { id: "1", name: "Maria Santos",   department: "HR",      stage: "Mid-Year",     rating: null, outcome: "Pending", pipCount: 0 },
  { id: "2", name: "Juan dela Cruz", department: "IT",      stage: "Year-End",     rating: 4,    outcome: "Pass",    pipCount: 0 },
  { id: "3", name: "Ana Reyes",      department: "Finance", stage: "Goal Setting", rating: null, outcome: "Pending", pipCount: 1 },
  { id: "4", name: "Pedro Gomez",    department: "IT",      stage: "Year-End",     rating: 2,    outcome: "Fail",    pipCount: 2 },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor", 2: "Below Expectations", 3: "Meets Expectations", 4: "Above Average", 5: "Excellent",
};

const STAGE_BADGE: Record<CycleStage, string> = {
  "Goal Setting": "bg-blue-100 text-blue-700 border border-blue-200",
  "Mid-Year":     "bg-amber-100 text-amber-700 border border-amber-200",
  "Year-End":     "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const OUTCOME_BADGE: Record<Outcome, string> = {
  Pass:    "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Fail:    "bg-red-100 text-red-700 border border-red-200",
  Pending: "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function HRPerformancePage() {
  const [deptFilter, setDeptFilter]       = useState("All");
  const [stageFilter, setStageFilter]     = useState("All");
  const [outcomeFilter, setOutcomeFilter] = useState("All");
  const [applying, setApplying]           = useState<string | null>(null);

  const filtered = MOCK_EMPLOYEES.filter((e) => {
    if (deptFilter !== "All" && e.department !== deptFilter) return false;
    if (stageFilter !== "All" && e.stage !== stageFilter) return false;
    if (outcomeFilter !== "All" && e.outcome !== outcomeFilter) return false;
    return true;
  });

  const cbEligible = MOCK_EMPLOYEES.filter((e) => e.outcome === "Pass" && e.rating !== null && e.rating >= 4);

  const handleApply = async (id: string) => {
    setApplying(id);
    await new Promise((res) => setTimeout(res, 800));
    toast.success("Outcome applied to salary record.");
    setApplying(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_52%,#134e4a_100%)] text-white px-8 py-10 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 mb-2">HR Operations</p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Performance Overview</h1>
        <p className="text-sm text-white/75 max-w-2xl">Monitor all employee performance records across the organization.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total",   value: MOCK_EMPLOYEES.length,                                          cls: "" },
          { label: "Passed",  value: MOCK_EMPLOYEES.filter((e) => e.outcome === "Pass").length,      cls: "text-emerald-600" },
          { label: "Failed",  value: MOCK_EMPLOYEES.filter((e) => e.outcome === "Fail").length,      cls: "text-red-600" },
          { label: "On PIP",  value: MOCK_EMPLOYEES.filter((e) => e.pipCount > 0).length,            cls: "text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground">{stat.label}</CardTitle></CardHeader>
            <CardContent className={`text-2xl font-bold ${stat.cls}`}>{stat.value}</CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border shadow-sm">
        <CardHeader><CardTitle className="text-base font-bold tracking-tight">Filters</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-1.5 w-40">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Department</label>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All", "HR", "IT", "Finance"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 w-44">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Stage</label>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All", "Goal Setting", "Mid-Year", "Year-End"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 w-36">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Outcome</label>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All", "Pass", "Fail", "Pending"].map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" /> Employee Performance Records ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No records match the selected filters.</p>
          ) : (
            filtered.map((emp) => (
              <div key={emp.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STAGE_BADGE[emp.stage]}`}>{emp.stage}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${OUTCOME_BADGE[emp.outcome]}`}>{emp.outcome}</span>
                    {emp.rating !== null && (
                      <Badge variant="outline">{emp.rating}/5 — {RATING_LABELS[emp.rating]}</Badge>
                    )}
                    {emp.pipCount > 0 && (
                      <Badge className="bg-red-100 text-red-700 border border-red-200">{emp.pipCount} PIP</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* C&B Integration */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight">C&B Integration — Outcome Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Employees with approved bonuses or merit increases eligible for salary record update.</p>
          {cbEligible.length === 0 ? (
            <p className="text-sm text-muted-foreground">No approved outcomes ready for C&B application.</p>
          ) : (
            cbEligible.map((emp) => (
              <div key={emp.id} className="border rounded-lg p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{emp.name}</p>
                    <p className="text-xs text-muted-foreground">{emp.department} · Rating {emp.rating}/5 — {RATING_LABELS[emp.rating!]}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="cursor-pointer"
                  disabled={applying === emp.id}
                  onClick={() => void handleApply(emp.id)}
                >
                  {applying === emp.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />}
                  Apply to Salary Record
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}