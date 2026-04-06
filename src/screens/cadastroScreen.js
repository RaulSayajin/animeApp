import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { registerUser } from "../storage";

const CURSOS = [
  "Análise e Desenvolvimento de Sistemas (Matutino)",
  "Análise e Desenvolvimento de Sistemas (Noturno)",
  "Desenvolvimento de Software Multiplataforma (Noturno)",
  "Gestão da Produção Industrial (Matutino)",
  "Gestão da Produção Industrial (Noturno)",
  "Gestão de Recursos Humanos (Matutino)",
  "Gestão de Recursos Humanos (Noturno)",
  "Gestão Empresarial (EaD)",
];

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
  const [curso, setCurso] = useState(null);
  const [showCursoModal, setShowCursoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const handleCadastro = async () => {
    console.log("📝 [CADASTRO] Iniciando validação");

    if (!nome || !nome.trim()) {
      console.log("❌ Nome vazio");
      setMessage("Digite seu nome completo.");
      setMessageType("error");
      Alert.alert("Atenção", "Digite seu nome completo.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!email || !email.trim()) {
      console.log("❌ Email vazio");
      setMessage("Digite seu e-mail.");
      setMessageType("error");
      Alert.alert("Atenção", "Digite seu e-mail.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!senha) {
      console.log("❌ Senha vazia");
      setMessage("Digite uma senha.");
      setMessageType("error");
      Alert.alert("Atenção", "Digite uma senha.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!confirmarSenha) {
      console.log("❌ Confirmação de senha vazia");
      setMessage("Confirme sua senha.");
      setMessageType("error");
      Alert.alert("Atenção", "Confirme sua senha.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!cpf || cpf.trim() === "") {
      console.log("❌ CPF vazio");
      setMessage("Digite seu CPF.");
      setMessageType("error");
      Alert.alert("Atenção", "Digite seu CPF.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!telefone || telefone.trim() === "") {
      console.log("❌ Telefone vazio");
      setMessage("Digite seu telefone.");
      setMessageType("error");
      Alert.alert("Atenção", "Digite seu telefone.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      console.log("❌ Email inválido");
      setMessage("E-mail inválido. Exemplo: usuario@email.com");
      setMessageType("error");
      Alert.alert("Atenção", "E-mail inválido. Exemplo: usuario@email.com");
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

    if (senha !== confirmarSenha) {
      console.log("❌ Senhas não conferem");
      setMessage("As senhas não conferem.");
      setMessageType("error");
      Alert.alert("Atenção", "As senhas não conferem.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      console.log("❌ CPF inválido:", cpfDigits.length, "dígitos");
      setMessage("CPF deve ter 11 dígitos.");
      setMessageType("error");
      Alert.alert("Atenção", "CPF deve ter 11 dígitos.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    const phoneDigits = telefone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      console.log("❌ Telefone inválido:", phoneDigits.length, "dígitos");
      setMessage("Telefone deve ter no mínimo 10 dígitos.");
      setMessageType("error");
      Alert.alert("Atenção", "Telefone deve ter no mínimo 10 dígitos.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (!curso) {
      console.log("❌ Curso não selecionado");
      setMessage("Selecione um curso.");
      setMessageType("error");
      Alert.alert("Atenção", "Selecione um curso.");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setLoading(true);
      setMessage("⏳ Salvando cadastro...");
      setMessageType("loading");
      console.log("⏳ [CADASTRO] Chamando registerUser...");

      const result = await registerUser({
        nome: nome.trim(),
        email: email.toLowerCase().trim(),
        senha,
        cpf: cpfDigits,
        telefone: phoneDigits,
        curso,
      });

      console.log("📦 [CADASTRO] Resultado recebido:", result);
      setLoading(false);

      if (!result || !result.ok) {
        const errorMsg = result?.message || "Erro ao registrar usuário.";
        console.log("❌ Cadastro falhou:", errorMsg);
        setMessage(errorMsg);
        setMessageType("error");
        Alert.alert("✗ Erro no Cadastro", errorMsg);
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      console.log("✅ Cadastro bem-sucedido para:", email);
      setMessage("✓ Cadastro realizado com sucesso!");
      setMessageType("success");
      Alert.alert(
        "✓ Cadastro Realizado!",
        "Sua conta foi criada com sucesso. Faça login agora.",
        [
          {
            text: "Ir para Login",
            onPress: () => {
              console.log("🔄 Navegando para Login");
              navigation.navigate("Login");
            },
          },
        ],
      );
    } catch (error) {
      console.error("💥 Erro no cadastro:", error);
      setLoading(false);
      setMessage(error.message || "Erro ao cadastrar. Tente novamente.");
      setMessageType("error");
      Alert.alert(
        "✗ Erro",
        error.message || "Erro ao cadastrar. Tente novamente.",
      );
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Cadastro</Text>

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

          <Pressable
            style={[
              styles.input,
              styles.cursoButton,
              curso && styles.cursoButtonSelected,
            ]}
            onPress={() => setShowCursoModal(true)}
          >
            <Text
              style={[
                styles.cursoButtonText,
                !curso && styles.cursoPlaceholder,
              ]}
            >
              {curso || "Selecione um curso"}
            </Text>
          </Pressable>

          <Modal
            visible={showCursoModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCursoModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Selecione seu Curso</Text>
                <ScrollView style={styles.cursosList}>
                  {CURSOS.map((c, index) => (
                    <Pressable
                      key={index}
                      style={[
                        styles.cursoOption,
                        curso === c && styles.cursoOptionSelected,
                      ]}
                      onPress={() => {
                        setCurso(c);
                        setShowCursoModal(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.cursoOptionText,
                          curso === c && styles.cursoOptionTextSelected,
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  style={styles.modalCloseButton}
                  onPress={() => setShowCursoModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Fechar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>

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
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
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
  cursoButton: {
    paddingVertical: 12,
    justifyContent: "center",
    backgroundColor: "#1e293b",
    borderColor: "#334155",
  },
  cursoButtonSelected: {
    borderColor: "#22c55e",
    backgroundColor: "#1a3a1a",
  },
  cursoButtonText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "500",
  },
  cursoPlaceholder: {
    color: "#94a3b8",
    fontWeight: "400",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#111827",
    borderRadius: 14,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modalTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  cursosList: {
    marginBottom: 16,
    maxHeight: 300,
  },
  cursoOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
  },
  cursoOptionSelected: {
    backgroundColor: "#15803d",
    borderBottomColor: "#22c55e",
  },
  cursoOptionText: {
    color: "#e2e8f0",
    fontSize: 14,
    flex: 1,
  },
  cursoOptionTextSelected: {
    color: "#f8fafc",
    fontWeight: "600",
  },
  modalCloseButton: {
    backgroundColor: "#334155",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  modalCloseButtonText: {
    color: "#f8fafc",
    fontWeight: "600",
    fontSize: 14,
  },
});
