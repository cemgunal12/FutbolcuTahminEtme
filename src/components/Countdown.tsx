// 3-2-1 geri sayım animasyonu.
// Sayı büyüyüp küçülerek görünür, bitince onFinish callback'i tetiklenir.
// Takım seçiminden sonra iki takımın açıklanmasından önce çalışır.

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated } from 'react-native';

interface CountdownProps {
  onFinish: () => void;
}

export default function Countdown({ onFinish }: CountdownProps) {
  const [count, setCount] = useState(3);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    animateCount();
  }, [count]);

  function animateCount() {
    scaleAnim.setValue(0.5);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 5,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        if (count > 1) {
          setCount((c) => c - 1);
        } else {
          // Geri sayım bitti
          onFinish();
        }
      }, 700);
    });
  }

  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Animated.Text
        style={[
          { fontSize: 120, fontWeight: 'bold', color: '#f59e0b' },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {count}
      </Animated.Text>
      <Text className="text-slate-400 text-lg mt-4">Hazırlanın!</Text>
    </View>
  );
}
