import { useState, useEffect, useRef, useCallback } from 'react';

interface WebcamPosition {
  x: number;
  y: number;
}

interface PositionBuffer {
  x: number[];
  y: number[];
}

const BUFFER_SIZE = 10; // Number of frames to keep for smoothing
const STD_DEV_THRESHOLD = 2.0; // Number of standard deviations for outlier detection

function calculateMeanAndStdDev(values: number[]): { mean: number; stdDev: number } {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => (value - mean) ** 2);
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return { mean, stdDev: Math.sqrt(variance) };
}

function getSmoothPosition(buffer: PositionBuffer): WebcamPosition {
  const { mean: meanX, stdDev: stdDevX } = calculateMeanAndStdDev(buffer.x);
  const { mean: meanY, stdDev: stdDevY } = calculateMeanAndStdDev(buffer.y);

  // Filter out values that are too far from the mean
  const filteredX = buffer.x.filter(x => Math.abs(x - meanX) <= STD_DEV_THRESHOLD * stdDevX);
  const filteredY = buffer.y.filter(y => Math.abs(y - meanY) <= STD_DEV_THRESHOLD * stdDevY);

  // Calculate final smoothed position
  return {
    x: filteredX.reduce((sum, val) => sum + val, 0) / filteredX.length,
    y: filteredY.reduce((sum, val) => sum + val, 0) / filteredY.length
  };
}

export function useWebcamTracking() {
  const [position, setPosition] = useState<WebcamPosition>({ x: 0, y: 0 });
  const [isEnabled, setIsEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const previousImageData = useRef<ImageData | null>(null);
  const positionBuffer = useRef<PositionBuffer>({ x: [], y: [] });

  const addToBuffer = useCallback((x: number, y: number) => {
    positionBuffer.current.x.push(x);
    positionBuffer.current.y.push(y);

    // Keep buffer size fixed
    if (positionBuffer.current.x.length > BUFFER_SIZE) {
      positionBuffer.current.x.shift();
      positionBuffer.current.y.shift();
    }

    // Only update position when we have enough samples
    if (positionBuffer.current.x.length >= 3) {
      const smoothedPosition = getSmoothPosition(positionBuffer.current);
      setPosition(smoothedPosition);
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
      }
      document.body.removeChild(videoRef.current);
      videoRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsEnabled(false);
    positionBuffer.current = { x: [], y: [] };
  }, []);

  const initializeWebcam = useCallback(async () => {
    // If already enabled, stop the webcam
    if (isEnabled) {
      stopWebcam();
      return;
    }

    try {
      // First check if we already have permission
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      
      if (permissions.state === 'denied') {
        console.error('Camera permission denied');
        setHasPermission(false);
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });

      // Create and setup video element if it doesn't exist
      if (!videoRef.current) {
        const video = document.createElement('video');
        video.style.position = 'fixed';
        video.style.bottom = '80px';
        video.style.left = '20px';
        video.style.width = '160px';
        video.style.height = '120px';
        video.style.borderRadius = '8px';
        video.style.transform = 'scaleX(-1)'; // Mirror the video
        video.style.zIndex = '40';
        video.style.opacity = '0.7';
        video.style.transition = 'opacity 0.3s ease';
        
        // Fix linter errors by using proper event handlers
        video.addEventListener('mouseenter', () => {
          video.style.opacity = '1';
        });
        video.addEventListener('mouseleave', () => {
          video.style.opacity = '0.7';
        });
        
        videoRef.current = video;
        document.body.appendChild(video);
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      
      setHasPermission(true);
      setIsEnabled(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      setHasPermission(false);
      setIsEnabled(false);
    }
  }, [isEnabled, stopWebcam]);

  const detectMotion = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isEnabled) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return;

    // Match canvas size to video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current frame
    context.drawImage(video, 0, 0);
    const currentImageData = context.getImageData(0, 0, canvas.width, canvas.height);

    if (previousImageData.current) {
      let totalX = 0;
      let totalY = 0;
      let totalDiff = 0;

      // Compare pixels for motion detection with increased step size for better performance
      for (let y = 0; y < canvas.height; y += 15) { // Increased step size
        for (let x = 0; x < canvas.width; x += 15) { // Increased step size
          const i = (y * canvas.width + x) * 4;
          // Compare average of RGB channels for more stable detection
          const diff = (
            Math.abs(currentImageData.data[i] - previousImageData.current.data[i]) +
            Math.abs(currentImageData.data[i + 1] - previousImageData.current.data[i + 1]) +
            Math.abs(currentImageData.data[i + 2] - previousImageData.current.data[i + 2])
          ) / 3;
          
          if (diff > 25) { // Adjusted threshold
            totalX += x;
            totalY += y;
            totalDiff++;
          }
        }
      }

      if (totalDiff > 0) {
        // Calculate average position of motion
        const avgX = (totalX / totalDiff) / canvas.width;
        const avgY = (totalY / totalDiff) / canvas.height;
        
        // Add to smoothing buffer
        addToBuffer(
          avgX * window.innerWidth,
          avgY * window.innerHeight
        );
      }
    }

    previousImageData.current = currentImageData;
    animationFrameRef.current = requestAnimationFrame(detectMotion);
  }, [isEnabled, addToBuffer]);

  useEffect(() => {
    // Create canvas element
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.display = 'none';
      canvasRef.current = canvas;
      document.body.appendChild(canvas);
    }

    return () => {
      stopWebcam();
      if (canvasRef.current) {
        document.body.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, [stopWebcam]);

  useEffect(() => {
    if (isEnabled) {
      detectMotion();
    }
  }, [isEnabled, detectMotion]);

  return {
    position,
    isEnabled,
    hasPermission,
    initializeWebcam,
    stopWebcam
  };
} 