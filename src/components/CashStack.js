import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function CashStack({ percentRemaining, isAnimating }) {
  const billCount = Math.max(1, Math.ceil((percentRemaining / 100) * 30));

  // Idle rocking animation for top bill
  const idleRock = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isAnimating) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(idleRock, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(idleRock, {
            toValue: -1,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(idleRock, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      idleRock.stopAnimation();
      idleRock.setValue(0);
    }
  }, [isAnimating]);

  // Convert idleRock (-1 → 1) into rotation degrees
  const idleRotate = idleRock.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-4deg', '0deg', '4deg'],
  });

  return (
    <View style={styles.container}>
      {/* Shadow */}
      <View style={[styles.shadow, { width: 260 }]} />

      {/* MAIN STACK */}
      <View style={styles.stackWrapper}>
        {Array.from({ length: billCount }).map((_, i) => {
          const tilt = (i % 2 === 0 ? 1 : -1) * (1 + Math.random() * 2);
          const scale = 0.85 + (percentRemaining / 100) * 0.15;

          // FIX: apply idle rocking inside the same transform chain
          const animatedTransforms =
            i === billCount - 1 ? [{ rotateZ: idleRotate }] : [];

          return (
            <Animated.View
              key={i}
              style={[
                styles.bill,
                {
                  bottom: i * 4,
                  transform: [
                    { rotateX: '55deg' },   // keeps bill laying down
                    { rotateZ: `${tilt}deg` },
                    { scale },
                    ...animatedTransforms,  // rocking applied LAST
                  ],
                  zIndex: i,
                },
              ]}
            >
              <View style={styles.band} />
              <View style={styles.innerCircle}>
                <Text style={styles.dollar}>$</Text>
              </View>

              {i === billCount - 1 && (
                <Text style={styles.sparkle}>✦</Text>
              )}
            </Animated.View>
          );
        })}
      </View>

      {/* FOUR MINI STACKS */}
      <View style={styles.miniRow}>
        <MiniStack label="1" />
        <MiniStack label="5" />
        <MiniStack label="20" />
        <MiniStack label="100" />
      </View>

      {/* Percent pill */}
      <View style={styles.percentPill}>
        <Text style={styles.percentText}>
          {percentRemaining.toFixed(2)}% of budget remaining
        </Text>
      </View>
    </View>
  );
}

/* MINI STACK COMPONENT */
function MiniStack({ label }) {
  const miniBills = 6;

  return (
    <View style={miniStyles.wrapper}>
      {Array.from({ length: miniBills }).map((_, i) => {
        const tilt = (i % 2 === 0 ? 1 : -1) * 1.5;

        return (
          <View
            key={i}
            style={[
              miniStyles.bill,
              {
                bottom: i * 3.6,
                transform: [
                  { rotateX: '55deg' },
                  { rotateZ: `${tilt}deg` },
                  { scale: 0.9 },
                ],
                zIndex: i,
              },
            ]}
          >
            <View style={miniStyles.band} />

            {i === miniBills - 1 && (
              <View style={miniStyles.denomCircle}>
                <Text style={miniStyles.denomText}>{label}</Text>
              </View>
            )}

            {i === miniBills - 1 && (
              <Text style={miniStyles.sparkle}>✦</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* MAIN STYLES */
const styles = StyleSheet.create({
  container: {
    height: 360,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  shadow: {
    position: 'absolute',
    bottom: 140,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 50,
  },

  stackWrapper: {
    position: 'absolute',
    bottom: 160,
    width: 240,
    height: 140,
    alignItems: 'center',
  },

  bill: {
    position: 'absolute',
    width: 240,
    height: 110,
    backgroundColor: '#10b981',
    borderRadius: 18,
    borderWidth: 4,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  band: {
    position: 'absolute',
    width: 50,
    height: '100%',
    backgroundColor: '#fbbf24',
    left: '50%',
    transform: [{ translateX: -25 }],
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: 'rgba(0,0,0,0.1)',
  },

  innerCircle: {
    width: 68,
    height: 68,
    backgroundColor: '#fff',
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },

  dollar: {
    fontSize: 32,
    fontWeight: '900',
    color: '#064e3b',
  },

  sparkle: {
    position: 'absolute',
    top: 10,
    right: 15,
    color: '#fff',
    fontSize: 20,
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowRadius: 10,
    zIndex: 5,
  },

  miniRow: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    gap: 20,
  },

  percentPill: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 22,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },

  percentText: {
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
});

/* MINI STACK STYLES */
const miniStyles = StyleSheet.create({
  wrapper: {
    width: 84,
    height: 108,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },

  bill: {
    position: 'absolute',
    width: 84,
    height: 48,
    backgroundColor: '#10b981',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  band: {
    position: 'absolute',
    width: 24,
    height: '100%',
    backgroundColor: '#fbbf24',
    left: '50%',
    transform: [{ translateX: -12 }],
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },

  denomCircle: {
    width: 34,
    height: 34,
    backgroundColor: '#fff',
    borderRadius: 17,
    borderWidth: 3,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  denomText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#064e3b',
  },

  sparkle: {
    position: 'absolute',
    top: 4,
    right: 6,
    color: '#fff',
    fontSize: 14,
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowRadius: 6,
  },
});
