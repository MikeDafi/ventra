import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { ChatMessage } from '@/components/imessage/MessageBubble';
import ConversationList from '@/components/imessage/ConversationList';
import InputBar from '@/components/imessage/InputBar';
import PlusMenu from '@/components/imessage/PlusMenu';
import Avatar from '@/components/imessage/Avatar';
import TimestampField from '@/components/imessage/TimestampField';
import {
  CHAT_FOLDER,
  THEMES,
  DEFAULT_THEME,
  DEFAULT_PERSON_NAME,
  DEFAULT_MESSAGES,
  SENDER_ME,
  SENDER_THEM,
  newMessageId,
} from '@/constants/imessage';

export default function ChatForm() {
  const router = useRouter();
  const routeParams = useLocalSearchParams();
  const initial = routeParams.chatPayload
    ? JSON.parse(routeParams.chatPayload as string)
    : {};

  const [personName, setPersonName] = useState<string>(initial.personName ?? DEFAULT_PERSON_NAME);
  const [location, setLocation] = useState<string>(initial.location ?? '');
  const [profileImage, setProfileImage] = useState<string | undefined>(initial.profileImage);
  const [themeKey, setThemeKey] = useState<string>(initial.theme ?? DEFAULT_THEME);
  const [showFaceTime, setShowFaceTime] = useState<boolean>(initial.faceTime ?? true);
  const [fileName, setFileName] = useState<string>(initial.fileName ?? '');
  const [messages, setMessages] = useState<ChatMessage[]>(
    initial.messages?.length ? initial.messages : DEFAULT_MESSAGES
  );

  const [draft, setDraft] = useState('');
  const [sender, setSender] = useState<'me' | 'them'>(SENDER_ME);
  const [nextDate, setNextDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);

  // Scheduled incoming messages that auto-appear on a timer while viewing the chat.
  type Scheduled = { id: string; text: string; sender: 'me' | 'them'; minutes: string };
  const [scheduled, setScheduled] = useState<Scheduled[]>(initial.scheduled || []);
  const addScheduled = () =>
    setScheduled((prev) => [
      ...prev,
      { id: newMessageId(), text: '', sender: SENDER_THEM, minutes: '1' },
    ]);
  const updateScheduled = (id: string, patch: Partial<Scheduled>) =>
    setScheduled((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeScheduled = (id: string) =>
    setScheduled((prev) => prev.filter((s) => s.id !== id));

  const theme = THEMES[themeKey] || THEMES[DEFAULT_THEME];
  const scrollRef = useRef<ScrollView>(null);

  const derivedFileName = useMemo(() => {
    const base = (personName.trim() || 'chat').replace(/\s+/g, '_');
    return `${base}__${new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })}`;
  }, [personName]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.length) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const addMessage = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      // Priority: explicit per-message time > 1 min after previous > conversation
      // start time (for the first message) > now.
      const time = nextDate
        ? nextDate.getTime()
        : last?.time
        ? last.time + 60 * 1000
        : startTime
        ? startTime.getTime()
        : Date.now();
      return [...prev, { id: newMessageId(), sender, text, time }];
    });
    setDraft('');
    setNextDate(null);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  // Re-base every message's time so the FIRST message starts at `start`,
  // preserving the relative gaps between messages.
  const applyStartTime = (start: Date | null) => {
    setStartTime(start);
    if (!start) return;
    setMessages((prev) => {
      if (!prev.length) return prev;
      const firstTime = prev.find((m) => typeof m.time === 'number')?.time ?? Date.now();
      const delta = start.getTime() - firstTime;
      return prev.map((m) => (m.time ? { ...m, time: m.time + delta } : m));
    });
  };

  const handlePlusSelect = async (key: string) => {
    if (key !== 'photos' && key !== 'camera') return;
    const res =
      key === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (res.canceled || !res.assets?.length) return;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      const time = nextDate
        ? nextDate.getTime()
        : last?.time
        ? last.time + 60 * 1000
        : startTime
        ? startTime.getTime()
        : Date.now();
      return [
        ...prev,
        { id: newMessageId(), sender, text: '', imageUri: res.assets[0].uri, time },
      ];
    });
    setNextDate(null);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const onBubbleLongPress = (msg: ChatMessage) => {
    Alert.alert('Edit Message', msg.text, [
      {
        text: msg.sender === SENDER_ME ? 'Switch to Them' : 'Switch to Me',
        onPress: () =>
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id
                ? { ...m, sender: m.sender === SENDER_ME ? SENDER_THEM : SENDER_ME }
                : m
            )
          ),
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => setMessages((prev) => prev.filter((m) => m.id !== msg.id)),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const buildPayload = () => ({
    personName,
    location,
    profileImage,
    theme: themeKey,
    faceTime: showFaceTime,
    messages,
    scheduled: scheduled.filter((s) => s.text.trim()),
    fileName: (fileName.trim() || derivedFileName).replace(/\s+/g, '_'),
  });

  const handlePreview = () => {
    router.push({
      pathname: '/subapps/imessage/preview',
      params: { chatPayload: JSON.stringify(buildPayload()) },
    });
  };

  const handleSave = async () => {
    if (messages.length === 0) {
      Alert.alert('Empty Chat', 'Add at least one message before saving.');
      return;
    }

    const payload = buildPayload();
    const sanitizedFileName = payload.fileName;
    const fileUri = `${CHAT_FOLDER}${sanitizedFileName}.json`;

    const folderInfo = await FileSystem.getInfoAsync(CHAT_FOLDER);
    if (!folderInfo.exists) {
      await FileSystem.makeDirectoryAsync(CHAT_FOLDER, { intermediates: true });
    }

    const payloadString = JSON.stringify(payload, null, 2);
    const existing = await FileSystem.getInfoAsync(fileUri);
    if (existing.exists) {
      const content = await FileSystem.readAsStringAsync(fileUri);
      if (content === payloadString) {
        Alert.alert('No Changes', 'There are no differences from the saved chat.');
        router.back();
        return;
      }
    }

    try {
      await FileSystem.writeAsStringAsync(fileUri, payloadString);
      Alert.alert('Saved!', `Chat saved as ${sanitizedFileName}.json`);
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not save chat: ' + err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.headerRow}>
        <Pressable style={styles.button} onPress={handlePreview}>
          <Text style={styles.buttonText}>👁 Preview</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>💾 Save</Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ---- Details / metadata ---- */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Conversation Details</Text>

          <Text style={styles.label}>Name (optional)</Text>
          <TextInput
            style={styles.input}
            value={personName}
            onChangeText={setPersonName}
            placeholder="e.g. John Appleseed"
          />

          <Text style={styles.label}>Location (optional)</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. San Francisco, CA"
          />

          <Text style={styles.label}>Profile Picture (optional)</Text>
          <View style={styles.photoRow}>
            <View style={styles.photoThumb}>
              <Avatar name={personName} profileImage={profileImage} size={54} />
            </View>
            <Pressable style={styles.photoButton} onPress={pickImage}>
              <Text style={styles.photoButtonText}>
                {profileImage ? 'Change Photo' : 'Add Photo'}
              </Text>
            </Pressable>
            {profileImage ? (
              <Pressable
                style={[styles.photoButton, styles.removePhoto]}
                onPress={() => setProfileImage(undefined)}
              >
                <Text style={styles.photoButtonText}>Remove</Text>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.label}>Color Theme</Text>
          <View style={styles.themeRow}>
            {Object.values(THEMES).map((t) => (
              <Pressable
                key={t.key}
                onPress={() => setThemeKey(t.key)}
                style={[
                  styles.themeChip,
                  { backgroundColor: t.meBubble },
                  themeKey === t.key && styles.themeChipActive,
                ]}
              >
                <Text style={styles.themeChipText}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>FaceTime Button</Text>
          <View style={styles.themeRow}>
            <Pressable
              onPress={() => setShowFaceTime(true)}
              style={[styles.toggleChip, showFaceTime && styles.toggleChipActive]}
            >
              <Text style={[styles.toggleChipText, showFaceTime && styles.toggleChipTextActive]}>
                Show
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowFaceTime(false)}
              style={[styles.toggleChip, !showFaceTime && styles.toggleChipActive]}
            >
              <Text style={[styles.toggleChipText, !showFaceTime && styles.toggleChipTextActive]}>
                Hide
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Conversation Start Time</Text>
          <TimestampField
            value={startTime}
            onChange={applyStartTime}
            label=""
            autoText="Now"
          />

          <Text style={styles.label}>File Name</Text>
          <TextInput
            style={styles.input}
            value={fileName}
            onChangeText={setFileName}
            placeholder={derivedFileName}
          />
        </View>

        {/* ---- Live conversation ---- */}
        <Text style={styles.sectionTitle}>Conversation</Text>
        <View style={styles.conversation}>
          {messages.length === 0 ? (
            <Text style={styles.emptyHint}>No messages yet. Type below to add one.</Text>
          ) : (
            <ConversationList
              messages={messages}
              theme={theme}
              bgColor="#FFFFFF"
              onBubbleLongPress={onBubbleLongPress}
            />
          )}
          <Text style={styles.tip}>Tip: long-press a bubble to switch side or delete.</Text>
        </View>

        {/* ---- Scheduled incoming messages ---- */}
        <Text style={styles.sectionTitle}>Scheduled Messages</Text>
        <View style={styles.detailsCard}>
          <Text style={styles.scheduledHint}>
            These appear automatically in the Preview after their delay (in minutes).
          </Text>
          {scheduled.map((s) => (
            <View key={s.id} style={styles.scheduledRow}>
              <TextInput
                style={styles.scheduledText}
                value={s.text}
                onChangeText={(t) => updateScheduled(s.id, { text: t })}
                placeholder="Message text"
              />
              <Pressable
                onPress={() =>
                  updateScheduled(s.id, {
                    sender: s.sender === SENDER_ME ? SENDER_THEM : SENDER_ME,
                  })
                }
                style={[
                  styles.scheduledSender,
                  { backgroundColor: s.sender === SENDER_ME ? theme.meBubble : '#8E8E93' },
                ]}
              >
                <Text style={styles.scheduledSenderText}>
                  {s.sender === SENDER_ME ? 'Me' : 'Them'}
                </Text>
              </Pressable>
              <TextInput
                style={styles.scheduledMin}
                value={s.minutes}
                onChangeText={(t) => updateScheduled(s.id, { minutes: t })}
                keyboardType="numeric"
                placeholder="1"
              />
              <Text style={styles.scheduledMinLabel}>min</Text>
              <Pressable onPress={() => removeScheduled(s.id)} hitSlop={6}>
                <Text style={styles.scheduledRemove}>✕</Text>
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addScheduled} onPress={addScheduled}>
            <Text style={styles.addScheduledText}>➕ Add scheduled message</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ---- Sender toggle ---- */}
      <View style={styles.senderRow}>
        <Text style={styles.senderLabel}>Sending as:</Text>
        <Pressable
          onPress={() => setSender(SENDER_ME)}
          style={[
            styles.senderChip,
            sender === SENDER_ME && { backgroundColor: theme.meBubble },
          ]}
        >
          <Text style={[styles.senderChipText, sender === SENDER_ME && styles.senderChipTextActive]}>
            Me
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setSender(SENDER_THEM)}
          style={[
            styles.senderChip,
            sender === SENDER_THEM && { backgroundColor: '#8E8E93' },
          ]}
        >
          <Text
            style={[styles.senderChipText, sender === SENDER_THEM && styles.senderChipTextActive]}
          >
            Them
          </Text>
        </Pressable>
      </View>

      {/* ---- Absolute timestamp for the next message ---- */}
      <View style={styles.timestampRow}>
        <TimestampField value={nextDate} onChange={setNextDate} />
      </View>

      {/* ---- iMessage-style input bar ---- */}
      <InputBar
        value={draft}
        onChangeText={setDraft}
        onSend={addMessage}
        onMic={addMessage}
        onPlus={() => {
          setPlusOpen(true);
        }}
        placeholder={theme.placeholder}
        sendColor={theme.sendButton}
      />

      <PlusMenu
        visible={plusOpen}
        onClose={() => setPlusOpen(false)}
        onSelect={handlePlusSelect}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 6,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontWeight: '600' },
  scrollContent: { padding: 16, paddingBottom: 20 },
  detailsCard: {
    backgroundColor: '#f7f8fc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  label: { fontWeight: '600', marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  photoRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  photoThumb: { width: 54, height: 54, borderRadius: 27, marginRight: 12 },
  photoPlaceholder: {
    backgroundColor: '#d9d9de',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: { fontSize: 10, color: '#666' },
  photoButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginRight: 8,
  },
  removePhoto: { backgroundColor: '#FF4D4F' },
  photoButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  themeChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 10,
    opacity: 0.55,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeChipActive: { opacity: 1, borderColor: '#000' },
  themeChipText: { color: '#fff', fontWeight: '600' },
  toggleChip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#E4E4E9',
  },
  toggleChipActive: { backgroundColor: '#007AFF' },
  toggleChipText: { fontWeight: '600', color: '#333' },
  toggleChipTextActive: { color: '#fff' },
  conversation: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    paddingVertical: 10,
    minHeight: 120,
    overflow: 'hidden',
  },
  emptyHint: { textAlign: 'center', color: '#999', padding: 20 },
  tip: { textAlign: 'center', color: '#aaa', fontSize: 11, marginTop: 8, paddingHorizontal: 10 },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F6F6F6',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  senderLabel: { fontSize: 13, color: '#555', marginRight: 10 },
  senderChip: {
    paddingVertical: 5,
    paddingHorizontal: 16,
    borderRadius: 15,
    backgroundColor: '#E4E4E9',
    marginRight: 8,
  },
  senderChipText: { fontWeight: '600', color: '#333' },
  senderChipTextActive: { color: '#fff' },
  gapInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 48,
    textAlign: 'center',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  tsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  timestampRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F6F6F6',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
  },
  scheduledHint: { fontSize: 12, color: '#777', marginBottom: 10 },
  scheduledRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduledText: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginRight: 6,
    backgroundColor: '#fff',
  },
  scheduledSender: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 6,
  },
  scheduledSenderText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  scheduledMin: {
    width: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 5,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  scheduledMinLabel: { fontSize: 12, color: '#777', marginHorizontal: 6 },
  scheduledRemove: { color: '#FF4D4F', fontSize: 16, fontWeight: '700', paddingHorizontal: 4 },
  addScheduled: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addScheduledText: { color: '#fff', fontWeight: '600' },
});
