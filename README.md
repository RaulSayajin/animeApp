Nomes: 
Raul de Oliveira Goncalves
Bruno José Rodrigues da Silva

# AnimeList - Aplicativo de Animes


Este é um aplicativo mobile desenvolvido com **Expo** e **React Native** que permite aos usuários buscar animes via API AniList GraphQL, criar contas com validação de CPF e telefone, e gerenciar uma lista de animes favoritos com persistência de dados.

## 📋 Estrutura do Projeto

### Arquivos Principais

| Arquivo                            | Descrição                                                    |
| ---------------------------------- | ------------------------------------------------------------ |
| **App.js**                         | Ponto de entrada principal da aplicação                      |
| **index.js**                       | Bootstrap do Expo                                            |
| **src/navigation/AppNavigator.js** | Roteamento entre as 4 telas                                  |
| **src/screens/loginScreen.js**     | Tela de login (e-mail + senha)                               |
| **src/screens/cadastroScreen.js**  | Tela de cadastro (CPF + telefone com máscara)                |
| **src/screens/cardsScreen.js**     | Cards de animes via AniList GraphQL API com ADD/EXCLUIR      |
| **src/screens/detalhesScreen.js**  | Detalhes completos (sinopse, elenco, avaliações, bilheteria) |
| **src/storage.js**                 | AsyncStorage (persistência local)                            |
| **src/config/anilist/**            | Configuração da API AniList GraphQL                          |
| **README.md**                      | Este arquivo                                                 |

## 🚀 Fluxo de Navegação

```
Login
  ↓ (novo usuário)
Cadastro → (volta para Login após salvar)
  ↓ (autenticado)
Cards (busca e favoritos)
  ↓ (clica no filme)
Detalhes (sinopse, elenco, avaliações)
  ↓ Sair (volta para Login)
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js (v20+)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)

### Passos

1. **Instale as dependências:**

   ```bash
   npm install
   ```

2. **Configure a variável de ambiente:**
   - Crie um arquivo `.env` na raiz do projeto
   - A chave da API AniList já está configurada no projeto

3. **Inicie a aplicação:**

   ```bash
   npm start
   ```

4. **Escolha a plataforma:**
   - **Android:** pressione `a` no terminal
   - **iOS:** pressione `i` no terminal
   - **Web:** pressione `w` no terminal

## 📱 Funcionalidades

### 🔐 Autenticação

- **Login:** E-mail + senha (mínimo 6 caracteres)
- **Cadastro:** Nome, e-mail, CPF (com máscara `000.000.000-00`), telefone (com máscara `(00) 90000-0000`), senha
- **Persistência:** Usuários salvos em AsyncStorage (não expira na sessão)

### 🎬 Busca de Filmes

- Busca em tempo real via AniList GraphQL API
- Mínimo de 3 caracteres para disparar a busca
- Exibe título, ano e poster
- Carregamento com spinner indicador

### ❤️ Gerenciamento de Favoritos

- **ADD:** Adicionar filme aos favoritos (salva detalhes completos)
- **EXCLUIR:** Remover filme da lista de favoritos
- Favoritos persistem por usuário em AsyncStorage
- Botões com cores distintas (ADD = verde, EXCLUIR = vermelho)

### 📖 Detalhes do Filme

Exibe informações completas:

- Sinopse (Plot)
- Elenco (Actors)
- Diretor (Director)
- Bilheteria (Box Office)
- Avaliações (de IMDb, Rotten Tomatoes, etc.)
- Duração, idioma, nota IMDb

## 💾 AsyncStorage (storage.js)

Módulo centralizado para persistência:

```javascript
// Usuários
getUsers(); // retorna array de usuários
registerUser(user); // registra novo usuário
loginUser(email, senha); // autentica e salva sessão
getCurrentUser(); // retorna usuário logado
logoutUser(); // remove sessão
```

```javascript
// Filmes Favoritos
getFavoriteMovies(userId); // lista de favoritos do usuário
addFavoriteMovie(userId, movie); // adiciona aos favoritos
removeFavoriteMovie(userId, imdbID); // remove dos favoritos
```

## 🎨 Estilos e Tema

- **Tema escuro:** `#0f172a` (background), `#111827` (cards)
- **Cores de ação:**
  - Verde: `#22c55e` (ADD/Entrar)
  - Vermelho: `#dc2626` (EXCLUIR/Sair)
  - Azul: `#93c5fd` (Links)

## 📦 Dependências Principais

```json
{
  "@react-navigation/native-stack": "^7.14.10",
  "@react-native-async-storage/async-storage": "^3.0.2",
  "axios": "^1.14.0",
  "expo": "55.0.10",
  "react-native": "0.83.4"
}
```

## 🔗 Referências da API

**AniList GraphQL API:**

- `query { Media(search: $search) { id, title, seasonYear, genres } }` - Buscar animes
- `query { Media(id: $id) { ...detailed info } }` - Detalhes completos

Documentação: [https://anilist.co/graphql/](https://anilist.co/graphql/)

## 📝 Notas de Desenvolvimento

- **Validação de CPF:** Máscara automática (`000.000.000-00`)
- **Validação de Telefone:** Máscara automática ((00) 90000-0000)
- **Persistência:** Usuários e favoritos salvos localmente (offline-first)
- **Segurança:** Senhas armazenadas em texto (para demo; em produção use hash)

## ⚙️ Variáveis de Ambiente

```env
# A chave da API AniList está configurada no projeto
# Nenhuma configuração de API key é necessária para usar
```

## 🐛 Troubleshooting

**Erro: "AsyncStorage is not defined"**

- Certifique-se de que `@react-native-async-storage/async-storage` está instalado
- Execute: `npm install @react-native-async-storage/async-storage`

**Erro: "API retorna 'Response: False'"**

- Verifique se a chave da API está correta
- Certifique-se de que o filme existe (e.g., "Inception", "Avengers")

**Botão de favorito não funciona**

- Verifique se o usuário está autenticado (`getCurrentUser()` deve retornar um usuário)
- Limpe o cache: `npm run reset-project`

## 📄 Licença

Este projeto é fornecido como está para fins educacionais.

## 👥 Autor

Desenvolvido para a disciplina de Mobile (Xandy Gomes) - 4º Semestre FATEC
