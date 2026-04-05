import AsyncStorage from "@react-native-async-storage/async-storage";

const USERS_KEY = "@animeflexis:users";
const AUTH_KEY = "@animeflexis:auth_user";
const FAVORITES_KEY = "@animeflexis:favorites";
const PLAYLISTS_KEY = "@animeflexis:playlists";
const RATINGS_KEY = "@animeflexis:ratings";

async function getJson(key, fallback) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

async function setJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function getUsers() {
  return getJson(USERS_KEY, []);
}

export async function registerUser(user) {
  const users = await getUsers();
  const normalizedEmail = user.email.trim().toLowerCase();

  if (users.some((item) => item.email === normalizedEmail)) {
    return { ok: false, message: "E-mail já cadastrado." };
  }

  const nextUsers = [
    ...users,
    {
      id: Date.now().toString(),
      nome: user.nome.trim(),
      cpf: user.cpf,
      telefone: user.telefone,
      email: normalizedEmail,
      senha: user.senha,
    },
  ];

  const saved = await setJson(USERS_KEY, nextUsers);
  return saved
    ? { ok: true }
    : { ok: false, message: "Erro ao salvar usuário." };
}

export async function loginUser(email, senha) {
  const users = await getUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (item) => item.email === normalizedEmail && item.senha === senha,
  );

  if (!user) {
    return { ok: false, message: "E-mail ou senha inválidos." };
  }

  const authSaved = await setJson(AUTH_KEY, user);
  return authSaved
    ? { ok: true, user }
    : { ok: false, message: "Erro de sessão." };
}

export async function getCurrentUser() {
  return getJson(AUTH_KEY, null);
}

export async function logoutUser() {
  try {
    await AsyncStorage.removeItem(AUTH_KEY);
    return true;
  } catch {
    return false;
  }
}

// Playlists Functions
export async function getPlaylists(userId) {
  const allPlaylists = await getJson(PLAYLISTS_KEY, {});
  return allPlaylists[userId] || [];
}

export async function savePlaylists(userId, playlists) {
  const allPlaylists = await getJson(PLAYLISTS_KEY, {});
  const nextPlaylists = { ...allPlaylists, [userId]: playlists };
  return setJson(PLAYLISTS_KEY, nextPlaylists);
}

export async function createPlaylist(userId, playlistName) {
  const playlists = await getPlaylists(userId);
  const newPlaylist = {
    id: Date.now().toString(),
    name: playlistName,
    createdAt: new Date().toISOString(),
    movies: [],
  };
  return savePlaylists(userId, [...playlists, newPlaylist]);
}

export async function addMovieToPlaylist(userId, playlistId, movie) {
  const playlists = await getPlaylists(userId);
  const updatedPlaylists = playlists.map((playlist) => {
    if (playlist.id === playlistId) {
      if (!playlist.movies.some((m) => m.imdbID === movie.imdbID)) {
        return { ...playlist, movies: [...playlist.movies, movie] };
      }
    }
    return playlist;
  });
  return savePlaylists(userId, updatedPlaylists);
}

export async function removeMovieFromPlaylist(userId, playlistId, imdbID) {
  const playlists = await getPlaylists(userId);
  const nextPlaylists = playlists.map((p) => {
    if (p.id === playlistId) {
      return { ...p, movies: p.movies.filter((m) => m.imdbID !== imdbID) };
    }
    return p;
  });
  return savePlaylists(userId, nextPlaylists);
}

export async function deletePlaylist(userId, playlistId) {
  const playlists = await getPlaylists(userId);
  const nextPlaylists = playlists.filter((p) => p.id !== playlistId);
  return savePlaylists(userId, nextPlaylists);
}

// Ratings Functions
export async function getUserRatings(userId) {
  const allRatings = await getJson(RATINGS_KEY, {});
  return allRatings[userId] || [];
}

export async function saveUserRatings(userId, ratings) {
  const allRatings = await getJson(RATINGS_KEY, {});
  const nextRatings = { ...allRatings, [userId]: ratings };
  return setJson(RATINGS_KEY, nextRatings);
}

export async function rateMovie(userId, movie, rating) {
  const ratings = await getUserRatings(userId);
  const existingRatingIndex = ratings.findIndex(
    (r) => r.imdbID === movie.imdbID,
  );

  if (existingRatingIndex >= 0) {
    ratings[existingRatingIndex] = {
      ...ratings[existingRatingIndex],
      rating,
      ratedAt: new Date().toISOString(),
    };
  } else {
    ratings.push({
      imdbID: movie.imdbID,
      title: movie.Title,
      poster: movie.Poster,
      rating,
      ratedAt: new Date().toISOString(),
    });
  }

  return saveUserRatings(userId, ratings);
}

export async function removeRating(userId, imdbID) {
  const ratings = await getUserRatings(userId);
  const nextRatings = ratings.filter((r) => r.imdbID !== imdbID);
  return saveUserRatings(userId, nextRatings);
}
