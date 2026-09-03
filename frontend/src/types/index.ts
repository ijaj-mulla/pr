export type RobotStatus = 
  | 'idle' 
  | 'active' 
  | 'on_mission' 
  | 'maintenance' 
  | 'blocked' 
  | 'error' 
  | 'offline'
  | 'charging';

export interface Position {
  x: number;
  y: number;
}

export interface Robot {
  robot_id: string;
  robot_type: 'picker' | 'hauler';
  start: Position;
}

export interface RobotEvent {
  t: number;
  robot_id: string;
  x: number;
  y: number;
  status: RobotStatus;
  battery: number;
  task_event?: string;
}

export interface RobotState {
  robot_id: string;
  robot_type: 'picker' | 'hauler';
  position: Position;
  status: RobotStatus;
  battery: number;
  last_updated: number;
  task_event?: string;
}

export interface FleetState {
  robots: Record<string, RobotState>;
  events: Record<string, RobotEvent[]>;
  initialRobots: Record<string, Robot>;
  getRobotState: (robotId: string) => RobotState | undefined;
  updateRobotState: (robotId: string, state: Partial<RobotState>) => void;
  resetFleet: () => void;
  initializeFleet: (robots: Robot[], events: RobotEvent[]) => void;
  updateFleetAtTime: (time: number) => void;
}

export type SimulationMode = 'replay' | 'live';

export interface ReplayState {
  mode: SimulationMode;
  isPlaying: boolean;
  currentTime: number;
  speed: number;
  maxTime: number;
  selectedRobotId: string | null;
  searchQuery: string;
  filterAttention: boolean;
  setMode: (mode: SimulationMode) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setSpeed: (speed: number) => void;
  setSelectedRobotId: (robotId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterAttention: (filter: boolean) => void;
  resetReplay: () => void;
  togglePlay: () => void;
}
