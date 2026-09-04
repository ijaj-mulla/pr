import { useEffect, useState, useRef, useCallback } from 'react';
import { useFleetStore } from './store/fleetStore';
import { useReplayStore } from './store/replayStore';
import { loadRobots, loadEvents } from './lib/dataLoader';
import { calculateFleetActivityOverTime } from './lib/fleetUtils';
import { LiveSimulator } from './lib/liveSimulator';
import { RobotMap } from './components/RobotMap';
import { ReplayControls } from './components/ReplayControls';
import { FleetSummary } from './components/FleetSummary';
import { RobotSearch } from './components/RobotSearch';
import { RobotDetails } from './components/RobotDetails';
import { FleetActivityChart } from './components/FleetActivityChart';
import type { Robot, RobotEvent } from './types';
import './style.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<Array<{ time: number; activity: number }>>([]);
  
  const robots = useFleetStore((state) => state.robots);
  const initializeFleet = useFleetStore((state) => state.initializeFleet);
  const updateRobotState = useFleetStore((state) => state.updateRobotState);
  
  const {
    mode,
    isPlaying,
    currentTime,
    speed,
    maxTime,
    selectedRobotId,
    searchQuery,
    filterAttention,
    setMode,
    setIsPlaying,
    setCurrentTime,
    setSpeed,
    setSelectedRobotId,
    setSearchQuery,
    setFilterAttention,
    resetReplay,
    togglePlay,
  } = useReplayStore();

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const liveSimulatorRef = useRef<LiveSimulator | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [robotsData, eventsData]: [Robot[], RobotEvent[]] = await Promise.all([
          loadRobots(),
          loadEvents(),
        ]);
        initializeFleet(robotsData, eventsData);
        
        const activityData = calculateFleetActivityOverTime(
          eventsData.reduce((acc, e) => {
            if (!acc[e.robot_id]) acc[e.robot_id] = [];
            acc[e.robot_id].push(e);
            return acc;
          }, {} as Record<string, RobotEvent[]>),
          robotsData.length,
          maxTime
        );
        setActivityData(activityData);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    }

    loadData();
  }, [initializeFleet, maxTime]);

  const animationLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (isPlaying && mode === 'replay') {
      const timeIncrement = (deltaTime / 1000) * speed;
      const newTime = Math.min(currentTime + timeIncrement, maxTime);
      setCurrentTime(newTime);
      
      const { updateFleetAtTime } = useFleetStore.getState();
      updateFleetAtTime(newTime);

      if (newTime >= maxTime) {
        setIsPlaying(false);
      }
    }

    animationRef.current = requestAnimationFrame(animationLoop);
  }, [isPlaying, currentTime, speed, maxTime, mode, setCurrentTime, setIsPlaying]);

  useEffect(() => {
    if (mode === 'replay' && isPlaying) {
      animationRef.current = requestAnimationFrame(animationLoop);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode, isPlaying, animationLoop]);

  useEffect(() => {
    if (mode === 'live') {
      if (liveSimulatorRef.current === null) {
        liveSimulatorRef.current = new LiveSimulator(robots, (events) => {
          for (const event of events) {
            updateRobotState(event.robot_id, {
              position: { x: event.x, y: event.y },
              status: event.status,
              battery: event.battery,
              last_updated: event.t,
              task_event: event.task_event,
            });
          }
        });
      }

      if (isPlaying) {
        liveSimulatorRef.current.start();
      } else {
        liveSimulatorRef.current.stop();
      }
    } else {
      if (liveSimulatorRef.current) {
        liveSimulatorRef.current.stop();
        liveSimulatorRef.current = null;
      }
    }

    return () => {
      if (liveSimulatorRef.current) {
        liveSimulatorRef.current.stop();
        liveSimulatorRef.current = null;
      }
    };
  }, [mode, isPlaying, robots, updateRobotState]);

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    const { updateFleetAtTime } = useFleetStore.getState();
    updateFleetAtTime(time);
  };

  const handleReset = () => {
    resetReplay();
    lastTimeRef.current = 0;
    const { updateFleetAtTime } = useFleetStore.getState();
    updateFleetAtTime(0);
  };

  const handleModeChange = (newMode: 'replay' | 'live') => {
    setMode(newMode);
    if (newMode === 'replay') {
      const { updateFleetAtTime } = useFleetStore.getState();
      updateFleetAtTime(currentTime);
    }
  };

  const handleRobotClick = (robotId: string) => {
    setSelectedRobotId(robotId);
  };

  const filteredRobots = Object.entries(robots).filter(([id, robot]) => {
    const matchesSearch = searchQuery === '' || id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !filterAttention || needsAttention(robot.status);
    return matchesSearch && matchesFilter;
  });

  const visibleRobots: Record<string, typeof robots[string]> = filteredRobots.reduce((acc, [id, robot]) => {
    acc[id] = robot;
    return acc;
  }, {} as Record<string, typeof robots[string]>);

  if (loading) {
    return <div className="app">Loading fleet data...</div>;
  }

  if (error) {
    return <div className="app">Error: {error}</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>Fleet Dashboard</h1>
      </header>
      <main>
        <ReplayControls
          mode={mode}
          isPlaying={isPlaying}
          currentTime={currentTime}
          speed={speed}
          maxTime={maxTime}
          onModeChange={handleModeChange}
          onPlayPause={togglePlay}
          onSpeedChange={setSpeed}
          onSeek={handleSeek}
          onReset={handleReset}
        />
        
        <div className="dashboard-grid">
          <div className="left-panel">
            <FleetSummary robots={visibleRobots} />
            <RobotSearch
              searchQuery={searchQuery}
              filterAttention={filterAttention}
              onSearchChange={setSearchQuery}
              onFilterChange={setFilterAttention}
            />
            <RobotDetails robot={selectedRobotId ? robots[selectedRobotId] : null} />
          </div>
          
          <div className="center-panel">
            <RobotMap
              robots={visibleRobots}
              selectedRobotId={selectedRobotId}
              onRobotClick={handleRobotClick}
              layoutImage="/layout.png"
            />
          </div>
          
          <div className="right-panel">
            <FleetActivityChart data={activityData} />
          </div>
        </div>
      </main>
    </div>
  );
}

function needsAttention(status: string): boolean {
  return ['blocked', 'error', 'offline', 'maintenance'].includes(status);
}

export default App;
