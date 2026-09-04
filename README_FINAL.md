# Peppermint Robotics Fleet Management Dashboard

A real-time fleet management dashboard for monitoring robot status, position, battery, and fleet activity in a warehouse environment.

## Assignment Chosen

**Frontend**

## Live Demo

**https://pr-seven-chi.vercel.app/**

The application is deployed on Vercel and can be opened directly without local setup.

## Tech Stack

- React
- TypeScript
- Vite
- Zustand (state management)
- Recharts (data visualization)
- Vitest (testing)

## Project Structure

```text
frontend/
├── src/
│   ├── components/       # React components (RobotMap, ReplayControls, FleetSummary, etc.)
│   ├── lib/              # Utility functions (dataLoader, fleetUtils, liveSimulator)
│   ├── store/            # Zustand stores (fleetStore, replayStore)
│   ├── types/            # TypeScript type definitions
│   ├── __tests__/        # Test files
│   ├── App.tsx           # Main application component
│   └── style.css         # Global styles
├── public/               # Static assets (layout.png, robots.json, events.jsonl)
└── package.json
```

## Installation

```bash
cd frontend
npm install
```

## Running Locally

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

## Running Tests

```bash
npm test
```

**Test result: 43/43 tests passing**

The test suite covers:

- data loading
- fleet state updates
- fleet classification and activity calculations
- replay behavior
- live simulator behavior
- map boundary behavior

## Production Build

```bash
npm run build
```

**Production build result: successful**

## How to Evaluate the Dashboard

1. Open the deployed application.
2. Use **Replay** mode to inspect the recorded fleet events.
3. Use Play/Pause, speed controls, and the timeline to move through the 15-minute window.
4. Search for a specific robot or filter robots requiring attention.
5. Inspect the selected robot's position, status, and battery information.
6. Observe the fleet activity trend over time.
7. Switch to **Live** mode to see newly generated events and continuous robot movement.

## Replay Mode

Replay mode uses the actual `events.jsonl` file to simulate historical robot events. The replay covers the window from `t=0` to `t=900` seconds (15 minutes).

It features:

- a shared simulation clock
- play/pause controls
- speed controls (0.5x, 1x, 2x, 5x, 10x)
- timeline seek functionality
- reset to beginning
- at simulation time `T`, each robot displays its latest event where `event.t <= T`

The replay logic is implemented in `src/App.tsx` using `requestAnimationFrame` for smooth playback, and fleet state is updated through `updateFleetAtTime` in `src/store/fleetStore.ts`.

## Live Mode

Live mode is a browser-only simulator that generates **new events continuously** rather than replaying `events.jsonl`.

This approach:

- eliminates the need for backend infrastructure
- simplifies deployment for the frontend assignment
- keeps replay and live mode on the same centralized fleet-state update path
- is intentionally limited to the current browser session and is not a multi-client/server-connected production feed

### Live Simulator Details

- Update rate: 1 second (1000ms)
- Picker movement: approximately 5 units/sec
- Hauler movement: approximately 8 units/sec
- Battery changes gradually based on robot state
- Uses sensible status transitions across the supported statuses
- Does not randomly teleport robots
- Cleans up timers when switching between Replay and Live modes

### Map Boundary Handling

The challenge layout is **900×560** pixels, with the same coordinate system as the supplied robot data.

The live simulator uses `MAP_WIDTH = 900` and `MAP_HEIGHT = 560`. When a robot reaches a map edge, its movement direction is reflected so movement remains continuous instead of being clamped and stuck at the boundary. A final safety clamp guarantees that coordinates remain within the valid map range.

Robot markers also account for their visual radius so the marker remains visible at map edges. Labels are repositioned near edges to reduce clipping while preserving the underlying robot coordinates.

The live simulator is implemented in `src/lib/liveSimulator.ts` and feeds events through the same `updateRobotState` function in `src/store/fleetStore.ts`.

## Working / Attention Classification

The dashboard classifies robots into three practical categories:

**Working**

- `active`
- `on_mission`

These represent robots actively performing work.

**Attention Needed**

- `blocked`
- `error`
- `offline`
- `maintenance`

These statuses require operator attention.

**Normal / Not Automatically Attention**

- `idle`
- `charging`

These are treated as normal states and do not automatically trigger attention alerts.

This classification is implemented in `src/lib/fleetUtils.ts` through `isWorking` and `needsAttention`, and is used by `src/components/FleetSummary.tsx`.

## Fleet Activity Trend

The dashboard displays a fleet-level trend showing the percentage of robots that are working over time.

The activity calculation is:

```text
(active + on_mission) / total robots
```

The trend is based on the recorded event data across the replay window (`t=0` to `t=900`) and is computed by `calculateFleetActivityOverTime` in `src/lib/fleetUtils.ts`.

The chart is rendered by `src/components/FleetActivityChart.tsx` using Recharts.

## Supported Robots and Statuses

All 8 robots from the challenge data are supported.

All 8 supplied statuses are supported:

- `idle`
- `active`
- `on_mission`
- `charging`
- `blocked`
- `error`
- `maintenance`
- `offline`

## AI Assistance Notes

AI tooling was used during implementation as development assistance for:

- React component and utility-function scaffolding
- test case creation and debugging
- TypeScript type definitions and state-management setup
- live simulator logic
- map boundary and marker visibility fixes

All AI-assisted code was reviewed, adapted, tested, and understood before inclusion in the submission.

## Deliberate Scope / Next Steps

To keep the implementation focused on the frontend assignment and its timebox, I did not add backend/server-side telemetry ingestion, persistent history, authentication/role-based access control, or large-fleet rendering optimizations.

For a production version, the next priority would be a backend telemetry service with persistent robot history and real-time multi-client updates. This would allow multiple operators to share the same fleet state, support historical analytics, and provide stronger handling for robot connectivity, stale data, and recovery workflows.

## Final Verification

Before submission, the project was verified with:

- **43/43 tests passing**
- **successful TypeScript/Vite production build**
- deployed frontend available at **https://pr-seven-chi.vercel.app/**
