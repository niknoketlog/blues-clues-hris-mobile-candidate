"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Plus, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type Severity = "Low" | "Medium" | "High" | "Critical";
type ViolationType = "Tardiness" | "Insubordination" | "Policy Violation" | "Misconduct" | "Negligence" | "Other";

type ViolationLog = {
  id: string;
  employeeName: string;
  employeeId: string;
  violationType: ViolationType;
  severity: Severity;
  description: string;
  date: string;
  suggestedAction: string;
};

const MOCK_VIOLATIONS: ViolationLog[] = [
  { id: "1", employeeName: "Ana Reyes",   employeeId: "EMP-003", violationType: "Tardiness",       severity: "Low",      description: "Late for 3 consecutive days",                      date: "2025-06-01", suggestedAction: "Verbal Warning" },
  { id: "2", employeeName: "Pedro Gomez", employeeId: "EMP-004", violationType: "Misconduct",      severity: "High",     description: "Disruptive behavior during team meeting",           date: "2025-05-28", suggestedAction: "Written Warning" },
  { id: "3", employeeName: "Pedro Gomez", employeeId: "EMP-004", violationType: "Policy Violation", severity: "Critical", description: "Unauthorized access to confidential files",          date: "2025-05-15", suggestedAction: "Suspension" },
];

const SEVERITY_BADGE: Record<Severity, string> = {
  Low:      "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Medium:   "bg-amber-100 text-amber-700 border border-amber-200",
  High:     "bg-orange-100 text-orange-700 border border-orange-200",
  Critical: "bg-red-100 text-red-700 border border-red-200",
};

const getSuggestedAction = (severity: Severity): string => {
  if (severity === "Low")      return "Verbal Warning";
  if (severity === "Medium")   return "Written Warning";
  if (severity === "High")     return "Suspension";
  if (severity === "Critical") return "Escalation / Termination";
  return "Review Required";
};

export default function HRViolationsPage() {
  const [violations, setViolations] = useState<ViolationLog[]>(MOCK_VIOLATIONS);
  const [logOpen, setLogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    employeeName: "", employeeId: "",
    violationType: "Tardiness" as ViolationType,
    severity: "Low" as Severity,
    description: "", date: "",
  });

  const handleSubmit = async () => {
    if (!form.employeeName.trim() || !form.description.trim() || !form.date) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setViolations((prev) => [{
        id: Date.now().toString(),
        ...form,
        suggestedAction: getSuggestedAction(form.severity),
      }, ...prev]);
      setLogOpen(false);
      setForm({ employeeName: "", employeeId: "", violationType: "Tardiness", severity: "Low", description: "", date: "" });
      toast.success("Violation logged successfully.");
    } finally {
      setSubmitting(false);
    }
  };

  const counts = (["Low", "Medium", "High", "Critical"] as Severity[]).map((sev) => ({
    sev,
    count: violations.filter((v) => v.severity === sev).length,
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_52%,#134e4a_100%)] text-white px-8 py-10 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 mb-2">HR Operations</p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Violation Log</h1>
        <p className="text-sm text-white/75 max-w-2xl">Track employee violations and disciplinary actions.</p>
      </div>

      {/* Severity Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {counts.map(({ sev, count }) => (
          <Card key={sev}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground">{sev}</CardTitle></CardHeader>
            <CardContent className="text-2xl font-bold">{count}</CardContent>
          </Card>
        ))}
      </div>

      {/* Violation List */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" /> Violation History
          </CardTitle>
          <Button size="sm" onClick={() => setLogOpen(true)} className="cursor-pointer">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Log Violation
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {violations.length === 0 ? (
            <p className="text-sm text-muted-foreground">No violations logged yet.</p>
          ) : (
            violations.map((v) => (
              <div key={v.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{v.employeeName}</p>
                    <p className="text-xs text-muted-foreground">{v.employeeId} · {v.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{v.violationType}</Badge>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${SEVERITY_BADGE[v.severity]}`}>{v.severity}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{v.description}</p>
                <div className="flex items-center gap-2 rounded-md bg-amber-50 border border-amber-100 px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 font-medium">Suggested Action: {v.suggestedAction}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Log Violation Dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">Log a Violation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Employee Name *</label>
                <Input value={form.employeeName} onChange={(e) => setForm({ ...form, employeeName: e.target.value })} placeholder="Full name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Employee ID</label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="e.g. EMP-001" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Violation Type *</label>
                <Select value={form.violationType} onValueChange={(v) => setForm({ ...form, violationType: v as ViolationType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Tardiness", "Insubordination", "Policy Violation", "Misconduct", "Negligence", "Other"] as ViolationType[]).map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Severity *</label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as Severity })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(["Low", "Medium", "High", "Critical"] as Severity[]).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">System Suggestion: {getSuggestedAction(form.severity)}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Description *</label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the violation in detail..." className="min-h-24 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Date *</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Log Violation
              </Button>
              <Button variant="outline" onClick={() => setLogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}