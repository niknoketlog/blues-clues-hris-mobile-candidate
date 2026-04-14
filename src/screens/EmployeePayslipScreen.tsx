import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, View, Pressable, useWindowDimensions,
} from "react-native";
import { Sidebar } from "../components/Sidebar";
import { MobileRoleMenu } from "../components/MobileRoleMenu";
import { Header } from "../components/Header";
import { GradientHero } from "../components/GradientHero";
import { SecurityModal } from "../components/SecurityModal";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

type PayslipEntry = {
  payslip_id: string;
  pay_period: string;
  basic_pay: number;
  allowances: number;
  deductions: number;
  tax: number;
  net_pay: number;
  created_at: string;
};

const MOCK_PAYSLIPS: PayslipEntry[] = [
  { payslip_id: "1", pay_period: "June 2025", basic_pay: 25000, allowances: 3000, deductions: 2000, tax: 1500, net_pay: 24500, created_at: "2025-06-30" },
  { payslip_id: "2", pay_period: "May 2025", basic_pay: 25000, allowances: 3000, deductions: 2000, tax: 1500, net_pay: 24500, created_at: "2025-05-31" },
];

const toCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const EmployeePayslipScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const [authVisible, setAuthVisible] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [unlockedId, setUnlockedId] = useState<string | null>(null);

  const selectedPayslip = MOCK_PAYSLIPS.find((p) => p.payslip_id === unlockedId) ?? null;
  const totalNetPay = MOCK_PAYSLIPS.reduce((sum, p) => sum + p.net_pay, 0);

  const handleView = (id: string) => {
    setPendingId(id);
    setAuthVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.rootRow}>
        {!isMobile && (
          <Sidebar role="employee" userName={session.name} email={session.email} activeScreen="Payslips" navigation={navigation} />
        )}
        <View style={styles.mainCol}>
          {isMobile ? (
            <MobileRoleMenu role="employee" userName={session.name} email={session.email} activeScreen="Payslips" navigation={navigation} />
          ) : (
            <Header role="employee" userName={session.name} />
          )}

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <GradientHero style={{ marginBottom: 0 }}>
              <Text style={styles.eyebrow}>Employee Self-Service</Text>
              <Text style={styles.heroTitle}>Payslip History</Text>
              <Text style={styles.heroSub}>Sensitive details are protected with secondary verification.</Text>
            </GradientHero>

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Payslips</Text>
                <Text style={styles.statValue}>{MOCK_PAYSLIPS.length}</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statLabel}>Total Net Pay</Text>
                <Text style={styles.statValue}>{toCurrency(totalNetPay)}</Text>
              </View>
            </View>

            {/* Payslip List */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>💰 Latest Payslips</Text>
              {MOCK_PAYSLIPS.map((row) => (
                <View key={row.payslip_id} style={styles.payslipRow}>
                  <View>
                    <Text style={styles.payPeriod}>{row.pay_period}</Text>
                    <Text style={styles.payDate}>Generated: {row.created_at}</Text>
                  </View>
                  <View style={styles.rowRight}>
                    <View style={styles.netBadge}>
                      <Text style={styles.netBadgeText}>Net: {toCurrency(row.net_pay)}</Text>
                    </View>
                    <Pressable style={styles.viewBtn} onPress={() => handleView(row.payslip_id)}>
                      <Text style={styles.viewBtnText}>View</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* Breakdown */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Payslip Breakdown</Text>
              {selectedPayslip ? (
                <View style={styles.breakdownGrid}>
                  <BreakdownItem label="Basic Pay" value={toCurrency(selectedPayslip.basic_pay)} />
                  <BreakdownItem label="Allowances" value={toCurrency(selectedPayslip.allowances)} />
                  <BreakdownItem label="Deductions" value={toCurrency(selectedPayslip.deductions)} />
                  <BreakdownItem label="Tax" value={toCurrency(selectedPayslip.tax)} />
                  <BreakdownItem label="Net Pay" value={toCurrency(selectedPayslip.net_pay)} highlight />
                </View>
              ) : (
                <Text style={styles.emptyText}>
                  🔒 Verify your identity and open a payslip to view full compensation details.
                </Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      <SecurityModal
        visible={authVisible}
        title="Unlock Payslip"
        description="Enter your account password to view compensation details."
        onClose={() => setAuthVisible(false)}
        onVerified={() => {
          if (pendingId) {
            setUnlockedId(pendingId);
            setPendingId(null);
          }
          setAuthVisible(false);
        }}
      />
    </SafeAreaView>
  );
};

function BreakdownItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={[styles.breakdownItem, highlight && styles.breakdownHighlight]}>
      <Text style={[styles.breakdownLabel, highlight && { color: "#15803d" }]}>{label}</Text>
      <Text style={[styles.breakdownValue, highlight && { color: "#14532d" }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bgApp },
  rootRow: { flex: 1, flexDirection: "row" },
  mainCol: { flex: 1 },
  content: { paddingHorizontal: 12, paddingVertical: 12, paddingBottom: 32, gap: 12 },
  eyebrow: { color: "rgba(255,255,255,0.78)", fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: 4 },
  heroSub: { color: "rgba(255,255,255,0.86)", fontSize: 12, lineHeight: 18, marginTop: 6 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: 14 },
  statLabel: { fontSize: 11, fontWeight: "700", color: Colors.textMuted },
  statValue: { fontSize: 20, fontWeight: "800", color: Colors.textPrimary, marginTop: 4 },
  card: { borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary },
  payslipRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12 },
  payPeriod: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  payDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  netBadge: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  netBadgeText: { fontSize: 11, fontWeight: "700", color: Colors.textSecondary },
  viewBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  viewBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  breakdownGrid: { gap: 8 },
  breakdownItem: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, padding: 12, backgroundColor: Colors.bgMuted },
  breakdownHighlight: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  breakdownLabel: { fontSize: 11, color: Colors.textMuted, fontWeight: "600" },
  breakdownValue: { fontSize: 14, fontWeight: "800", color: Colors.textPrimary, marginTop: 2 },
  emptyText: { color: Colors.textMuted, fontSize: 13, lineHeight: 20 },
});