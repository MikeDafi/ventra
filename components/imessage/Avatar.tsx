import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  name?: string;
  profileImage?: string;
  size?: number;
};

/**
 * The contact avatar used in both the chat header and the form preview.
 * Renders: profile photo, else initials (first + second word), else the
 * iOS-style gray gradient person silhouette.
 */
export default function Avatar({ name, profileImage, size = 50 }: Props) {
  const initials = (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .filter((c) => c && /[a-zA-Z\u00C0-\u024F]/.test(c))
    .join('')
    .toUpperCase();

  const circle = { width: size, height: size, borderRadius: size / 2 };

  if (profileImage) {
    return <Image source={{ uri: profileImage }} style={circle} />;
  }

  return (
    <LinearGradient colors={['#BCC0C9', '#8A8F9A']} style={[circle, styles.center]}>
      {initials ? (
        <Text style={{ color: '#FFFFFF', fontSize: size * 0.4, fontWeight: '500' }}>
          {initials}
        </Text>
      ) : (
        <>
          <View
            style={{
              position: 'absolute',
              top: size * 0.18,
              left: size * 0.33,
              width: size * 0.34,
              height: size * 0.34,
              borderRadius: (size * 0.34) / 2,
              backgroundColor: '#FFFFFF',
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: -size * 0.08,
              left: size * 0.12,
              width: size * 0.76,
              height: size * 0.48,
              borderTopLeftRadius: size * 0.38,
              borderTopRightRadius: size * 0.38,
              backgroundColor: '#FFFFFF',
            }}
          />
        </>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
