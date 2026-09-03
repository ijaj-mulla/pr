import { describe, it, expect, beforeEach } from 'vitest';
import { useFleetStore } from '../store/fleetStore';
import type { Robot, RobotEvent } from '../types';

describe('fleetStore', () => {
  beforeEach(() => {
    useFleetStore.getState().resetFleet();
  });

  describe('initializeFleet', () => {
    it('should initialize fleet state from robots and events', () => {
      const robots: Robot[] = [
        { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
        { robot_id: 'r2', robot_type: 'hauler', start: { x: 150, y: 250 } },
      ];

      const events: RobotEvent[] = [
        { t: 0, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
        { t: 5, robot_id: 'r1', x: 110, y: 210, status: 'active', battery: 98 },
        { t: 0, robot_id: 'r2', x: 150, y: 250, status: 'idle', battery: 95 },
      ];

      useFleetStore.getState().initializeFleet(robots, events);

      const state = useFleetStore.getState();

      expect(state.robots).toHaveProperty('r1');
      expect(state.robots).toHaveProperty('r2');
      expect(state.robots['r1'].robot_type).toBe('picker');
      expect(state.robots['r2'].robot_type).toBe('hauler');
      expect(state.robots['r1'].status).toBe('active');
      expect(state.robots['r1'].position).toEqual({ x: 110, y: 210 });
      expect(state.robots['r1'].battery).toBe(98);
      expect(state.robots['r1'].last_updated).toBe(5);
    });

    it('should use start position when no events exist for robot', () => {
      const robots: Robot[] = [
        { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
      ];

      const events: RobotEvent[] = [];

      useFleetStore.getState().initializeFleet(robots, events);

      const state = useFleetStore.getState();

      expect(state.robots['r1'].position).toEqual({ x: 100, y: 200 });
      expect(state.robots['r1'].status).toBe('idle');
      expect(state.robots['r1'].battery).toBe(100);
    });
  });

  describe('getRobotState', () => {
    it('should return robot state for existing robot', () => {
      const robots: Robot[] = [
        { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
      ];

      const events: RobotEvent[] = [
        { t: 0, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
      ];

      useFleetStore.getState().initializeFleet(robots, events);

      const robotState = useFleetStore.getState().getRobotState('r1');

      expect(robotState).toBeDefined();
      expect(robotState?.robot_id).toBe('r1');
    });

    it('should return undefined for non-existent robot', () => {
      const robotState = useFleetStore.getState().getRobotState('nonexistent');
      expect(robotState).toBeUndefined();
    });
  });

  describe('updateRobotState', () => {
    it('should update robot state', () => {
      const robots: Robot[] = [
        { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
      ];

      const events: RobotEvent[] = [
        { t: 0, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
      ];

      useFleetStore.getState().initializeFleet(robots, events);

      useFleetStore.getState().updateRobotState('r1', {
        status: 'active',
        battery: 90,
      });

      const state = useFleetStore.getState();

      expect(state.robots['r1'].status).toBe('active');
      expect(state.robots['r1'].battery).toBe(90);
      expect(state.robots['r1'].robot_type).toBe('picker');
    });
  });

  describe('resetFleet', () => {
    it('should clear all robot states', () => {
      const robots: Robot[] = [
        { robot_id: 'r1', robot_type: 'picker', start: { x: 100, y: 200 } },
      ];

      const events: RobotEvent[] = [
        { t: 0, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
      ];

      useFleetStore.getState().initializeFleet(robots, events);

      useFleetStore.getState().resetFleet();

      const state = useFleetStore.getState();

      expect(Object.keys(state.robots)).toHaveLength(0);
    });
  });
});
