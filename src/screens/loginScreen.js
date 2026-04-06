import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { loginUser } from "../storage";

export default function LoginScreen({ navigation, onAuthSuccess }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const handleLogin = async () => {
    console.log("🔐 [LOGIN] Tentando login com email:", email);

    if (!email || email.trim().length === 0) {
      console.log("❌ Email vazio");
      setMessage("Digite seu e-mail.");
      setMessageType("error");
      Alert.alert("Atenção", "Digite seu e-mail.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!email.includes("@")) {
      console.log("❌ Email sem @");
      setMessage("E-mail deve conter '@'.");
      setMessageType("error");
      Alert.alert("Atenção", "E-mail deve conter '@'.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!senha || senha.length === 0) {
      console.log("❌ Senha vazia");
      setMessage("Digite sua senha.");
      setMessageType("error");
      Alert.alert("Atenção", "Digite sua senha.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (senha.length < 6) {
      console.log("❌ Senha muito curta");
      setMessage("A senha deve ter no mínimo 6 caracteres.");
      setMessageType("error");
      Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Autenticando...");
      setMessageType("loading");
      console.log(
        "⏳ [LOGIN] Chamando loginUser com:",
        email.toLowerCase().trim(),
      );

      const result = await loginUser(email.toLowerCase().trim(), senha);
      console.log("📦 [LOGIN] Resultado recebido:", result);

      setLoading(false);

      if (!result || !result.ok) {
        const errorMsg = result?.message || "E-mail ou senha inválidos.";
        console.log("❌ Login falhou:", errorMsg);
        setMessage(errorMsg);
        setMessageType("error");
        Alert.alert("❌ Falha no Login", errorMsg);
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      if (!result.user) {
        console.log("❌ Usuário não encontrado nos dados");
        setMessage("Dados do usuário não encontrados.");
        setMessageType("error");
        Alert.alert("Erro", "Dados do usuário não encontrados.");
        return;
      }

      console.log("✅ Login bem-sucedido para:", result.user.email);
      setMessage(`✓ Bem-vindo, ${result.user.nome}!`);
      setMessageType("success");

      // Limpar campos
      setEmail("");
      setSenha("");

      // Chamar callback de autenticação
      if (onAuthSuccess) {
        console.log("🔄 Chamando onAuthSuccess");
        onAuthSuccess(result.user);
      }

      // Redirecionar para Home após 1 segundo
      setTimeout(() => {
        console.log("🏠 Redirecionando para Home");
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }, 1000);
    } catch (error) {
      console.error("💥 Erro no login:", error);
      setLoading(false);
      setMessage(error.message || "Erro ao fazer login. Tente novamente.");
      setMessageType("error");
      Alert.alert(
        "💥 Erro",
        error.message || "Erro ao fazer login. Tente novamente.",
      );
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

        {message && (
          <View
            style={[
              styles.messageBox,
              messageType === "error" && styles.errorMessage,
              messageType === "success" && styles.successMessage,
              messageType === "loading" && styles.loadingMessage,
            ]}
          >
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="E-mail"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />

        <TextInput
          value={senha}
          onChangeText={setSenha}
          placeholder="Senha"
          secureTextEntry
          style={styles.input}
          placeholderTextColor="#94a3b8"
        />

        <Pressable
          style={styles.primaryButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Entrando..." : "Entrar"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.ghostButton}
          onPress={() => navigation.navigate("Cadastro")}
        >
          <Text style={styles.ghostButtonText}>Não tem conta? Cadastre-se</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    color: "#e2e8f0",
    backgroundColor: "#1e293b",
    fontSize: 14,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#22c55e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  primaryButtonText: {
    color: "#052e16",
    fontWeight: "700",
    fontSize: 16,
  },
  ghostButton: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 12,
  },
  ghostButtonText: {
    color: "#93c5fd",
    fontSize: 14,
    fontWeight: "500",
  },
  messageBox: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  errorMessage: {
    backgroundColor: "#7f1d1d",
    borderColor: "#dc2626",
  },
  successMessage: {
    backgroundColor: "#15803d",
    borderColor: "#22c55e",
  },
  loadingMessage: {
    backgroundColor: "#1e40af",
    borderColor: "#3b82f6",
  },
  messageText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
    flex: 1,
  },
});
