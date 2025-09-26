
export enum Tab {
  Map,
  Imu,
  Gnss,
}

export interface PositionState {
  lat: number;
  lng: number;
  accuracy: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number | null;
}

export interface ImuData {
  x: number | null;
  y: number | null;
  z: number | null;
}

export interface GyroData {
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
}

export interface Satellite {
  svid: number;
  constellation: 'GPS' | 'GLONASS' | 'Galileo' | 'BeiDou';
  cn0: number;
  elevation: number;
  azimuth: number;
  usedInFix: boolean;
}
