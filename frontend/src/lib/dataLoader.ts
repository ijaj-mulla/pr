import type { Robot, RobotEvent } from '../types';

export async function loadRobots(): Promise<Robot[]> {
  const response = await fetch('/robots.json');
  if (!response.ok) {
    throw new Error(`Failed to load robots.json: ${response.statusText}`);
  }
  const data: Robot[] = await response.json();
  return data;
}

export async function loadEvents(): Promise<RobotEvent[]> {
  const response = await fetch('/events.jsonl');
  if (!response.ok) {
    throw new Error(`Failed to load events.jsonl: ${response.statusText}`);
  }
  const text = await response.text();
  const lines = text.trim().split('\n');
  const events: RobotEvent[] = [];
  
  for (const line of lines) {
    if (line.trim()) {
      try {
        const event = JSON.parse(line) as RobotEvent;
        events.push(event);
      } catch (error) {
        console.error('Failed to parse event line:', line, error);
      }
    }
  }
  
  return events;
}

export function groupEventsByRobot(events: RobotEvent[]): Record<string, RobotEvent[]> {
  const grouped: Record<string, RobotEvent[]> = {};
  
  for (const event of events) {
    if (!grouped[event.robot_id]) {
      grouped[event.robot_id] = [];
    }
    grouped[event.robot_id].push(event);
  }
  
  return grouped;
}

export function sortEventsByTimestamp(events: RobotEvent[]): RobotEvent[] {
  return [...events].sort((a, b) => a.t - b.t);
}

export function sortRobotEvents(groupedEvents: Record<string, RobotEvent[]>): Record<string, RobotEvent[]> {
  const sorted: Record<string, RobotEvent[]> = {};
  
  for (const [robotId, events] of Object.entries(groupedEvents)) {
    sorted[robotId] = sortEventsByTimestamp(events);
  }
  
  return sorted;
}
