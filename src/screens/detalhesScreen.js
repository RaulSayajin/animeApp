import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PlaylistModal from "../components/PlaylistModal";
import ResponsiveNavigation from "../components/responsive-navigation";
import { getAnimeDetails } from "../config/anilist";
import {
  getContentPadding,
  getHeroHeight,
  getResponsiveFontSize,
  useResponsive,
} from "../constants/responsive";
import { NAV_ITEMS } from "../navigation/navigationConfig";
import { addMovieToPlaylist, createPlaylist, getPlaylists } from "../storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function DetalhesScreen({
  route,
  navigation,
  user,
  onLogout,
  onNavigate,
}) {
  const responsive = useResponsive();
  const { id } = route.params;
  const [movie, setMovie] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    getAnimeDetails(id).then(async (data) => {
      setMovie(data);
      if (user?.id) {
        loadPlaylists();
      }
    });
  }, [id, user?.id]);

  const loadPlaylists = async () => {
    if (user?.id) {
      const allPlaylists = await getPlaylists(user.id);
      setPlaylists(allPlaylists);
      const inAnyPlaylist = allPlaylists.some((playlist) =>
        playlist.movies.some((m) => m.id === movie?.id || m.id === id),
      );
      setIsFavorite(inAnyPlaylist);
    }
  };

  const handleCreatePlaylist = async (name) => {
    const success = await createPlaylist(user.id, name);
    if (success) {
      loadPlaylists();
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    const success = await addMovieToPlaylist(user.id, playlistId, movie);
    if (success) {
      Alert.alert("Sucesso", "Anime adicionado à playlist!");
      setShowPlaylistModal(false);
      loadPlaylists();
    }
  };

  const handleToggleFavorite = async () => {
    if (!user?.id) {
      Alert.alert("Atenção", "Faça login para salvar animes.");
      return;
    }
    setShowPlaylistModal(true);
  };

  if (!movie) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#eab308" size="large" />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  const genres = movie.Genre?.split(", ") || [];
  const recommendations = movie.Recommendations || [];

  return (
    <View style={{ flex: 1, backgroundColor: "#050505" }}>
      <ScrollView
        style={[
          styles.container,
          responsive.isWeb ? { paddingLeft: 240 } : { paddingBottom: 0 },
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={[styles.heroSection, { height: getHeroHeight() }]}>
          <ImageBackground
            source={{ uri: movie.Poster }}
            style={styles.heroImage}
          >
            <View style={styles.heroOverlay} />
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View
          style={[
            styles.mainContent,
            {
              paddingHorizontal: getContentPadding(),
              paddingVertical: getContentPadding() + 8,
            },
          ]}
        >
          {/* Título e Metadata */}
          <View style={styles.titleSection}>
            <Text
              style={[styles.title, { fontSize: getResponsiveFontSize.h2() }]}
            >
              {movie.Title}
            </Text>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>⭐ {movie.imdbRating}/10</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>{movie.Year}</Text>
              <Text style={styles.metaSeparator}>•</Text>
              <Text style={styles.metaText}>{movie.Status}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={handleToggleFavorite}
            >
              <Text style={styles.primaryBtnText}>
                {isFavorite ? "✓ SALVO" : "+ SALVAR"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>EPISÓDIOS</Text>
              <Text style={styles.infoValue}>{movie.Episodes || "N/A"}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>DURAÇÃO</Text>
              <Text style={styles.infoValue}>{movie.Duration || "N/A"}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>TIPO</Text>
              <Text style={styles.infoValue}>{movie.Format || "N/A"}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>ESTAÇÃO</Text>
              <Text style={styles.infoValue}>
                {movie.Season ? `${movie.Season}` : "N/A"}
              </Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>FONTE</Text>
              <Text style={styles.infoValue}>{movie.Source || "N/A"}</Text>
            </View>
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>PAÍS</Text>
              <Text style={styles.infoValue}>
                {movie.CountryOfOrigin || "N/A"}
              </Text>
            </View>
          </View>

          {/* Gêneros */}
          {genres.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>GÊNEROS</Text>
              <View style={styles.genreRow}>
                {genres.map((genre, idx) => (
                  <View key={idx} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sinopse */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SINOPSE</Text>
            <Text style={styles.description}>
              {movie.Description || movie.Plot}
            </Text>
          </View>

          {/* Informações Técnicas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INFORMAÇÕES</Text>
            <View style={styles.techInfoRow}>
              <View style={styles.techInfo}>
                <Text style={styles.techLabel}>INÍCIO</Text>
                <Text style={styles.techValue}>{movie.StartDate || "N/A"}</Text>
              </View>
              <View style={styles.techInfo}>
                <Text style={styles.techLabel}>FIM</Text>
                <Text style={styles.techValue}>{movie.EndDate || "N/A"}</Text>
              </View>
            </View>
            {movie.Studios && (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.techLabel}>ESTÚDIOS</Text>
                <Text style={styles.techValue}>{movie.Studios}</Text>
              </View>
            )}
            {movie.IsAdult && (
              <View
                style={{
                  marginTop: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <View style={styles.adultBadge}>
                  <Text style={styles.adultText}>18+</Text>
                </View>
                <Text style={styles.techValue}>Conteúdo adulto</Text>
              </View>
            )}
          </View>

          {/* Recomendações */}
          {recommendations && recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>SIMILAR</Text>
              <FlatList
                data={recommendations.slice(0, 5)}
                horizontal
                scrollEnabled={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    key={item.mediaRecommendation?.id}
                    style={styles.recCard}
                    onPress={() => {
                      if (item.mediaRecommendation?.id) {
                        navigation.push("Detalhes", {
                          id: item.mediaRecommendation.id,
                        });
                      }
                    }}
                  >
                    <ImageBackground
                      source={{
                        uri:
                          item.mediaRecommendation?.coverImage?.large ||
                          "https://via.placeholder.com/100x150",
                      }}
                      style={styles.recPoster}
                      imageStyle={{ borderRadius: 12 }}
                    >
                      <View style={styles.recOverlay} />
                    </ImageBackground>
                    <Text style={styles.recTitle} numberOfLines={2}>
                      {item.mediaRecommendation?.title?.romaji ||
                        item.mediaRecommendation?.title?.english}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, idx) => String(idx)}
                contentContainerStyle={styles.recList}
              />
            </View>
          )}

          <View style={styles.spacer} />
        </View>
      </ScrollView>

      <PlaylistModal
        visible={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        playlists={playlists}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={handleCreatePlaylist}
      />

      <ResponsiveNavigation
        items={NAV_ITEMS}
        activeRoute="Descobrir"
        onNavigate={(route) => {
          onNavigate(route);
          navigation.navigate("Home");
        }}
        onLogout={onLogout}
        userName={user?.name}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#050505",
  },
  loadingText: {
    marginTop: 14,
    color: "#71717a",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 100,
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "300",
  },
  heroSection: {
    width: "100%",
    backgroundColor: "#1a1a1e",
  },
  heroImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  mainContent: {
    backgroundColor: "#050505",
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontWeight: "900",
    color: "#fff",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  metaText: {
    fontSize: 13,
    color: "#a1a1aa",
    fontWeight: "700",
  },
  metaSeparator: {
    color: "#52525b",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtn: {
    backgroundColor: "#eab308",
  },
  primaryBtnText: {
    color: "#000",
    fontWeight: "900",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  secondaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    width: "32%",
    backgroundColor: "#18181b",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#71717a",
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#eab308",
    letterSpacing: 1.5,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreTag: {
    backgroundColor: "#18181b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  genreText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
  },
  description: {
    color: "#a1a1aa",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  techInfoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  techInfo: {
    flex: 1,
    backgroundColor: "#18181b",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
  },
  techLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#71717a",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  techValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  adultBadge: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  adultText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
  },
  recList: {
    gap: 12,
    paddingBottom: 4,
  },
  recCard: {
    width: 110,
  },
  recPoster: {
    width: "100%",
    aspectRatio: 2 / 3,
    backgroundColor: "#18181b",
    borderRadius: 12,
    marginBottom: 8,
  },
  recOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  recTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    lineHeight: 14,
  },
  spacer: {
    height: 40,
  },
});
