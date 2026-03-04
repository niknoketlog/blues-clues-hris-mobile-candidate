import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, SafeAreaView, StatusBar, TextInput } from "react-native";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { MetricCard } from "../components/MetricCard";
import { Colors } from "../constants/colors";
import { UserSession } from "../services/auth";

const PIPELINE = [
  { initials: "S", name: "Sarah Connor",  dept: "Design",          status: "In Progress", progress: 45  },
  { initials: "M", name: "Michael Chen",  dept: "Engineering",     status: "Reviewing",   progress: 80  },
  { initials: "J", name: "Jessica Day",   dept: "Marketing",       status: "Pending",     progress: 10  },
  { initials: "D", name: "David Miller",  dept: "Sales",           status: "Completed",   progress: 100 },
  { initials: "E", name: "Emily Wilson",  dept: "Human Resources", status: "In Progress", progress: 30  },
  { initials: "A", name: "Alex Thompson", dept: "Engineering",     status: "Reviewing",   progress: 70  },
];

export const HROfficerDashboardScreen = ({ route, navigation }: any) => {
  const session: UserSession = route.params.session;
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return PIPELINE.filter((e) => e.name.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q));
  }, [search]);

  return (
    <SafeAreaView style={{ backgroundColor: Colors.bgApp }} className="flex-1">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 flex-row">
        <Sidebar role="hr" userName={session.name} activeScreen="Dashboard" navigation={navigation} />
        <View className="flex-1">
          <Header role="hr" userName={session.name} />
          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

            <View className="flex-row gap-3 mb-4">
              <MetricCard label="Total Headcount" value="1,248" sub="Active Employees" trend="+12%" />
              <MetricCard label="Pending"          value="15"    sub="Action Required"  trend="Critical" alert />
            </View>
            <View className="mb-4">
              <MetricCard label="New Hires" value="28" sub="Onboarding" trend="+5" />
            </View>

            <View className="rounded-2xl bg-white shadow-sm mb-6 overflow-hidden">
              <View style={{ backgroundColor: Colors.bgMuted, borderBottomColor: Colors.border }} className="px-4 pt-4 pb-3 border-b">
                <Text style={{ color: Colors.textPrimary }} className="font-bold text-base">Onboarding Pipeline</Text>
                <Text style={{ color: Colors.textMuted }} className="text-xs mt-0.5">Monitor candidate progress and document status</Text>
                <View style={{ borderColor: Colors.border }} className="mt-3 flex-row items-center rounded-xl border bg-white px-3 py-2.5">
                  <Text style={{ color: Colors.textPlaceholder }} className="mr-2">🔍</Text>
                  <TextInput value={search} onChangeText={setSearch} placeholder="Search candidates..."
                    placeholderTextColor={Colors.textPlaceholder} style={{ color: Colors.textPrimary }}
                    className="flex-1 text-xs" />
                </View>
              </View>

              <View style={{ backgroundColor: Colors.bgSubtle, borderBottomColor: Colors.border }} className="flex-row px-4 py-2 border-b">
                <Text style={{ color: Colors.textPlaceholder }} className="flex-1 text-[9px] font-bold uppercase tracking-widest">Employee</Text>
                <Text style={{ color: Colors.textPlaceholder }} className="w-24 text-[9px] font-bold uppercase tracking-widest">Progress</Text>
              </View>

              {filtered.map((row, i) => (
                <View key={i} style={{ borderBottomColor: Colors.bgSubtle }} className="flex-row items-center px-4 py-3 border-b">
                  <View className="flex-1 flex-row items-center">
                    <View style={{ backgroundColor: Colors.primaryLight, borderColor: Colors.primaryBorder }}
                      className="h-9 w-9 rounded-full items-center justify-center mr-3 border">
                      <Text style={{ color: Colors.primary }} className="font-bold text-sm">{row.initials}</Text>
                    </View>
                    <View className="flex-1">
                      <Text style={{ color: Colors.textPrimary }} className="font-semibold text-sm">{row.name}</Text>
                      <Text style={{ color: Colors.textPlaceholder }} className="text-[10px] uppercase font-medium">{row.dept}</Text>
                    </View>
                  </View>
                  <View className="w-24">
                    <View className="flex-row justify-between mb-1">
                      <Text style={{ color: row.progress === 100 ? Colors.successText : Colors.primary }}
                        className="text-[9px] font-bold uppercase">{row.status}</Text>
                      <Text style={{ color: Colors.textPlaceholder }} className="text-[9px]">{row.progress}%</Text>
                    </View>
                    <View style={{ backgroundColor: Colors.border }} className="h-1.5 rounded-full overflow-hidden">
                      <View style={{
                        backgroundColor: row.progress === 100 ? Colors.success : Colors.primary,
                        width: `${row.progress}%`
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
                  Showing {filtered.length} of {PIPELINE.length} employees
                </Text>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};
