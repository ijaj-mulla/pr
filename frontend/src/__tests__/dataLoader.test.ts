import { describe, it, expect } from 'vitest';
import { groupEventsByRobot, sortEventsByTimestamp, sortRobotEvents } from '../lib/dataLoader';
import type { RobotEvent } from '../types';

describe('dataLoader', () => {
  describe('groupEventsByRobot', () => {
    it('should group events by robot_id', () => {
      const events: RobotEvent[] = [
        { t: 0, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
        { t: 5, robot_id: 'r2', x: 150, y: 250, status: 'active', battery: 95 },
        { t: 10, robot_id: 'r1', x: 110, y: 210, status: 'active', battery: 98 },
      ];

      const grouped = groupEventsByRobot(events);

      expect(grouped).toHaveProperty('r1');
      expect(grouped).toHaveProperty('r2');
      expect(grouped['r1']).toHaveLength(2);
      expect(grouped['r2']).toHaveLength(1);
    });

    it('should handle empty events array', () => {
      const grouped = groupEventsByRobot([]);
      expect(grouped).toEqual({});
    });
  });

  describe('sortEventsByTimestamp', () => {
    it('should sort events by timestamp ascending', () => {
      const events: RobotEvent[] = [
        { t: 10, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
        { t: 5, robot_id: 'r1', x: 150, y: 250, status: 'active', battery: 95 },
        { t: 15, robot_id: 'r1', x: 110, y: 210, status: 'active', battery: 98 },
      ];

      const sorted = sortEventsByTimestamp(events);

      expect(sorted[0].t).toBe(5);
      expect(sorted[1].t).toBe(10);
      expect(sorted[2].t).toBe(15);
    });

    it('should not mutate original array', () => {
      const events: RobotEvent[] = [
        { t: 10, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
        { t: 5, robot_id: 'r1', x: 150, y: 250, status: 'active', battery: 95 },
      ];

      const originalFirst = events[0];
      sortEventsByTimestamp(events);

      expect(events[0]).toBe(originalFirst);
    });
  });

  describe('sortRobotEvents', () => {
    it('should sort events for each robot', () => {
      const grouped: Record<string, RobotEvent[]> = {
        r1: [
          { t: 10, robot_id: 'r1', x: 100, y: 200, status: 'idle', battery: 100 },
          { t: 5, robot_id: 'r1', x: 150, y: 250, status: 'active', battery: 95 },
        ],
        r2: [
          { t: 15, robot_id: 'r2', x: 200, y: 300, status: 'active', battery: 90 },
          { t: 10, robot_id: 'r2', x: 180, y: 280, status: 'idle', battery: 92 },
        ],
      };

      const sorted = sortRobotEvents(grouped);

      expect(sorted['r1'][0].t).toBe(5);
      expect(sorted['r1'][1].t).toBe(10);
      expect(sorted['r2'][0].t).toBe(10);
      expect(sorted['r2'][1].t).toBe(15);
    });
  });
});
