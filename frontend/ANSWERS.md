# Frontend Challenge Answers

## Question 1
"What holds fleet state as data arrives, and why is that a good fit given the replay/live requirement?"

The fleet state is held in a centralized Zustand store (`src/store/fleetStore.ts`). The store maintains a `robots` object mapping robot IDs to their current state (position, status, battery, last_updated, task_event) and an `events` object mapping robot IDs to their historical event arrays. This centralized store is an excellent fit for the replay/live requirement because both the replay system and the live simulator can feed the same state update path. In replay mode, `updateFleetAtTime` processes historical events from events.jsonl to update robot states based on the simulation time. In live mode, the `LiveSimulator` class (`src/lib/liveSimulator.ts`) generates new RobotEvent objects and feeds them through the same `updateRobotState` function. This shared architecture ensures consistent state management regardless of the data source, simplifies mode switching, and avoids duplicate state logic.

## Question 2
"Describe one real tradeoff you made. What did it cost?"

I chose to implement a browser-only live simulator instead of a backend-connected live service. This tradeoff simplified deployment (no backend infrastructure, no WebSocket/MQTT setup) and kept the challenge scope manageable for a frontend-focused assignment. However, this approach has limitations: it is not a true multi-client server-connected production feed, it cannot persist state across browser sessions, and it cannot handle real-world scenarios where multiple operators need to see the same live fleet state. The implementation in `src/lib/liveSimulator.ts` generates plausible robot behavior locally, but this is fundamentally different from a production system that would ingest real telemetry from actual robots via a backend API.

## Question 3
"What did you deliberately leave out, and what would you build next?"

I deliberately left out backend/server-side live ingestion, persistent robot history, authentication/role-based access control, and larger-scale optimizations (e.g., virtualization for hundreds of robots). These were excluded to keep the implementation focused on the core frontend requirements within the challenge scope. If building this for production, the next priority would be implementing a proper backend service to ingest real robot telemetry via WebSocket or MQTT, with a database to store historical events for analytics and replay. This would enable true multi-client synchronization, persistent state across sessions, and the ability to analyze long-term fleet performance patterns beyond the 15-minute replay window.
