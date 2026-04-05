import React, { useState } from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    useResponsive
} from "../constants/responsive";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function PlaylistModal({
  visible,
  onClose,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
}) {
  const responsive = useResponsive();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const handleCreate = () => {
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName);
    setNewPlaylistName("");
    setIsCreating(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHandle} />

          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>SALVAR EM...</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCloseText}>FECHAR</Text>
            </TouchableOpacity>
          </View>

          {isCreating ? (
            <View style={styles.createContainer}>
              <TextInput
                style={styles.playlistInput}
                placeholder="Nome da Playlist"
                placeholderTextColor="#52525b"
                value={newPlaylistName}
                onChangeText={setNewPlaylistName}
                autoFocus
              />
              <View style={styles.createActionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsCreating(false)}
                >
                  <Text style={styles.cancelBtnText}>CANCELAR</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={handleCreate}
                >
                  <Text style={styles.confirmBtnText}>CRIAR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView
              style={styles.playlistList}
              showsVerticalScrollIndicator={false}
            >
              {playlists.map((pl) => (
                <TouchableOpacity
                  key={pl.id}
                  style={styles.playlistItem}
                  onPress={() => onAddToPlaylist(pl.id)}
                >
                  <View style={styles.playlistIconBox}>
                    <Text style={styles.playlistIcon}>📁</Text>
                  </View>
                  <View>
                    <Text style={styles.playlistItemName}>{pl.name}</Text>
                    <Text style={styles.playlistItemCount}>
                      {pl.movies?.length || 0} ANIMES
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.newPlaylistBtn}
                onPress={() => setIsCreating(true)}
              >
                <Text style={styles.newPlaylistBtnText}>+ NOVA PLAYLIST</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#0c0c0e",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: SCREEN_HEIGHT * 0.45,
    maxHeight: SCREEN_HEIGHT * 0.85,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.5,
  },
  modalCloseText: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
  playlistList: {
    flexShrink: 1,
    marginBottom: 20,
  },
  playlistItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.03)",
  },
  playlistIconBox: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(234,179,8,0.1)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  playlistIcon: {
    fontSize: 18,
  },
  playlistItemName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  playlistItemCount: {
    color: "#52525b",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 2,
  },
  newPlaylistBtn: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.05)",
    borderStyle: "dashed",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  newPlaylistBtnText: {
    color: "#eab308",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2,
  },
  createContainer: {
    marginTop: 20,
  },
  playlistInput: {
    backgroundColor: "#18181b",
    borderRadius: 16,
    padding: 20,
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  createActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cancelBtnText: {
    color: "#71717a",
    fontSize: 10,
    fontWeight: "900",
  },
  confirmBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eab308",
  },
  confirmBtnText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
  },
});
