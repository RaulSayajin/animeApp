import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ImageBackground,
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import PlaylistModal from "../components/PlaylistModal";
import {
    getAnimeDetails,
    getAnimesByGenre,
    getPopularAnimes,
    searchAnimes,
} from "../config/anilist";
import {
    getBottomNavHeight,
    getContentPadding,
    getHeroHeight,
    getHorizontalMovieWidth,
    getResponsiveFontSize,
    getSectionSpacing,
    useResponsive,
} from "../constants/responsive";
import { addMovieToPlaylist, createPlaylist, getPlaylists } from "../storage";

// MovieRow component for horizontal scrolling
function MovieRow({ title, movies, onMoviePress, loading, icon, onViewAll }) {
  const responsive = useResponsive();
  const movieWidth = getHorizontalMovieWidth();

  const renderMovieItem = ({ item }) => (
    <Pressable
      style={[styles.rowMovie, { width: movieWidth }]}
      onPress={() => onMoviePress(item.id)}
    >
      <ImageBackground
        source={{
          uri:
            item.Poster !== "N/A"
              ? item.Poster
              : "https://via.placeholder.com/100x150",
        }}
        style={[styles.rowPoster, { width: movieWidth }]}
        imageStyle={{ borderRadius: responsive.isMobile ? 16 : 20 }}
      >
        <View style={styles.rowOverlay} />
        {item.imdbRating && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>⭐ {item.imdbRating}</Text>
          </View>
        )}
      </ImageBackground>
      <Text style={styles.rowTitle} numberOfLines={2}>
        {item.Title}
      </Text>
      <Text style={styles.rowYear}>{item.Year}</Text>
    </Pressable>
  );

  return (
    <View style={[styles.rowSection, { paddingVertical: getSectionSpacing() }]}>
      <View style={styles.rowHeader}>
        <View style={styles.rowTitleContainer}>
          <View style={styles.rowDecorLine} />
          <Text
            style={[
              styles.rowSectionTitle,
              { fontSize: getResponsiveFontSize.h3() },
            ]}
          >
            {icon} {title}
          </Text>
        </View>
        {onViewAll && (
          <Pressable style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>VER TUDO</Text>
          </Pressable>
        )}
      </View>
      {loading ? (
        <ActivityIndicator
          size="small"
          color="#eab308"
          style={styles.rowLoader}
        />
      ) : movies.length > 0 ? (
        <FlatList
          data={movies}
          renderItem={renderMovieItem}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          scrollEventThrottle={16}
        />
      ) : (
        <Text style={styles.rowEmpty}>Nenhum anime encontrado</Text>
      )}
    </View>
  );
}

