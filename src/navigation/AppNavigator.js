import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import ResponsiveNavigation from "../components/responsive-navigation";
import CadastroScreen from "../screens/cadastroScreen.js";
import ConfigScreen from "../screens/configScreen.js";
import DescobrirScreen from "../screens/descobrirScreen.js";
import DetalhesScreen from "../screens/detalhesScreen.js";
import FavoritosScreen from "../screens/favoritosScreen.js";
import HomeScreen from "../screens/homeScreen.js";
import LoginScreen from "../screens/loginScreen.js";
import { getCurrentUser, logoutUser } from "../storage";
import { NAV_ITEMS, NAVIGATION_PADDING } from "./navigationConfig";

const Stack = createNativeStackNavigator();

// Component that renders based on activeRoute
function ScreenContent({ activeRoute, currentUser, handleLogout, navigation }) {
  return (
    <>
      {activeRoute === "Home" && (
        <HomeScreen navigation={navigation} user={currentUser} />
      )}
      {activeRoute === "Descobrir" && (
        <DescobrirScreen navigation={navigation} user={currentUser} />
      )}
      {activeRoute === "Favoritos" && (
        <FavoritosScreen
          navigation={navigation}
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
      {activeRoute === "Configuracoes" && (
        <ConfigScreen
          navigation={navigation}
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
    </>
  );
}

// Main authenticated screen with navigation bar
function AppLayout({
  currentUser,
  handleLogout,
  activeRoute,
  onNavigate,
  isWeb,
  navigation,
}) {
  return (
    <View style={styles.container}>
      <ResponsiveNavigation
        items={NAV_ITEMS}
        activeRoute={activeRoute}
        onNavigate={onNavigate}
        onLogout={handleLogout}
        userName={currentUser?.name}
      />

      <View
        style={[
          styles.contentWrapper,
          isWeb ? NAVIGATION_PADDING.web : NAVIGATION_PADDING.mobile,
        ]}
      >
        <ScreenContent
          activeRoute={activeRoute}
          currentUser={currentUser}
          handleLogout={handleLogout}
          navigation={navigation}
        />
      </View>
    </View>
  );
}

function AuthedStack({
  currentUser,
  handleLogout,
  activeRoute,
  onNavigate,
  isWeb,
}) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      <Stack.Screen name="Home">
        {(props) => (
          <AppLayout
            {...props}
            currentUser={currentUser}
            handleLogout={handleLogout}
            activeRoute={activeRoute}
            onNavigate={onNavigate}
            isWeb={isWeb}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Detalhes" options={{ title: "Detalhes do Anime" }}>
        {(props) => (
          <DetalhesScreen
            {...props}
            user={currentUser}
            onLogout={handleLogout}
            onNavigate={onNavigate}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function UnauthStack({ handleAuthSuccess }) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#111827" },
        headerTintColor: "#f8fafc",
        contentStyle: { backgroundColor: "#0b1220" },
      }}
    >
      <Stack.Screen name="Login" options={{ headerShown: false }}>
        {(props) => (
          <LoginScreen {...props} onAuthSuccess={handleAuthSuccess} />
        )}
      </Stack.Screen>
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeRoute, setActiveRoute] = useState("Home");
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    async function restoreSession() {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    }

    restoreSession();
  }, []);

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

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleNavigate = (route) => {
    setActiveRoute(route);
  };

  if (!isAuthenticated) {
    return <UnauthStack handleAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <AuthedStack
      currentUser={currentUser}
      handleLogout={handleLogout}
      activeRoute={activeRoute}
      onNavigate={handleNavigate}
      isWeb={isWeb}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  contentWrapper: {
    flex: 1,
  },
});
