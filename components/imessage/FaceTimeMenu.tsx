import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (key: 'audio' | 'video' | 'share' | 'ask') => void;
};

export default function FaceTimeMenu({ visible, onClose, onSelect }: Props) {
  const scale = useSharedValue(0.1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // Smooth expand from the button — no bounce.
      scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.cubic) });
      opacity.value = withTiming(1, { duration: 120 });
    } else {
      scale.value = 0.1;
      opacity.value = 0;
    }
  }, [visible, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const handle = (key: 'audio' | 'video' | 'share' | 'ask') => {
    onSelect?.(key);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View style={[styles.menu, animStyle]}>
        <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => handle('audio')}
        >
          <Text style={styles.label}>FaceTime Audio</Text>
          <Ionicons name="call-outline" size={22} color="#000000" />
        </Pressable>

        <View style={styles.hairline} />

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => handle('video')}
        >
          <Text style={styles.label}>FaceTime Video</Text>
          <Feather name="video" size={22} color="#000000" />
        </Pressable>

        <View style={styles.groupDivider} />

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => handle('share')}
        >
          <Text style={styles.label}>Share My Screen</Text>
        </Pressable>

        <View style={styles.hairline} />

        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => handle('ask')}
        >
          <Text style={styles.label}>Ask to Share Screen</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  menu: {
    position: 'absolute',
    top: 92,
    right: 10,
    width: 268,
    borderRadius: 14,
    backgroundColor: 'rgba(248,248,248,0.45)',
    overflow: 'hidden',
    transformOrigin: 'top right',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 8,
  },
  row: {
    height: 55,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  rowPressed: {
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  label: {
    fontSize: 19,
    color: '#000000',
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
    marginLeft: 18,
  },
  groupDivider: {
    height: 6,
    backgroundColor: '#C8C8CC',
  },
});
