export type Direction = "NORTH" | "EAST" | "SOUTH" | "WEST";

export interface ProbeState {
  id: string;
  x: number;
  y: number;
  direction: Direction;
}

export interface PathHistoryStep {
  x: number;
  y: number;
  direction: Direction;
  action: "LANDING" | "MOVE" | "TURN_LEFT" | "TURN_RIGHT";
}

export interface ProbeDetail extends ProbeState {
  plateau_max_x: number;
  plateau_max_y: number;
  path_history: PathHistoryStep[];
}

export interface ProbeListResponse {
  probes: ProbeState[];
}

export interface LaunchPayload {
  x: number;
  y: number;
  direction: Direction;
}

export interface MovePayload {
  commands: string;
}

export interface ApiErrorDetail {
  detail: string;
  error_code: string;
  failed_at_step?: number | null;
  failed_command?: string | null;
  last_safe_state?: ProbeState | null;
}
