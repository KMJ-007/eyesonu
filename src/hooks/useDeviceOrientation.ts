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

type UseDeviceOrientationData = {
  orientation: DeviceOrientation | null;
  error: Error | null;
  requestAccess: () => Promise<boolean>;
  revokeAccess: () => Promise<void>;
};

export function useDeviceOrientation(): UseDeviceOrientationData {
  const [error, setError] = useState<Error | null>(null);
  const [orientation, setOrientation] = useState<DeviceOrientation | null>(null);

  const onDeviceOrientation = (event: DeviceOrientationEvent): void => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  };

  const revokeAccessAsync = async (): Promise<void> => {
    window.removeEventListener('deviceorientation', onDeviceOrientation);
    setOrientation(null);
  };

  const requestAccessAsync = async (): Promise<boolean> => {
    if (typeof window === 'undefined') {
      setError(new Error('Window is not defined'));
      return false;
    }

    const win = window as WindowWithOrientation;
    console.log('DeviceOrientation Debug:', {
      isSupported: 'DeviceOrientationEvent' in win,
      hasRequestPermission: typeof win.DeviceOrientationEvent?.requestPermission === 'function'
    });

    // Check if device orientation is supported
    if (!('DeviceOrientationEvent' in win)) {
      setError(new Error('Device orientation is not supported by this device'));
      return false;
    }

    try {
      // For iOS 13+ devices
      if (typeof win.DeviceOrientationEvent?.requestPermission === 'function') {
        console.log('Requesting iOS permission...');
        const permission = await win.DeviceOrientationEvent.requestPermission();
        console.log('iOS permission result:', permission);
        if (permission !== 'granted') {
          setError(new Error('Permission not granted'));
          return false;
        }
      }

      // Add the event listener
      window.addEventListener('deviceorientation', onDeviceOrientation, true);
      return true;
    } catch (err) {
      console.error('Device orientation error:', err);
      setError(err instanceof Error ? err : new Error('Failed to initialize device orientation'));
      return false;
    }
  };

  const requestAccess = useCallback(requestAccessAsync, []);
  const revokeAccess = useCallback(revokeAccessAsync, []);

  useEffect(() => {
    // Auto-request access for non-iOS devices
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      const win = window as WindowWithOrientation;
      // Only auto-request if not iOS (no requestPermission function)
      if (typeof win.DeviceOrientationEvent?.requestPermission !== 'function') {
        requestAccess();
      }
    }

    return () => {
      revokeAccess();
    };
  }, [requestAccess, revokeAccess]);

  return {
    orientation,
    error,
    requestAccess,
    revokeAccess,
  };
} 