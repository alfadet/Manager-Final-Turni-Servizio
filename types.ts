
export interface Operator {
  operator_id: string;
  operator_name: string;
}

export interface Venue {
  venue_id: string;
  venue_name: string;
}

export interface ServiceEntry {
  id: number;
  venue_name: string;
  location: string;
  service_date: string;
  start_time: string;
  end_time: string;
  notes: string;
  operators: Operator[];
  double_shift?: boolean;
}

export interface Batch {
  batch_id: string;
  created_at: string;
  services: ServiceEntry[];
}

export enum AppState {
  IDLE = 'IDLE',
  CREATING_SERVICE = 'CREATING_SERVICE',
  TERMINATED = 'TERMINATED',
  SENT = 'SENT',
  VIEWING_SENT_BATCHES = 'VIEWING_SENT_BATCHES',
  VIEWING_OPERATOR_STATS = 'VIEWING_OPERATOR_STATS',
  VIEWING_VENUE_STATS = 'VIEWING_VENUE_STATS',
  VIEWING_ADVANCED_LOGS = 'VIEWING_ADVANCED_LOGS'
}

/**
 * Interfaces to support the legacy MonthlyReport component
 */
export interface OperatorMonthlyStat {
  totalHours: number;
  serviceCount: number;
}

export interface VenueMonthlyStat {
  operatorServiceCount: number;
}

export interface MonthlyData {
  operators: Record<string, OperatorMonthlyStat>;
  venues: Record<string, VenueMonthlyStat>;
}

export interface HistoricalStats {
  months: Record<string, MonthlyData>;
}
