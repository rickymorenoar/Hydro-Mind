export interface Device {
  id: number;
  name: string;
  api_key_masked: string;
  latest_reading: Reading | null;
  setting: DeviceSetting | null;
  is_online: boolean;
  last_seen_diff?: string | null;
  created_at: string;
}

export interface Reading {
  soil_moisture: number;
  air_temp: number;
  air_humidity: number;
  pump_status: 'ON' | 'OFF';
  water_flow: number;
  battery_level: number;
  battery_voltage: number;
  is_online?: boolean;
  last_seen_diff?: string | null;
  created_at: string;
}

export interface DeviceSetting {
  mode: 'AUTO' | 'MANUAL';
  pump_cmd: 'ON' | 'OFF';
  moisture_lower: number;
  moisture_upper: number;
}

export interface NotifLogEntry {
  id: number;
  type: 'CLOG_OR_PUMP_FAIL' | 'LOW_BATTERY';
  message: string;
  created_at: string;
}

export interface HistoryPoint {
  value: number;
  created_at: string;
}
