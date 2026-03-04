import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar, TextInput } from "react-native";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { MetricCard } from "../components/MetricCard";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

const TEAM = [
  { name: "Alex Johnson",  role: "Senior Developer",   status: "Online", performance: 95  },
  { name: "Maria Garcia",  role: "Product Designer",   status: "Online", performance: 88  },
  { name: "James Wilson",  role: "QA Engineer",        status: "Online", performance: 100 },
  { name: "Sarah Lee",     role: "Frontend Developer", status: "Online", performance: 40  },
  { name: "Michael Brown", role: "Backend Engineer",   status: "Away",   performance: 75  },
  { name: "Kevin Adams",   role: "UI Intern",          status: "Online", performance: 20  },
];

export const ManagerDashboardScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TEAM.filter((m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
  }, [search]);

  return (
    <SafeAreaView style={{ backgroundColor: Colors.bgApp }} className="flex-1">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 flex-row">
        <Sidebar role="manager" userName={session.name} activeScreen="Dashboard" navigation={navigation} />
        <View className="flex-1">
          <Header role="manager" userName={session.name} />
          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

            <View className="flex-row gap-3 mb-4">
              <MetricCard label="Team Size"        value="12" sub="Direct Reports"     trend="Stable"   />
              <MetricCard label="Pending Requests" value="05" sub="Time-off approvals" trend="3 Urgent" alert />
            </View>
            <View className="mb-4">
              <MetricCard label="Approvals Needed" value="02" sub="Performance reviews" trend="Pending" />
            </View>

            <View className="rounded-2xl bg-white shadow-sm mb-6 overflow-hidden">
              <View style={{ backgroundColor: Colors.bgMuted, borderBottomColor: Colors.border }} className="px-4 pt-4 pb-3 border-b">
                <Text style={{ color: Colors.textPrimary }} className="font-bold text-base">Direct Reports</Text>
                <Text style={{ color: Colors.textMuted }} className="text-xs mt-0.5">Monitor team status and performance</Text>
                <View style={{ borderColor: Colors.border }} className="mt-3 flex-row items-center rounded-xl border bg-white px-3 py-2.5">
                  <Text style={{ color: Colors.textPlaceholder }} className="mr-2">🔍</Text>
                  <TextInput value={search} onChangeText={setSearch} placeholder="Search team..."
                    placeholderTextColor={Colors.textPlaceholder} style={{ color: Colors.textPrimary }}
                    className="flex-1 text-xs" />
                </View>
              </View>

              <View style={{ backgroundColor: Colors.bgSubtle, borderBottomColor: Colors.border }} className="flex-row px-4 py-2 border-b">
                <Text style={{ color: Colors.textPlaceholder }} className="flex-1 text-[9px] font-bold uppercase tracking-widest">Member</Text>
                <Text style={{ color: Colors.textPlaceholder }} className="w-24 text-[9px] font-bold uppercase tracking-widest">Performance</Text>
              </View>

              {filtered.map((row, i) => (
                <View key={i} style={{ borderBottomColor: Colors.bgSubtle }} className="flex-row items-center px-4 py-3 border-b">
                  <View className="flex-1 flex-row items-center">
                    <View style={{ backgroundColor: Colors.primaryLight, borderColor: Colors.primaryBorder }}
                      className="h-9 w-9 rounded-full items-center justify-center mr-3 border">
                      <Text style={{ color: Colors.primary }} className="font-bold text-sm">{row.name.charAt(0)}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: Colors.textPrimary }} className="font-semibold text-sm">{row.name}</Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <View style={{ backgroundColor: row.status === "Online" ? Colors.success : Colors.warning }}
                          className="h-1.5 w-1.5 rounded-full" />
                        <Text style={{ color: Colors.textPlaceholder }} className="text-[10px] uppercase font-medium">{row.role}</Text>
                      </View>
                    </View>
                  </View>
                  <View className="w-24">
                    <View className="flex-row justify-between mb-1">
                      <Text style={{ color: row.status === "Online" ? Colors.successText : Colors.warningText }}
                        className="text-[9px] font-bold uppercase">{row.status}</Text>
                      <Text style={{ color: Colors.textPlaceholder }} className="text-[9px]">{row.performance}%</Text>
                    </View>
                    <View style={{ backgroundColor: Colors.border }} className="h-1.5 rounded-full overflow-hidden">
                      <View style={{
                        backgroundColor: row.performance === 100 ? Colors.success : Colors.primary,
                        width: `${row.performance}%`
                      }} className="h-full rounded-full" />
                    </View>
                  </View>
                </View>
              ))}

              {filtered.length === 0 && (
                <View className="px-4 py-8 items-center">
                  <Text style={{ color: Colors.textPlaceholder }} className="text-sm">No results found.</Text>
                </View>
              )}
              <View style={{ backgroundColor: Colors.bgMuted }} className="px-4 py-3">
                <Text style={{ color: Colors.textPlaceholder }} className="text-[10px] font-bold uppercase tracking-widest">
                  Showing {filtered.length} of {TEAM.length} members
                </Text>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};
