"use client";

import { useState } from "react";
import { Loader2, Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type ViolationRule = {
  id: string;
  condition: string;
  action: string;
};

export default function PerformanceSettingsPage() {
  const [cycleEnabled, setCycleEnabled]   = useState(true);
  const [goalStartDate, setGoalStartDate] = useState("2025-01-01");
  const [midYearDate, setMidYearDate]     = useState("2025-06-30");
  const [yearEndDate, setYearEndDate]     = useState("2025-12-31");
  const [pipLimit, setPipLimit]           = useState("2");
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);

  const [ratingLabels, setRatingLabels] = useState<Record<number, string>>({
    1: "Poor",
    2: "Below Expectations",
    3: "Meets Expectations",
    4: "Above Average",
    5: "Excellent",
  });

  const [violationRules, setViolationRules] = useState<ViolationRule[]>([
    { id: "1", condition: "3 Low violations",     action: "Verbal Warning" },
    { id: "2", condition: "2 Medium violations",  action: "Written Warning" },
    { id: "3", condition: "1 High violation",     action: "Suspension" },
    { id: "4", condition: "1 Critical violation", action: "Escalation / Termination" },
  ]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((res) => setTimeout(res, 800));
    setSaving(false);
    setSaved(true);
    toast.success("Performance settings saved.");
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#172554_52%,#134e4a_100%)] text-white px-8 py-10 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/65 mb-2">System Admin</p>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Performance Settings</h1>
        <p className="text-sm text-white/75 max-w-2xl">Configure performance cycles, rating scales, PIP limits, and violation rules.</p>
      </div>

      {/* Cycle Settings */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" /> Performance Cycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cycle-toggle" className="text-sm font-semibold">Enable Performance Cycle</Label>
              <p className="text-xs text-muted-foreground mt-0.5">{cycleEnabled ? "Cycle is currently active" : "Cycle is currently disabled"}</p>
            </div>
            <Switch id="cycle-toggle" checked={cycleEnabled} onCheckedChange={setCycleEnabled} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Goal Setting Start Date</label>
              <Input type="date" value={goalStartDate} onChange={(e) => setGoalStartDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Mid-Year Review Date</label>
              <Input type="date" value={midYearDate} onChange={(e) => setMidYearDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Year-End Review Date</label>
              <Input type="date" value={yearEndDate} onChange={(e) => setYearEndDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Max PIPs Per Employee Per Year</label>
              <Input type="number" value={pipLimit} onChange={(e) => setPipLimit(e.target.value)} min="1" max="5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Scale */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold tracking-tight">Rating Scale Labels (1–5)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Customize the description shown for each rating level.</p>
          {([1, 2, 3, 4, 5] as const).map((r) => (
            <div key={r} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">{r}</div>
              <Input
                value={ratingLabels[r]}
                onChange={(e) => setRatingLabels((prev) => ({ ...prev, [r]: e.target.value }))}
                placeholder={`Label for rating ${r}`}
                className="flex-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Violation Rule Builder */}
      <Card className="border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-bold tracking-tight">Violation Rule Builder</CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            onClick={() => setViolationRules((prev) => [...prev, { id: Date.now().toString(), condition: "", action: "" }])}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Rule
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Define thresholds that trigger automatic disciplinary actions.</p>
          {violationRules.map((rule) => (
            <div key={rule.id} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">If</span>
                <Input
                  value={rule.condition}
                  onChange={(e) => setViolationRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, condition: e.target.value } : r))}
                  placeholder="e.g. 3 Low violations"
                  className="flex-1 h-8 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">→</span>
                <Input
                  value={rule.action}
                  onChange={(e) => setViolationRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, action: e.target.value } : r))}
                  placeholder="e.g. Suspension"
                  className="flex-1 h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive cursor-pointer"
                  onClick={() => setViolationRules((prev) => prev.filter((r) => r.id !== rule.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className={`w-full h-11 text-sm font-bold cursor-pointer ${saved ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
      >
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {saved ? "✓ Settings Saved!" : "Save Settings"}
      </Button>
    </div>
  );
}