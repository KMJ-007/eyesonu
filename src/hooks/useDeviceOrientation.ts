import { useCallback, useEffect, useState } from 'react';

interface WindowWithOrientation extends Window {
  DeviceOrientationEvent: {
    requestPermission?: () => Promise<PermissionState>;
    new (type: string, eventInitDict?: DeviceOrientationEventInit): DeviceOrientationEvent;
    prototype: DeviceOrientationEvent;
  };
  DeviceMotionEvent: {
    requestPermission?: () => Promise<PermissionState>;
    new (type: string, eventInitDict?: DeviceMotionEventInit): DeviceMotionEvent;
    prototype: DeviceMotionEvent;
  };
}

type DeviceOrientation = {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
};

type DeviceMotion = {
  acceleration: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  accelerationIncludingGravity: {
    x: number | null;
    y: number | null;
    z: number | null;
  };
  rotationRate: {
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  };
  interval: number | null;
};

type UseDeviceOrientationData = {
  orientation: DeviceOrientation | null;
  motion: DeviceMotion | null;
  error: Error | null;
  requestAccess: () => Promise<boolean>;
  revokeAccess: () => Promise<void>;
};

export function useDeviceOrientation(): UseDeviceOrientationData {
  const [error, setError] = useState<Error | null>(null);
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);
  const [motion, setMotion] = useState<DeviceMotion | null>(null);

  const onDeviceOrientation = (event: DeviceOrientationEvent): void => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  };

  const onDeviceMotion = (event: DeviceMotionEvent): void => {
    setMotion({
      acceleration: {
        x: event.acceleration?.x ?? null,
        y: event.acceleration?.y ?? null,
        z: event.acceleration?.z ?? null,
      },
      accelerationIncludingGravity: {
        x: event.accelerationIncludingGravity?.x ?? null,
        y: event.accelerationIncludingGravity?.y ?? null,
        z: event.accelerationIncludingGravity?.z ?? null,
      },
      rotationRate: {
        alpha: event.rotationRate?.alpha ?? null,
        beta: event.rotationRate?.beta ?? null,
        gamma: event.rotationRate?.gamma ?? null,
      },
      interval: event.interval,
    });
  };

  const revokeAccessAsync = async (): Promise<void> => {
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    window.removeEventListener('devicemotion', onDeviceMotion);
    setOrientation(null);
    setMotion(null);
  };

  const requestAccessAsync = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      setError(new Error('Window is not defined'));
      return false;
    }

    const win = window as WindowWithOrientation;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

   
    try {
      // Only request permissions on iOS 13+
      if (isIOS && typeof win.DeviceOrientationEvent?.requestPermission === 'function') {
        const orientationPermission = await win.DeviceOrientationEvent.requestPermission();
        if (orientationPermission !== 'granted') {
          setError(new Error('Orientation permission not granted'));
          return false;
        }
      }

      if (isIOS && typeof win.DeviceMotionEvent?.requestPermission === 'function') {
        const motionPermission = await win.DeviceMotionEvent.requestPermission();
        if (motionPermission !== 'granted') {
          setError(new Error('Motion permission not granted'));
          return false;
        }
      }

      // Add event listeners (works directly on Android)
      window.addEventListener('deviceorientation', onDeviceOrientation, true);
      window.addEventListener('devicemotion', onDeviceMotion, true);
      return true;
    } catch (err) {
      console.error('Device sensors error:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize device sensors'));
      return false;
    }
  };

  const requestAccess = useCallback(requestAccessAsync, []);
  const revokeAccess = useCallback(revokeAccessAsync, []);

  useEffect(() => {
    // Auto-request access for non-iOS devices or when permission APIs aren't available
    if (typeof window !== 'undefined') {
      const win = window as WindowWithOrientation;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Only auto-request if not iOS or if iOS but no permission API
      if (!isIOS || (isIOS && typeof win.DeviceOrientationEvent?.requestPermission !== 'function')) {
        requestAccess();
      }
    }

    return () => {
      revokeAccess();
    };
  }, [requestAccess, revokeAccess]);

  return {
    orientation,
    motion,
    error,
    requestAccess,
    revokeAccess,
  };
} 