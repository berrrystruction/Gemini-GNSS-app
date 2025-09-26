
import React, { useState, useEffect, useCallback } from 'react';
import type { ImuData, GyroData } from '../types';
import Card from './Card';

const DataDisplay: React.FC<{ title: string; data: ImuData | GyroData }> = ({ title, data }) => (
  <div className="mb-6">
    <h3 className="font-semibold text-lg text-sky-400 mb-2">{title}</h3>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
      <div className="bg-slate-700 p-4 rounded-lg">
        <span className="block text-sm text-slate-400">{data && 'x' in data ? 'X-axis' : 'Alpha (z)'}</span>
        {/* FIX: Use a type guard ('in' operator) to correctly access properties from the union type. */}
        <span className="text-2xl font-mono">{data ? (('x' in data ? data.x : data.alpha))?.toFixed(2) : '0.00'}</span>
      </div>
      <div className="bg-slate-700 p-4 rounded-lg">
        <span className="block text-sm text-slate-400">{data && 'y' in data ? 'Y-axis' : 'Beta (x)'}</span>
        {/* FIX: Use a type guard ('in' operator) to correctly access properties from the union type. */}
        <span className="text-2xl font-mono">{data ? (('y' in data ? data.y : data.beta))?.toFixed(2) : '0.00'}</span>
      </div>
      <div className="bg-slate-700 p-4 rounded-lg">
        <span className="block text-sm text-slate-400">{data && 'z' in data ? 'Z-axis' : 'Gamma (y)'}</span>
        {/* FIX: Use a type guard ('in' operator) to correctly access properties from the union type. */}
        <span className="text-2xl font-mono">{data ? (('z' in data ? data.z : data.gamma))?.toFixed(2) : '0.00'}</span>
      </div>
    </div>
  </div>
);

const ImuTab: React.FC = () => {
  const [accelData, setAccelData] = useState<ImuData | null>(null);
  const [gyroData, setGyroData] = useState<GyroData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  const startSensors = useCallback(() => {
    setError(null);
    let accelerometer: any;
    let gyroscope: any;

    try {
      // Accelerometer
      if ('Accelerometer' in window) {
        accelerometer = new (window as any).Accelerometer({ frequency: 60 });
        accelerometer.addEventListener('reading', () => {
          setAccelData({ x: accelerometer.x, y: accelerometer.y, z: accelerometer.z });
        });
        accelerometer.addEventListener('error', (event: any) => {
          setError(`Accelerometer error: ${event.error.name} ${event.error.message}`);
        });
        accelerometer.start();
      } else {
        setError('Accelerometer API not supported.');
      }

      // Gyroscope
      if ('Gyroscope' in window) {
        gyroscope = new (window as any).Gyroscope({ frequency: 60 });
        gyroscope.addEventListener('reading', () => {
          setGyroData({ alpha: gyroscope.x, beta: gyroscope.y, gamma: gyroscope.z });
        });
        gyroscope.addEventListener('error', (event: any) => {
          setError(`Gyroscope error: ${event.error.name} ${event.error.message}`);
        });
        gyroscope.start();
      } else {
        setError(prev => prev ? `${prev} Gyroscope API not supported.` : 'Gyroscope API not supported.');
      }
      
      setPermissionState('granted');
      
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
          setError("Permission to access sensors was denied.");
          setPermissionState('denied');
      } else {
          setError(`An error occurred: ${err.message}`);
      }
    }

    return () => {
      if (accelerometer) accelerometer.stop();
      if (gyroscope) gyroscope.stop();
    };
  }, []);

  const requestPermission = async () => {
    // For iOS 13+ devices
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          await (DeviceOrientationEvent as any).requestPermission();
          startSensors();
        } else {
          setPermissionState('denied');
          setError('Permission to access motion sensors denied.');
        }
      } catch (err) {
        setError('Error requesting sensor permissions.');
      }
    } else {
      // For other devices, permission is often granted by default or handled differently
      startSensors();
    }
  };

  useEffect(() => {
    // Automatically try to start for non-iOS devices.
    if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
      const cleanup = startSensors();
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Card title="IMU Data (Accelerometer & Gyroscope)">
      {permissionState === 'prompt' && typeof (DeviceMotionEvent as any).requestPermission === 'function' && (
        <div className="text-center">
            <p className="mb-4 text-slate-300">This application needs access to your device's motion sensors to display data. Please grant permission.</p>
            <button onClick={requestPermission} className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Enable Sensors
            </button>
        </div>
      )}

      {permissionState !== 'prompt' && (
        <div>
          <DataDisplay title="Accelerometer" data={accelData} />
          <DataDisplay title="Gyroscope" data={gyroData} />
        </div>
      )}

      {error && (
        <div className="mt-4 text-center text-amber-400 bg-amber-900/50 p-3 rounded-lg">
          {error}
        </div>
      )}
    </Card>
  );
};

export default ImuTab;
