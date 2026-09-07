import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { CHAT_FOLDER } from '@/constants/imessage';

type ChatFile = { name: string; modified: number; chatData: any };

export default function ChatList() {
  const [files, setFiles] = useState<ChatFile[]>([]);
  const router = useRouter();

  const loadChats = async () => {
    const folderInfo = await FileSystem.getInfoAsync(CHAT_FOLDER);
    if (!folderInfo.exists) {
      setFiles([]);
      return;
    }

    const allFiles = await FileSystem.readDirectoryAsync(CHAT_FOLDER);
    const chatFiles = allFiles.filter((f) => f.endsWith('.json'));

    const filesWithStats = await Promise.all(
      chatFiles.map(async (file) => {
        const info = await FileSystem.getInfoAsync(CHAT_FOLDER + file);
        const content = await FileSystem.readAsStringAsync(CHAT_FOLDER + file);
        return {
          name: file,
          modified: info.modificationTime || 0,
          chatData: JSON.parse(content),
        };
      })
    );

    setFiles(filesWithStats.sort((a, b) => b.modified - a.modified));
  };

  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  const deleteChat = async (fileName: string) => {
    try {
      await FileSystem.deleteAsync(CHAT_FOLDER + fileName);
      loadChats();
    } catch (err) {
      Alert.alert('Error', 'Could not delete file');
    }
  };

  const handlePreview = async (fileName: string) => {
    const content = await FileSystem.readAsStringAsync(CHAT_FOLDER + fileName);
    router.push({
      pathname: '/subapps/imessage/preview',
      params: { chatPayload: content },
    });
  };

  const handleEdit = async (fileName: string) => {
    const content = await FileSystem.readAsStringAsync(CHAT_FOLDER + fileName);
    router.push({
      pathname: '/subapps/imessage/form',
      params: { chatPayload: content, editMode: 'true' },
    });
  };

  const renderItem = ({ item }: { item: ChatFile }) => {
    const lastModified = new Date(item.modified * 1000);
    const formattedTime = lastModified.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
    const name = item.chatData.personName?.trim() || 'Unknown';
    const lastMsg =
      item.chatData.messages?.[item.chatData.messages.length - 1]?.text || 'No messages';

    return (
      <View style={styles.chatCard}>
        <View style={styles.chatHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.chatName}>{name}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {lastMsg}
            </Text>
          </View>
          <View style={styles.modifiedContainer}>
            <Text style={styles.modifiedText}>Edited:</Text>
            <Text style={styles.modifiedText}>{formattedTime}</Text>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.previewButton, pressed && styles.buttonPressed]}
            onPress={() => handlePreview(item.name)}
          >
            <Text style={styles.buttonText}>👁 Preview</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
            onPress={() => handleEdit(item.name)}
          >
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && styles.buttonPressed]}
            onPress={() => {
              Alert.alert('Confirm Delete', `Are you sure you want to delete ${item.name}?`, [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => deleteChat(item.name),
                },
              ]);
            }}
          >
            <Text style={styles.deleteButtonText}>🗑 Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: '💬 Your Chats' }} />
      <View style={styles.container}>
        <Text style={styles.header}>💬 Saved Chats</Text>
        {files.length === 0 ? (
          <Text style={styles.noChats}>No chats found</Text>
        ) : (
          <FlatList
            data={files}
            keyExtractor={(item) => item.name}
            renderItem={renderItem}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 100, backgroundColor: '#f7f8fc' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  chatCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chatName: { fontSize: 18, fontWeight: '600', color: '#222' },
  subtitle: { fontSize: 12, color: '#555', marginTop: 2 },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap' },
  previewButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  editButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF4D4F',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: '600', fontSize: 12 },
  editButtonText: { color: '#333', fontWeight: '600', fontSize: 12 },
  deleteButtonText: { color: 'white', fontWeight: '600', fontSize: 12 },
  buttonPressed: { opacity: 0.7 },
  noChats: { fontStyle: 'italic', color: '#666' },
  modifiedContainer: { alignItems: 'flex-end' },
  modifiedText: { fontSize: 12, color: '#777', marginTop: 4 },
});
