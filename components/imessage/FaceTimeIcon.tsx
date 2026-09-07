import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

/**
 * iOS-style FaceTime video icon: a thin, rounded-rectangle camera body with a
 * triangular "play" lens on the right. Drawn as SVG so stroke width and corner
 * radii precisely match the reference (thin blue outline, rounded corners).
 */
export default function FaceTimeIcon({ size = 30, color = '#007AFF' }: Props) {
  const stroke = 1.7;
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Rect
        x={4}
        y={7.5}
        width={15}
        height={15}
        rx={2.6}
        ry={2.6}
        stroke={color}
        strokeWidth={stroke}
      />
      <Path
        d="M19 12.2 L24.4 8.7 C25.2 8.2 26 8.8 26 9.7 L26 20.3 C26 21.2 25.2 21.8 24.4 21.3 L19 17.8 Z"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
