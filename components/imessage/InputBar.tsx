import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

type Props = {
  value?: string;
  onChangeText?: (t: string) => void;
  onSend?: () => void;
  onPlus?: () => void;
  onMic?: () => void;
  placeholder?: string;
  sendColor?: string;
  editable?: boolean;
};

export default function InputBar({
  value = '',
  onChangeText,
  onSend,
  onPlus,
  onMic,
  placeholder = 'iMessage',
  sendColor = '#007AFF',
  editable = true,
}: Props) {
  const hasText = value.length > 0;
  const insets = useSafeAreaInsets();
  const [keyboardUp, setKeyboardUp] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardWillShow', () => setKeyboardUp(true));
    const showA = Keyboard.addListener('keyboardDidShow', () => setKeyboardUp(true));
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardUp(false));
    const hideA = Keyboard.addListener('keyboardDidHide', () => setKeyboardUp(false));
    return () => {
      show.remove();
      showA.remove();
      hide.remove();
      hideA.remove();
    };
  }, []);

  // When the keyboard is up it covers the home indicator, so drop the safe-area
  // padding — otherwise a white gap appears between the bar and the keyboard.
  const bottomPad = keyboardUp ? 8 : (insets.bottom || 10) + 8;

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      {/* Plus sign to the LEFT of the input bar */}
      <Pressable style={styles.plusButton} onPress={onPlus} hitSlop={8}>
        <Ionicons name="add" size={26} color="#8E8E93" />
      </Pressable>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#B0B0B5"
          editable={editable}
          multiline
        />

        {hasText ? (
          // Send arrow (appears once text is entered, iMessage-style)
          <Pressable
            style={[styles.sendButton, { backgroundColor: sendColor }]}
            onPress={onSend}
            hitSlop={6}
          >
            <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
          </Pressable>
        ) : (
          // Microphone to the RIGHT of the input bar
          <Pressable style={styles.micButton} onPress={onMic} hitSlop={6}>
            <Ionicons name="mic" size={22} color="#8E8E93" />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  plusButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E4E4E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 38,
    borderRadius: 19,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C8',
    backgroundColor: '#FFFFFF',
    paddingLeft: 14,
    paddingRight: 5,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 17,
    maxHeight: 100,
    paddingTop: 4,
    paddingBottom: 4,
    color: '#000000',
  },
  micButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
