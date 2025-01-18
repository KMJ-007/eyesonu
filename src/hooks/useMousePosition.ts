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

      // Constrain the range of beta and gamma to [-90,90]
      const constrainedBeta = Math.max(-90, Math.min(90, beta));
      const constrainedGamma = Math.max(-90, Math.min(90, gamma));

      // Map the orientation values to cursor coordinates
      // Using a more precise calculation based on the reference
      const x = ((constrainedGamma + 90) / 180) * window.innerWidth;
      const y = ((constrainedBeta + 90) / 180) * window.innerHeight;

      console.log('Gyro Debug:', { 
        beta, 
        gamma, 
        constrained: { beta: constrainedBeta, gamma: constrainedGamma },
        position: { x, y }
      });

      setMousePosition({ x, y });
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