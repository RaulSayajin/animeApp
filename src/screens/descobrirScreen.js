import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import GenreSelector from "../components/GenreSelector";
import PlaylistModal from "../components/PlaylistModal";
import {
  getAnimeDetails,
  getPopularAnimes,
  searchAnimes,
} from "../config/anilist";
import {
  getBottomNavHeight,
  getContentPadding,
  useResponsive,
} from "../constants/responsive";
import { addMovieToPlaylist, createPlaylist, getPlaylists } from "../storage";

export default function DescobrirScreen({ navigation, user }) {
  const responsive = useResponsive();
  const [search, setSearch] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showGenreSelector, setShowGenreSelector] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTrendingNow, setIsTrendingNow] = useState(true);

  const loadPlaylists = useCallback(async () => {
    if (user?.id) {
      const data = await getPlaylists(user.id);
      setPlaylists(data || []);
    }
  }, [user?.id]);

  const loadTrendingNow = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPopularAnimes(1);
      setMovies(response?.results || []);
      setHasNextPage(response?.pagination?.hasNextPage || false);
      setCurrentPage(1);
    } catch (error) {
      console.log("Erro ao carregar trending now:", error);
      setMovies([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
    loadTrendingNow();
  }, [loadPlaylists, loadTrendingNow]);

  const handleSearch = useCallback(async (text) => {
    setSearch(text);
    setSelectedGenres([]);
    setIsTrendingNow(false);
    setCurrentPage(1);

    if (text.trim().length < 3) {
      setMovies([]);
      setHasNextPage(false);
      return;
    }

    setLoading(true);
    try {
      const response = await searchAnimes(text.trim(), 1);
      setMovies(response?.results || []);
      setHasNextPage(response?.pagination?.hasNextPage || false);
    } catch (error) {
      console.log("Erro ao buscar:", error);
      setMovies([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectGenre = useCallback((genreId) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  }, []);

  const handleApplyGenres = useCallback(async () => {
    if (selectedGenres.length === 0) return;

    setSearch("");
    setIsTrendingNow(false);
    setMovies([]);
    setCurrentPage(1);
    setLoading(true);

    try {
      const genreQuery = selectedGenres.join(",");
      const response = await searchAnimes(genreQuery, 1);
      setMovies(response?.results || []);
      setHasNextPage(response?.pagination?.hasNextPage || false);
    } catch (error) {
      console.log("Erro ao filtrar por gêneros:", error);
      setMovies([]);
      setHasNextPage(false);
    } finally {
      setLoading(false);
    }
  }, [selectedGenres]);

  const handleCreatePlaylist = async (name) => {
    if (!user?.id) return;
    const success = await createPlaylist(user.id, name);
    if (success) {
      loadPlaylists();
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!user?.id || !selectedMovie) return;
    const success = await addMovieToPlaylist(
      user.id,
      playlistId,
      selectedMovie,
    );
    if (success) {
      Alert.alert("Sucesso", "Anime adicionado à playlist!");
      setShowPlaylistModal(false);
      setSelectedMovie(null);
      loadPlaylists();
    }
  };

  const handleToggleFavorite = async (movie) => {
    if (!user?.id) {
      Alert.alert("Atenção", "Faça login para salvar animes.");
      return;
    }
    const details = await getAnimeDetails(movie.id);
    setSelectedMovie(details);
    setShowPlaylistModal(true);
  };

  const handleEndReached = useCallback(async () => {
    if (!hasNextPage || isLoadingMore || loading) return;

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      let response;
      if (search.trim().length >= 3) {
        response = await searchAnimes(search.trim(), nextPage);
      } else if (selectedGenres.length > 0) {
        const genreQuery = selectedGenres.join(",");
        response = await searchAnimes(genreQuery, nextPage);
      }

      if (response?.results) {
        setMovies((prev) => [...prev, ...response.results]);
        setHasNextPage(response?.pagination?.hasNextPage || false);
        setCurrentPage(nextPage);
      }
    } catch (error) {
      console.log("Erro ao carregar mais:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    hasNextPage,
    isLoadingMore,
    loading,
    search,
    selectedGenres,
    currentPage,
  ]);

  const emptyMessage = useMemo(() => {
    if (selectedGenres.length > 0)
      return `Nenhum anime encontrado para os gêneros selecionados.`;
    if (search.trim().length < 3)
      return "Digite ao menos 3 caracteres ou selecione gêneros para buscar animes.";
    if (loading) return "Buscando animes...";
    return "Nenhum anime encontrado.";
  }, [loading, search, selectedGenres]);

  const renderCard = ({ item }) => {
    const poster =
      item.Poster !== "N/A"
        ? item.Poster
        : "https://images.unsplash.com/photo-1542204172-3f16bc56af60?q=80&w=300&auto=format&fit=crop";

    return (
      <View style={styles.cardContainer}>
        <Pressable
          onPress={() => navigation.navigate("Detalhes", { id: item.id })}
          style={({ pressed }) => [
            styles.card,
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
        >
          <ImageBackground
            source={{ uri: poster }}
            style={styles.cardPoster}
            imageStyle={{ borderRadius: 16 }}
          >
            <View style={styles.cardOverlay} />
            {item.imdbRating && (
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>⭐ {item.imdbRating}</Text>
              </View>
            )}

            <View style={styles.cardContent}>
              <View style={styles.tagRow}>
                <View style={styles.yearTag}>
                  <Text style={styles.yearText}>{item.Year}</Text>
                </View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.Title}
              </Text>
            </View>
          </ImageBackground>
        </Pressable>

        <Pressable
          style={[styles.floatingAction, styles.addFab]}
          onPress={() => handleToggleFavorite(item)}
        >
          <Text style={styles.fabText}>+</Text>
        </Pressable>
      </View>
    );
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            CINE<Text style={{ color: "#eab308" }}>REVIEW</Text>
          </Text>
          <View style={styles.userBadge}>
            <Text style={styles.userInitial}>
              {user?.name?.charAt(0) || "U"}
            </Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>EXPLORE MASTERPIECES</Text>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          placeholder="Explorar universo anime..."
          placeholderTextColor="#71717a"
          value={search}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
        {loading && (
          <ActivityIndicator color="#eab308" style={styles.searchLoader} />
        )}
      </View>

      <View
        style={[
          styles.filterSection,
          { paddingHorizontal: getContentPadding() },
        ]}
      >
        <Pressable
          style={styles.genreFilterButton}
          onPress={() => setShowGenreSelector(true)}
        >
          <Text style={styles.genreFilterIcon}>✨</Text>
          <View style={styles.genreFilterContent}>
            <Text style={styles.genreFilterLabel}>Filtrar por Gênero</Text>
            {selectedGenres.length > 0 && (
              <Text style={styles.genreFilterCount}>
                {selectedGenres.length} selecionado
                {selectedGenres.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>
          <Text style={styles.genreFilterArrow}>›</Text>
        </Pressable>
      </View>

      <FlatList
        data={movies}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCard}
        numColumns={responsive.isMobile ? 2 : responsive.isTablet ? 3 : 4}
        contentContainerStyle={[
          styles.listContent,
          { paddingHorizontal: getContentPadding() },
        ]}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore && (
            <ActivityIndicator
              color="#eab308"
              size="large"
              style={{ marginVertical: 20 }}
            />
          )
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{emptyMessage}</Text>
          </View>
        }
      />

      <PlaylistModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
      />

      <GenreSelector
        visible={showGenreSelector}
        onClose={() => {
          setShowGenreSelector(false);
          if (selectedGenres.length > 0) {
            handleApplyGenres();
          }
        }}
        onSelectGenre={handleSelectGenre}
        selectedGenres={selectedGenres}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.5,
    fontStyle: "italic",
    marginBottom: 4,
  },
  userBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
    justifyContent: "center",
  },
  userInitial: {
    color: "#eab308",
    fontSize: 12,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 4,
    marginTop: 4,
  },
  searchWrapper: {
    paddingHorizontal: 24,
    marginBottom: 16,
    position: "relative",
  },
  searchInput: {
    backgroundColor: "#0c0c0e",
    color: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    fontSize: 14,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  searchLoader: {
    position: "absolute",
    right: 40,
    top: 16,
  },
  filterSection: {
    paddingVertical: 16,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1e",
  },
  genreFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#18181b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  genreFilterIcon: {
    fontSize: 18,
  },
  genreFilterContent: {
    flex: 1,
  },
  genreFilterLabel: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  genreFilterCount: {
    color: "#eab308",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  genreFilterArrow: {
    color: "#eab308",
    fontSize: 20,
    fontWeight: "300",
  },
  listContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    flex: 1,
    padding: 8,
    maxWidth: "50%",
  },
  card: {
    height: 300,
    borderRadius: 20,
    backgroundColor: "#18181b",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardPoster: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  cardContent: {
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
  },
  tagRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 8,
  },
  yearTag: {
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.1)",
  },
  yearText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 17,
    textTransform: "uppercase",
    letterSpacing: -0.5,
  },
  floatingAction: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  addFab: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderColor: "#eab308",
  },
  removeFab: {
    backgroundColor: "#eab308",
    shadowColor: "#eab308",
    shadowOpacity: 0.4,
  },
  fabText: {
    color: "#000",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 0,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },
  emptyText: {
    color: "#3f3f46",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 220,
    letterSpacing: 0.5,
  },
  scoreBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
  },
  scoreText: {
    color: "#eab308",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
