import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { Voucher } from '@/constants/groupon';

const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = {
  voucher: Voucher;
  stampScale: SharedValue<number>;
};

function Barcode() {
  const pattern = [4,2,5,2,3,4,2,6,4,3,2,4,5,2,3,5,2,3,6,2,4,3,2,5,3,4,2,3,5,4,2,3,4,2,5,3,2,4,3,5,2,4,3,6,2,4];
  return (
    <View style={barcodeStyles.container}>
      {pattern.map((w, i) => (
        <View
          key={i}
          style={[
            barcodeStyles.bar,
            { width: w * 1.8, backgroundColor: i % 2 === 0 ? '#000' : '#fff' },
          ]}
        />
      ))}
    </View>
  );
}

const barcodeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    marginVertical: 20,
    width: '100%',
    alignSelf: 'center',
  },
  bar: { height: '100%' },
});

function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// Seeded pseudo-random for deterministic speckles
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate dense speckles concentrated heavily over DEE area (x: 50-115, y: 0-30)
// with lighter wash along bottom of REDEE
function generateSpeckles() {
  const rng = seededRandom(42);
  const speckles: { x: number; y: number; w: number; h: number; o: number }[] = [];

  // Dots ON the text of DEE (x: 35-80, y: 2-18)
  for (let i = 0; i < 120; i++) {
    const x = 35 + rng() * 45;
    const y = 2 + rng() * 16;
    const w = 1 + rng() * 2;
    const h = 1 + rng() * 1.5;
    const o = 0.3 + rng() * 0.35;
    speckles.push({ x: Math.round(x), y: Math.round(y), w: +w.toFixed(1), h: +h.toFixed(1), o: +o.toFixed(2) });
  }

  // Dots on inner top border above DEE (y: -3 to -1)
  for (let i = 0; i < 80; i++) {
    const x = 32 + rng() * 52;
    const y = -3 + rng() * 2;
    const w = 1.5 + rng() * 2;
    const h = 1 + rng() * 2;
    const o = 0.4 + rng() * 0.4;
    speckles.push({ x: Math.round(x), y: +y.toFixed(1), w: +w.toFixed(1), h: +h.toFixed(1), o: +o.toFixed(2) });
  }

  // Dots on outer top border above DEE (y: -7 to -5)
  for (let i = 0; i < 50; i++) {
    const x = 30 + rng() * 56;
    const y = -7 + rng() * 2;
    const w = 1.5 + rng() * 2;
    const h = 1 + rng() * 1.5;
    const o = 0.35 + rng() * 0.35;
    speckles.push({ x: Math.round(x), y: +y.toFixed(1), w: +w.toFixed(1), h: +h.toFixed(1), o: +o.toFixed(2) });
  }

  // Few dots on bottom of M (x: 85-105, y: 15-20)
  for (let i = 0; i < 25; i++) {
    const x = 85 + rng() * 20;
    const y = 15 + rng() * 5;
    const w = 1 + rng() * 2;
    const h = 1 + rng() * 1.5;
    const o = 0.25 + rng() * 0.3;
    speckles.push({ x: Math.round(x), y: Math.round(y), w: +w.toFixed(1), h: +h.toFixed(1), o: +o.toFixed(2) });
  }

  return speckles;
}

const SPECKLES = generateSpeckles();

export default function GrouponVoucher({ voucher, stampScale }: Props) {
  const stampAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: stampScale.value * 1.2 },
      { rotate: '-8deg' },
    ],
    opacity: stampScale.value > 0 ? 1 : 0,
  }));

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>{voucher.title}</Text>
        <Text style={styles.count}>
          {voucher.countCurrent} of {voucher.countTotal}
        </Text>
      </View>

      {voucher.location ? (
        <Text style={styles.location}>{voucher.location}</Text>
      ) : null}

      {/* Barcode area */}
      <View style={styles.barcodeContainer}>
        <Barcode />
        {/* REDEEMED stamp overlay — triggered by swipe, purely visual */}
        <Animated.View style={[styles.stampOverlay, stampAnimatedStyle]}>
          <View style={styles.stampOuterBorder}>
            <View style={styles.stampInnerBorder}>
              <Text style={styles.stampText}>REDEEMED</Text>
              {/* White speckles scattered over the text */}
              {SPECKLES.map((s, i) => (
                <View
                  key={i}
                  style={[styles.speckle, { left: s.x, top: s.y, width: s.w, height: s.h, borderRadius: s.w / 2, opacity: s.o }]}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Details */}
      <DetailRow label="Redemption Code" value={voucher.redemptionCode} />
      <DetailRow label="Groupon" value={voucher.grouponCode} />
      <DetailRow label="Original Price" value={voucher.originalPrice} />
      <DetailRow label="Groupon Price" value={voucher.grouponPrice} />
      <DetailRow label="Promotional Discount" value={voucher.promoDiscount} />
      <DetailRow label="Amount Paid" value={voucher.amountPaid} />
      <DetailRow label="Expires" value={voucher.expires} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '400',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 10,
  },
  count: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  location: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  barcodeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  stampOverlay: {
    position: 'absolute',
  },
  stampOuterBorder: {
    borderWidth: 2,
    borderColor: '#d05a52',
    borderRadius: 7,
    padding: 1.5,
  },
  stampInnerBorder: {
    borderWidth: 2,
    borderColor: '#d05a52',
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    position: 'relative',
  },
  stampText: {
    fontSize: 23,
    fontWeight: '900',
    color: '#d05a52',
    letterSpacing: 4,
    fontFamily: 'HelveticaNeue-Bold',
  },
  speckle: {
    position: 'absolute',
    backgroundColor: '#fff',
  },
  detailRow: {
    marginTop: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    color: '#aaa',
    marginTop: 1,
  },
});
