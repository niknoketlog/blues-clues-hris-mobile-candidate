import React from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

const CHECKLIST = [
  { title: "Upload Identification Documents", status: "Pending", locked: false },
  { title: "Review Employee Handbook",        status: "Pending", locked: false },
  { title: "Complete Tax Forms",              status: "Pending", locked: false },
  { title: "Set Up Direct Deposit",           status: "Pending", locked: false },
  { title: "IT Security Training",            status: "Locked",  locked: true  },
];

export const EmployeeDashboardScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;

  return (
    <SafeAreaView style={{ backgroundColor: Colors.bgApp }} className="flex-1">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 flex-row">
        <Sidebar role="employee" userName={session.name} activeScreen="Dashboard" navigation={navigation} />
        <View className="flex-1">
          <Header role="employee" userName={session.name} />
          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

            {/* Welcome Banner */}
            <View style={{ backgroundColor: Colors.primary }} className="rounded-2xl p-6 mb-4">
              <Text className="text-white text-2xl font-bold">Welcome, {session.name}!</Text>
              <Text className="text-white/80 text-sm mt-2 leading-relaxed">
                We're excited to have you on board. Here's your profile and onboarding progress.
              </Text>
            </View>

            {/* Profile Card */}
            <View className="rounded-2xl bg-white p-4 shadow-sm mb-4">
              <Text style={{ color: Colors.textPrimary }} className="font-bold text-base mb-4">Profile Details</Text>
              {[
                { label: "FULL NAME",    value: session.name     },
                { label: "ROLE",         value: "Internal Staff" },
                { label: "MEMBER SINCE", value: "February 2026"  },
              ].map((field) => (
                <View key={field.label} style={{ borderColor: Colors.border, backgroundColor: Colors.bgMuted }}
                  className="rounded-xl border px-4 py-3 mb-2">
                  <Text style={{ color: Colors.textPlaceholder }} className="text-[9px] font-bold uppercase tracking-widest mb-1">
                    {field.label}
                  </Text>
                  <Text style={{ color: Colors.textPrimary }} className="font-semibold">{field.value}</Text>
                </View>
              ))}
            </View>

            {/* Onboarding Checklist */}
            <View className="rounded-2xl bg-white p-4 shadow-sm mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text style={{ color: Colors.textPrimary }} className="font-bold text-base">Onboarding Progress</Text>
                <View style={{ backgroundColor: Colors.primaryLight }} className="rounded-full px-3 py-1">
                  <Text style={{ color: Colors.primary }} className="text-xs font-bold">0% Complete</Text>
                </View>
              </View>
              <View style={{ backgroundColor: Colors.border }} className="h-2 rounded-full overflow-hidden mb-4">
                <View style={{ backgroundColor: Colors.primary, width: "5%" }} className="h-full rounded-full" />
              </View>
              {CHECKLIST.map((item, idx) => (
                <View key={idx}
                  style={{ borderColor: Colors.border, opacity: item.locked ? 0.5 : 1,
                    backgroundColor: item.locked ? Colors.bgMuted : Colors.bgCard }}
                  className="flex-row items-center justify-between rounded-xl border p-4 mb-2"
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <View style={{ backgroundColor: item.locked ? Colors.bgSubtle : Colors.primaryLight }}
                      className="h-8 w-8 rounded-lg items-center justify-center mr-3">
                      <Text>{item.locked ? "🔒" : "📄"}</Text>
                    </View>
                    <View>
                      <Text style={{ color: item.locked ? Colors.textPlaceholder : Colors.textPrimary }}
                        className="font-semibold text-sm">{item.title}</Text>
                      <Text style={{ color: Colors.textPlaceholder }} className="text-[10px] uppercase font-medium">Requirement</Text>
                    </View>
                  </View>
                  <View style={{
                    backgroundColor: item.locked ? Colors.bgSubtle : Colors.warningLight,
                    borderColor: item.locked ? "transparent" : Colors.warningBorder,
                  }} className="px-3 py-1 rounded-lg border">
                    <Text style={{ color: item.locked ? Colors.textPlaceholder : Colors.warningText }}
                      className="text-[10px] font-bold uppercase">{item.status}</Text>
                  </View>
                </View>
              ))}
            </View>

          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};
