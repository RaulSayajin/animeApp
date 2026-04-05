import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import {
    getContentPadding,
    getResponsiveFontSize,
    useResponsive,
} from "../constants/responsive";

// Mapeamento completo de gêneros disponíveis
const ALL_GENRES = [
  // Genres principais
  { id: "Action", name: "Action", tag: "genre" },
  { id: "Adventure", name: "Adventure", tag: "genre" },
  { id: "Comedy", name: "Comedy", tag: "genre" },
  { id: "Drama", name: "Drama", tag: "genre" },
  { id: "Ecchi", name: "Ecchi", tag: "genre" },
  { id: "Fantasy", name: "Fantasy", tag: "genre" },
  { id: "Horror", name: "Horror", tag: "genre" },
  { id: "Mahou Shoujo", name: "Mahou Shoujo", tag: "genre" },
  { id: "Mecha", name: "Mecha", tag: "genre" },
  { id: "Music", name: "Music", tag: "genre" },
  { id: "Mystery", name: "Mystery", tag: "genre" },
  { id: "Psychological", name: "Psychological", tag: "genre" },
  { id: "Romance", name: "Romance", tag: "genre" },
  { id: "Sci-Fi", name: "Sci-Fi", tag: "genre" },
  { id: "Slice of Life", name: "Slice of Life", tag: "genre" },
  { id: "Sports", name: "Sports", tag: "genre" },
  { id: "Supernatural", name: "Supernatural", tag: "genre" },
  { id: "Thriller", name: "Thriller", tag: "genre" },

  // Themes (seleção mais populares)
  { id: "Isekai", name: "Isekai", tag: "theme" },
  { id: "School", name: "School", tag: "theme" },
  { id: "Military", tag: "Military", tag: "theme" },
  { id: "Historical", name: "Historical", tag: "theme" },
  { id: "Medieval", name: "Medieval", tag: "theme" },
  { id: "Cyberpunk", name: "Cyberpunk", tag: "theme" },
  { id: "Post-Apocalyptic", name: "Post-Apocalyptic", tag: "theme" },
  { id: "Urban Fantasy", name: "Urban Fantasy", tag: "theme" },
  { id: "Vampire", name: "Vampire", tag: "theme" },
  { id: "Samurai", name: "Samurai", tag: "theme" },
  { id: "Pirates", name: "Pirates", tag: "theme" },
  { id: "Zombie", name: "Zombie", tag: "theme" },
  { id: "Reincarnation", name: "Reincarnation", tag: "theme" },
  { id: "Time Loop", name: "Time Loop", tag: "theme" },
  {
    id: "Artificial Intelligence",
    name: "Artificial Intelligence",
    tag: "theme",
  },
  { id: "Aliens", name: "Aliens", tag: "theme" },
  { id: "Demons", name: "Demons", tag: "theme" },
  { id: "Dragons", name: "Dragons", tag: "theme" },
  { id: "Gods", name: "Gods", tag: "theme" },
  { id: "Marriage", name: "Marriage", tag: "theme" },
  { id: "Prison", name: "Prison", tag: "theme" },
  { id: "War", name: "War", tag: "theme" },
  { id: "Ghost", name: "Ghost", tag: "theme" },
  { id: "Detective", name: "Detective", tag: "theme" },

  // Formatos
  { id: "TV", name: "TV", tag: "format" },
  { id: "Movie", name: "Movie", tag: "format" },
  { id: "OVA", name: "OVA", tag: "format" },
  { id: "Special", name: "Special", tag: "format" },
];

