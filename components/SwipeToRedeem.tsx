import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  interpolateColor,
  SharedValue,
  Easing,
} from 'react-native-reanimated';

const SLIDER_WIDTH = Dimensions.get('window').width - 80;
const THUMB_SIZE = 50;
const TRACK_HEIGHT = 56;
const TRIGGER_THRESHOLD = SLIDER_WIDTH - TRACK_HEIGHT - 20;

type Props = {
  onSwipeComplete?: () => void;
  stampScale: SharedValue<number>;
};

export default function SwipeToRedeem({ onSwipeComplete, stampScale }: Props) {
  const translateX = useSharedValue(0);
  const completed = useSharedValue(0);

  const handleComplete = () => {
    onSwipeComplete?.();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (completed.value === 1) return;
      const clamp = Math.min(Math.max(e.translationX, 0), SLIDER_WIDTH - TRACK_HEIGHT);
      translateX.value = clamp;
    })
    .onEnd(() => {
      if (completed.value === 1) return;
      if (translateX.value > TRIGGER_THRESHOLD) {
        completed.value = withTiming(1, { duration: 300 });
        translateX.value = withTiming(SLIDER_WIDTH - TRACK_HEIGHT, { duration: 200 });
        // Stamp thump: starts huge, slams down fast
        stampScale.value = withSequence(
          withTiming(3, { duration: 0 }),
          withDelay(100, withTiming(1.0, { duration: 150, easing: Easing.out(Easing.quad) })),
        );
        runOnJS(handleComplete)();
      } else {
        translateX.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: completed.value === 1 ? 0 : 1,
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: Math.max(translateX.value + TRACK_HEIGHT, TRACK_HEIGHT),
    opacity: completed.value === 1 ? 0 : 1,
  }));

  const trackStyle = useAnimatedStyle(() => ({
    opacity: 1 - completed.value,
  }));

  return (
    <Animated.View style={[styles.track, trackStyle]}>
      {/* Green fill behind thumb */}
      <Animated.View style={[styles.fill, fillStyle]} />

      {/* Swipe label */}
      <Animated.Text style={styles.label}>
        Swipe to Mark as Used
      </Animated.Text>

      {/* Draggable thumb */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.thumb, thumbStyle]}>
          <View style={styles.arrowChevron} />
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: SLIDER_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#3d7a2a',
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#4a9632',
    borderRadius: 8,
    zIndex: 1,
  },
  thumb: {
    position: 'absolute',
    width: TRACK_HEIGHT,
    height: TRACK_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#4a9632',
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    zIndex: 3,
  },
  arrowChevron: {
    width: 20,
    height: 20,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
    marginLeft: -3,
  },
  label: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    zIndex: 0,
  },
});
