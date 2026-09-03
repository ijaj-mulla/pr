import { describe, it, expect, beforeEach } from 'vitest';
import { useFleetStore } from '../store/fleetStore';
import type { Robot, RobotEvent } from '../types';

describe('replay event selection', () => {
  beforeEach(() => {
    useFleetStore.getState().resetFleet();
  });

  it('should select latest event at or before given time', () => {
    const robots: Robot[] = [
      { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
    ];

    const events: RobotEvent[] = [
      { t: 0, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
      { t: 10, robot_id: 'r1', x: 110, y: 210, status: 'active', battery: 95 },
      { t: 20, robot_id: 'r1', x: 120, y: 220, status: 'on_mission', battery: 90 },
    ];

    useFleetStore.getState().initializeFleet(robots, events);

    useFleetStore.getState().updateFleetAtTime(5);
    let state = useFleetStore.getState();
    expect(state.robots['r1'].status).toBe('idle');
    expect(state.robots['r1'].position).toEqual({ x: 100, y: 200 });

    useFleetStore.getState().updateFleetAtTime(15);
    state = useFleetStore.getState();
    expect(state.robots['r1'].status).toBe('active');
    expect(state.robots['r1'].position).toEqual({ x: 110, y: 210 });

    useFleetStore.getState().updateFleetAtTime(25);
    state = useFleetStore.getState();
    expect(state.robots['r1'].status).toBe('on_mission');
    expect(state.robots['r1'].position).toEqual({ x: 120, y: 220 });
  });

  it('should handle time before any events', () => {
    const robots: Robot[] = [
      { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
    ];

    const events: RobotEvent[] = [
      { t: 10, robot_id: 'r1', x: 110, y: 210, status: 'active', battery: 95 },
    ];

    useFleetStore.getState().initializeFleet(robots, events);

    useFleetStore.getState().updateFleetAtTime(5);
    const state = useFleetStore.getState();
    expect(state.robots['r1'].status).toBe('idle');
    expect(state.robots['r1'].position).toEqual({ x: 100, y: 200 });
  });

  it('should update multiple robots independently', () => {
    const robots: Robot[] = [
      { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
      { robot_id: 'r2', robot_type: 'hauler', start: { x: 150, y: 250 } },
    ];

    const events: RobotEvent[] = [
      { t: 0, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
      { t: 5, robot_id: 'r1', x: 110, y: 210, status: 'active', battery: 95 },
      { t: 0, robot_id: 'r2', x: 150, y: 250, status: 'idle', battery: 100 },
      { t: 10, robot_id: 'r2', x: 160, y: 260, status: 'on_mission', battery: 90 },
    ];

    useFleetStore.getState().initializeFleet(robots, events);

    useFleetStore.getState().updateFleetAtTime(7);
    const state = useFleetStore.getState();
    expect(state.robots['r1'].status).toBe('active');
    expect(state.robots['r2'].status).toBe('idle');
  });
});