export default function GenreSelector({
  visible,
  onClose,
  onSelectGenre,
  selectedGenres = [],
}) {
  const responsive = useResponsive();
  const [searchText, setSearchText] = useState("");

  const filteredGenres = useMemo(() => {
    if (!searchText.trim()) return ALL_GENRES;

    const query = searchText.toLowerCase();
    return ALL_GENRES.filter((genre) =>
      genre.name.toLowerCase().includes(query),
    );
  }, [searchText]);

  // Agrupar por tipo
  const groupedGenres = useMemo(() => {
    const groups = {
      genre: [],
      theme: [],
      format: [],
    };

    filteredGenres.forEach((g) => {
      if (groups[g.tag]) groups[g.tag].push(g);
    });

    return groups;
  }, [filteredGenres]);

  const renderGenreItem = ({ item }) => {
    const isSelected = selectedGenres.includes(item.id);

    return (
      <Pressable
        style={[
          styles.genreItem,
          isSelected && styles.genreItemActive,
          { paddingHorizontal: getContentPadding() - 4 },
        ]}
        onPress={() => onSelectGenre(item.id)}
      >
        <Text
          style={[
            styles.genreText,
            { fontSize: getResponsiveFontSize.body() },
            isSelected && styles.genreTextActive,
          ]}
        >
          {item.name}
        </Text>
        {isSelected && <Text style={styles.genreCheckmark}>✓</Text>}
      </Pressable>
    );
  };

  const renderSection = (title, genres) => {
    if (genres.length === 0) return null;

    return (
      <View key={title} style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: getResponsiveFontSize.small() },
          ]}
        >
          {title}
        </Text>
        <View style={styles.genresGrid}>
          {genres.map((genre) => (
            <Pressable
              key={genre.id}
              style={[
                styles.genreChip,
                selectedGenres.includes(genre.id) && styles.genreChipActive,
              ]}
              onPress={() => onSelectGenre(genre.id)}
            >
              <Text
                style={[
                  styles.genreChipText,
                  selectedGenres.includes(genre.id) &&
                    styles.genreChipTextActive,
                ]}
              >
                {genre.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        {/* Header */}
        <View
          style={[styles.header, { paddingHorizontal: getContentPadding() }]}
        >
          <View style={styles.headerTop}>
            <Text
              style={[
                styles.headerTitle,
                { fontSize: getResponsiveFontSize.h3() },
              ]}
            >
              Selecionar Gêneros
            </Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>

          {/* Search */}
          <TextInput
            placeholder="Buscar gêneros..."
            placeholderTextColor="#71717a"
            value={searchText}
            onChangeText={setSearchText}
            style={[
              styles.searchInput,
              {
                fontSize: getResponsiveFontSize.body(),
                paddingVertical: getContentPadding() - 4,
              },
            ]}
          />

          {/* Selected Count */}
          {selectedGenres.length > 0 && (
            <Text style={styles.selectedCount}>
              {selectedGenres.length} selecionado
              {selectedGenres.length !== 1 ? "s" : ""}
            </Text>
          )}
        </View>

        {/* Content */}
        <FlatList
          data={[
            {
              type: "genres",
              title: "🎬 Gêneros",
              genres: groupedGenres.genre,
            },
            { type: "themes", title: "✨ Temas", genres: groupedGenres.theme },
            {
              type: "formats",
              title: "📺 Formatos",
              genres: groupedGenres.format,
            },
          ]}
          keyExtractor={(item) => item.type}
          renderItem={({ item }) => renderSection(item.title, item.genres)}
          contentContainerStyle={[
            styles.listContent,
            { paddingHorizontal: getContentPadding() },
          ]}
          showsVerticalScrollIndicator={false}
        />

        {/* Footer - Action Buttons */}
        <View
          style={[
            styles.footer,
            { paddingBottom: responsive.isMobile ? 20 : 16 },
          ]}
        >
          <Pressable
            style={styles.buttonSecondary}
            onPress={() => {
              setSearchText("");
              onClose();
            }}
          >
            <Text style={styles.buttonSecondaryText}>Fechar</Text>
          </Pressable>
          <Pressable
            style={[
              styles.buttonPrimary,
              selectedGenres.length === 0 && styles.buttonDisabled,
            ]}
            onPress={onClose}
            disabled={selectedGenres.length === 0}
          >
            <Text style={styles.buttonPrimaryText}>
              {selectedGenres.length > 0
                ? `Filtrar (${selectedGenres.length})`
                : "Selecione um gênero"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
    paddingTop: 40,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1e",
    backgroundColor: "#050505",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: {
    color: "#eab308",
    fontSize: 20,
    fontWeight: "900",
  },
  searchInput: {
    backgroundColor: "#0c0c0e",
    color: "#fff",
    paddingHorizontal: 16,
    borderRadius: 12,
    fontWeight: "600",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  selectedCount: {
    color: "#eab308",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 8,
  },
  listContent: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: "#eab308",
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#18181b",
    borderWidth: 1,
    borderColor: "#27272a",
  },
  genreChipActive: {
    backgroundColor: "#eab308",
    borderColor: "#eab308",
  },
  genreChipText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
  },
  genreChipTextActive: {
    color: "#000",
    fontWeight: "900",
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#1a1a1e",
    backgroundColor: "#050505",
  },
  buttonSecondary: {
    flex: 0.4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#27272a",
    alignItems: "center",
  },
  buttonSecondaryText: {
    color: "#a1a1aa",
    fontSize: 12,
    fontWeight: "700",
  },
  buttonPrimary: {
    flex: 0.6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#eab308",
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "900",
  },
  buttonDisabled: {
    backgroundColor: "#3f3f46",
    opacity: 0.5,
  },
});
