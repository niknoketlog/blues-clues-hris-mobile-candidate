import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/colors";

interface SecurityModalProps {
  visible: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onVerified: () => void;
}

export const SecurityModal = ({
  visible,
  title = "Verify Identity",
  description = "Enter your password to continue.",
  onClose,
  onVerified,
}: SecurityModalProps) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    setError("");
    // Simulate verification — replace with real API call later
    setTimeout(() => {
      setLoading(false);
      setPassword("");
      onVerified();
    }, 800);
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              setError("");
            }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Verify</Text>
            )}
          </Pressable>

          <Pressable style={styles.cancelBtn} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modal: {
    width: "100%",
    backgroundColor: Colors.bgCard,
    borderRadius: 20,
    padding: 24,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: "#fff",
  },
  error: {
    color: "#dc2626",
    fontSize: 12,
    fontWeight: "600",
  },
  btn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  cancelBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
});