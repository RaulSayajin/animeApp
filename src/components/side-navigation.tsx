import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface SideNavigationProps {
  items: NavItem[];
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  userName?: string;
}

export default function SideNavigation({
  items,
  activeRoute,
  onNavigate,
  onLogout,
  userName,
}: SideNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          CINE<Text style={{ color: "#eab308" }}>REVIEW</Text>
        </Text>
      </View>

      <View style={styles.navItems}>
        {items.map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <Pressable
              key={item.route}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onNavigate(item.route)}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text
                style={[styles.label, isActive && styles.labelActive]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
        {onLogout && (
          <Pressable
            style={[styles.navItem, styles.logoutItem]}
            onPress={onLogout}
          >
            <Text style={styles.icon}>🚪</Text>
            <Text style={[styles.label, styles.logoutLabel]} numberOfLines={1}>
              Sair
            </Text>
          </Pressable>
        )}
      </View>

      {userName && (
        <View style={styles.footer}>
          <View style={styles.userInitialBadge}>
            <Text style={styles.userInitial}>{userName.charAt(0)}</Text>
          </View>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 240,
    backgroundColor: "#050505",
    borderRightWidth: 1,
    borderRightColor: "#1a1a1e",
    paddingTop: 40,
    paddingBottom: 20,
    zIndex: 1000,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 32,
    alignItems: "center",
  },
  logo: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
    fontStyle: "italic",
  },
  navItems: {
    flex: 1,
    paddingHorizontal: 8,
    gap: 8,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: "#1a1a1e",
    borderLeftWidth: 4,
    borderLeftColor: "#eab308",
    paddingLeft: 8,
  },
  icon: {
    fontSize: 20,
    width: 24,
    textAlign: "center",
  },
  label: {
    color: "#71717a",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  labelActive: {
    color: "#eab308",
    fontWeight: "700",
  },
  logoutItem: {
    marginTop: "auto",
    backgroundColor: "rgba(248, 113, 113, 0.05)",
  },
  logoutLabel: {
    color: "#f87171",
  },
  footer: {
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1e",
    paddingTop: 12,
    alignItems: "center",
    gap: 8,
  },
  userInitialBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  userInitial: {
    color: "#eab308",
    fontSize: 16,
    fontWeight: "900",
  },
  userName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 180,
  },
});
