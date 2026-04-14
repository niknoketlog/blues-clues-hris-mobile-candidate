import React, { useState } from "react";
import {
  SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TextInput, View, Pressable, Modal,
  ActivityIndicator, useWindowDimensions,
} from "react-native";
import { Sidebar } from "../components/Sidebar";
import { MobileRoleMenu } from "../components/MobileRoleMenu";
import { Header } from "../components/Header";
import { GradientHero } from "../components/GradientHero";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

const LEAVE_TYPES = ["Vacation Leave", "Sick Leave", "Emergency Leave", "Personal Leave", "WFH / Remote", "Other"];

type LeaveRequest = {
  id: string;
  reason: string;
  date: string;
  notes: string;
  status: "Reported" | "Approved";
};

const MOCK_BALANCES = [
  { type: "Vacation", remaining: 10, total: 15 },
  { type: "Sick", remaining: 5, total: 10 },
  { type: "Emergency", remaining: 3, total: 3 },
  { type: "Personal", remaining: 2, total: 5 },
];

const MOCK_REQUESTS: LeaveRequest[] = [
  { id: "1", reason: "Vacation Leave", date: "2025-06-01", notes: "Family trip", status: "Approved" },
  { id: "2", reason: "Sick Leave", date: "2025-05-20", notes: "Fever", status: "Reported" },
];

export const EmployeeLeaveScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveType, setLeaveType] = useState("Vacation Leave");
  const [reason, setReason] = useState("");
  const [typePickerOpen, setTypePickerOpen] = useState(false);
  const [requests, setRequests] = useState<LeaveRequest[]>(MOCK_REQUESTS);

  const handleSubmit = () => {
    if (!leaveDate || !reason.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setRequests((prev) => [
        { id: Date.now().toString(), reason: leaveType, date: leaveDate, notes: reason, status: "Reported" },
        ...prev,
      ]);
      setModalOpen(false);
      setLeaveDate("");
      setReason("");
      setSubmitting(false);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.rootRow}>
        {!isMobile && (
          <Sidebar role="employee" userName={session.name} email={session.email} activeScreen="Leave" navigation={navigation} />
        )}
        <View style={styles.mainCol}>
          {isMobile ? (
            <MobileRoleMenu role="employee" userName={session.name} email={session.email} activeScreen="Leave" navigation={navigation} />
          ) : (
            <Header role="employee" userName={session.name} />
          )}

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <GradientHero style={{ marginBottom: 0 }}>
              <Text style={styles.eyebrow}>Employee Portal</Text>
              <Text style={styles.heroTitle}>Leave Dashboard</Text>
              <Text style={styles.heroSub}>Track your leave balances and file a leave request.</Text>
            </GradientHero>

            {/* Balances */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Balances</Text>
              <Pressable style={styles.primaryBtn} onPress={() => setModalOpen(true)}>
                <Text style={styles.primaryBtnText}>+ File a Leave</Text>
              </Pressable>
            </View>

            <View style={styles.balanceGrid}>
              {MOCK_BALANCES.map((item) => (
                <View key={item.type} style={styles.balanceCard}>
                  <Text style={styles.balanceType}>{item.type}</Text>
                  <Text style={styles.balanceValue}>
                    {item.remaining}
                    <Text style={styles.balanceTotal}> / {item.total}</Text>
                  </Text>
                </View>
              ))}
            </View>

            {/* Recent Requests */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📅 Recent Leave Requests</Text>
              {requests.length === 0 ? (
                <Text style={styles.emptyText}>No leave requests yet.</Text>
              ) : (
                requests.slice(0, 10).map((req) => (
                  <View key={req.id} style={styles.requestRow}>
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestReason}>{req.reason}</Text>
                      <Text style={styles.requestDate}>{req.date}</Text>
                      {req.notes ? <Text style={styles.requestNotes}>{req.notes}</Text> : null}
                    </View>
                    <View style={[styles.statusBadge, req.status === "Approved" ? styles.statusApproved : styles.statusPending]}>
                      <Text style={styles.statusText}>{req.status}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* File Leave Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>File a Leave</Text>

            <Text style={styles.fieldLabel}>Date</Text>
            <TextInput
              style={styles.input}
              value={leaveDate}
              onChangeText={setLeaveDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Leave Type</Text>
            <Pressable style={styles.picker} onPress={() => setTypePickerOpen(!typePickerOpen)}>
              <Text style={styles.pickerText}>{leaveType}</Text>
              <Text style={styles.pickerArrow}>▾</Text>
            </Pressable>
            {typePickerOpen && (
              <View style={styles.pickerDropdown}>
                {LEAVE_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    style={styles.pickerOption}
                    onPress={() => { setLeaveType(type); setTypePickerOpen(false); }}
                  >
                    <Text style={[styles.pickerOptionText, leaveType === type && { color: Colors.primary, fontWeight: "800" }]}>
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Text style={styles.fieldLabel}>Reason</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={reason}
              onChangeText={setReason}
              placeholder="Explain your leave request"
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <Pressable
              style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
            </Pressable>

            <Pressable style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  balanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  balanceCard: { flex: 1, minWidth: "45%", borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, padding: 14 },
  balanceType: { fontSize: 13, fontWeight: "700", color: Colors.textSecondary },
  balanceValue: { fontSize: 24, fontWeight: "800", color: Colors.textPrimary, marginTop: 4 },
  balanceTotal: { fontSize: 13, color: Colors.textMuted, fontWeight: "600" },
  card: { borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 14, paddingVertical: 14, gap: 10 },
  cardTitle: { fontSize: 15, fontWeight: "800", color: Colors.textPrimary },
  emptyText: { color: Colors.textMuted, fontSize: 13 },
  requestRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 12 },
  requestInfo: { flex: 1, paddingRight: 10 },
  requestReason: { fontSize: 13, fontWeight: "700", color: Colors.textPrimary },
  requestDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  requestNotes: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  statusBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  statusApproved: { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
  statusPending: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal: { backgroundColor: Colors.bgCard, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 10 },
  modalTitle: { fontSize: 17, fontWeight: "800", color: Colors.textPrimary },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.textPrimary, backgroundColor: "#fff" },
  textArea: { minHeight: 80, textAlignVertical: "top" },
  picker: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", backgroundColor: "#fff" },
  pickerText: { fontSize: 13, color: Colors.textPrimary },
  pickerArrow: { fontSize: 13, color: Colors.textMuted },
  pickerDropdown: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, backgroundColor: "#fff", overflow: "hidden" },
  pickerOption: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.bgSubtle },
  pickerOptionText: { fontSize: 13, color: Colors.textPrimary },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
});