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

  const handleLogin = async () => {
    if (!email.includes("@") || email.trim().length < 5) {
      Alert.alert("Atenção", "Digite um e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    const result = await loginUser(email, senha);
    setLoading(false);

    if (!result.ok) {
      Alert.alert("Erro", result.message);
      return;
    }

    onAuthSuccess(result.user);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>

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
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  title: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    color: "#e2e8f0",
    backgroundColor: "#1e293b",
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#22c55e",
  },
  primaryButtonText: {
    color: "#052e16",
    fontWeight: "700",
    fontSize: 16,
  },
  ghostButton: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 8,
  },
  ghostButtonText: {
    color: "#93c5fd",
    fontSize: 14,
  },
});
