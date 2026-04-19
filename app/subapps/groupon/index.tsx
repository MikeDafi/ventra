import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect, useRouter } from 'expo-router';
import { GROUPON_FOLDER, SEED_VOUCHERS, Voucher } from '@/constants/groupon';

export default function GrouponHome() {
  const [vouchers, setVouchers] = useState<{ name: string; voucher: Voucher; modified: number }[]>([]);
  const router = useRouter();

  const loadVouchers = async () => {
    const folderInfo = await FileSystem.getInfoAsync(GROUPON_FOLDER);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(GROUPON_FOLDER, { intermediates: true });
      for (const v of SEED_VOUCHERS) {
        const path = `${GROUPON_FOLDER}${v.id}.json`;
        await FileSystem.writeAsStringAsync(path, JSON.stringify(v, null, 2));
      }
    }

    const allFiles = await FileSystem.readDirectoryAsync(GROUPON_FOLDER);
    const jsonFiles = allFiles.filter(f => f.endsWith('.json'));

    const loaded = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await FileSystem.readAsStringAsync(GROUPON_FOLDER + file);
        const info = await FileSystem.getInfoAsync(GROUPON_FOLDER + file);
        return {
          name: file,
          voucher: JSON.parse(content) as Voucher,
          modified: info.modificationTime || 0,
        };
      })
    );

    loaded.sort((a, b) => b.modified - a.modified);
    setVouchers(loaded);
  };

  useFocusEffect(
    useCallback(() => {
      loadVouchers();
    }, [])
  );

  const deleteVoucher = async (fileName: string) => {
    try {
      await FileSystem.deleteAsync(GROUPON_FOLDER + fileName);
      loadVouchers();
    } catch {
      Alert.alert('Error', 'Could not delete voucher');
    }
  };

  const navigateToViewer = (fileName: string, mode: 'preview' | 'inGame') => {
    router.push({
      pathname: '/subapps/groupon/viewer',
      params: { fileName, mode },
    });
  };

  const navigateToEdit = async (fileName: string) => {
    const content = await FileSystem.readAsStringAsync(GROUPON_FOLDER + fileName);
    router.push({
      pathname: '/subapps/groupon/form',
      params: { voucherPayload: content, fileName },
    });
  };

  const renderItem = ({ item }: { item: { name: string; voucher: Voucher; modified: number } }) => {
    const v = item.voucher;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>{v.title}</Text>
        </View>
        {v.location ? <Text style={styles.cardLocation}>{v.location}</Text> : null}

        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>Paid {v.amountPaid}</Text>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.previewBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigateToViewer(item.name, 'preview')}
          >
            <Text style={styles.btnTextWhite}>Preview</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.inGameBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigateToViewer(item.name, 'inGame')}
          >
            <Text style={styles.btnTextDark}>In-Game</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigateToEdit(item.name)}
          >
            <Text style={styles.btnTextDark}>Edit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
            onPress={() => {
              Alert.alert('Delete Voucher', `Delete "${v.title}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteVoucher(item.name) },
              ]);
            }}
          >
            <Text style={styles.btnTextWhite}>Delete</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Groupon Vouchers</Text>

      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/subapps/groupon/form')}
      >
        <Text style={styles.addButtonText}>+ Add Voucher</Text>
      </Pressable>

      {vouchers.length === 0 ? (
        <Text style={styles.empty}>No vouchers yet</Text>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={(item) => item.name}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 80, backgroundColor: '#f5f5f5' },
  header: { fontSize: 28, fontWeight: 'bold', marginBottom: 16, color: '#1a1a1a' },
  addButton: {
    backgroundColor: '#3d7a2a',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { fontStyle: 'italic', color: '#888', textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: { marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
  cardLocation: { fontSize: 12, color: '#999', marginTop: 2, marginBottom: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  cardPrice: { fontSize: 13, color: '#555', fontWeight: '600' },
  cardExpiry: { fontSize: 12, color: '#999' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap' },
  previewBtn: {
    backgroundColor: '#3d7a2a',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  inGameBtn: {
    backgroundColor: '#EFEFEF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  editBtn: {
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  deleteBtn: {
    backgroundColor: '#FF4D4F',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  btnTextWhite: { color: '#fff', fontWeight: '600', fontSize: 13 },
  btnTextDark: { color: '#333', fontWeight: '600', fontSize: 13 },
});
