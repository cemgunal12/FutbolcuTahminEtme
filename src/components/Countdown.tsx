// 3-2-1 geri sayım animasyonu — spring ile büyüyüp küçülür.
// Bitince onFinish callback'i çağrılır.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { C } from '../theme';

interface Props {
  onFinish: () => void;
}

export default function Countdown({ onFinish }: Props) {
  const [count, setCount] = useState(3);
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.setValue(0.3);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        tension: 70,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(() => {
        if (count > 1) {
          setCount(c => c - 1);
        } else {
          onFinish();
        }
      }, 650);
    });
  }, [count]);

  return (
    <View style={s.container}>
      <Text style={s.label}>HAZIRLANIN!</Text>
      <Animated.Text style={[s.number, { transform: [{ scale }], opacity }]}>
        {count}
      </Animated.Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textMuted,
    letterSpacing: 4,
    marginBottom: 24,
  },
  number: {
    fontSize: 140,
    fontWeight: '900',
    color: C.green,
    lineHeight: 150,
  },
});
