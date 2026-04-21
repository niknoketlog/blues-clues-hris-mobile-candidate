"use client";

import { useState } from "react";
import {
  BarChart2,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Target,
} from "lucide-react";
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

type GoalStatus = "Not Started" | "In Progress" | "Achieved";
type BSCCategory = "Financial" | "Customer" | "Internal Process" | "Learning & Growth";

type Goal = {
  id: string;
  title: string;
  kpiDescription: string;
  targetValue: string;
  bscCategory: BSCCategory;
  deadline: string;
  status: GoalStatus;
  midYearProgress?: string;
};

type PerformanceCycle = {
  year: string;
  rating: number;
  outcome: "Pass" | "Fail";
  reviewer: string;
};

const MOCK_GOALS: Goal[] = [
  { id: "1", title: "Reduce processing time", kpiDescription: "Reduce avg ticket resolution time", targetValue: "< 2 hours", bscCategory: "Internal Process", deadline: "2025-12-31", status: "In Progress", midYearProgress: "Currently at 3.5 hours avg" },
  { id: "2", title: "Complete training modules", kpiDescription: "Finish all assigned L&D modules", targetValue: "100%", bscCategory: "Learning & Growth", deadline: "2025-12-31", status: "Achieved" },
  { id: "3", title: "Customer satisfaction score", kpiDescription: "Maintain CSAT above target", targetValue: "≥ 4.5 / 5", bscCategory: "Customer", deadline: "2025-12-31", status: "Not Started" },
];

const MOCK_HISTORY: PerformanceCycle[] = [
  { year: "2024", rating: 4, outcome: "Pass", reviewer: "Manager A" },
  { year: "2023", rating: 3, outcome: "Pass", reviewer: "Manager B" },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor", 2: "Below Expectations", 3: "Meets Expectations", 4: "Above Average", 5: "Excellent",
};

const STATUS_BADGE: Record<GoalStatus, string> = {
  "Not Started": "bg-slate-100 text-slate-600 border border-slate-200",
  "In Progress":  "bg-amber-100 text-amber-700 border border-amber-200",
  "Achieved":     "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

const BSC_COLORS: Record<BSCCategory, string> = {
  "Financial":          "bg-blue-100 text-blue-700",
  "Customer":           "bg-pink-100 text-pink-700",
  "Internal Process":   "bg-purple-100 text-purple-700",
  "Learning & Growth":  "bg-green-100 text-green-700",
};

export default function EmployeePerformancePage() {
  const [goals, setGoals] = useState<Goal[]>(MOCK_GOALS);
  const [activeTab, setActiveTab] = useState<"goals" | "history" | "pip">("goals");
  const [proposeOpen, setProposeOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: "", kpiDescription: "", targetValue: "",
    bscCategory: "Financial" as BSCCategory, deadline: "",
  });

  const latestCycle = MOCK_HISTORY[0];

  const handleProposeGoal = async () => {
    if (!newGoal.title.trim() || !newGoal.deadline) {
      toast.error("Please fill in required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      setGoals((prev) => [...prev, { id: Date.now().toString(), ...newGoal, status: "Not Started" }]);
      setProposeOpen(false);
      setNewGoal({ title: "", kpiDescription: "", targetValue: "", bscCategory: "Financial", deadline: "" });
      toast.success("Goal proposal submitted — awaiting manager review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="rounded-[26px] bg-[linear-gradient(135deg,#0f172a_0%,#172554_52%,#134e4a_100%)] text-white px-8 py-10 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 mb-2">Employee Portal</p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">My Performance</h1>
        <p className="text-sm text-white/70 max-w-xl">View your goals, track progress, and see your performance history.</p>
      </div>

      {/* Latest Rating */}
      {latestCycle && (
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">{latestCycle.year} Review</p>
                <p className="text-2xl font-bold tracking-tight mt-1">{RATING_LABELS[latestCycle.rating]}</p>
                <p className="text-sm text-muted-foreground mt-1">Reviewed by {latestCycle.reviewer}</p>
              </div>
              <div className="text-right space-y-2">
                <p className="text-4xl font-bold text-primary">{latestCycle.rating}<span className="text-lg text-muted-foreground font-medium">/5</span></p>
                <Badge className={latestCycle.outcome === "Pass" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}>
                  {latestCycle.outcome}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {(["goals", "history", "pip"] as const).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
            className="capitalize"
          >
            {tab === "goals" ? "My Goals" : tab === "history" ? "History" : "PIP"}
          </Button>
        ))}
      </div>

      {/* Goals Tab */}
      {activeTab === "goals" && (
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" /> Assigned Goals
            </CardTitle>
            <Button size="sm" onClick={() => setProposeOpen(true)} className="cursor-pointer">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Propose Goal
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {goals.map((goal) => (
              <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">{goal.title}</p>
                    <p className="text-xs text-muted-foreground">{goal.kpiDescription}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${BSC_COLORS[goal.bscCategory]}`}>
                      {goal.bscCategory}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[goal.status]}`}>
                      {goal.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Target: <span className="font-semibold text-foreground">{goal.targetValue}</span></span>
                  <span>Due: <span className="font-semibold text-foreground">{goal.deadline}</span></span>
                </div>
                {goal.midYearProgress && (
                  <div className="rounded-md bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-700">
                    <BarChart2 className="h-3 w-3 inline mr-1" />
                    Mid-Year: {goal.midYearProgress}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold tracking-tight">Performance History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {MOCK_HISTORY.map((cycle) => (
              <div key={cycle.year} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{cycle.year} Cycle</p>
                  <p className="text-xs text-muted-foreground mt-1">Reviewed by {cycle.reviewer}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xl font-bold text-primary">{cycle.rating}/5</p>
                  <p className="text-xs text-muted-foreground">{RATING_LABELS[cycle.rating]}</p>
                  <Badge className={cycle.outcome === "Pass" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-red-100 text-red-700 border border-red-200"}>
                    {cycle.outcome}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PIP Tab */}
      {activeTab === "pip" && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold tracking-tight">Performance Improvement Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-base font-bold">No active PIP</p>
              <p className="text-sm text-muted-foreground max-w-sm">You currently have no performance improvement plan assigned.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Propose Goal Dialog */}
      <Dialog open={proposeOpen} onOpenChange={setProposeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">Propose a Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Goal Title *</label>
              <Input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} placeholder="e.g. Reduce processing time by 20%" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">KPI Description</label>
              <Textarea value={newGoal.kpiDescription} onChange={(e) => setNewGoal({ ...newGoal, kpiDescription: e.target.value })} placeholder="How will this be measured?" className="min-h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Target Value</label>
              <Input value={newGoal.targetValue} onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })} placeholder="e.g. < 2 hours, 100%, ≥ ₱25M" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">BSC Category</label>
              <Select value={newGoal.bscCategory} onValueChange={(v) => setNewGoal({ ...newGoal, bscCategory: v as BSCCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Financial", "Customer", "Internal Process", "Learning & Growth"] as BSCCategory[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Deadline *</label>
              <Input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleProposeGoal} disabled={submitting} className="flex-1 cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Proposal
              </Button>
              <Button variant="outline" onClick={() => setProposeOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}