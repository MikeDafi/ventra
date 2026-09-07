import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, Platform, KeyboardAvoidingView, Alert, Keyboard } from 'react-native';
import { ScrollView, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import ChatHeader from '@/components/imessage/ChatHeader';
import { ChatMessage } from '@/components/imessage/MessageBubble';
import ConversationList from '@/components/imessage/ConversationList';
import InputBar from '@/components/imessage/InputBar';
import PlusMenu, { PlusOption } from '@/components/imessage/PlusMenu';
import * as ImagePicker from 'expo-image-picker';
import { THEMES, DEFAULT_THEME, SENDER_ME, newMessageId } from '@/constants/imessage';

export default function IMessagePreview() {
  const { chatPayload = '{}' } = useLocalSearchParams();
  const chat = JSON.parse(chatPayload as string);
  const navigation = useNavigation();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const theme = THEMES[chat.theme] || THEMES[DEFAULT_THEME];

  // Local, ephemeral copy of the conversation — typing here is NOT saved to disk.
  const [messages, setMessages] = useState<ChatMessage[]>(chat.messages || []);
  const [draft, setDraft] = useState('');
  const [plusOpen, setPlusOpen] = useState(false);

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [
      ...prev,
      { id: newMessageId(), sender: SENDER_ME, text, time: Date.now() },
    ]);
    setDraft('');
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const openPlus = () => {
    setPlusOpen(true);
  };

  // Fire scheduled incoming messages on their timers while viewing the chat.
  useEffect(() => {
    const scheduled = chat.scheduled || [];
    const timers = scheduled
      .filter((s: any) => s.text?.trim())
      .map((s: any) => {
        const mins = parseFloat(s.minutes);
        const ms = (isNaN(mins) ? 1 : mins) * 60 * 1000;
        return setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: newMessageId(),
              sender: s.sender === SENDER_ME ? SENDER_ME : 'them',
              text: s.text,
              time: Date.now(),
            },
          ]);
          requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
        }, ms);
      });
    return () => timers.forEach((t: any) => clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addImageMessage = (uri: string) => {
    setMessages((prev) => [
      ...prev,
      { id: newMessageId(), sender: SENDER_ME, text: '', imageUri: uri, time: Date.now() },
    ]);
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  };

  const handlePlusSelect = async (key: PlusOption) => {
    if (key === 'photos') {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!res.canceled && res.assets?.length) addImageMessage(res.assets[0].uri);
    } else if (key === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera', 'Camera permission is required.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
      if (!res.canceled && res.assets?.length) addImageMessage(res.assets[0].uri);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ChatHeader
          name={chat.personName}
          location={chat.location}
          profileImage={chat.profileImage}
          themeColor={theme.sendButton}
          showFaceTime={chat.faceTime !== false}
          onBack={() => router.back()}
        />

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ConversationList
            messages={messages}
            theme={theme}
            bgColor="#FFFFFF"
            onReportJunk={() =>
              Alert.alert('Report Junk', 'This would report the sender as junk.')
            }
          />
        </ScrollView>

        <InputBar
          value={draft}
          onChangeText={setDraft}
          onSend={sendDraft}
          onMic={sendDraft}
          onPlus={openPlus}
          placeholder={theme.placeholder}
          sendColor={theme.sendButton}
        />

        <PlusMenu
          visible={plusOpen}
          onClose={() => setPlusOpen(false)}
          onSelect={handlePlusSelect}
        />
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  messages: { flex: 1 },
  messagesContent: { paddingTop: 8, paddingBottom: 12, flexGrow: 1 },
});
