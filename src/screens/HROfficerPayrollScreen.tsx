import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View, Pressable, useWindowDimensions,
} from "react-native";
import { Sidebar } from "../components/Sidebar";
import { MobileRoleMenu } from "../components/MobileRoleMenu";
import { Header } from "../components/Header";
import { GradientHero } from "../components/GradientHero";
import { SecurityModal } from "../components/SecurityModal";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

type PayrollEntry = {
  payroll_id: string;
  employee_name: string;
  employee_id: string;
  cutoff_date: string;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  status: "draft" | "processed" | "released";
};

const MOCK_PAYROLL: PayrollEntry[] = [
  { payroll_id: "1", employee_name: "Maria Santos", employee_id: "EMP-001", cutoff_date: "2025-06-30", gross_pay: 28000, deductions: 3500, net_pay: 24500, status: "released" },
  { payroll_id: "2", employee_name: "Juan dela Cruz", employee_id: "EMP-002", cutoff_date: "2025-06-30", gross_pay: 32000, deductions: 4000, net_pay: 28000, status: "processed" },
  { payroll_id: "3", employee_name: "Ana Reyes", employee_id: "EMP-003", cutoff_date: "2025-06-30", gross_pay: 22000, deductions: 2800, net_pay: 19200, status: "draft" },
];

const toCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  released: { bg: "#f0fdf4", text: "#16a34a" },
  processed: { bg: "#eff6ff", text: "#2563eb" },
  draft: { bg: "#fffbeb", text: "#b45309" },
};

export const HROfficerPayrollScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const [locked, setLocked] = useState(true);
  const [authVisible, setAuthVisible] = useState(false);
  const [cutoffDate, setCutoffDate] = useState(new Date().toISOString().slice(0, 10));

  const totals = MOCK_PAYROLL.reduce(
    (acc, row) => { acc.gross += row.gross_pay; acc.deductions += row.deductions; acc.net += row.net_pay; return acc; },
    { gross: 0, deductions: 0, net: 0 }
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.rootRow}>
        {!isMobile && (
          <Sidebar role="hr" userName={session.name} email={session.email} activeScreen="Payroll" navigation={navigation} />
        )}
        <View style={styles.mainCol}>
          {isMobile ? (
            <MobileRoleMenu role="hr" userName={session.name} email={session.email} activeScreen="Payroll" navigation={navigation} />
          ) : (
            <Header role="hr" userName={session.name} />
          )}

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <GradientHero style={{ marginBottom: 0 }}>
              <Text style={styles.eyebrow}>HR Operations</Text>
              <Text style={styles.heroTitle}>Payroll Ledger</Text>
              <Text style={styles.heroSub}>Run payroll cutoffs and review compensation data.</Text>
            </GradientHero>

            {/* Run Cutoff */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Run Payroll Cutoff</Text>
              <Text style={styles.fieldLabel}>Cutoff Date</Text>
              <TextInput
                style={styles.input}
                value={cutoffDate}
                onChangeText={setCutoffDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.textMuted}
              />
              <View style={styles.cutoffBtns}>
                <Pressable style={styles.runBtn}>
                  <Text style={styles.runBtnText}>▶ Run Cutoff</Text>
                </Pressable>
                <Pressable style={styles.outlineBtn}>
                  <Text style={styles.outlineBtnText}>Refresh Ledger</Text>
                </Pressable>
              </View>
            </View>

            {/* Totals */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Gross Payroll</Text>
                <Text style={styles.statValue}>{toCurrency(totals.gross)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Deductions</Text>
                <Text style={styles.statValue}>{toCurrency(totals.deductions)}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Net Payroll</Text>
                <Text style={styles.statValue}>{toCurrency(totals.net)}</Text>
              </View>
            </View>

            {/* Compensation Data */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>💰 Compensation Data</Text>
                {locked ? (
                  <Pressable style={styles.unlockBtn} onPress={() => setAuthVisible(true)}>
                    <Text style={styles.unlockBtnText}>🔒 Unlock</Text>
                  </Pressable>
                ) : (
                  <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedBadgeText}>Unlocked</Text>
                  </View>
                )}
              </View>

              {locked ? (
                <Text style={styles.emptyText}>
                  🔒 Unlock with secondary authentication to view employee compensation values.
                </Text>
              ) : (
                MOCK_PAYROLL.map((row) => {
                  const statusColor = STATUS_COLORS[row.status] ?? STATUS_COLORS.draft;
                  return (
                    <View key={row.payroll_id} style={styles.payrollRow}>
                      <View style={styles.payrollTop}>
                        <View>
                          <Text style={styles.empName}>{row.employee_name}</Text>
                          <Text style={styles.empMeta}>{row.employee_id} · Cutoff {row.cutoff_date}</Text>
                        </View>
                        <View style={styles.rowBadges}>
                          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                            <Text style={[styles.statusBadgeText, { color: statusColor.text }]}>{row.status}</Text>
                          </View>
                          <View style={styles.netBadge}>
                            <Text style={styles.netBadgeText}>Net {toCurrency(row.net_pay)}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.payrollBreakdown}>
                        <Text style={styles.breakdownItem}>Gross: {toCurrency(row.gross_pay)}</Text>
                        <Text style={styles.breakdownItem}>Deductions: {toCurrency(row.deductions)}</Text>
                        <Text style={styles.breakdownItem}>Net: {toCurrency(row.net_pay)}</Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      <SecurityModal
        visible={authVisible}
        title="Unlock Compensation Data"
        description="Re-enter your password to access payroll amounts."
        onClose={() => setAuthVisible(false)}
        onVerified={() => { setLocked(false); setAuthVisible(false); }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgApp },
  rootRow: { flex: 1, flexDirection: "row" },
  mainCol: { flex: 1 },
  content: { paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 32, gap: 12 },
  eyebrow: { color: "rgba(255,255,255,0.78)", fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.86)", fontSize: 12, lineHeight: 18, marginTop: 6 },
  card: { borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.textPrimary, backgroundColor: "#fff" },
  cutoffBtns: { flexDirection: "row", gap: 8 },
  runBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  runBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  outlineBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  outlineBtnText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: 12 },
  statLabel: { fontSize: 10, fontWeight: "700", color: Colors.textMuted },
  statValue: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary, marginTop: 4 },
  unlockBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  unlockBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  unlockedBadge: { backgroundColor: Colors.bgMuted, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  unlockedBadgeText: { fontSize: 11, fontWeight: "700", color: Colors.textMuted },
  emptyText: { color: Colors.textMuted, fontSize: 13, lineHeight: 20 },
  payrollRow: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, gap: 8, backgroundColor: Colors.bgMuted },
  payrollTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  empName: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  empMeta: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  rowBadges: { gap: 4, alignItems: "flex-end" },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 10, fontWeight: "800" },
  netBadge: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: "#fff" },
  netBadgeText: { fontSize: 10, fontWeight: "700", color: Colors.textSecondary },
  payrollBreakdown: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  breakdownItem: { fontSize: 11, color: Colors.textSecondary, backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
});