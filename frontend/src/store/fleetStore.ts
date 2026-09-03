import { create } from 'zustand';
import type { Robot, RobotEvent, RobotState, FleetState } from '../types';
import { groupEventsByRobot, sortRobotEvents } from '../lib/dataLoader';

export const useFleetStore = create<FleetState>((set, get) => ({
  robots: {},
  events: {},
  initialRobots: {},

  getRobotState: (robotId: string) => {
    return get().robots[robotId];
  },

  updateRobotState: (robotId: string, stateUpdate: Partial<RobotState>) => {
    set((state) => ({
      robots: {
        ...state.robots,
        [robotId]: {
          ...state.robots[robotId],
          ...stateUpdate,
        },
      },
    }));
  },

  resetFleet: () => {
    set({ robots: {}, events: {}, initialRobots: {} });
  },

  initializeFleet: (robots: Robot[], events: RobotEvent[]) => {
    const groupedEvents = sortRobotEvents(groupEventsByRobot(events));
    const fleetState: Record<string, RobotState> = {};
    const initialRobotsMap: Record<string, Robot> = {};

    for (const robot of robots) {
      initialRobotsMap[robot.robot_id] = robot;
      const robotEvents = groupedEvents[robot.robot_id] || [];
      const latestEvent = robotEvents.length > 0 
        ? robotEvents[robotEvents.length - 1] 
        : null;

      fleetState[robot.robot_id] = {
        robot_id: robot.robot_id,
        robot_type: robot.robot_type,
        position: latestEvent 
          ? { x: latestEvent.x, y: latestEvent.y }
          : robot.start,
        status: latestEvent?.status || 'idle',
        battery: latestEvent?.battery ?? 100,
        last_updated: latestEvent?.t ?? 0,
        task_event: latestEvent?.task_event,
      };
    }

    set({ robots: fleetState, events: groupedEvents, initialRobots: initialRobotsMap });
  },

  updateFleetAtTime: (time: number) => {
    const { events, robots, initialRobots } = get();
    const updatedState: Record<string, RobotState> = { ...robots };

    for (const [robotId, robotEvents] of Object.entries(events)) {
      const currentState = robots[robotId];
      const initialRobot = initialRobots[robotId];
      if (!currentState || !initialRobot) continue;

      const latestEventAtTime = robotEvents
        .filter((e) => e.t <= time)
        .pop();

      if (latestEventAtTime) {
        updatedState[robotId] = {
          ...currentState,
          position: { x: latestEventAtTime.x, y: latestEventAtTime.y },
          status: latestEventAtTime.status,
          battery: latestEventAtTime.battery,
          last_updated: latestEventAtTime.t,
          task_event: latestEventAtTime.task_event,
        };
      } else {
        updatedState[robotId] = {
          ...currentState,
          position: initialRobot.start,
          status: 'idle',
          battery: 100,
          last_updated: 0,
          task_event: undefined,
        };
      }
    }

    set({ robots: updatedState });
  },
}));
