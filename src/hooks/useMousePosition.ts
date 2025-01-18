import { useState, useEffect } from 'react';
import { useDeviceOrientation } from './useDeviceOrientation';

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition() {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ 
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0
  });

  const { orientation, requestAccess } = useDeviceOrientation();
  const [isUsingGyro, setIsUsingGyro] = useState(false);

  useEffect(() => {
    // Request gyroscope access on mobile devices
    if ('ontouchstart' in window) {
      requestAccess().then(granted => {
        setIsUsingGyro(granted);
      });
    }
  }, [requestAccess]);

  useEffect(() => {
    // Handle gyroscope input
    if (isUsingGyro && orientation) {
      const { beta, gamma } = orientation;
      if (beta === null || gamma === null) return;

      // Natural holding angle is around 60 degrees tilted back
      const NATURAL_TILT = 60;
      
      // Adjust beta relative to natural holding position
      const adjustedBeta = beta - NATURAL_TILT;

      // Use wider range for more responsive movement
      const constrainedBeta = Math.max(-25, Math.min(25, adjustedBeta));
      const constrainedGamma = Math.max(-25, Math.min(25, gamma));

      // Direct linear mapping with inversion
      const normalizedGamma = -(constrainedGamma / 25);
      const normalizedBeta = -(constrainedBeta / 25);

      // Tiny deadzone just to prevent jitter
      const applyTinyDeadzone = (value: number) => Math.abs(value) < 0.02 ? 0 : value;

      const gammaDead = applyTinyDeadzone(normalizedGamma);
      const betaDead = applyTinyDeadzone(normalizedBeta);

      // Direct linear response for maximum responsiveness
      const sensitivity = 1.2;

      // Almost no center bias for maximum range of movement
      const centerBias = 0.1;
      const x = window.innerWidth / 2 + (gammaDead * window.innerWidth * sensitivity * (1 - centerBias));
      const y = window.innerHeight / 2 + (betaDead * window.innerHeight * sensitivity * (1 - centerBias));

      // Ensure position stays within screen bounds
      const boundedX = Math.max(0, Math.min(window.innerWidth, x));
      const boundedY = Math.max(0, Math.min(window.innerHeight, y));

      setMousePosition({ x: boundedX, y: boundedY });
    }
  }, [isUsingGyro, orientation]);

  useEffect(() => {
    // Only add mouse/touch handlers if not using gyroscope
    if (isUsingGyro) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isUsingGyro]);

  return mousePosition;
} 