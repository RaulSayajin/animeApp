import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface BottomNavigationProps {
  items: NavItem[];
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
}

export default function BottomNavigation({
  items,
  activeRoute,
  onNavigate,
  onLogout,
}: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
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
          <Pressable style={styles.navItem} onPress={onLogout}>
            <Text style={styles.icon}>🚪</Text>
            <Text
              style={[styles.label, { color: "#f87171" }]}
              numberOfLines={1}
            >
              Sair
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#050505",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1e",
    zIndex: 1000,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 4,
  },
  navItemActive: {
    borderTopWidth: 3,
    borderTopColor: "#eab308",
    paddingTop: 5,
  },
  icon: {
    fontSize: 24,
  },
  label: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "600",
  },
  labelActive: {
    color: "#eab308",
    fontWeight: "700",
  },
});
