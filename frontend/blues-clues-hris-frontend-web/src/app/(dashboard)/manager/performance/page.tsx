"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Users,
  XCircle,
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
type Outcome = "Pass" | "Fail" | "Pending";

type TeamMember = {
  id: string;
  name: string;
  position: string;
  goalStatus: GoalStatus;
  rating: number | null;
  pipCount: number;
  outcome: Outcome;
};

const MOCK_TEAM: TeamMember[] = [
  { id: "1", name: "Maria Santos",   position: "HR Associate",    goalStatus: "In Progress", rating: null, pipCount: 0, outcome: "Pending" },
  { id: "2", name: "Juan dela Cruz", position: "IT Specialist",   goalStatus: "Achieved",    rating: 4,    pipCount: 0, outcome: "Pass"    },
  { id: "3", name: "Ana Reyes",      position: "Finance Analyst", goalStatus: "Not Started", rating: null, pipCount: 1, outcome: "Pending" },
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor", 2: "Below Expectations", 3: "Meets Expectations", 4: "Above Average", 5: "Excellent",
};

const STATUS_BADGE: Record<GoalStatus, string> = {
  "Not Started": "bg-slate-100 text-slate-600 border border-slate-200",
  "In Progress":  "bg-amber-100 text-amber-700 border border-amber-200",
  "Achieved":     "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

export default function ManagerPerformancePage() {
  const [team] = useState<TeamMember[]>(MOCK_TEAM);
  const [activeModal, setActiveModal] = useState<"goal" | "review" | "pip" | "nominate" | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [goalForm, setGoalForm] = useState({ title: "", kpiDescription: "", targetValue: "", bscCategory: "Financial" as BSCCategory, deadline: "" });
  const [reviewForm, setReviewForm] = useState({ rating: "3", outcome: "Pass" as "Pass" | "Fail", comments: "" });
  const [pipForm, setPipForm] = useState({ improvementAreas: "", actionSteps: "", targetDate: "" });
  const [nominateForm, setNominateForm] = useState({ promotion: false, bonus: false, meritIncrease: false, bonusAmount: "" });

  const openModal = (type: typeof activeModal, member: TeamMember) => {
    setSelectedMember(member);
    setActiveModal(type);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await new Promise((res) => setTimeout(res, 800));
      toast.success("Submitted — awaiting HR countersignature.");
      setActiveModal(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="rounded-[26px] bg-[linear-gradient(135deg,#0f172a_0%,#172554_52%,#134e4a_100%)] text-white px-8 py-10 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60 mb-2">Management Portal</p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Team Performance</h1>
        <p className="text-sm text-white/70 max-w-xl">Set goals, conduct reviews, and manage your team's performance.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground">Total Members</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold">{team.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground">On Track</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-emerald-600">{team.filter((m) => m.goalStatus === "Achieved").length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-semibold text-muted-foreground">On PIP</CardTitle></CardHeader>
          <CardContent className="text-2xl font-bold text-red-600">{team.filter((m) => m.pipCount > 0).length}</CardContent>
        </Card>
      </div>

      {/* Team Cards */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" /> Direct Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {team.map((member) => (
            <div key={member.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.position}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_BADGE[member.goalStatus]}`}>
                    {member.goalStatus}
                  </span>
                  {member.rating !== null && (
                    <Badge variant="outline">{member.rating}/5 — {RATING_LABELS[member.rating]}</Badge>
                  )}
                  {member.pipCount > 0 && (
                    <Badge className="bg-red-100 text-red-700 border border-red-200">{member.pipCount} of 2 PIPs</Badge>
                  )}
                  <Badge className={
                    member.outcome === "Pass" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                    member.outcome === "Fail" ? "bg-red-100 text-red-700 border border-red-200" :
                    "bg-slate-100 text-slate-600 border border-slate-200"
                  }>
                    {member.outcome}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openModal("goal", member)}>Set Goal</Button>
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openModal("review", member)}>Conduct Review</Button>
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openModal("pip", member)}>
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5 text-amber-500" /> Initiate PIP
                </Button>
                <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => openModal("nominate", member)}>Nominate</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Goal Setting Dialog */}
      <Dialog open={activeModal === "goal"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">Set Goal — {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-xs text-muted-foreground">Submission will trigger HR countersignature workflow.</p>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Goal Title *</label>
              <Input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="e.g. Reduce cost by 15%" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">KPI Description</label>
              <Textarea value={goalForm.kpiDescription} onChange={(e) => setGoalForm({ ...goalForm, kpiDescription: e.target.value })} placeholder="How will this be measured?" className="min-h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Target Value</label>
              <Input value={goalForm.targetValue} onChange={(e) => setGoalForm({ ...goalForm, targetValue: e.target.value })} placeholder="e.g. < ₱85M cost" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">BSC Category</label>
              <Select value={goalForm.bscCategory} onValueChange={(v) => setGoalForm({ ...goalForm, bscCategory: v as BSCCategory })}>
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
              <Input type="date" value={goalForm.deadline} onChange={(e) => setGoalForm({ ...goalForm, deadline: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit for HR Approval
              </Button>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={activeModal === "review"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">Conduct Review — {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Overall Rating (1–5)</label>
              <Select value={reviewForm.rating} onValueChange={(v) => setReviewForm({ ...reviewForm, rating: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1,2,3,4,5].map((r) => (
                    <SelectItem key={r} value={String(r)}>{r} — {RATING_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Outcome</label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={reviewForm.outcome === "Pass" ? "default" : "outline"}
                  className={`flex-1 cursor-pointer ${reviewForm.outcome === "Pass" ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                  onClick={() => setReviewForm({ ...reviewForm, outcome: "Pass" })}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Pass
                </Button>
                <Button
                  size="sm"
                  variant={reviewForm.outcome === "Fail" ? "default" : "outline"}
                  className={`flex-1 cursor-pointer ${reviewForm.outcome === "Fail" ? "bg-red-600 hover:bg-red-700" : ""}`}
                  onClick={() => setReviewForm({ ...reviewForm, outcome: "Fail" })}
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" /> Fail
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Comments</label>
              <Textarea value={reviewForm.comments} onChange={(e) => setReviewForm({ ...reviewForm, comments: e.target.value })} placeholder="Performance notes and observations..." className="min-h-24 resize-none" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Review
              </Button>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PIP Dialog */}
      <Dialog open={activeModal === "pip"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">Initiate PIP — {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {selectedMember && selectedMember.pipCount > 0 && (
              <div className="flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-700 font-medium">{selectedMember.pipCount} of 2 PIPs used this year</p>
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Improvement Areas *</label>
              <Textarea value={pipForm.improvementAreas} onChange={(e) => setPipForm({ ...pipForm, improvementAreas: e.target.value })} placeholder="Describe areas needing improvement..." className="min-h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Action Steps *</label>
              <Textarea value={pipForm.actionSteps} onChange={(e) => setPipForm({ ...pipForm, actionSteps: e.target.value })} placeholder="Specific steps to be taken..." className="min-h-20 resize-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Target Date *</label>
              <Input type="date" value={pipForm.targetDate} onChange={(e) => setPipForm({ ...pipForm, targetDate: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-red-600 hover:bg-red-700 cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Initiate PIP
              </Button>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Nominate Dialog */}
      <Dialog open={activeModal === "nominate"} onOpenChange={(o) => !o && setActiveModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">Nominate — {selectedMember?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {[
              { key: "promotion",    label: "Recommend for Promotion" },
              { key: "bonus",        label: "Recommend for Bonus" },
              { key: "meritIncrease",label: "Recommend for Merit Increase" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={nominateForm[item.key as keyof typeof nominateForm] as boolean}
                  onChange={(e) => setNominateForm((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">{item.label}</span>
              </label>
            ))}
            {nominateForm.bonus && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Bonus Amount (optional override)</label>
                <Input value={nominateForm.bonusAmount} onChange={(e) => setNominateForm({ ...nominateForm, bonusAmount: e.target.value })} placeholder="e.g. ₱15,000" />
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <Button onClick={handleSubmit} disabled={submitting} className="flex-1 cursor-pointer">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit Nomination
              </Button>
              <Button variant="outline" onClick={() => setActiveModal(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}