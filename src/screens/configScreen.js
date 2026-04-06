import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getBottomNavHeight, useResponsive } from "../constants/responsive";
import { logoutUser } from "../storage";

export default function ConfigScreen({ navigation, user, onLogout }) {
  const responsive = useResponsive();

  const handleLogout = async () => {
    Alert.alert("Sair", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logoutUser();
          onLogout?.();
        },
      },
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        responsive.isWeb
          ? { paddingLeft: 240, paddingBottom: 0 }
          : { paddingLeft: 0, paddingBottom: getBottomNavHeight() },
      ]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            CONFIGUR<Text style={{ color: "#eab308" }}>AÇÕES</Text>
          </Text>
          <Text style={styles.headerSubtitle}>PREFERÊNCIAS E CONTA</Text>
        </View>

        {/* Seção de Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 SUA CONTA</Text>

          <View style={styles.accountCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatar}>{user?.nome?.charAt(0) || "U"}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user?.nome || "Sem nome"}</Text>
              <Text style={styles.accountEmail}>
                {user?.email || "Sem email"}
              </Text>
            </View>
          </View>

          {!user && (
            <View
              style={[
                styles.settingRow,
                { backgroundColor: "#ff4444", borderColor: "#ff0000" },
              ]}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                ⚠️ Nenhum usuário encontrado!
              </Text>
            </View>
          )}

          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>ID da Conta</Text>
              <Text style={styles.settingValue} numberOfLines={1}>
                {user?.id || "N/A"}
              </Text>
            </View>
          </View>

          {user?.curso && (
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Curso</Text>
                <Text style={styles.settingValue}>{user.curso}</Text>
              </View>
            </View>
          )}

          {user?.telefone && (
            <View style={styles.settingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>Telefone</Text>
                <Text style={styles.settingValue}>{user.telefone}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Seção de Ações */}
        <View style={styles.section}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Sair da Conta</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>AnimeList</Text>
          <Text style={styles.footerSubtext}>v1.0 • © 2024</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.5,
    fontStyle: "italic",
  },
  headerSubtitle: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#eab308",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: "#0c0c0e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1a1a1e",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eab308",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  accountEmail: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "600",
  },
  settingRow: {
    backgroundColor: "#0c0c0e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1a1a1e",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  settingDescription: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "600",
  },
  settingValue: {
    color: "#eab308",
    fontSize: 13,
    fontWeight: "700",
  },
  arrow: {
    color: "#71717a",
    fontSize: 20,
    fontWeight: "300",
  },
  logoutButton: {
    backgroundColor: "#f87171",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1a1a1e",
    marginTop: 16,
  },
  footerText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  footerSubtext: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "600",
  },
});
