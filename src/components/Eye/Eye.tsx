import { useRef, useState, useEffect } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface EyeProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  isMobile: boolean;
  scale?: number;
  maxMoveScale?: number;
}

export function Eye({ mouseX, mouseY, isMobile, scale = 85, maxMoveScale = 0.12 }: EyeProps) {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [eyeRect, setEyeRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!eyeRef.current) return;
    const updateEyeRect = () => {
      setEyeRect(eyeRef.current?.getBoundingClientRect() || null);
    };
    
    updateEyeRect();
    const observer = new ResizeObserver(updateEyeRect);
    observer.observe(eyeRef.current);
    window.addEventListener('scroll', updateEyeRect);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateEyeRect);
    };
  }, []);

  const getOffset = (mousePos: number, eyePos: number, eyeSize: number) => {
    const eyeCenter = eyePos + eyeSize / 2;
    const delta = mousePos - eyeCenter;
    const maxMove = eyeSize * (isMobile ? maxMoveScale * 0.67 : maxMoveScale);
    const easedDelta = Math.sign(delta) * (Math.abs(delta) * 0.01) ** 0.8;
    return Math.max(Math.min(easedDelta * maxMove, maxMove), -maxMove);
  };

  const x = useTransform(mouseX, (latestX) => {
    if (!eyeRect) return 0;
    return getOffset(latestX, eyeRect.left, eyeRect.width);
  });

  const y = useTransform(mouseY, (latestY) => {
    if (!eyeRect) return 0;
    return getOffset(latestY, eyeRect.top, eyeRect.height);
  });

  const scalePercentage = scale / 100;

  return (
    <div ref={eyeRef} className="relative w-full pt-[100%]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative rounded-full bg-white shadow-lg overflow-hidden
                    border-2 sm:border-4 border-white/90"
          style={{
            width: `${95 * scalePercentage}%`,
            height: `${95 * scalePercentage}%`
          }}
        >
          <motion.div
            className="absolute w-[45%] h-[45%] rounded-full bg-[#4169e1]"
            style={{
              top: '50%',
              left: '50%',
              x,
              y,
              transform: 'translate(-50%, -50%)',
            }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45%] h-[45%] rounded-full bg-black" />
            <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] rounded-full bg-white/60" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_10px_rgba(0,0,0,0.6)]" />
          </motion.div>
          <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]" />
        </div>
      </div>
    </div>
  );
} 