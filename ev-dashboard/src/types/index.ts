export interface ChargingSession {
  id: number;
  ev_id: string;
  connector_id: number;
  start_time: string;
  end_time?: string;
  start_meter: number;
  end_meter?: number;
  start_soc?: number;
  end_soc?: number;
}

export interface MeterValue {
  id: number;
  session_id: number;
  timestamp: string;
  voltage?: number;
  current?: number;
  power_kw?: number;
  soc?: number;
}

export interface ChargingStatus {
  ev_id: string;
  session_id: number;
  start_time: string;
  current_time: string;
  current_soc: number;
  remaining_percent: number;
  power_kw?: number;
  voltage?: number;
  current?: number;
}

export interface WebSocketMessage {
  type: 'status_update' | 'meter_value' | 'session_start' | 'session_end';
  data: any;
  timestamp: string;
}
