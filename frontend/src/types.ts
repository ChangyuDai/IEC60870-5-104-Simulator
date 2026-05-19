export interface ServerInfo {
  id: string
  bind_address: string
  port: number
  state: string
  station_count: number
}

export interface StationInfo {
  common_address: number
  name: string
  point_count: number
}

export interface DataPointInfo {
  ioa: number
  asdu_type: string
  category: string
  name: string
  comment: string
  value: string
  quality_iv: boolean
  timestamp: string | null
}

/** Response of the incremental `list_data_points_since` command. */
export interface IncrementalDataResponse {
  /** Current sequence counter — pass back as `sinceSeq` next poll. */
  seq: number
  /** Backend's total point count — a mismatch vs the local cache means a delete. */
  total_count: number
  /** Only the points changed since the caller's `sinceSeq`. */
  points: DataPointInfo[]
}

export interface LogEntry {
  timestamp: string
  direction: string
  frame_label: { [key: string]: string } | string
  detail: string
  raw_bytes: number[] | null
  detail_event?: { kind: string; payload: Record<string, unknown> } | null
}

// Frame parser types now live in @shared/types/frame to avoid duplicate
// definitions between slave and master frontends.
export * from '@shared/types/frame'
