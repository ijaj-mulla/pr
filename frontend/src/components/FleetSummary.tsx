import type { RobotState } from '../types';

interface FleetSummaryProps {
  robots: Record<string, RobotState>;
}

export function FleetSummary({ robots }: FleetSummaryProps) {
  const robotList = Object.values(robots);
  const total = robotList.length;
  
  const working = robotList.filter(
    (r) => r.status === 'active' || r.status === 'on_mission'
  ).length;
  
  const attention = robotList.filter(
    (r) => ['blocked', 'error', 'offline', 'maintenance'].includes(r.status)
  ).length;
  
  const avgBattery = total > 0
    ? robotList.reduce((sum, r) => sum + r.battery, 0) / total
    : 0;

  return (
    <div className="fleet-summary">
      <h2>Fleet Summary</h2>
      <div className="summary-stats">
        <div className="stat">
          <span className="stat-label">Total Robots</span>
          <span className="stat-value">{total}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Working</span>
          <span className="stat-value working">{working}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Needs Attention</span>
          <span className="stat-value attention">{attention}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Avg Battery</span>
          <span className="stat-value">{avgBattery.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
