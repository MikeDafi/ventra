import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { useLocalSearchParams, useFocusEffect, useRouter, useNavigation } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import { DeviceMotion } from 'expo-sensors';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GROUPON_FOLDER, Voucher } from '@/constants/groupon';
import GrouponVoucher from '@/components/GrouponVoucher';
import SwipeToRedeem from '@/components/SwipeToRedeem';

const SHAKE_THRESHOLD = 1.5;

export default function VoucherViewer() {
  const { fileName, previewPayload, mode } = useLocalSearchParams<{
    fileName?: string;
    previewPayload?: string;
    mode?: 'preview' | 'inGame';
  }>();
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const stampScale = useSharedValue(0);
  const [redeemed, setRedeemed] = useState(false);
  const [locked, setLocked] = useState(mode === 'inGame');
  const router = useRouter();
  const navigation = useNavigation();

  // Block back navigation when locked (in-game mode)
  useEffect(() => {
    if (!locked) return;
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (locked) {
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [locked, navigation]);

  // Listen for shake to unlock
  useEffect(() => {
    if (!locked) return;
    DeviceMotion.setUpdateInterval(100);
    const sub = DeviceMotion.addListener((data) => {
      const { x, y, z } = data.acceleration || {};
      if (x == null || y == null || z == null) return;
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      if (magnitude > SHAKE_THRESHOLD) {
        setLocked(false);
      }
    });
    return () => sub.remove();
  }, [locked]);

  const loadVoucher = async () => {
    let parsed: Voucher;
    if (previewPayload) {
      parsed = JSON.parse(previewPayload) as Voucher;
    } else if (fileName) {
      const content = await FileSystem.readAsStringAsync(GROUPON_FOLDER + fileName);
      parsed = JSON.parse(content) as Voucher;
    } else {
      return;
    }

    setVoucher(parsed);
    stampScale.value = 0;
    setRedeemed(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadVoucher();
    }, [fileName, previewPayload])
  );

  const handleSwipeComplete = () => {
    setTimeout(() => setRedeemed(true), 400);
  };

  if (!voucher) {
    return (
      <View style={styles.loading}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Voucher</Text>
        </View>

        {/* Voucher Card */}
        <GrouponVoucher voucher={voucher} stampScale={stampScale} />

        {/* Swipe section or Buy It Again */}
        {!redeemed ? (
          <View style={styles.swipeSection}>
            <Text style={styles.swipePrompt}>
              All done? Mark this Groupon as used.
            </Text>
            <SwipeToRedeem stampScale={stampScale} onSwipeComplete={handleSwipeComplete} />
          </View>
        ) : (
          <View style={styles.buyAgainCard}>
            <MaterialCommunityIcons name="history" size={36} color="#1a1a1a" style={[styles.clockIcon, { transform: [{ rotate: '90deg' }] }]} />
            <View>
              <Text style={styles.buyAgainTitle}>Buy It Again</Text>
              <Text style={styles.buyAgainSubtitle}>
                You can purchase this deal again.
              </Text>
            </View>
          </View>
        )}

        {/* Locked indicator for in-game mode */}
        {locked && (
          <View style={styles.lockedBanner}>
            <Text style={styles.lockedText}>Shake to unlock navigation</Text>
          </View>
        )}

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  swipeSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  swipePrompt: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  buyAgainCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 12,
  },
  buyAgainTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  buyAgainSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  lockedBanner: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  lockedText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
