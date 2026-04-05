import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { registerUser } from "../storage";

function maskCpf(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

export default function CadastroScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (
      !nome.trim() ||
      !email.trim() ||
      !senha ||
      !confirmarSenha ||
      !cpf ||
      !telefone
    ) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Atenção", "Digite um e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Atenção", "As senhas não conferem.");
      return;
    }

    if (cpf.replace(/\D/g, "").length !== 11) {
      Alert.alert("Atenção", "CPF inválido.");
      return;
    }

    if (telefone.replace(/\D/g, "").length < 10) {
      Alert.alert("Atenção", "Telefone inválido.");
      return;
    }

    setLoading(true);
    const result = await registerUser({ nome, email, senha, cpf, telefone });
    setLoading(false);

    if (!result.ok) {
      Alert.alert("Erro", result.message);
      return;
    }

    Alert.alert("Sucesso", "Cadastro realizado com sucesso.", [
      { text: "Ir para login", onPress: () => navigation.navigate("Login") },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Cadastro</Text>

          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Nome completo"
            autoCapitalize="words"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

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
            value={cpf}
            onChangeText={(value) => setCpf(maskCpf(value))}
            placeholder="CPF (000.000.000-00)"
            keyboardType="numeric"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <TextInput
            value={telefone}
            onChangeText={(value) => setTelefone(maskPhone(value))}
            placeholder="Telefone ((00) 90000-0000)"
            keyboardType="phone-pad"
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

          <TextInput
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            placeholder="Confirmar senha"
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Pressable
            style={styles.primaryButton}
            onPress={handleCadastro}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Salvando..." : "Cadastrar"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.ghostButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.ghostButtonText}>Já tem conta? Entrar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
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
