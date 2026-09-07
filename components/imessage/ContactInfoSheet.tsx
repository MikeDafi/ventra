import React from 'react';
import { Modal, View, Text, StyleSheet, Pressable, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Avatar from './Avatar';
import FaceTimeIcon from './FaceTimeIcon';

type Props = {
  visible: boolean;
  onClose: () => void;
  name?: string;
  profileImage?: string;
  themeColor?: string;
};

function ActionCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.actionCard} onPress={onPress}>
      {icon}
      <Text style={[styles.actionLabel, { color }]}>{label}</Text>
    </Pressable>
  );
}

export default function ContactInfoSheet({
  visible,
  onClose,
  name,
  profileImage,
  themeColor = '#007AFF',
}: Props) {
  const displayName = name?.trim() || 'Unknown';
  const [shared, setShared] = React.useState(true);
  const [hideAlerts, setHideAlerts] = React.useState(false);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.doneRow}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={[styles.done, { color: themeColor }]}>Done</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Avatar name={name} profileImage={profileImage} size={90} />
            <Text style={styles.name}>{displayName}</Text>
          </View>

          <View style={styles.actionsRow}>
            <ActionCard
              icon={<Ionicons name="call" size={22} color={themeColor} />}
              label="call"
              color={themeColor}
            />
            <ActionCard
              icon={<FaceTimeIcon size={26} color={themeColor} />}
              label="video"
              color={themeColor}
            />
            <ActionCard
              icon={<Ionicons name="mail" size={22} color="#B0B0B5" />}
              label="mail"
              color="#B0B0B5"
            />
            <ActionCard
              icon={<Ionicons name="person-circle-outline" size={24} color={themeColor} />}
              label="info"
              color={themeColor}
            />
          </View>

          {/* Location map placeholder */}
          <LinearGradient colors={['#A6E1FA', '#BDF0C8']} style={styles.map}>
            <View style={styles.mapPin}>
              <Avatar name={name} profileImage={profileImage} size={44} />
            </View>
            <Text style={styles.locating}>Locating…</Text>
          </LinearGradient>

          <View style={styles.card}>
            <Pressable style={styles.rowItem}>
              <Text style={styles.destructive}>Stop Sharing My Location</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Show in Shared with You</Text>
              <Switch value={shared} onValueChange={setShared} />
            </View>
          </View>
          <Text style={styles.footnote}>
            Content shared in this conversation will appear in selected apps. Pins will always show.
          </Text>

          <View style={styles.card}>
            <View style={styles.rowItem}>
              <Text style={styles.rowLabel}>Hide Alerts</Text>
              <Switch value={hideAlerts} onValueChange={setHideAlerts} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDEDF2' },
  doneRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  done: { fontSize: 17, fontWeight: '600' },
  content: { paddingBottom: 40 },
  header: { alignItems: 'center', marginTop: 8 },
  name: { fontSize: 26, fontWeight: '700', marginTop: 12, color: '#000' },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 22,
  },
  actionCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionLabel: { fontSize: 12, marginTop: 5 },
  map: {
    marginHorizontal: 16,
    marginTop: 22,
    height: 220,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPin: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 26,
  },
  locating: { marginTop: 10, fontSize: 18, color: '#3A3A3C' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 18,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 17, color: '#000' },
  destructive: { fontSize: 17, color: '#FF3B30', fontWeight: '500' },
  footnote: {
    fontSize: 12,
    color: '#8E8E93',
    paddingHorizontal: 28,
    marginTop: 8,
  },
});
