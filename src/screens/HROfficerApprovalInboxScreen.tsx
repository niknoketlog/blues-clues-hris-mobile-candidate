import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, View, Pressable, Modal, useWindowDimensions,
} from "react-native";
import { Sidebar } from "../components/Sidebar";
import { MobileRoleMenu } from "../components/MobileRoleMenu";
import { Header } from "../components/Header";
import { GradientHero } from "../components/GradientHero";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

type RequestType = "leave" | "profile";
type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type InboxRow = {
  id: string;
  type: RequestType;
  employeeName: string;
  employeeId: string;
  summary: string;
  submittedAt: string;
  status: RequestStatus;
  reason?: string;
  notes?: string;
};

const MOCK_ROWS: InboxRow[] = [
  { id: "1", type: "leave", employeeName: "Maria Santos", employeeId: "EMP-001", summary: "Vacation Leave - Family trip", submittedAt: "2025-06-10T09:00:00", status: "PENDING", reason: "Vacation Leave", notes: "Family trip to Batangas" },
  { id: "2", type: "profile", employeeName: "Juan dela Cruz", employeeId: "EMP-002", summary: "Legal Name change request", submittedAt: "2025-06-09T14:30:00", status: "PENDING", reason: "Marriage" },
  { id: "3", type: "leave", employeeName: "Ana Reyes", employeeId: "EMP-003", summary: "Sick Leave - Fever", submittedAt: "2025-06-08T08:00:00", status: "PENDING", reason: "Sick Leave", notes: "Fever and flu" },
];

function formatDateTime(ts: string) {
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export const HROfficerApprovalInboxScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const [rows, setRows] = useState<InboxRow[]>(MOCK_ROWS);
  const [selectedRow, setSelectedRow] = useState<InboxRow | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "leave" | "profile">("all");

  const handleApprove = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedRow(null);
  };

  const handleReject = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedRow(null);
  };

  const filteredRows = rows.filter((r) => activeTab === "all" || r.type === activeTab);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.rootRow}>
        {!isMobile && (
          <Sidebar role="hr" userName={session.name} email={session.email} activeScreen="Approvals" navigation={navigation} />
        )}
        <View style={styles.mainCol}>
          {isMobile ? (
            <MobileRoleMenu role="hr" userName={session.name} email={session.email} activeScreen="Approvals" navigation={navigation} />
          ) : (
            <Header role="hr" userName={session.name} />
          )}

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <GradientHero style={{ marginBottom: 0 }}>
              <Text style={styles.eyebrow}>HR Operations</Text>
              <Text style={styles.heroTitle}>Approval Inbox</Text>
              <Text style={styles.heroSub}>Review pending leave and profile change requests.</Text>
            </GradientHero>

            {/* Tabs */}
            <View style={styles.tabs}>
              {(["all", "leave", "profile"] as const).map((tab) => (
                <Pressable
                  key={tab}
                  style={[styles.tab, activeTab === tab && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Inbox Rows */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pending Queue ({filteredRows.length})</Text>
              {filteredRows.length === 0 ? (
                <Text style={styles.emptyText}>No pending requests.</Text>
              ) : (
                filteredRows.map((row) => (
                  <View key={row.id} style={styles.inboxRow}>
                    <View style={styles.inboxTop}>
                      <View style={styles.inboxInfo}>
                        <Text style={styles.empName}>{row.employeeName}</Text>
                        <Text style={styles.empId}>{row.employeeId}</Text>
                        <Text style={styles.submittedAt}>Submitted {formatDateTime(row.submittedAt)}</Text>
                      </View>
                      <View style={styles.badges}>
                        <View style={[styles.typeBadge, row.type === "leave" ? styles.typeBadgeLeave : styles.typeBadgeProfile]}>
                          <Text style={styles.typeBadgeText}>{row.type === "leave" ? "Leave" : "Profile"}</Text>
                        </View>
                        <View style={styles.pendingBadge}>
                          <Text style={styles.pendingBadgeText}>Pending</Text>
                        </View>
                      </View>
                    </View>

                    <Text style={styles.summary}>{row.summary}</Text>

                    <View style={styles.actionRow}>
                      <Pressable style={styles.outlineBtn} onPress={() => setSelectedRow(row)}>
                        <Text style={styles.outlineBtnText}>View Details</Text>
                      </Pressable>
                      <Pressable style={styles.approveBtn} onPress={() => handleApprove(row.id)}>
                        <Text style={styles.approveBtnText}>✓ Approve</Text>
                      </Pressable>
                      <Pressable style={styles.rejectBtn} onPress={() => handleReject(row.id)}>
                        <Text style={styles.rejectBtnText}>✕ Reject</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Detail Modal */}
      <Modal visible={!!selectedRow} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{selectedRow?.type === "leave" ? "Leave Request Details" : "Profile Change Details"}</Text>

            <View style={styles.detailRows}>
              <DetailRow label="Employee" value={selectedRow?.employeeName ?? ""} />
              <DetailRow label="Employee ID" value={selectedRow?.employeeId ?? ""} />
              <DetailRow label="Submitted" value={selectedRow ? formatDateTime(selectedRow.submittedAt) : ""} />
              <DetailRow label="Reason" value={selectedRow?.reason ?? "—"} />
              {selectedRow?.notes ? <DetailRow label="Notes" value={selectedRow.notes} /> : null}
            </View>

            <View style={styles.modalActions}>
              <Pressable style={styles.approveBtn} onPress={() => selectedRow && handleApprove(selectedRow.id)}>
                <Text style={styles.approveBtnText}>✓ Approve</Text>
              </Pressable>
              <Pressable style={styles.rejectBtn} onPress={() => selectedRow && handleReject(selectedRow.id)}>
                <Text style={styles.rejectBtnText}>✕ Reject</Text>
              </Pressable>
            </View>

            <Pressable style={styles.cancelBtn} onPress={() => setSelectedRow(null)}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
  tabs: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 9, alignItems: "center", backgroundColor: Colors.bgCard },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontSize: 12, fontWeight: "700", color: Colors.textMuted },
  tabTextActive: { color: "#fff" },
  card: { borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  inboxRow: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12, gap: 8 },
  inboxTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  inboxInfo: { flex: 1 },
  empName: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  empId: { fontSize: 11, color: Colors.textMuted },
  submittedAt: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  badges: { gap: 4, alignItems: "flex-end" },
  typeBadge: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typeBadgeLeave: { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
  typeBadgeProfile: { backgroundColor: "#f5f3ff", borderColor: "#ddd6fe" },
  typeBadgeText: { fontSize: 10, fontWeight: "800", color: Colors.textSecondary },
  pendingBadge: { backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  pendingBadgeText: { fontSize: 10, fontWeight: "800", color: "#b45309" },
  summary: { fontSize: 13, color: Colors.textSecondary },
  actionRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  outlineBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  outlineBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "700" },
  approveBtn: { backgroundColor: "#16a34a", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  approveBtnText: { color: "#fff", fontSize: 12, fontWeight: "800" },
  rejectBtn: { borderWidth: 1, borderColor: "#dc2626", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  rejectBtnText: { color: "#dc2626", fontSize: 12, fontWeight: "800" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  modal: { width: "100%", backgroundColor: Colors.bgCard, borderRadius: 20, padding: 24, gap: 12 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  detailRows: { gap: 8 },
  detailRow: { flexDirection: "row", gap: 6 },
  detailLabel: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  detailValue: { fontSize: 13, color: Colors.textSecondary, flex: 1 },
  modalActions: { flexDirection: "row", gap: 8 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
});