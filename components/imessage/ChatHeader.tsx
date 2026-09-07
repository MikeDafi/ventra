import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FaceTimeMenu from './FaceTimeMenu';
import FaceTimeIcon from './FaceTimeIcon';
import ContactInfoSheet from './ContactInfoSheet';
import Avatar from './Avatar';

type Props = {
  name?: string;
  location?: string;
  profileImage?: string;
  themeColor?: string;
  showFaceTime?: boolean;
  onBack?: () => void;
  onFaceTime?: () => void;
};

export default function ChatHeader({
  name,
  location,
  profileImage,
  themeColor = '#007AFF',
  showFaceTime = true,
  onBack,
  onFaceTime,
}: Props) {
  const displayName = name?.trim() || 'Unknown';
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable style={styles.sideButton} onPress={onBack} hitSlop={10}>
        <Ionicons name="chevron-back" size={30} color={themeColor} />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.center, pressed && { opacity: 0.5 }]}
        onPress={() => setInfoOpen(true)}
      >
        <View style={styles.avatarWrap}>
          <Avatar name={name} profileImage={profileImage} size={50} />
        </View>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#C7C7CC" />
        </View>
        {location?.trim() ? (
          <Text style={styles.location} numberOfLines={1}>
            {location.trim()}
          </Text>
        ) : null}
      </Pressable>

      {/* Optional FaceTime button in the top-right */}
      {showFaceTime ? (
        <Pressable
          style={styles.sideButton}
          onPress={() => {
            onFaceTime?.();
            setMenuOpen(true);
          }}
          hitSlop={10}
        >
          <FaceTimeIcon size={34} color={themeColor} />
        </Pressable>
      ) : (
        <View style={styles.sideButton} />
      )}

      <FaceTimeMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />
      <ContactInfoSheet
        visible={infoOpen}
        onClose={() => setInfoOpen(false)}
        name={name}
        profileImage={profileImage}
        themeColor={themeColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F6F6F6',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#C6C6C8',
    zIndex: 20,
  },
  sideButton: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  avatarWrap: {
    marginBottom: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    maxWidth: 180,
  },
  location: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
});
