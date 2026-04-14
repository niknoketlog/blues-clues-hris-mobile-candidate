import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Modal,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Sidebar } from "../components/Sidebar";
import { MobileRoleMenu } from "../components/MobileRoleMenu";
import { Header } from "../components/Header";
import { GradientHero } from "../components/GradientHero";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

type PendingSection = "legal-name" | "bank" | null;

export const EmployeeProfileScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;
  const { width } = useWindowDimensions();
  const isMobile = width < 900;

  // Legal name
  const [legalName, setLegalName] = useState({ first: "", middle: "", last: "" });
  const [pendingSection, setPendingSection] = useState<PendingSection>(null);

  // Contact & address
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState({
    phone: "",
    personalEmail: "",
    address: "",
    dob: "",
    placeOfBirth: "",
    nationality: "",
    civilStatus: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelationship: "",
  });
  const [draft, setDraft] = useState({ ...contact });

  // Bank
  const [bank, setBank] = useState({ bankName: "", accountNumber: "", accountName: "" });
  const [bankDraft, setBankDraft] = useState({ ...bank });

  // Approval modal
  const [approvalModal, setApprovalModal] = useState({
    visible: false,
    section: "" as "legal-name" | "bank",
    label: "",
    newValue: "",
  });
  const [approvalReason, setApprovalReason] = useState("");
  const [approvalSubmitting, setApprovalSubmitting] = useState(false);

  const handleSaveContact = async () => {
    setSaving(true);
    setTimeout(() => {
      setContact(draft);
      setEditing(false);
      setSaving(false);
    }, 800);
  };

  const handleApprovalSubmit = async () => {
    if (!approvalReason.trim()) return;
    setApprovalSubmitting(true);
    setTimeout(() => {
      setPendingSection(approvalModal.section);
      setApprovalModal({ ...approvalModal, visible: false });
      setApprovalReason("");
      setApprovalSubmitting(false);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.rootRow}>
        {!isMobile && (
          <Sidebar
            role="employee"
            userName={session.name}
            email={session.email}
            activeScreen="Profile"
            navigation={navigation}
          />
        )}
        <View style={styles.mainCol}>
          {isMobile ? (
            <MobileRoleMenu
              role="employee"
              userName={session.name}
              email={session.email}
              activeScreen="Profile"
              navigation={navigation}
            />
          ) : (
            <Header role="employee" userName={session.name} />
          )}

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <GradientHero style={{ marginBottom: 0 }}>
              <Text style={styles.eyebrow}>Employee Portal</Text>
              <Text style={styles.heroTitle}>My Profile</Text>
              <Text style={styles.heroSub}>
                Manage your personal information, contact details, and account settings.
              </Text>
            </GradientHero>

            {/* ── Personal Information ── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Information</Text>
                {pendingSection !== "legal-name" && (
                  <Pressable
                    style={styles.outlineBtn}
                    onPress={() =>
                      setApprovalModal({
                        visible: true,
                        section: "legal-name",
                        label: "Legal Name",
                        newValue: [legalName.first, legalName.middle, legalName.last]
                          .filter(Boolean)
                          .join(" "),
                      })
                    }
                  >
                    <Text style={styles.outlineBtnText}>Request Change</Text>
                  </Pressable>
                )}
              </View>

              {pendingSection === "legal-name" && (
                <View style={styles.pendingBanner}>
                  <Text style={styles.pendingText}>
                    ⏳ Awaiting HR Approval — your request is pending review.
                  </Text>
                </View>
              )}

              <View style={styles.fieldRow}>
                <FieldBlock label="First Name" permType="approval">
                  <TextInput
                    style={[styles.input, pendingSection === "legal-name" && styles.inputDisabled]}
                    value={legalName.first}
                    onChangeText={(t) => setLegalName({ ...legalName, first: t })}
                    placeholder="First name"
                    placeholderTextColor={Colors.textMuted}
                    editable={pendingSection !== "legal-name"}
                  />
                </FieldBlock>
                <FieldBlock label="Middle Name" permType="approval">
                  <TextInput
                    style={[styles.input, pendingSection === "legal-name" && styles.inputDisabled]}
                    value={legalName.middle}
                    onChangeText={(t) => setLegalName({ ...legalName, middle: t })}
                    placeholder="Middle name"
                    placeholderTextColor={Colors.textMuted}
                    editable={pendingSection !== "legal-name"}
                  />
                </FieldBlock>
                <FieldBlock label="Last Name" permType="approval">
                  <TextInput
                    style={[styles.input, pendingSection === "legal-name" && styles.inputDisabled]}
                    value={legalName.last}
                    onChangeText={(t) => setLegalName({ ...legalName, last: t })}
                    placeholder="Last name"
                    placeholderTextColor={Colors.textMuted}
                    editable={pendingSection !== "legal-name"}
                  />
                </FieldBlock>
              </View>

              <View style={styles.fieldRow}>
                <FieldBlock label="Work Email" permType="system">
                  <TextInput style={[styles.input, styles.inputDisabled]} value={session.email} editable={false} />
                </FieldBlock>
                <FieldBlock label="Role" permType="system">
                  <TextInput style={[styles.input, styles.inputDisabled]} value={session.role} editable={false} />
                </FieldBlock>
              </View>
            </View>

            {/* ── Contact & Address ── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Contact & Address</Text>
                {editing ? (
                  <View style={styles.rowGap}>
                    <Pressable
                      style={[styles.outlineBtn, saving && { opacity: 0.6 }]}
                      onPress={handleSaveContact}
                      disabled={saving}
                    >
                      {saving ? (
                        <ActivityIndicator size="small" color={Colors.primary} />
                      ) : (
                        <Text style={styles.outlineBtnText}>Save</Text>
                      )}
                    </Pressable>
                    <Pressable style={styles.outlineBtn} onPress={() => { setDraft(contact); setEditing(false); }}>
                      <Text style={styles.outlineBtnText}>Cancel</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable style={styles.outlineBtn} onPress={() => setEditing(true)}>
                    <Text style={styles.outlineBtnText}>Edit</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.fieldRow}>
                <FieldBlock label="Phone Number" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.phone}
                    onChangeText={(t) => setDraft({ ...draft, phone: t })}
                    placeholder="+63 900 000 0000"
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                    keyboardType="phone-pad"
                  />
                </FieldBlock>
                <FieldBlock label="Personal Email" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.personalEmail}
                    onChangeText={(t) => setDraft({ ...draft, personalEmail: t })}
                    placeholder="personal@email.com"
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                    keyboardType="email-address"
                  />
                </FieldBlock>
              </View>

              <View style={styles.fieldRow}>
                <FieldBlock label="Date of Birth" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.dob}
                    onChangeText={(t) => setDraft({ ...draft, dob: t })}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                  />
                </FieldBlock>
                <FieldBlock label="Place of Birth" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.placeOfBirth}
                    onChangeText={(t) => setDraft({ ...draft, placeOfBirth: t })}
                    placeholder="City, Province"
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                  />
                </FieldBlock>
              </View>

              <View style={styles.fieldRow}>
                <FieldBlock label="Nationality" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.nationality}
                    onChangeText={(t) => setDraft({ ...draft, nationality: t })}
                    placeholder="e.g. Filipino"
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                  />
                </FieldBlock>
                <FieldBlock label="Civil Status" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.civilStatus}
                    onChangeText={(t) => setDraft({ ...draft, civilStatus: t })}
                    placeholder="Single / Married / etc."
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                  />
                </FieldBlock>
              </View>

              <FieldBlock label="Complete Address" permType="self">
                <TextInput
                  style={[styles.input, styles.textArea, !editing && styles.inputDisabled]}
                  value={draft.address}
                  onChangeText={(t) => setDraft({ ...draft, address: t })}
                  placeholder="Street, Barangay, City, Province, ZIP"
                  placeholderTextColor={Colors.textMuted}
                  editable={editing}
                  multiline
                  numberOfLines={3}
                />
              </FieldBlock>
            </View>

            {/* ── Emergency Contact ── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Emergency Contact</Text>
                {!editing && (
                  <Pressable style={styles.outlineBtn} onPress={() => setEditing(true)}>
                    <Text style={styles.outlineBtnText}>Edit</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.fieldRow}>
                <FieldBlock label="Contact Name" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.emergencyName}
                    onChangeText={(t) => setDraft({ ...draft, emergencyName: t })}
                    placeholder="Full name"
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                  />
                </FieldBlock>
                <FieldBlock label="Relationship" permType="self">
                  <TextInput
                    style={[styles.input, !editing && styles.inputDisabled]}
                    value={draft.emergencyRelationship}
                    onChangeText={(t) => setDraft({ ...draft, emergencyRelationship: t })}
                    placeholder="e.g. Spouse, Parent"
                    placeholderTextColor={Colors.textMuted}
                    editable={editing}
                  />
                </FieldBlock>
              </View>

              <FieldBlock label="Contact Phone" permType="self">
                <TextInput
                  style={[styles.input, !editing && styles.inputDisabled]}
                  value={draft.emergencyPhone}
                  onChangeText={(t) => setDraft({ ...draft, emergencyPhone: t })}
                  placeholder="+63 900 000 0000"
                  placeholderTextColor={Colors.textMuted}
                  editable={editing}
                  keyboardType="phone-pad"
                />
              </FieldBlock>
            </View>

            {/* ── Bank Account ── */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Bank Account</Text>
                {pendingSection !== "bank" && (
                  <Pressable
                    style={styles.outlineBtn}
                    onPress={() =>
                      setApprovalModal({
                        visible: true,
                        section: "bank",
                        label: "Bank Account",
                        newValue: `${bankDraft.bankName} — ${bankDraft.accountNumber}`,
                      })
                    }
                  >
                    <Text style={styles.outlineBtnText}>Request Change</Text>
                  </Pressable>
                )}
              </View>

              {pendingSection === "bank" && (
                <View style={styles.pendingBanner}>
                  <Text style={styles.pendingText}>
                    ⏳ Awaiting HR Approval — your request is pending review.
                  </Text>
                </View>
              )}

              <View style={styles.fieldRow}>
                <FieldBlock label="Bank Name" permType="approval">
                  <TextInput
                    style={[styles.input, pendingSection === "bank" && styles.inputDisabled]}
                    value={bankDraft.bankName}
                    onChangeText={(t) => setBankDraft({ ...bankDraft, bankName: t })}
                    placeholder="e.g. BDO"
                    placeholderTextColor={Colors.textMuted}
                    editable={pendingSection !== "bank"}
                  />
                </FieldBlock>
                <FieldBlock label="Account Number" permType="approval">
                  <TextInput
                    style={[styles.input, pendingSection === "bank" && styles.inputDisabled]}
                    value={bankDraft.accountNumber}
                    onChangeText={(t) => setBankDraft({ ...bankDraft, accountNumber: t })}
                    placeholder="00000-0000000-0"
                    placeholderTextColor={Colors.textMuted}
                    editable={pendingSection !== "bank"}
                    keyboardType="numeric"
                  />
                </FieldBlock>
              </View>

              <FieldBlock label="Account Name" permType="approval">
                <TextInput
                  style={[styles.input, pendingSection === "bank" && styles.inputDisabled]}
                  value={bankDraft.accountName}
                  onChangeText={(t) => setBankDraft({ ...bankDraft, accountName: t })}
                  placeholder="Full name on account"
                  placeholderTextColor={Colors.textMuted}
                  editable={pendingSection !== "bank"}
                />
              </FieldBlock>
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ── Approval Modal ── */}
      <Modal visible={approvalModal.visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Request Changes — {approvalModal.label}</Text>

            <Text style={styles.fieldLabel}>New Value</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={approvalModal.newValue}
              editable={false}
            />

            <Text style={styles.fieldLabel}>Reason *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={approvalReason}
              onChangeText={setApprovalReason}
              placeholder="Explain why you need this change..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={3}
            />

            <Pressable
              style={[styles.primaryBtn, approvalSubmitting && { opacity: 0.6 }]}
              onPress={handleApprovalSubmit}
              disabled={approvalSubmitting}
            >
              {approvalSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Submit Request</Text>
              )}
            </Pressable>

            <Pressable
              style={styles.cancelBtn}
              onPress={() => { setApprovalModal({ ...approvalModal, visible: false }); setApprovalReason(""); }}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ── Helper Components ──────────────────────────────────────────────────────────

const PERM_COLORS = {
  self: { bg: "#f0fdf4", text: "#15803d", border: "#bbf7d0" },
  approval: { bg: "#fffbeb", text: "#b45309", border: "#fde68a" },
  system: { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" },
  immutable: { bg: "#f1f5f9", text: "#94a3b8", border: "#e2e8f0" },
};

const PERM_LABELS = {
  self: "Self-service",
  approval: "Requires HR Approval",
  system: "System-managed",
  immutable: "Immutable",
};

function FieldBlock({
  label,
  permType,
  children,
}: {
  label: string;
  permType: "self" | "approval" | "system" | "immutable";
  children: React.ReactNode;
}) {
  const colors = PERM_COLORS[permType];
  return (
    <View style={styles.fieldBlock}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabelText}>{label}</Text>
        <View style={[styles.permBadge, { backgroundColor: colors.bg, borderColor: colors.border }]}>
          <Text style={[styles.permBadgeText, { color: colors.text }]}>{PERM_LABELS[permType]}</Text>
        </View>
      </View>
      {children}
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
  card: { borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard, paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  cardTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: "800" },
  rowGap: { flexDirection: "row", gap: 8 },
  outlineBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  outlineBtnText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "700" },
  fieldRow: { gap: 10 },
  fieldBlock: { gap: 6 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  fieldLabelText: { fontSize: 10, fontWeight: "800", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  permBadge: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2 },
  permBadgeText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: Colors.textPrimary, backgroundColor: "#fff" },
  inputDisabled: { backgroundColor: Colors.bgMuted, color: Colors.textMuted },
  textArea: { minHeight: 72, textAlignVertical: "top" },
  pendingBanner: { backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  pendingText: { color: "#b45309", fontSize: 13, fontWeight: "600" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  modal: { width: "100%", backgroundColor: Colors.bgCard, borderRadius: 20, padding: 24, gap: 10 },
  modalTitle: { fontSize: 16, fontWeight: "800", color: Colors.textPrimary },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: Colors.textMuted, textTransform: "uppercase", letterSpacing: 0.8 },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  cancelBtn: { alignItems: "center", paddingVertical: 8 },
  cancelBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: "600" },
});