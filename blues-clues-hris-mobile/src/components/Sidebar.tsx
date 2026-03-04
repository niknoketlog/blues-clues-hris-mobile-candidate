import React, { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { clearSession, UserRole } from "../services/auth";
import { MENU_CONFIG, ROLE_LABELS, APP_NAME, APP_SUBTITLE } from "../constants/config";
import { Colors } from "../constants/colors";
import { getInitial } from "../lib/utils";

type Props = {
  role: UserRole;
  userName: string;
  activeScreen: string;
  navigation: any;
};

export const Sidebar = ({ role, userName, activeScreen, navigation }: Props) => {
  const [showLogout, setShowLogout] = useState(false);
  const menu = MENU_CONFIG[role];
  const initial = getInitial(userName);

  async function confirmLogout() {
    await clearSession();
    setShowLogout(false);
    navigation.replace("Login");
  }

  return (
    <>
      <View style={{ backgroundColor: Colors.sidebarBg }} className="w-28 pt-6 flex-col">
        {/* Logo */}
        <View className="px-3">
          <Text className="text-white font-extrabold text-base leading-tight">
            {APP_NAME.split("'")[0]}'{"\n"}{APP_NAME.split("'")[1]}
          </Text>
          <Text className="text-white/60 text-[9px] font-bold tracking-widest uppercase mt-0.5">
            {APP_SUBTITLE}
          </Text>
        </View>

        {/* Main Menu */}
        <View className="mt-8 px-3">
          <Text className="text-[9px] text-white/50 font-bold tracking-widest uppercase mb-2">Main</Text>
          {menu.map((item) => {
            const isActive = activeScreen === item.name;
            return (
              <Pressable
                key={item.name}
                style={{ backgroundColor: isActive ? Colors.sidebarActive : "rgba(255,255,255,0.1)" }}
                className="mt-1 rounded-xl px-3 py-2"
              >
                <Text numberOfLines={1} className={`text-xs font-semibold ${isActive ? "text-white" : "text-white/80"}`}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Account */}
        <View className="mt-8 px-3">
          <Text className="text-[9px] text-white/50 font-bold tracking-widest uppercase mb-2">Account</Text>
          <Pressable
            className="mt-1 rounded-xl bg-white/10 px-3 py-2"
            onPress={() => setShowLogout(true)}
          >
            <Text numberOfLines={1} className="text-white text-xs font-semibold">Sign Out</Text>
          </Pressable>
        </View>

        {/* Profile Block */}
        <View className="mt-auto px-3 pb-6">
          <View className="rounded-xl bg-black/20 px-3 py-3 flex-row items-center gap-2">
            <View className="h-7 w-7 rounded-full bg-white/20 items-center justify-center">
              <Text className="text-white font-bold text-xs">{initial}</Text>
            </View>
            <View className="flex-1">
              <Text numberOfLines={1} className="text-white text-xs font-bold">{userName}</Text>
              <Text numberOfLines={1} className="text-white/50 text-[9px] uppercase tracking-widest mt-0.5">
                {ROLE_LABELS[role]}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Logout Modal */}
      <Modal transparent visible={showLogout} animationType="fade">
        <View className="flex-1 bg-black/40 items-center justify-center px-6">
          <View className="w-full max-w-sm rounded-2xl bg-white p-5">
            <View className="flex-row items-start">
              <View style={{ backgroundColor: Colors.dangerLight }} className="h-12 w-12 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl">⚠️</Text>
              </View>
              <View className="flex-1">
                <Text style={{ color: Colors.textPrimary }} className="text-lg font-bold">Confirm Logout</Text>
                <Text style={{ color: Colors.textMuted }} className="mt-2 text-sm">
                  Are you sure you want to log out? Your session will end immediately.
                </Text>
              </View>
            </View>
            <View className="mt-5 flex-row justify-end">
              <Pressable
                style={{ backgroundColor: Colors.bgSubtle }}
                className="rounded-xl px-4 py-3 mr-3"
                onPress={() => setShowLogout(false)}
              >
                <Text style={{ color: Colors.textPrimary }} className="font-semibold">Cancel</Text>
              </Pressable>
              <Pressable
                style={{ backgroundColor: Colors.danger }}
                className="rounded-xl px-4 py-3"
                onPress={confirmLogout}
              >
                <Text className="font-semibold text-white">Log Out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
