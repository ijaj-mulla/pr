import type { RobotState, RobotEvent, RobotStatus } from '../types';

const LIVE_UPDATE_RATE_MS = 1000; // 1 second per update
const MAP_WIDTH = 900;
const MAP_HEIGHT = 560;

export class LiveSimulator {
  private intervalId: number | null = null;
  private currentTime: number = 0;
  private robotStates: Record<string, RobotState>;
  private onUpdate: (events: RobotEvent[]) => void;

  constructor(
    initialStates: Record<string, RobotState>,
    onUpdate: (events: RobotEvent[]) => void
  ) {
    this.robotStates = JSON.parse(JSON.stringify(initialStates));
    this.onUpdate = onUpdate;
    this.currentTime = 0;
  }

  start() {
    if (this.intervalId !== null) {
      this.stop();
    }

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, LIVE_UPDATE_RATE_MS);
  }

  stop() {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick() {
    this.currentTime += LIVE_UPDATE_RATE_MS / 1000;
    const events = this.generateEvents();
    this.onUpdate(events);
  }

  private generateEvents(): RobotEvent[] {
    const events: RobotEvent[] = [];

    for (const robotId in this.robotStates) {
      const state = this.robotStates[robotId];
      const newEvent = this.generateRobotEvent(state, this.currentTime);
      events.push(newEvent);

      this.robotStates[robotId] = {
        ...state,
        position: { x: newEvent.x, y: newEvent.y },
        status: newEvent.status,
        battery: newEvent.battery,
        last_updated: newEvent.t,
        task_event: newEvent.task_event,
      };
    }

    return events;
  }

  private generateRobotEvent(state: RobotState, time: number): RobotEvent {
    const { position, status, battery, robot_type } = state;

    const newPosition = this.generateMovement(position, status, robot_type);
    const newStatus = this.generateStatusTransition(status, battery);
    const newBattery = this.generateBatteryChange(battery, newStatus);

    return {
      t: time,
      robot_id: state.robot_id,
      x: newPosition.x,
      y: newPosition.y,
      status: newStatus,
      battery: newBattery,
      task_event: this.maybeGenerateTaskEvent(newStatus),
    };
  }

  private generateMovement(
    position: { x: number; y: number },
    status: RobotStatus,
    robotType: 'picker' | 'hauler'
  ): { x: number; y: number } {
    if (['idle', 'offline', 'maintenance', 'error', 'charging'].includes(status)) {
      return position;
    }

    const speed = robotType === 'picker' ? 5 : 8;
    const maxMove = speed * (LIVE_UPDATE_RATE_MS / 1000);

    // Choose a random direction
    const angle = Math.random() * Math.PI * 2;
    const dx = Math.cos(angle) * maxMove * Math.random();
    const dy = Math.sin(angle) * maxMove * Math.random();

    let newX = position.x + dx;
    let newY = position.y + dy;

    // Boundary reflection: if hitting edge, reflect direction
    if (newX < 0) {
      newX = -newX; // Reflect from left edge
    } else if (newX > MAP_WIDTH) {
      newX = MAP_WIDTH - (newX - MAP_WIDTH); // Reflect from right edge
    }

    if (newY < 0) {
      newY = -newY; // Reflect from top edge
    } else if (newY > MAP_HEIGHT) {
      newY = MAP_HEIGHT - (newY - MAP_HEIGHT); // Reflect from bottom edge
    }

    // Clamp to ensure we stay within bounds (safety check)
    return {
      x: Math.max(0, Math.min(MAP_WIDTH, newX)),
      y: Math.max(0, Math.min(MAP_HEIGHT, newY)),
    };
  }

  private generateStatusTransition(currentStatus: RobotStatus, battery: number): RobotStatus {
    if (currentStatus === 'offline') {
      return Math.random() < 0.1 ? 'idle' : 'offline';
    }

    if (currentStatus === 'maintenance') {
      return Math.random() < 0.05 ? 'idle' : 'maintenance';
    }

    if (currentStatus === 'error') {
      return Math.random() < 0.1 ? 'idle' : 'error';
    }

    if (currentStatus === 'blocked') {
      return Math.random() < 0.2 ? 'idle' : 'blocked';
    }

    if (currentStatus === 'charging') {
      if (battery >= 95) {
        return 'idle';
      }
      return 'charging';
    }

    if (battery < 20) {
      return Math.random() < 0.3 ? 'charging' : currentStatus;
    }

    const transitions: Record<RobotStatus, RobotStatus[]> = {
      idle: ['idle', 'active', 'on_mission'],
      active: ['idle', 'active', 'on_mission', 'blocked'],
      on_mission: ['idle', 'active', 'on_mission'],
      blocked: ['idle', 'blocked', 'error'],
      error: ['idle', 'error', 'maintenance'],
      maintenance: ['idle', 'maintenance'],
      offline: ['idle', 'offline'],
      charging: ['idle', 'charging'],
    };

    const possible = transitions[currentStatus] || [currentStatus];
    return possible[Math.floor(Math.random() * possible.length)];
  }

  private generateBatteryChange(currentBattery: number, status: RobotStatus): number {
    if (status === 'charging') {
      return Math.min(100, currentBattery + 2);
    }

    if (['idle', 'offline', 'maintenance'].includes(status)) {
      return Math.max(0, currentBattery - 0.1);
    }

    const drainRate = status === 'on_mission' ? 0.5 : 0.3;
    return Math.max(0, currentBattery - drainRate);
  }

  private maybeGenerateTaskEvent(status: RobotStatus): string | undefined {
    if (status === 'on_mission' && Math.random() < 0.1) {
      return 'task_completed';
    }
    return undefined;
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}
