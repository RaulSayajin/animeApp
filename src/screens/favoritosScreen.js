import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from "react-native";
import PlaylistModal from "../components/PlaylistModal";
import { getBottomNavHeight, useResponsive } from "../constants/responsive";
import { createPlaylist, getPlaylists } from "../storage";

export default function FavoritosScreen({ navigation, user }) {
  const responsive = useResponsive();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlaylist, setExpandedPlaylist] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) {
      setPlaylists([]);
      return;
    }

    setLoading(true);
    try {
      const userPlaylists = await getPlaylists(user.id);
      setPlaylists(userPlaylists);
    } catch (error) {
      console.log("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const handleCreatePlaylist = async (name) => {
    if (!user?.id) return;
    const success = await createPlaylist(user.id, name);
    if (success) {
      loadData();
    }
  };

  // Load data when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const renderPlaylistMovie = ({ item }) => (
    <Pressable
      style={styles.playlistMovie}
      onPress={() => navigation.navigate("Detalhes", { id: item.id })}
    >
      <View style={styles.playlistMoviePosterContainer}>
        <ImageBackground
          source={{
            uri:
              item.Poster !== "N/A"
                ? item.Poster
                : "https://via.placeholder.com/150",
          }}
          style={styles.playlistMoviePoster}
          imageStyle={{ borderRadius: 16 }}
        >
          <View style={styles.playlistMovieOverlay} />
        </ImageBackground>
      </View>
      <Text style={styles.playlistMovieTitle} numberOfLines={1}>
        {item.Title}
      </Text>
    </Pressable>
  );

  const renderPlaylistCard = ({ item: playlist }) => (
    <View style={styles.playlistCard}>
      <Pressable
        style={styles.playlistHeader}
        onPress={() =>
          setExpandedPlaylist(
            expandedPlaylist === playlist.id ? null : playlist.id,
          )
        }
      >
        <View style={styles.playlistLeft}>
          <View style={styles.playlistIconContainer}>
            <Text style={styles.playlistEmoji}>📁</Text>
          </View>
          <View style={styles.playlistTitleSection}>
            <Text style={styles.playlistTitle}>{playlist.name}</Text>
            <Text style={styles.playlistMeta}>
              {playlist.movies.length} Títulos • Criada em{" "}
              {new Date(playlist.createdAt).toLocaleDateString("pt-BR")}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.expandIcon,
            expandedPlaylist === playlist.id && styles.expandIconActive,
          ]}
        >
          {expandedPlaylist === playlist.id ? "▼" : "▶"}
        </Text>
      </Pressable>

      {expandedPlaylist === playlist.id && (
        <View style={styles.playlistContentWrapper}>
          <View style={styles.playlistDivider} />
          {playlist.movies.length > 0 ? (
            <FlatList
              data={playlist.movies}
              renderItem={renderPlaylistMovie}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playlistMoviesContent}
              scrollEnabled={true}
            />
          ) : (
            <Text style={styles.emptyPlaylist}>
              Nenhum anime nesta playlist
            </Text>
          )}
        </View>
      )}
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        responsive.isWeb
          ? { paddingLeft: 240, paddingBottom: 0 }
          : { paddingLeft: 0, paddingBottom: getBottomNavHeight() },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerTitleMain}>
              MINHA <Text style={{ color: "#eab308" }}>COLEÇÃO</Text>
            </Text>
          </View>
          <View style={styles.headerTaglineRow}>
            <View style={styles.headerLine} />
            <Text style={styles.headerSubtitleText}>CURADORIA PESSOAL</Text>
          </View>
        </View>

        <View style={styles.createArea}>
          <Pressable
            style={styles.createPlaylistMainBtn}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.createPlaylistMainBtnText}>
              + NOVA PLAYLIST
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loaderArea}>
            <ActivityIndicator color="#eab308" size="large" />
          </View>
        ) : playlists.length > 0 ? (
          <View style={styles.listWrapper}>
            {playlists.map((playlist) => (
              <View key={playlist.id}>
                {renderPlaylistCard({ item: playlist })}
              </View>
            ))}
          </View>
        ) : (
          <EmptyStateView
            icon="📁"
            title="SEM PLAYLISTS"
            sub="Crie sua primeira lista agora mesmo"
          />
        )}
      </ScrollView>

      <PlaylistModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        playlists={playlists}
        onAddToPlaylist={() => {}} // Não necessário aqui
        onCreatePlaylist={handleCreatePlaylist}
      />
    </View>
  );
}

const EmptyStateView = ({ icon, title, sub }) => (
  <View style={styles.emptyBox}>
    <View style={styles.emptyIconCircle}>
      <Text style={styles.emptyIconLarge}>{icon}</Text>
    </View>
    <Text style={styles.emptyTitleLarge}>{title}</Text>
    <Text style={styles.emptySubtextLarge}>{sub}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  scrollContent: {
    paddingBottom: 100,
    paddingTop: 40,
  },
  header: {
    paddingHorizontal: 28,
    marginBottom: 32,
  },
  headerTitleRow: {
    marginBottom: 8,
  },
  headerTitleMain: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
  },
  headerTaglineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerLine: {
    width: 24,
    height: 2,
    backgroundColor: "#eab308",
    borderRadius: 1,
  },
  headerSubtitleText: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.5,
  },
  createArea: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  createPlaylistMainBtn: {
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(234, 179, 8, 0.3)",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  createPlaylistMainBtnText: {
    color: "#eab308",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2,
  },
  loaderArea: {
    paddingTop: 100,
    alignItems: "center",
  },
  listWrapper: {
    paddingHorizontal: 24,
    gap: 16,
  },
  playlistCard: {
    backgroundColor: "rgba(24, 24, 27, 0.4)",
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    marginBottom: 16,
  },
  playlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  playlistLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  playlistIconContainer: {
    width: 52,
    height: 52,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  playlistEmoji: {
    fontSize: 22,
  },
  playlistTitleSection: {
    flex: 1,
  },
  playlistTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  playlistMeta: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  expandIcon: {
    color: "#71717a",
    fontSize: 12,
    fontWeight: "900",
  },
  expandIconActive: {
    color: "#eab308",
  },
  playlistContentWrapper: {
    paddingBottom: 24,
  },
  playlistDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 24,
    marginBottom: 20,
  },
  playlistMoviesContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  playlistMovie: {
    width: 140,
    gap: 10,
  },
  playlistMoviePosterContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  playlistMoviePoster: {
    width: 140,
    aspectRatio: 2 / 3,
    backgroundColor: "#18181b",
  },
  playlistMovieOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  playlistMovieTitle: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontStyle: "italic",
  },
  emptyPlaylist: {
    color: "#3f3f46",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emptyBox: {
    paddingTop: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 30,
    backgroundColor: "#0c0c0e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyIconLarge: {
    fontSize: 32,
    opacity: 0.5,
  },
  emptyTitleLarge: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  emptySubtextLarge: {
    color: "#52525b",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
