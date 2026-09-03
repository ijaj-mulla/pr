import { describe, it, expect } from 'vitest';
import { needsAttention, isWorking, calculateFleetActivity, calculateFleetActivityOverTime } from '../lib/fleetUtils';
import type { RobotStatus, RobotEvent, RobotState } from '../types';

describe('fleetUtils', () => {
  describe('needsAttention', () => {
    it('should return true for blocked status', () => {
      expect(needsAttention('blocked' as RobotStatus)).toBe(true);
    });

    it('should return true for error status', () => {
      expect(needsAttention('error' as RobotStatus)).toBe(true);
    });

    it('should return true for offline status', () => {
      expect(needsAttention('offline' as RobotStatus)).toBe(true);
    });

    it('should return true for maintenance status', () => {
      expect(needsAttention('maintenance' as RobotStatus)).toBe(true);
    });

    it('should return false for idle status', () => {
      expect(needsAttention('idle' as RobotStatus)).toBe(false);
    });

    it('should return false for active status', () => {
      expect(needsAttention('active' as RobotStatus)).toBe(false);
    });

    it('should return false for on_mission status', () => {
      expect(needsAttention('on_mission' as RobotStatus)).toBe(false);
    });
  });

  describe('isWorking', () => {
    it('should return true for active status', () => {
      expect(isWorking('active' as RobotStatus)).toBe(true);
    });

    it('should return true for on_mission status', () => {
      expect(isWorking('on_mission' as RobotStatus)).toBe(true);
    });

    it('should return false for idle status', () => {
      expect(isWorking('idle' as RobotStatus)).toBe(false);
    });

    it('should return false for other statuses', () => {
      expect(isWorking('blocked' as RobotStatus)).toBe(false);
      expect(isWorking('error' as RobotStatus)).toBe(false);
      expect(isWorking('maintenance' as RobotStatus)).toBe(false);
    });
  });

  describe('calculateFleetActivity', () => {
    it('should calculate percentage of working robots', () => {
      const robots: Record<string, RobotState> = {
        r1: {
          robot_id: 'r1',
          robot_type: 'picker',
          position: { x: 0, y: 0 },
          status: 'active',
          battery: 100,
          last_updated: 0,
        },
        r2: {
          robot_id: 'r2',
          robot_type: 'hauler',
          position: { x: 0, y: 0 },
          status: 'idle',
          battery: 100,
          last_updated: 0,
        },
        r3: {
          robot_id: 'r3',
          robot_type: 'picker',
          position: { x: 0, y: 0 },
          status: 'on_mission',
          battery: 100,
          last_updated: 0,
        },
      };

      const activity = calculateFleetActivity(robots);
      expect(activity).toBe((2 / 3) * 100);
    });

    it('should return 0 for empty fleet', () => {
      const activity = calculateFleetActivity({});
      expect(activity).toBe(0);
    });

    it('should return 100 when all robots are working', () => {
      const robots: Record<string, RobotState> = {
        r1: {
          robot_id: 'r1',
          robot_type: 'picker',
          position: { x: 0, y: 0 },
          status: 'active',
          battery: 100,
          last_updated: 0,
        },
        r2: {
          robot_id: 'r2',
          robot_type: 'hauler',
          position: { x: 0, y: 0 },
          status: 'on_mission',
          battery: 100,
          last_updated: 0,
        },
      };

      const activity = calculateFleetActivity(robots);
      expect(activity).toBe(100);
    });
  });

  describe('calculateFleetActivityOverTime', () => {
    it('should calculate activity at different time points', () => {
      const events: Record<string, RobotEvent[]> = {
        r1: [
          { t: 0, robot_id: 'r1', x: 0, y: 0, status: 'idle', battery: 100 },
          { t: 10, robot_id: 'r1', x: 10, y: 10, status: 'active', battery: 95 },
        ],
        r2: [
          { t: 0, robot_id: 'r2', x: 0, y: 0, status: 'idle', battery: 100 },
          { t: 20, robot_id: 'r2', x: 20, y: 20, status: 'on_mission', battery: 90 },
        ],
      };

      const data = calculateFleetActivityOverTime(events, 2, 30, 10);

      expect(data).toHaveLength(4);
      expect(data[0].time).toBe(0);
      expect(data[0].activity).toBe(0);
      expect(data[1].time).toBe(10);
      expect(data[1].activity).toBe(50);
      expect(data[2].time).toBe(20);
      expect(data[2].activity).toBe(100);
      expect(data[3].time).toBe(30);
      expect(data[3].activity).toBe(100);
    });

    it('should handle empty events', () => {
      const data = calculateFleetActivityOverTime({}, 0, 30, 10);
      expect(data).toHaveLength(4);
      expect(data.every((d) => d.activity === 0)).toBe(true);
    });
  });
});
