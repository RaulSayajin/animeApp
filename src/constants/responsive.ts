import { useEffect, useState } from "react";
import { Dimensions, StyleSheet } from "react-native";

// Breakpoints (mobile-first approach)
export const BREAKPOINTS = {
  MOBILE_SM: 320, // Small phones
  MOBILE: 480, // Standard mobile
  MOBILE_LG: 600, // Large mobile / small tablet
  TABLET: 768, // Tablet
  DESKTOP: 1024, // Desktop / iPad landscape
  DESKTOP_LG: 1280, // Large desktop
  DESKTOP_XL: 1920, // Extra large desktop
};

// Screen size utilities
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions({
        width: window.width,
        height: window.height,
      });
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const { width, height } = dimensions;

  return {
    width,
    height,
    isSmallMobile: width < BREAKPOINTS.MOBILE,
    isMobile: width < BREAKPOINTS.MOBILE_LG,
    isLargeMobile: width >= BREAKPOINTS.MOBILE_LG && width < BREAKPOINTS.TABLET,
    isTablet: width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP,
    isDesktop: width >= BREAKPOINTS.DESKTOP && width < BREAKPOINTS.DESKTOP_LG,
    isDesktopLg: width >= BREAKPOINTS.DESKTOP_LG,
    isWeb: width >= BREAKPOINTS.TABLET,
    isPortrait: height > width,
    isLandscape: width > height,
  };
};

// Typography scaling
export const getResponsiveSize = (
  mobileSm: number,
  mobile: number,
  tablet: number,
  desktop: number,
) => {
  const width = Dimensions.get("window").width;

  if (width < BREAKPOINTS.MOBILE) return mobileSm;
  if (width < BREAKPOINTS.MOBILE_LG) return mobile;
  if (width < BREAKPOINTS.DESKTOP) return tablet;
  return desktop;
};

// Spacing utilities
export const getResponsivePadding = (
  mobileSm: number,
  mobile: number,
  tablet: number,
  desktop: number = tablet,
) => {
  return getResponsiveSize(mobileSm, mobile, tablet, desktop);
};

// Grid column utilities
export const getGridColumns = (baseWidth: number = 160) => {
  const width = Dimensions.get("window").width;
  const padding = 32; // Left and right padding

  if (width < BREAKPOINTS.MOBILE) return 2;
  if (width < BREAKPOINTS.MOBILE_LG) return 2;
  if (width < BREAKPOINTS.TABLET) return 3;
  if (width < BREAKPOINTS.DESKTOP) return 4;
  if (width < BREAKPOINTS.DESKTOP_LG) return 5;
  return 6;
};

// Aspect ratio constants
export const ASPECT_RATIO = {
  POSTER: 2 / 3, // Standard movie poster
  BACKGROUND: 16 / 9, // Hero backgrounds
  SQUARE: 1 / 1, // Square images
};

// Responsive theme
export const responsiveTheme = {
  colors: {
    background: "#050505",
    surface: "#0c0c0e",
    border: "#1a1a1e",
    primary: "#eab308",
    text: "#ffffff",
    textSecondary: "#71717a",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    pill: 32,
  },
};

// Responsive font sizes
export const getResponsiveFontSize = {
  h1: () => getResponsiveSize(32, 36, 44, 52),
  h2: () => getResponsiveSize(24, 28, 32, 40),
  h3: () => getResponsiveSize(20, 22, 26, 32),
  h4: () => getResponsiveSize(16, 18, 20, 24),
  body: () => getResponsiveSize(14, 14, 15, 16),
  small: () => getResponsiveSize(12, 12, 13, 14),
  xs: () => getResponsiveSize(10, 11, 12, 12),
};

// Create responsive stylesheet with screen size support
export const createResponsiveStyles = (styles: Record<string, any>) => {
  return StyleSheet.create(styles);
};

// Common responsive widths
export const getResponsiveWidth = (percentage: number) => {
  const width = Dimensions.get("window").width;
  return (width * percentage) / 100;
};

// Movie card responsive width
export const getMovieCardWidth = () => {
  const width = Dimensions.get("window").width;

  if (width < BREAKPOINTS.MOBILE) return (width - 48) / 2;
  if (width < BREAKPOINTS.MOBILE_LG) return (width - 48) / 2;
  if (width < BREAKPOINTS.TABLET) return (width - 64) / 3;
  if (width < BREAKPOINTS.DESKTOP) return (width - 80) / 4;
  if (width < BREAKPOINTS.DESKTOP_LG) return (width - 96) / 5;
  return (width - 112) / 6;
};

// Horizontal scroll movie row width
export const getHorizontalMovieWidth = () => {
  const width = Dimensions.get("window").width;

  if (width < BREAKPOINTS.MOBILE) return 140;
  if (width < BREAKPOINTS.MOBILE_LG) return 150;
  if (width < BREAKPOINTS.TABLET) return 160;
  if (width < BREAKPOINTS.DESKTOP) return 180;
  return 200;
};

// Hero section height
export const getHeroHeight = () => {
  const { width, height } = Dimensions.get("window");
  const isPortrait = height > width;

  if (width < BREAKPOINTS.MOBILE) return 300;
  if (width < BREAKPOINTS.MOBILE_LG) return 350;
  if (width < BREAKPOINTS.TABLET) return 400;
  if (width < BREAKPOINTS.DESKTOP) return 450;
  return 500;
};

// Content padding for different screens
export const getContentPadding = () => {
  const width = Dimensions.get("window").width;

  if (width < BREAKPOINTS.MOBILE) return 12;
  if (width < BREAKPOINTS.MOBILE_LG) return 16;
  if (width < BREAKPOINTS.TABLET) return 20;
  if (width < BREAKPOINTS.DESKTOP) return 24;
  return 32;
};

// Section spacing
export const getSectionSpacing = () => {
  const width = Dimensions.get("window").width;

  if (width < BREAKPOINTS.MOBILE) return 20;
  if (width < BREAKPOINTS.MOBILE_LG) return 24;
  if (width < BREAKPOINTS.TABLET) return 28;
  if (width < BREAKPOINTS.DESKTOP) return 32;
  return 40;
};

// Bottom navigation height
export const getBottomNavHeight = () => {
  const width = Dimensions.get("window").width;

  if (width >= BREAKPOINTS.TABLET) return 0; // No bottom nav on web
  return 80; // Standard height for mobile (with safe area)
};

// Get bottom padding including nav
export const getBottomPadding = () => {
  const responsive = useResponsive();

  if (responsive.isWeb) return 0;
  return getBottomNavHeight();
};
