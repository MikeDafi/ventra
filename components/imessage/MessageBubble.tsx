import React from 'react';
import { View, Text, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import { SENDER_ME } from '@/constants/imessage';

const SCREEN_W = Dimensions.get('window').width;
export const TS_REVEAL = 74; // width of the timestamp rail revealed on swipe

export type ChatMessage = {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time?: number;
  imageUri?: string;
};

type Props = {
  message: ChatMessage;
  theme: {
    meBubble: string;
    meText: string;
    themBubble: string;
    themText: string;
  };
  bgColor?: string;
  showTail?: boolean;
  spacingTop?: number;
  displayTime?: number;
  bubbleAnimStyle?: any;
  onLongPress?: () => void;
};

export default function MessageBubble({
  message,
  theme,
  bgColor = '#FFFFFF',
  showTail = true,
  spacingTop = 8,
  displayTime,
  bubbleAnimStyle,
  onLongPress,
}: Props) {
  const isMe = message.sender === SENDER_ME;
  const bubbleColor = isMe ? theme.meBubble : theme.themBubble;
  const effTime = message.time ?? displayTime;
  const timeLabel = effTime
    ? new Date(effTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : '';
  const hasImage = !!message.imageUri;
  const hasText = !!message.text?.trim();

  return (
    <View style={[styles.row, { marginTop: spacingTop }]}>
      <Animated.View
        style={[styles.bubbleArea, isMe ? styles.rowMe : styles.rowThem, bubbleAnimStyle]}
      >
        <Pressable
          onLongPress={onLongPress}
          style={[
            hasImage && !hasText ? styles.imageBubble : styles.bubble,
            !(hasImage && !hasText) && { backgroundColor: bubbleColor },
          ]}
        >
          {hasImage ? (
            <Image
              source={{ uri: message.imageUri }}
              style={hasText ? styles.imageWithText : styles.image}
              resizeMode="cover"
            />
          ) : null}
          {hasText ? (
            <Text style={[styles.text, { color: isMe ? theme.meText : theme.themText }]}>
              {message.text}
            </Text>
          ) : null}

          {/* iMessage-style tail: a colored curve + a background-colored mask that
              carves the concave notch. Rendered behind the bubble body. */}
          {showTail && isMe && (
            <>
              <View style={[styles.tailRight, { backgroundColor: bubbleColor }]} />
              <View style={[styles.tailRightMask, { backgroundColor: bgColor }]} />
            </>
          )}
          {showTail && !isMe && (
            <>
              <View style={[styles.tailLeft, { backgroundColor: bubbleColor }]} />
              <View style={[styles.tailLeftMask, { backgroundColor: bgColor }]} />
            </>
          )}
        </Pressable>
      </Animated.View>

      {/* Timestamp rail — sits just off the right edge, revealed on swipe-left */}
      <View style={styles.timeCol} pointerEvents="none">
        <Text style={styles.timeColText}>{timeLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: SCREEN_W + TS_REVEAL,
  },
  bubbleArea: {
    width: SCREEN_W,
    flexDirection: 'row',
    paddingHorizontal: 13,
  },
  rowMe: {
    justifyContent: 'flex-end',
  },
  rowThem: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '76%',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageBubble: {
    maxWidth: '70%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    width: 210,
    height: 210,
    borderRadius: 18,
  },
  imageWithText: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 6,
  },
  text: {
    fontSize: 17,
    lineHeight: 22,
  },
  timeCol: {
    width: TS_REVEAL,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  timeColText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  // ---- Sent (right) tail ----
  tailRight: {
    position: 'absolute',
    bottom: 0,
    right: -6,
    width: 24,
    height: 27,
    borderBottomLeftRadius: 27,
  },
  tailRightMask: {
    position: 'absolute',
    bottom: -6,
    right: -21,
    width: 26,
    height: 42,
    borderBottomLeftRadius: 19,
    borderTopLeftRadius: 14,
  },
  // ---- Received (left) tail ----
  tailLeft: {
    position: 'absolute',
    bottom: 0,
    left: -6,
    width: 24,
    height: 27,
    borderBottomRightRadius: 27,
  },
  tailLeftMask: {
    position: 'absolute',
    bottom: -6,
    left: -21,
    width: 26,
    height: 42,
    borderBottomRightRadius: 19,
  },
});
