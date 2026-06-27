import React, { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export default function CashStack({ onRef, percentRemaining = 100 }) {
  const stackRefs = {
    1: useRef(null),
    5: useRef(null),
    20: useRef(null),
    100: useRef(null),
  };

  const pickClosest = (amount) => {
    const denoms = [1, 5, 20, 100];
    return denoms.reduce((prev, curr) =>
      Math.abs(curr - amount) < Math.abs(prev - amount) ? curr : prev
    );
  };

  if (onRef) {
    onRef({
      deduct: (amount) => {
        const denom = pickClosest(amount);
        stackRefs[denom]?.current?.flyOff();
      },
    });
  }

  // Idle rocking animation
  const idleRock = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(idleRock, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(idleRock, {
          toValue: -1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(idleRock, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const idleRotate = idleRock.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-4deg', '0deg', '4deg'],
  });

  const billCount = Math.max(1, Math.ceil((percentRemaining / 100) * 30));

  return (
    <View style={styles.container}>
      {/* MAIN STACK */}
      <View style={styles.mainStack}>
        {Array.from({ length: billCount }).map((_, i) => {
          const tilt = (i % 2 === 0 ? 1 : -1) * 2;

          return (
            <Animated.View
              key={i}
              style={[
                styles.bigBill,
                {
                  bottom: i * 2.5,
                  transform: [
                    { rotateX: '55deg' },
                    {
                      rotateZ:
                        i === billCount - 1
                          ? idleRotate
                          : `${tilt}deg`,
                    },
                  ],
                  zIndex: i,
                },
              ]}
            >
              <View style={styles.bigBand} />
              <View style={styles.bigCircle}>
                <Text style={styles.bigDollar}>$</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      {/* MINI STACKS */}
      <View style={styles.miniRow}>
        <MiniStack ref={stackRefs[1]} label="1" color="#10b981" />
        <MiniStack ref={stackRefs[5]} label="5" color="#10b981" />
        <MiniStack ref={stackRefs[20]} label="20" color="#8b5cf6" />
        <MiniStack ref={stackRefs[100]} label="100" color="#a78bfa" />
      </View>
    </View>
  );
}

/* MINI STACK COMPONENT */
const MiniStack = forwardRef(({ label, color }, ref) => {
  const count = 6;
  const flyAnim = useRef(new Animated.Value(0)).current;

  useImperativeHandle(ref, () => ({
    flyOff: () => {
      Animated.timing(flyAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => flyAnim.setValue(0));
    },
  }));

  const flyStyle = {
    transform: [
      {
        translateY: flyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -120],
        }),
      },
      {
        rotateZ: flyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '-25deg'],
        }),
      },
      {
        scale: flyAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.6],
        }),
      },
    ],
    opacity: flyAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  return (
    <View style={miniStyles.wrapper}>
      {Array.from({ length: count }).map((_, i) => {
        const isTop = i === count - 1;

        if (isTop) {
          return (
            <Animated.View
              key={i}
              style={[
                miniStyles.bill,
                { backgroundColor: color, bottom: i * 6 },
                flyStyle,
              ]}
            >
              <View style={miniStyles.band} />
              <View style={miniStyles.circle}>
                <Text style={miniStyles.text}>{label}</Text>
              </View>
            </Animated.View>
          );
        }

        return (
          <View
            key={i}
            style={[
              miniStyles.bill,
              { backgroundColor: color, bottom: i * 6 },
            ]}
          >
            <View style={miniStyles.band} />
          </View>
        );
      })}
    </View>
  );
});

/* STYLES */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  mainStack: {
    marginBottom: 40,
    width: 240,
    height: 140,
    alignItems: 'center',
    position: 'relative',
  },

  bigBill: {
    position: 'absolute',
    width: 240,
    height: 110,
    backgroundColor: '#10b981',
    borderWidth: 4,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bigBand: {
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

  bigCircle: {
    width: 68,
    height: 68,
    backgroundColor: '#fff',
    borderRadius: 34,
    borderWidth: 4,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bigDollar: {
    fontSize: 32,
    fontWeight: '900',
    color: '#064e3b',
  },

  miniRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 260,
  },
});

const miniStyles = StyleSheet.create({
  wrapper: {
    width: 48,
    height: 108,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  bill: {
    position: 'absolute',
    width: 48,
    height: 84,
    borderWidth: 3,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  band: {
    position: 'absolute',
    width: '100%',
    height: 24,
    backgroundColor: '#fbbf24',
    top: '50%',
    transform: [{ translateY: -12 }],
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  circle: {
    width: 34,
    height: 34,
    backgroundColor: '#fff',
    borderRadius: 17,
    borderWidth: 3,
    borderColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    fontWeight: '900',
    color: '#064e3b',
  },
});
