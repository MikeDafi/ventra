import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Keyboard } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Svg, { Path, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type PlusOption =
  | 'camera'
  | 'photos'
  | 'stickers'
  | 'applecash'
  | 'genmoji'
  | 'audio'
  | 'store';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (key: PlusOption) => void;
};

function PhotosPinwheel({ size = 30 }: { size?: number }) {
  // Eight full, rounded petals radiating from the center (iOS Photos flower).
  const colors = [
    '#FCCC63', // top - yellow
    '#7FD06F', // green
    '#33C4C4', // teal
    '#4AA3F0', // blue
    '#7A6FF0', // indigo
    '#C86DD7', // purple
    '#F45C8C', // pink
    '#F97D5A', // orange-red
  ];
  const c = 15;
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      {colors.map((color, i) => (
        <Path
          key={i}
          // A rounded teardrop petal from the center pointing up.
          d="M15 3.5 C18 6 18.5 10 15 14.5 C11.5 10 12 6 15 3.5 Z"
          fill={color}
          opacity={0.92}
          transform={`rotate(${i * 45} ${c} ${c})`}
        />
      ))}
      <Circle cx={c} cy={c} r={2.4} fill="#F7C948" />
    </Svg>
  );
}

function StickerPeel({ size = 30 }: { size?: number }) {
  // Purple→blue rounded square with a peeled/curled bottom-left corner.
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30">
      <Path
        d="M8 5 h14 a3 3 0 0 1 3 3 v14 a3 3 0 0 1 -3 3 h-8 L5 16 V8 a3 3 0 0 1 3 -3 Z"
        fill="#FFFFFF"
      />
      <Path d="M14 25 L5 16 h6 a3 3 0 0 1 3 3 Z" fill="#DDE3EA" />
    </Svg>
  );
}

function OptionIcon({ option }: { option: PlusOption }) {
  switch (option) {
    case 'camera':
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#E3E3E8' }]}>
          <Ionicons name="camera" size={22} color="#3A3A3C" />
        </View>
      );
    case 'photos':
      return (
        <View style={[styles.iconCircle, styles.iconBordered]}>
          <PhotosPinwheel size={30} />
        </View>
      );
    case 'stickers':
      return (
        <LinearGradient
          colors={['#8E8BFF', '#57B7F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconCircle}
        >
          <StickerPeel size={26} />
        </LinearGradient>
      );
    case 'applecash':
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#111111' }]}>
          <MaterialCommunityIcons name="currency-usd" size={22} color="#FFFFFF" />
        </View>
      );
    case 'genmoji':
      return (
        <LinearGradient
          colors={['#5AC8FA', '#FF5AF2', '#FF9500']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.iconCircle}
        >
          <MaterialCommunityIcons name="emoticon-plus" size={20} color="#FFFFFF" />
        </LinearGradient>
      );
    case 'audio':
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#FF6B54' }]}>
          <MaterialCommunityIcons name="waveform" size={22} color="#FFFFFF" />
        </View>
      );
    case 'store':
      return (
        <View style={[styles.iconCircle, { backgroundColor: '#0A84FF' }]}>
          <Ionicons name="logo-apple-appstore" size={22} color="#FFFFFF" />
        </View>
      );
  }
}

const OPTIONS: { key: PlusOption; label: string }[] = [
  { key: 'camera', label: 'Camera' },
  { key: 'photos', label: 'Photos' },
  { key: 'stickers', label: 'Stickers' },
  { key: 'applecash', label: 'Apple Cash' },
  { key: 'genmoji', label: 'Genmoji' },
  { key: 'audio', label: 'Audio' },
  { key: 'store', label: 'Store' },
];

export default function PlusMenu({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [kbHeight, setKbHeight] = useState(0);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', (e) =>
      setKbHeight(e.endCoordinates?.height ?? 0)
    );
    const showA = Keyboard.addListener('keyboardDidShow', (e) =>
      setKbHeight(e.endCoordinates?.height ?? 0)
    );
    const hide = Keyboard.addListener('keyboardWillHide', () => setKbHeight(0));
    const hideA = Keyboard.addListener('keyboardDidHide', () => setKbHeight(0));
    return () => {
      show.remove();
      showA.remove();
      hide.remove();
      hideA.remove();
    };
  }, []);

  const handle = (key: PlusOption) => {
    onSelect?.(key);
    onClose();
  };

  if (!visible) return null;

  // Sit above the keyboard when it's up; otherwise above the safe-area bottom.
  const bottomOffset = kbHeight > 0 ? kbHeight : (insets.bottom || 10) + 60;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      </Pressable>
      <View style={[styles.panel, { bottom: bottomOffset }]}>
        {OPTIONS.map((o) => (
          <Pressable
            key={o.key}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => handle(o.key)}
          >
            <OptionIcon option={o.key} />
            <Text style={styles.label}>{o.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  rowPressed: {
    opacity: 0.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBordered: {
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#D1D1D6',
  },
  label: {
    fontSize: 20,
    color: '#000000',
    marginLeft: 18,
  },
});
