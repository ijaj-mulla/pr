import type { RobotStatus, RobotEvent, RobotState } from '../types';

export function needsAttention(status: RobotStatus): boolean {
  return ['blocked', 'error', 'offline', 'maintenance'].includes(status);
}

export function isWorking(status: RobotStatus): boolean {
  return status === 'active' || status === 'on_mission';
}

export function calculateFleetActivity(robots: Record<string, RobotState>): number {
  const robotList = Object.values(robots);
  if (robotList.length === 0) return 0;
  
  const working = robotList.filter((r) => isWorking(r.status)).length;
  return (working / robotList.length) * 100;
}

export function calculateFleetActivityOverTime(
  events: Record<string, RobotEvent[]>,
  totalRobots: number,
  maxTime: number,
  interval: number = 10
): Array<{ time: number; activity: number }> {
  const data: Array<{ time: number; activity: number }> = [];
  
  for (let time = 0; time <= maxTime; time += interval) {
    let workingCount = 0;
    
    for (const robotEvents of Object.values(events)) {
      const eventAtTime = robotEvents
        .filter((e) => e.t <= time)
        .pop();
      
      if (eventAtTime && isWorking(eventAtTime.status)) {
        workingCount++;
      }
    }
    
    data.push({
      time,
      activity: totalRobots > 0 ? (workingCount / totalRobots) * 100 : 0,
    });
  }
  
  return data;
}
