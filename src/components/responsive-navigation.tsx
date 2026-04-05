import React, { useEffect, useState } from "react";
import { Dimensions } from "react-native";
import BottomNavigation from "./bottom-navigation";
import SideNavigation from "./side-navigation";

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface ResponsiveNavigationProps {
  items: NavItem[];
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout?: () => void;
  userName?: string;
}

export default function ResponsiveNavigation({
  items,
  activeRoute,
  onNavigate,
  onLogout,
  userName,
}: ResponsiveNavigationProps) {
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    const handleDimensionChange = () => {
      const { width } = Dimensions.get("window");
      setIsWeb(width > 768);
    };

    handleDimensionChange();
    const subscription = Dimensions.addEventListener(
      "change",
      handleDimensionChange,
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleNavigate = (route: string) => {
    onNavigate(route);
  };

  if (isWeb) {
    return (
      <SideNavigation
        items={items}
        activeRoute={activeRoute}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        userName={userName}
      />
    );
  }

  return (
    <BottomNavigation
      items={items}
      activeRoute={activeRoute}
      onNavigate={handleNavigate}
      onLogout={onLogout}
    />
  );
}
