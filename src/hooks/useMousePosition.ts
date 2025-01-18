import { useState, useEffect } from 'react';
import { useSpring } from 'framer-motion';

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition(springConfig = { damping: 15, stiffness: 150 }) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  
  const mouseX = useSpring(mousePosition.x, springConfig);
  const mouseY = useSpring(mousePosition.y, springConfig);

  useEffect(() => {
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return { mouseX, mouseY };
} 