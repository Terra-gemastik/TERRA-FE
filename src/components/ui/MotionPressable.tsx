import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  type StyleProp,
  type GestureResponderEvent,
  type PressableProps,
  type ViewStyle,
} from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type MotionPressableProps = Omit<PressableProps, "children" | "style"> & {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  pressedScale?: number;
  style?: StyleProp<ViewStyle>;
};

export function MotionPressable({
  children,
  disabled = false,
  onPressIn,
  onPressOut,
  pressedScale = 0.985,
  style,
  ...props
}: MotionPressableProps) {
  const [kurangiGerak, setKurangiGerak] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(disabled ? 0.58 : 1)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setKurangiGerak);
  }, []);

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: disabled ? 0.58 : 1,
      duration: 120,
      useNativeDriver: true,
    }).start();
  }, [disabled, opacity]);

  const tekanMasuk = (event: GestureResponderEvent) => {
    onPressIn?.(event);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: kurangiGerak ? 1 : pressedScale,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: disabled ? 0.58 : 0.88,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const tekanKeluar = (event: GestureResponderEvent) => {
    onPressOut?.(event);
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: disabled ? 0.58 : 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={tekanMasuk}
      onPressOut={tekanKeluar}
      style={[style, { opacity, transform: [{ scale }] }]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}
