import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import MessageBubble, { ChatMessage, TS_REVEAL } from './MessageBubble';
import { SENDER_ME, SEPARATOR_GAP_MS, formatMessageTime } from '@/constants/imessage';

const SCREEN_W = Dimensions.get('window').width;

type Theme = {
  meBubble: string;
  meText: string;
  themBubble: string;
  themText: string;
  serviceLabel?: string;
};

type Props = {
  messages: ChatMessage[];
  theme: Theme;
  bgColor?: string;
  onBubbleLongPress?: (msg: ChatMessage) => void;
  onReportJunk?: () => void;
};

export default function ConversationList({
  messages,
  theme,
  bgColor = '#FFFFFF',
  onBubbleLongPress,
  onReportJunk,
}: Props) {
  // "Report Junk" prompt shows when the sender is unknown and you haven't replied yet.
  const iHaveTexted = messages.some((m) => m.sender === SENDER_ME);
  const showReportJunk = messages.length > 0 && !iHaveTexted;

  // Best available timestamp for the conversation-start separator.
  const firstAvailableTime = messages.find((m) => typeof m.time === 'number')?.time;

  // Effective display time for EVERY message (so predetermined/older messages that
  // lack an explicit `time` still show a timestamp on swipe). Fills gaps by walking
  // forward (+1 min) from the last known time, seeded by the first available time.
  const displayTimes: number[] = [];
  {
    let last = firstAvailableTime ?? Date.now();
    for (let i = 0; i < messages.length; i++) {
      const t = messages[i].time ?? last + (i === 0 ? 0 : 60 * 1000);
      displayTimes[i] = t;
      last = t;
    }
  }

  // Swipe the whole conversation left to reveal each message's timestamp.
  // Reanimated + GestureDetector => runs on the UI thread (fluid) and coexists
  // with vertical scroll (failOffsetY yields vertical drags to the ScrollView).
  const tx = useSharedValue(0);
  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-10, 10])
    .onUpdate((e) => {
      // Rubber-band with resistance: you must drag further to reveal the rail.
      const x = e.translationX;
      tx.value = x < 0 ? Math.max(-TS_REVEAL, x * 0.55) : x * 0.1;
    })
    .onEnd(() => {
      tx.value = withSpring(0, { damping: 22, stiffness: 180, overshootClamping: true });
    });
  const animStyle = useAnimatedStyle(() => ({ transform: [{ translateX: tx.value }] }));
  // "Them" (left) bubbles stay put — counter the list translation so only the
  // timestamp rail reveals while the away person's bubbles don't move.
  const themCounterStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -tx.value }] }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[{ flexGrow: 1 }, animStyle]}>
        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const next = messages[i + 1];

          // Always show a centered timestamp at the start of the conversation,
          // and again after a long gap (> 1 hour) between messages.
          const showSeparator =
            i === 0
              ? true
              : !!(m.time && prev?.time && m.time - prev.time > SEPARATOR_GAP_MS);

          // Every message shows a tail.
          const showTail = true;

          // Tight spacing for back-to-back same-sender bubbles; more space when
          // the sender changes. Separators bring their own spacing.
          const spacingTop = showSeparator
            ? 2
            : prev && prev.sender === m.sender
            ? 2
            : 12;

          const isLast = i === messages.length - 1;
          const sepTime = i === 0 ? m.time ?? firstAvailableTime ?? Date.now() : m.time;
          const sep = showSeparator ? formatMessageTime(sepTime) : null;

          return (
            <View key={m.id}>
              {sep && (
                <Animated.View style={[styles.separator, themCounterStyle]}>
                  {i === 0 && theme.serviceLabel ? (
                    <Text style={styles.separatorService}>{theme.serviceLabel}</Text>
                  ) : null}
                  <Text style={styles.separatorText}>
                    <Text style={styles.separatorBold}>{sep.boldPart}</Text>
                    {sep.connector}
                    {sep.time}
                  </Text>
                </Animated.View>
              )}

              <MessageBubble
                message={m}
                theme={theme}
                bgColor={bgColor}
                showTail={showTail}
                spacingTop={spacingTop}
                displayTime={displayTimes[i]}
                bubbleAnimStyle={m.sender === SENDER_ME ? undefined : themCounterStyle}
                onLongPress={onBubbleLongPress ? () => onBubbleLongPress(m) : undefined}
              />

              {isLast && m.sender === SENDER_ME && (
                <Text style={styles.delivered}>
                  <Text style={styles.deliveredBold}>Delivered</Text>
                  {m.time
                    ? '  ' +
                      new Date(m.time).toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : ''}
                </Text>
              )}
            </View>
          );
        })}

        {showReportJunk && (
          <View style={styles.junkContainer}>
            <Text style={styles.junkText}>The sender is not in your contact list.</Text>
            <Pressable onPress={onReportJunk} hitSlop={8}>
              <Text style={styles.junkAction}>Report Junk</Text>
            </Pressable>
          </View>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  separator: {
    width: SCREEN_W,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 6,
  },
  separatorText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  separatorBold: {
    fontWeight: '600',
    color: '#8E8E93',
  },
  separatorService: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 2,
  },
  delivered: {
    width: SCREEN_W,
    textAlign: 'right',
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    paddingRight: 10,
    marginBottom: 4,
  },
  deliveredBold: {
    fontWeight: '600',
    color: '#8E8E93',
  },
  junkContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  junkText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  junkAction: {
    fontSize: 13,
    fontWeight: '500',
    color: '#007AFF',
  },
});
