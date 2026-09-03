import type { SimulationMode } from '../types';

interface ReplayControlsProps {
  mode: SimulationMode;
  isPlaying: boolean;
  currentTime: number;
  speed: number;
  maxTime: number;
  onModeChange: (mode: SimulationMode) => void;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (time: number) => void;
  onReset: () => void;
}

export function ReplayControls({
  mode,
  isPlaying,
  currentTime,
  speed,
  maxTime,
  onModeChange,
  onPlayPause,
  onSpeedChange,
  onSeek,
  onReset,
}: ReplayControlsProps) {
  const speeds = [0.5, 1, 2, 5, 10];

  return (
    <div className="replay-controls">
      <div className="replay-buttons">
        <button
          className={`mode-button ${mode === 'replay' ? 'active' : ''}`}
          onClick={() => onModeChange('replay')}
        >
          Replay
        </button>
        <button
          className={`mode-button ${mode === 'live' ? 'active' : ''}`}
          onClick={() => onModeChange('live')}
        >
          Live
        </button>
      </div>

      {mode === 'replay' && (
        <>
          <div className="replay-buttons">
            <button className="play-button" onClick={onPlayPause}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button className="reset-button" onClick={onReset}>
              Reset
            </button>
          </div>

          <div className="speed-controls">
            <label>Speed:</label>
            {speeds.map((s) => (
              <button
                key={s}
                className={`speed-button ${speed === s ? 'active' : ''}`}
                onClick={() => onSpeedChange(s)}
              >
                {s}x
              </button>
            ))}
          </div>

          <div className="timeline">
            <input
              type="range"
              min={0}
              max={maxTime}
              value={currentTime}
              onChange={(e) => onSeek(Number(e.target.value))}
              className="timeline-slider"
            />
            <div className="time-display">
              <span>0s</span>
              <span>{Math.floor(currentTime)}s</span>
              <span>{maxTime}s</span>
            </div>
          </div>
        </>
      )}

      {mode === 'live' && (
        <div className="live-status">
          <button className="play-button" onClick={onPlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <span>Live Mode - Generating new events</span>
        </div>
      )}
    </div>
  );
}
