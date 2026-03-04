import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, SafeAreaView, StatusBar } from "react-native";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { Colors } from "../constants/colors";
import { stepProgress } from "../lib/utils";
import { UserSession } from "../services/auth";

type Job = { title: string; dept: string; location: string; posted: string; type: string };

const STEPS = ["Applied", "Screening", "Interview", "Offer"];
const CURRENT_STEP = 2;

export const ApplicantDashboardScreen = ({ route, navigation }: any) => {
  const session: UserSession = route?.params?.session ?? { name: "Alex Thompson", role: "applicant", email: "applicant@company.com" };
  const [pressedIdx, setPressedIdx] = useState<number | null>(null);
  const progressPercent = stepProgress(CURRENT_STEP, STEPS.length);

  const jobs: Job[] = useMemo(() => [
    { title: "Product Manager",  dept: "Product",     location: "San Francisco, CA", posted: "2 days ago",  type: "Full-time" },
    { title: "UX/UI Designer",   dept: "Design",      location: "Remote",            posted: "5 hours ago", type: "Contract"  },
    { title: "DevOps Engineer",  dept: "Engineering", location: "New York, NY",      posted: "1 week ago",  type: "Full-time" },
    { title: "Data Scientist",   dept: "Data",        location: "Boston, MA",        posted: "3 days ago",  type: "Full-time" },
  ], []);

  return (
    <SafeAreaView style={{ backgroundColor: Colors.bgApp }} className="flex-1">
      <StatusBar barStyle="dark-content" />
      <View className="flex-1 flex-row">
        <Sidebar role="applicant" userName={session.name} activeScreen="Dashboard" navigation={navigation} />
        <View className="flex-1">
          <Header role="applicant" userName={session.name} />
          <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>

            {/* Application Status */}
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text style={{ color: Colors.primary }} className="text-[10px] font-bold uppercase tracking-widest mb-1">
                    Current Application
                  </Text>
                  <Text style={{ color: Colors.textPrimary }} className="text-base font-bold">Status: In Review</Text>
                  <Text style={{ color: Colors.textMuted }} className="mt-1 text-xs">
                    Senior Software Engineer at Tech Corp
                  </Text>
                </View>
                <View style={{ backgroundColor: Colors.primaryLight, borderColor: Colors.primaryBorder }} className="rounded-full border px-3 py-1">
                  <Text style={{ color: Colors.primary }} className="text-xs font-bold">Active Phase</Text>
                </View>
              </View>

              {/* Step Tracker */}
              <View className="mt-5">
                <View className="flex-row justify-between mb-3">
                  {STEPS.map((s, i) => (
                    <Text key={s} style={{ color: i <= CURRENT_STEP ? Colors.primary : Colors.textPlaceholder }}
                      className="text-[10px] font-bold uppercase tracking-widest">{s}</Text>
                  ))}
                </View>
                <View className="relative h-6 justify-center">
                  <View style={{ backgroundColor: Colors.border }} className="h-2 rounded-full" />
                  <View style={{ backgroundColor: Colors.primary, width: `${progressPercent}%` }}
                    className="absolute left-0 h-2 rounded-full" />
                  <View className="absolute left-0 right-0 flex-row justify-between">
                    {STEPS.map((_, i) => {
                      const isDone = i < CURRENT_STEP;
                      const isCurrent = i === CURRENT_STEP;
                      return (
                        <View key={i} style={{
                          borderColor: isDone || isCurrent ? Colors.primary : Colors.borderMuted,
                          backgroundColor: isDone ? Colors.primary : Colors.bgCard,
                        }} className="h-6 w-6 rounded-full items-center justify-center border-2">
                          <Text style={{ color: isDone ? Colors.bgCard : isCurrent ? Colors.primary : Colors.textPlaceholder }}
                            className="text-[10px] font-bold">
                            {isDone ? "✓" : i + 1}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* Available Jobs */}
            <View className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
              <Text style={{ color: Colors.textPrimary }} className="text-base font-bold">Available Positions</Text>
              <Text style={{ color: Colors.textMuted }} className="mt-1 text-xs">Discover roles that match your expertise</Text>
              <View style={{ borderColor: Colors.border, backgroundColor: Colors.bgMuted }}
                className="mt-3 rounded-xl border px-3 py-2.5">
                <Text style={{ color: Colors.textPlaceholder }} className="text-xs">Search jobs...</Text>
              </View>
              <View className="mt-4">
                {jobs.map((job, idx) => (
                  <Pressable key={job.title}
                    onPressIn={() => setPressedIdx(idx)}
                    onPressOut={() => setPressedIdx(null)}
                    style={{ borderColor: Colors.border, backgroundColor: pressedIdx === idx ? Colors.primaryLight : Colors.bgCard }}
                    className="mb-3 rounded-2xl border p-4"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text style={{ color: Colors.textPrimary }} className="font-bold">{job.title}</Text>
                        <Text style={{ color: Colors.textMuted }} className="mt-1 text-xs">
                          {job.dept} • {job.location} • {job.posted}
                        </Text>
                      </View>
                      <View className="items-end">
                        <View style={{ borderColor: Colors.border }} className="rounded-full border px-3 py-1">
                          <Text style={{ color: Colors.textSecondary }} className="text-xs">{job.type}</Text>
                        </View>
                        <View style={{ backgroundColor: Colors.primary }} className="mt-2 rounded-xl px-4 py-2">
                          <Text className="text-white text-xs font-semibold">Apply Now →</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
                <Pressable className="mt-1 py-2">
                  <Text style={{ color: Colors.primary }} className="text-center text-xs font-bold uppercase tracking-widest">
                    View all open positions
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="h-6" />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};
