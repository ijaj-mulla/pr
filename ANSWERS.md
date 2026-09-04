# Frontend Challenge Answers

## Question 1

**What holds fleet state as data arrives, and why is that a good fit given the replay/live requirement?**

The fleet state is held in a centralized Zustand store in `src/store/fleetStore.ts`. The store maintains a `robots` object keyed by robot ID for current robot state (position, status, battery, last updated information, and task event data) and an `events` object for historical event arrays. This is a good fit because replay and live simulation converge on the same state-update path instead of requiring separate UI state logic. In replay mode, `updateFleetAtTime` processes historical events from `events.jsonl` according to the simulation time. In live mode, `LiveSimulator` in `src/lib/liveSimulator.ts` generates new `RobotEvent` objects and feeds them through `updateRobotState`. As a result, the map, summary, search, details, and trend views can consume the same centralized fleet state regardless of the data source.

## Question 2

**Describe one real tradeoff you made. What did it cost?**

I chose a browser-only live simulator instead of adding a backend-connected live service. This simplified deployment and kept the implementation focused on the frontend assignment, while still satisfying the requirement to generate new live events rather than simply replaying the recorded file. The cost is that the live state exists only in the current browser session: it is not a true multi-client feed, it is not persisted across sessions, and multiple operators cannot share the same live fleet state. The decision is isolated mainly in `src/lib/liveSimulator.ts`, while the shared Zustand state/update path in `src/store/fleetStore.ts` keeps the UI independent of whether events come from replay or the local simulator.

## Question 3

**What did you deliberately leave out, and what would you build next?**

I deliberately left out backend/server-side telemetry ingestion, persistent robot history, authentication/role-based access control, and large-fleet rendering optimizations. These were outside the core frontend scope and would have increased implementation complexity without improving the required frontend workflow proportionally. If extending this toward production, I would first add a backend telemetry service with WebSocket or MQTT ingestion and persistent event storage. That would enable true multi-client synchronization, durable history and replay, long-term fleet analytics, and stronger handling of connectivity and stale robot data. The current frontend could continue to consume the resulting state through the existing centralized store/update architecture.
