import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useWindowDimensions } from 'react-native';
import MainMoneyStack from '../../assets/MainMoneyStack.png';

const GOLD_THRESHOLD = 75;

function Sparkles({ stackWidth, stackHeight, intense }) {
  const positions = useMemo(() => [
    { top: stackHeight * 0.05, left: stackWidth * 0.06, size: stackWidth * 0.14 },
    { top: stackHeight * 0.08, right: stackWidth * 0.04, size: stackWidth * 0.1 },
    { top: stackHeight * 0.38, right: stackWidth * 0.02, size: stackWidth * 0.11 },
    { bottom: stackHeight * 0.2, left: stackWidth * 0.04, size: stackWidth * 0.1 },
    { bottom: stackHeight * 0.1, right: stackWidth * 0.06, size: stackWidth * 0.12 },
    ...(intense ? [
      { top: stackHeight * 0.22, left: stackWidth * 0.0, size: stackWidth * 0.09 },
      { bottom: stackHeight * 0.28, right: stackWidth * 0.0, size: stackWidth * 0.08 },
    ] : []),
  ], [stackWidth, stackHeight, intense]);

  return (
    <View style={[styles.sparkleLayer, { width: stackWidth, height: stackHeight }]} pointerEvents="none">
      {positions.map((pos, i) => (
        <Sparkle key={i} style={pos} size={pos.size} delay={i * 180} />
      ))}
    </View>
  );
}

function Sparkle({ style, size, delay }) {
  const opacity = useRef(new Animated.Value(0.4)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0.35, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 0.85, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [delay, opacity, scale]);

  const { size: _size, ...position } = style;

  return (
    <Animated.Text
      style={[
        styles.sparkle,
        position,
        {
          fontSize: size,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      ✦
    </Animated.Text>
  );
}

function StackImage({ isGold, width, height }) {
  const idleRock = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(idleRock, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(idleRock, { toValue: -1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(idleRock, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();
  }, [idleRock]);

  const idleRotate = idleRock.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-2deg', '0deg', '2deg'],
  });

  return (
    <Animated.Image
      source={MainMoneyStack}
      style={[
        { width, height, resizeMode: 'contain' },
        isGold && styles.stackImageGold,
        { transform: [{ rotateZ: idleRotate }] },
      ]}
    />
  );
}

function MetricColumn({
  label,
  heroValue,
  footerValue,
  footerColor,
  heroColor,
  isGold,
  showSparkles,
  layout,
}) {
  return (
    <View style={styles.column}>
      <View style={[styles.blueSection, { paddingBottom: layout.bluePaddingBottom }]}>
        <Text style={[styles.metricLabel, { fontSize: layout.labelSize }]}>{label}</Text>
        <Text style={[styles.heroValue, { fontSize: layout.heroSize }, heroColor && { color: heroColor }]}>
          {heroValue}
        </Text>
      </View>

      <View style={[styles.stackSection, {
        marginTop: layout.stackOverlap,
        minHeight: layout.stackAreaHeight,
      }]}>
        <View style={styles.stackFrame}>
          {showSparkles && (
            <Sparkles
              stackWidth={layout.stackWidth}
              stackHeight={layout.stackHeight}
              intense={isGold}
            />
          )}
          <StackImage isGold={isGold} width={layout.stackWidth} height={layout.stackHeight} />
        </View>
      </View>

      <View style={styles.whiteSection}>
        <Text style={[styles.footerValue, { fontSize: layout.footerSize, color: footerColor }]}>
          {footerValue}
        </Text>
      </View>
    </View>
  );
}

export default function BudgetDualCard({ remaining, onTrackProgress }) {
  const { height: screenHeight } = useWindowDimensions();
  const cardHeight = screenHeight * 0.442;

  const layout = useMemo(() => {
    const scale = cardHeight / 380;
    return {
      labelSize: Math.round(13 * scale),
      heroSize: Math.round(32 * scale),
      footerSize: Math.round(26 * scale),
      stackWidth: Math.round(160 * scale),
      stackHeight: Math.round(110 * scale),
      stackAreaHeight: Math.round(130 * scale),
      stackOverlap: Math.round(-48 * scale),
      bluePaddingBottom: Math.round(52 * scale),
    };
  }, [cardHeight]);

  const onTrackRounded = Math.round(onTrackProgress);
  const onTrackLabel = `${onTrackRounded}%`;
  const isHighScore = onTrackRounded >= GOLD_THRESHOLD;

  const remainingFormatted = `$${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <View style={[styles.card, { minHeight: cardHeight }]}>
      <MetricColumn
        label="Remaining Budget"
        heroValue={remainingFormatted}
        footerValue={remainingFormatted}
        footerColor="#1a6fd4"
        isGold={false}
        showSparkles={false}
        layout={layout}
      />

      <View style={styles.divider} />

      <MetricColumn
        label="On-Track Progress"
        heroValue={onTrackLabel}
        footerValue={onTrackLabel}
        footerColor="#d4a017"
        heroColor={isHighScore ? '#FFE566' : '#fff'}
        isGold={isHighScore}
        showSparkles
        layout={layout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  column: {
    flex: 1,
    alignItems: 'center',
  },

  blueSection: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1a6fd4',
    paddingTop: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  metricLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },

  heroValue: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },

  stackSection: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    overflow: 'visible',
  },

  stackFrame: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },

  sparkleLayer: {
    position: 'absolute',
    zIndex: 3,
    overflow: 'visible',
  },

  stackImageGold: {
    tintColor: '#E8C547',
  },

  sparkle: {
    position: 'absolute',
    color: '#FFE566',
    fontWeight: '700',
    textShadowColor: 'rgba(255, 255, 200, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },

  whiteSection: {
    flex: 0.55,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },

  footerValue: {
    fontWeight: '700',
  },

  divider: {
    width: 1,
    alignSelf: 'stretch',
    backgroundColor: '#dce8f5',
  },
});
