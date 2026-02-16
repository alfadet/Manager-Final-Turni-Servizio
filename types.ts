
export interface Operator {
  operator_id: string;
  operator_name: string;
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
  VIEWING_VENUE_STATS = 'VIEWING_VENUE_STATS'
}

/**
 * Statistics for an operator within a specific month.
 */
export interface OperatorMonthlyStat {
  serviceCount: number;
  totalHours: number;
}

/**
 * Statistics for a venue within a specific month.
 */
export interface VenueMonthlyStat {
  operatorServiceCount: number;
}

export interface HistoricalStats {
  months: Record<string, {
    operators: Record<string, OperatorMonthlyStat>;
    venues: Record<string, VenueMonthlyStat>;
  }>;
}
