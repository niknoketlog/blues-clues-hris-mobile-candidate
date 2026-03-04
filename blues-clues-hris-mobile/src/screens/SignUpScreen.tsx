import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { login, saveSession, UserSession } from "../services/auth";
import { isValidEmail } from "../lib/utils";
import { Colors } from "../constants/colors";

type Mode = "signin" | "signup";

export const SignUpScreen = ({ navigation }: any) => {
  const [mode, setMode]       = useState<Mode>("signin");
  const [loading, setLoading] = useState(false);

  // Sign in fields
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [fullName, setFullName] = useState("");
  const [email2, setEmail2]     = useState("");
  const [pw1, setPw1]           = useState("");
  const [pw2, setPw2]           = useState("");

  const canSignIn = useMemo(
    () => isValidEmail(email) && password.length > 0 && !loading,
    [email, password, loading]
  );

  const canSignUp = useMemo(
    () => fullName.trim().length > 0 && isValidEmail(email2) && pw1.length > 0 && pw2.length > 0 && pw1 === pw2 && !loading,
    [fullName, email2, pw1, pw2, loading]
  );

  // Fix 2: Applicant sign-in now uses mockLogin — consistent with internal portal
  async function onSignIn() {
    setLoading(true);
    const res = await login(email, password, rememberMe);
    setLoading(false);

    if (!res.ok) {
      Alert.alert("Sign In Failed", res.error);
      return;
    }

    if (res.user.role !== "applicant") {
      Alert.alert("Wrong Portal", "Staff accounts must use the Internal Login portal.");
      return;
    }

    await saveSession(res.user, rememberMe);
    navigation.replace("ApplicantDashboard", { session: res.user });
  }

  async function onCreateAccount() {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    setLoading(false);
    Alert.alert("Account Created", "Your applicant account is now active.");
    const session: UserSession = { name: fullName.trim(), email: email2.trim(), role: "applicant" };
    await saveSession(session, rememberMe);
    navigation.replace("ApplicantDashboard", { session });
  }

  const inputStyle = { borderColor: Colors.border, color: Colors.textPrimary };

  return (
    <View style={{ backgroundColor: Colors.bgApp }} className="flex-1 px-6 justify-center">
      <View className="rounded-2xl bg-white p-6 shadow-sm">
        <Text style={{ color: Colors.textPrimary }} className="text-2xl font-bold">Applicant Portal</Text>
        <Text style={{ color: Colors.textMuted }} className="mt-1 text-sm">Start your journey with us today</Text>

        {/* Tabs */}
        <View style={{ backgroundColor: Colors.bgSubtle }} className="mt-6 flex-row rounded-xl p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              className={`flex-1 rounded-lg py-2 ${mode === m ? "bg-white" : ""}`}
              onPress={() => setMode(m)}
            >
              <Text style={{ color: mode === m ? Colors.textPrimary : Colors.textMuted }} className="text-center font-semibold">
                {m === "signin" ? "Sign In" : "Sign Up"}
              </Text>
            </Pressable>
          ))}
        </View>

        {mode === "signin" ? (
          <>
            <View className="mt-6">
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">Email</Text>
              <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
                placeholder="applicant@company.com" placeholderTextColor={Colors.textPlaceholder}
                style={inputStyle} className="mt-2 rounded-xl border bg-white px-4 py-3" />
            </View>

            <View className="mt-4">
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">Password</Text>
              <TextInput value={password} onChangeText={setPassword} secureTextEntry
                placeholder="••••••••" placeholderTextColor={Colors.textPlaceholder}
                style={inputStyle} className="mt-2 rounded-xl border bg-white px-4 py-3" />
            </View>

            <View className="mt-4 flex-row items-center justify-between">
              <Pressable className="flex-row items-center" onPress={() => setRememberMe(v => !v)}>
                <View style={{
                  backgroundColor: rememberMe ? Colors.primary : Colors.bgCard,
                  borderColor: rememberMe ? Colors.primary : Colors.textPlaceholder,
                }} className="h-5 w-5 rounded border" />
                <Text style={{ color: Colors.textSecondary }} className="ml-2 text-sm">Remember me</Text>
              </Pressable>
              {/* Fix 3: Forgot password now actually navigates */}
              <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={{ color: Colors.primary }} className="text-sm font-semibold">Forgot password?</Text>
              </Pressable>
            </View>

            <Pressable
              style={{ backgroundColor: canSignIn ? Colors.primary : Colors.primaryDisabled }}
              className="mt-6 rounded-xl px-5 py-3"
              disabled={!canSignIn} onPress={onSignIn}
            >
              <Text className="text-center font-semibold text-white">
                {loading ? "Signing in..." : "Sign In →"}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View className="mt-6">
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">Full Name</Text>
              <TextInput value={fullName} onChangeText={setFullName} placeholder="Enter name"
                placeholderTextColor={Colors.textPlaceholder} style={inputStyle}
                className="mt-2 rounded-xl border bg-white px-4 py-3" />
            </View>

            <View className="mt-4">
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">Email Address</Text>
              <TextInput value={email2} onChangeText={setEmail2} autoCapitalize="none" keyboardType="email-address"
                placeholder="Enter email" placeholderTextColor={Colors.textPlaceholder} style={inputStyle}
                className="mt-2 rounded-xl border bg-white px-4 py-3" />
            </View>

            <View className="mt-4">
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">Password</Text>
              <TextInput value={pw1} onChangeText={setPw1} secureTextEntry placeholder="••••••••"
                placeholderTextColor={Colors.textPlaceholder} style={inputStyle}
                className="mt-2 rounded-xl border bg-white px-4 py-3" />
            </View>

            <View className="mt-4">
              <Text style={{ color: Colors.textSecondary }} className="text-sm font-semibold">Confirm Password</Text>
              <TextInput value={pw2} onChangeText={setPw2} secureTextEntry placeholder="••••••••"
                placeholderTextColor={Colors.textPlaceholder} style={inputStyle}
                className="mt-2 rounded-xl border bg-white px-4 py-3" />
              {pw1 && pw2 && pw1 !== pw2 ? (
                <Text style={{ color: Colors.dangerText }} className="mt-2 text-xs">Passwords do not match.</Text>
              ) : null}
            </View>

            <Pressable
              style={{ backgroundColor: canSignUp ? Colors.primary : Colors.primaryDisabled }}
              className="mt-6 rounded-xl px-5 py-3"
              disabled={!canSignUp} onPress={onCreateAccount}
            >
              <Text className="text-center font-semibold text-white">
                {loading ? "Creating..." : "Create Account →"}
              </Text>
            </Pressable>

            <View style={{ backgroundColor: Colors.primaryLight }} className="mt-6 rounded-xl p-4">
              <Text style={{ color: Colors.primary }} className="font-bold">Did you know?</Text>
              <Text style={{ color: Colors.primary }} className="mt-1 text-xs">
                Fresh graduates can connect via the Pillars System, and Alumni can use the Alumni Portal for streamlined processing.
              </Text>
            </View>
          </>
        )}

        <View style={{ backgroundColor: Colors.border }} className="mt-6 h-[1px]" />
        <Pressable className="mt-4 items-center" onPress={() => navigation.replace("Login")}>
          <Text style={{ color: Colors.textMuted }} className="text-sm font-semibold">← Return to Employee Portal</Text>
        </Pressable>
      </View>
    </View>
  );
};