export default function HomeScreen({ navigation, user }) {
  const responsive = useResponsive();
  const [heroMovie, setHeroMovie] = useState(null);
  const [trending, setTrending] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [editorial, setEditorial] = useState([]);
  const [seasonal, setSeasonal] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userGenres, setUserGenres] = useState([]);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playlists, setPlaylists] = useState([]);

  const loadPlaylists = useCallback(async () => {
    if (user?.id) {
      const data = await getPlaylists(user.id);
      setPlaylists(data || []);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  // Extract genres from user's playlists
  useEffect(() => {
    const loadUserGenres = async () => {
      if (user?.id) {
        const playlists = await getPlaylists(user.id);
        const genreSet = new Set();

        for (const playlist of playlists) {
          for (const movie of playlist.movies) {
            if (movie.Genre) {
              const genres = movie.Genre.split(",").map((g) =>
                g.trim().toLowerCase(),
              );
              genres.forEach((g) => genreSet.add(g));
            }
          }
        }

        setUserGenres(Array.from(genreSet));
      }
    };

    loadUserGenres();
  }, [user?.id]);

  // Load home data
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        console.log("🏠 Carregando dados da Home...");

        // Hero: Popular anime
        const heroResponse = await searchAnimes("Death Note");
        const heroResults = heroResponse?.results || [];
        if (heroResults?.length > 0) {
          setHeroMovie(heroResults[0]);
          console.log("🎬 Hero:", heroResults[0].Title);
        }

        // Trending: Popular animes
        const trendingResponse = await getPopularAnimes();
        const trendingResults = trendingResponse?.results || [];
        if (trendingResults?.length > 0) {
          setTrending(trendingResults.slice(0, 8));
        }

        // Recommendations: Based on user genres
        if (userGenres.length > 0) {
          const recGenre = userGenres[0];
          try {
            const recResponse = await getAnimesByGenre(recGenre, 1);
            const recResults = recResponse?.results || [];
            setRecommendations(recResults.slice(0, 8));
            console.log(
              "💡 Recomendações por",
              recGenre,
              ":",
              recResults.length,
              "itens",
            );
          } catch (error) {
            console.log("⚠️ Erro ao buscar por gênero:", error);
            setRecommendations([]);
          }
        }

        // Editorial: Drama
        const editResponse = await searchAnimes("Drama");
        const editResults = editResponse?.results || [];
        const dramFiltered = editResults
          .filter(
            (movie) =>
              movie.Genre && movie.Genre.toLowerCase().includes("drama"),
          )
          .slice(0, 8);
        setEditorial(dramFiltered);
        console.log("🏆 Editorial (Drama):", dramFiltered.length, "itens");

        // Novidades da Estação
        const seasonalResponse = await getAnimesByGenre("Adventure", 1);
        setSeasonal((seasonalResponse?.results || []).slice(0, 8));
        console.log(
          "📅 Novidades da Estação:",
          seasonalResponse?.results?.length || 0,
          "itens",
        );

        // Aclamação da Crítica (Top rated)
        const topRatedResponse = await getPopularAnimes();
        setTopRated((topRatedResponse?.results || []).slice(0, 8));
        console.log(
          "⭐ Aclamação da Crítica:",
          topRatedResponse?.results?.length || 0,
          "itens",
        );

        // Favoritos da Comunidade
        const favResponse = await getAnimesByGenre("Romance", 1);
        setFavorites((favResponse?.results || []).slice(0, 8));
        console.log(
          "❤️ Favoritos da Comunidade:",
          favResponse?.results?.length || 0,
          "itens",
        );

        console.log("✅ Home carregada com sucesso!");
      } catch (error) {
        console.log("❌ Erro ao carregar home:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [userGenres]);

  const handleMoviePress = useCallback(
    (movieId) => {
      navigation.navigate("Detalhes", { id: movieId });
    },
    [navigation],
  );

  const handleOpenIMDB = useCallback((imdbID) => {
    const imdbUrl = `https://www.imdb.com/title/${imdbID}/`;
    Linking.openURL(imdbUrl).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o IMDB");
    });
  }, []);

  const handleSearch = useCallback(async (text) => {
    setSearch(text);

    if (text.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await searchAnimes(text.trim());
      setSearchResults(response?.results || []);
    } catch (error) {
      console.log("Erro ao buscar:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

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

  return (
    <View
      style={[
        styles.container,
        responsive.isWeb
          ? { paddingLeft: 240, paddingBottom: 0 }
          : { paddingLeft: 0, paddingBottom: getBottomNavHeight() },
      ]}
    >
      {/* Search Bar - Always at top */}
      <View
        style={[
          styles.searchWrapper,
          {
            paddingHorizontal: getContentPadding(),
            paddingVertical: getContentPadding() - 4,
          },
          responsive.isWeb && { paddingTop: 60 },
        ]}
      >
        <TextInput
          placeholder="Explorar animes..."
          placeholderTextColor="#71717a"
          value={search}
          onChangeText={handleSearch}
          style={[
            styles.searchInput,
            {
              fontSize: getResponsiveFontSize.body(),
              paddingVertical: getContentPadding() - 2,
              paddingHorizontal: getContentPadding() + 2,
            },
          ]}
        />
        {searchLoading && (
          <ActivityIndicator color="#eab308" style={styles.searchLoader} />
        )}
      </View>

      {/* Show search results or home content */}
      {search.trim().length >= 3 ? (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => {
            const isFavorite = favoriteIds.includes(item.id);
            return (
              <View
                style={[
                  styles.searchCardContainer,
                  {
                    width: responsive.isMobile
                      ? "50%"
                      : responsive.isTablet
                        ? "33.33%"
                        : "25%",
                  },
                ]}
              >
                <Pressable
                  style={styles.searchCardInner}
                  onPress={() => handleMoviePress(item.id)}
                >
                  <ImageBackground
                    source={{
                      uri:
                        item.Poster !== "N/A"
                          ? item.Poster
                          : "https://via.placeholder.com/100x150",
                    }}
                    style={styles.searchCard}
                    imageStyle={{ borderRadius: responsive.isMobile ? 12 : 8 }}
                  >
                    <View style={styles.searchCardOverlay} />
                  </ImageBackground>
                  <Text
                    style={[
                      styles.searchCardTitle,
                      { fontSize: getResponsiveFontSize.small() },
                    ]}
                    numberOfLines={2}
                  >
                    {item.Title}
                  </Text>
                  <Text
                    style={[
                      styles.searchCardYear,
                      { fontSize: getResponsiveFontSize.xs() },
                    ]}
                  >
                    {item.Year}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.searchCardFab,
                    isFavorite
                      ? styles.searchCardFabActive
                      : styles.searchCardFabInactive,
                  ]}
                  onPress={() => handleToggleFavorite(item)}
                >
                  <Text style={styles.searchCardFabText}>
                    {isFavorite ? "−" : "+"}
                  </Text>
                </Pressable>
              </View>
            );
          }}
          keyExtractor={(item) => String(item.id)}
          numColumns={responsive.isMobile ? 2 : responsive.isTablet ? 3 : 4}
          columnWrapperStyle={styles.searchGrid}
          contentContainerStyle={[
            styles.searchContent,
            { paddingHorizontal: getContentPadding() },
          ]}
          ListEmptyComponent={
            !searchLoading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum anime encontrado</Text>
              </View>
            )
          }
        />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          {loading ? (
            <ActivityIndicator
              size="large"
              color="#eab308"
              style={styles.heroLoader}
            />
          ) : heroMovie ? (
            <Pressable
              style={[styles.heroSection, { height: getHeroHeight() }]}
              onPress={() => handleMoviePress(heroMovie.id)}
            >
              <ImageBackground
                source={{
                  uri:
                    heroMovie.Poster !== "N/A"
                      ? heroMovie.Poster
                      : "https://via.placeholder.com/400x600",
                }}
                style={styles.heroPoster}
                imageStyle={{ opacity: 0.8 }}
              >
                <View
                  style={[
                    styles.heroOverlay,
                    { padding: getContentPadding() + 4 },
                  ]}
                >
                  <View style={styles.heroTagline}>
                    <View style={styles.heroDecoLine} />
                    <Text style={styles.heroTaglineText}>
                      Anime Extraordinário
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.heroTitle,
                      { fontSize: getResponsiveFontSize.h1() },
                    ]}
                  >
                    {heroMovie.Title}
                  </Text>
                  <View style={styles.heroInfoRow}>
                    <Text style={styles.heroYear}>{heroMovie.Year}</Text>
                    <Text style={styles.heroRating}>
                      ⭐ {heroMovie.imdbRating}
                    </Text>
                  </View>
                  <Pressable
                    style={styles.heroButton}
                    onPress={() => handleOpenIMDB(heroMovie.imdbID)}
                  >
                    <Text style={styles.heroButtonText}>► Assistir Agora</Text>
                  </Pressable>
                </View>
              </ImageBackground>
            </Pressable>
          ) : null}
          {/* Trending Section */}
          <MovieRow
            title="Em Alta no Review"
            icon="🔥"
            movies={trending}
            onMoviePress={handleMoviePress}
            loading={loading}
            onViewAll={() => Alert.alert("Ver Tudo", "Todas as tendências")}
          />

          {/* Recommendations Section */}
          {userGenres.length > 0 && (
            <MovieRow
              title={`Porque você gosta de ${userGenres[0]}`}
              icon="💡"
              movies={recommendations}
              onMoviePress={handleMoviePress}
              loading={loading}
              onViewAll={() =>
                Alert.alert("Ver Tudo", "Todas as recomendações")
              }
            />
          )}

          {/* Editorial Section */}
          <MovieRow
            title="Indicações da Redação"
            icon="🏆"
            movies={editorial}
            onMoviePress={handleMoviePress}
            loading={loading}
            onViewAll={() => Alert.alert("Ver Tudo", "Editorial completo")}
          />

          {/* Seasonal Section */}
          <MovieRow
            title="Novidades da Estação"
            icon="📅"
            movies={seasonal}
            onMoviePress={handleMoviePress}
            loading={loading}
            onViewAll={() => Alert.alert("Ver Tudo", "Todas as novidades")}
          />

          {/* Top Rated Section */}
          <MovieRow
            title="Aclamação da Crítica"
            icon="⭐"
            movies={topRated}
            onMoviePress={handleMoviePress}
            loading={loading}
            onViewAll={() => Alert.alert("Ver Tudo", "Aclamações completas")}
          />

          {/* Favorites Section */}
          <MovieRow
            title="Favoritos da Comunidade"
            icon="❤️"
            movies={favorites}
            onMoviePress={handleMoviePress}
            loading={loading}
            onViewAll={() => Alert.alert("Ver Tudo", "Favoritos completos")}
          />

          {/* Footer spacer */}
          <View style={styles.spacer} />
        </ScrollView>
      )}

      <PlaylistModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  searchWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1e",
    position: "relative",
    backgroundColor: "#050505",
    zIndex: 100,
  },
  searchInput: {
    backgroundColor: "#0c0c0e",
    color: "#fff",
    borderRadius: 16,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  searchLoader: {
    position: "absolute",
    right: "5%",
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  searchContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  searchGrid: {
    gap: 12,
    marginBottom: 12,
  },
  searchCardContainer: {
    position: "relative",
    marginBottom: 6,
    paddingHorizontal: 6,
  },
  searchCard: {
    aspectRatio: 2 / 3,
    backgroundColor: "#18181b",
    marginBottom: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  searchCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  searchCardTitle: {
    color: "#fff",
    fontWeight: "800",
    lineHeight: 16,
    textTransform: "uppercase",
  },
  searchCardYear: {
    color: "#71717a",
    fontWeight: "700",
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyText: {
    color: "#71717a",
    fontSize: 14,
    fontWeight: "600",
  },
  scrollContent: {
    paddingVertical: 0,
  },
  heroLoader: {
    justifyContent: "center",
  },
  heroSection: {
    width: "100%",
    justifyContent: "flex-end",
    backgroundColor: "#1a1a1e",
    borderBottomWidth: 2,
    borderBottomColor: "#27272a",
  },
  heroPoster: {
    flex: 1,
    justifyContent: "flex-end",
  },
  heroOverlay: {
    backgroundColor: "rgba(5, 5, 5, 0.96)",
    borderTopWidth: 2,
    borderTopColor: "rgba(234, 179, 8, 0.15)",
  },
  heroTagline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  heroDecoLine: {
    width: 48,
    height: 3,
    backgroundColor: "#eab308",
    borderRadius: 2,
  },
  heroTaglineText: {
    color: "#eab308",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  heroTitle: {
    color: "#fff",
    fontWeight: "900",
    marginBottom: 12,
    fontStyle: "italic",
    letterSpacing: -1,
  },
  heroInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  heroYear: {
    color: "#eab308",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  heroRating: {
    color: "#a1a1aa",
    fontSize: 13,
    fontWeight: "700",
  },
  heroButton: {
    backgroundColor: "#eab308",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    alignItems: "center",
    width: "85%",
    shadowColor: "#eab308",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
  },
  rowSection: {
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(26, 26, 30, 0.4)",
  },
  rowHeader: {
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderWidth: 1,
    borderColor: "#eab308",
  },
  viewAllText: {
    color: "#eab308",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  rowDecorLine: {
    width: 4,
    height: 24,
    backgroundColor: "#eab308",
    borderRadius: 2,
  },
  rowSectionTitle: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: -0.5,
    fontStyle: "italic",
  },
  rowContent: {
    gap: 12,
    paddingRight: 16,
  },
  rowMovie: {
    gap: 10,
  },
  rowPoster: {
    aspectRatio: 2 / 3,
    backgroundColor: "#18181b",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  rowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  rowTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 14,
  },
  rowYear: {
    color: "#71717a",
    fontSize: 11,
    fontWeight: "600",
  },
  rowLoader: {
    height: 200,
    justifyContent: "center",
  },
  rowEmpty: {
    color: "#71717a",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 24,
  },
  scoreBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#eab308",
  },
  scoreText: {
    color: "#eab308",
    fontSize: 10,
    fontWeight: "900",
  },
  spacer: {
    height: 40,
  },
  searchCardInner: {
    borderRadius: 20,
    overflow: "hidden",
  },
  searchCardFab: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  searchCardFabActive: {
    backgroundColor: "#eab308",
    shadowColor: "#eab308",
    shadowOpacity: 0.5,
  },
  searchCardFabInactive: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 2,
    borderColor: "#eab308",
  },
  searchCardFabText: {
    fontSize: 26,
    fontWeight: "900",
    color: "#000",
  },
});
