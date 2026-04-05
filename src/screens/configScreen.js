import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { getBottomNavHeight, useResponsive } from "../constants/responsive";
import { logoutUser } from "../storage";

export default function ConfigScreen({ navigation, user, onLogout }) {
  const responsive = useResponsive();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

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
              <Text style={styles.avatar}>{user?.name?.charAt(0)}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountName}>{user?.name}</Text>
              <Text style={styles.accountEmail}>{user?.email}</Text>
            </View>
          </View>

          <Pressable style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>ID da Conta</Text>
              <Text style={styles.settingValue} numberOfLines={1}>
                {user?.id}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Seção de Notificações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 NOTIFICAÇÕES</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Notificações Push</Text>
              <Text style={styles.settingDescription}>
                Receba atualizações de novos animes
              </Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#1a1a1e", true: "#eab30844" }}
              thumbColor={notifications ? "#eab308" : "#71717a"}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Recomendações</Text>
              <Text style={styles.settingDescription}>
                Notificações de animes recomendados
              </Text>
            </View>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: "#1a1a1e", true: "#eab30844" }}
              thumbColor="#eab308"
            />
          </View>
        </View>

        {/* Seção de Reprodução */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>▶️ REPRODUÇÃO</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Reprodução Automática</Text>
              <Text style={styles.settingDescription}>
                Reproduzir próximo episódio automaticamente
              </Text>
            </View>
            <Switch
              value={autoPlay}
              onValueChange={setAutoPlay}
              trackColor={{ false: "#1a1a1e", true: "#eab30844" }}
              thumbColor={autoPlay ? "#eab308" : "#71717a"}
            />
          </View>

          <Pressable style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Qualidade de Vídeo</Text>
              <Text style={styles.settingValue}>HD (automático)</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Idioma de Áudio</Text>
              <Text style={styles.settingValue}>Português</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {/* Seção de Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 APARÊNCIA</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Tema Escuro</Text>
              <Text style={styles.settingDescription}>
                Sempre usar tema escuro
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#1a1a1e", true: "#eab30844" }}
              thumbColor={darkMode ? "#eab308" : "#71717a"}
            />
          </View>
        </View>

        {/* Seção de Privacidade */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔒 PRIVACIDADE</Text>

          <Pressable style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Gerenciar Dados Pessoais</Text>
              <Text style={styles.settingDescription}>
                Controlar quais dados coletamos
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingRow}>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Histórico de Atividade</Text>
              <Text style={styles.settingDescription}>
                Ver e gerenciar seu histórico
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>

        {/* Seção de Sobre */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ SOBRE</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Versão do App</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>

          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Termos de Serviço</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>

          <Pressable style={styles.settingRow}>
            <Text style={styles.settingLabel}>Política de Privacidade</Text>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
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
