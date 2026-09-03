import type { RobotState } from '../types';

interface RobotDetailsProps {
  robot: RobotState | null;
}

export function RobotDetails({ robot }: RobotDetailsProps) {
  if (!robot) {
    return (
      <div className="robot-details">
        <h2>Robot Details</h2>
        <p>Select a robot to view details</p>
      </div>
    );
  }

  return (
    <div className="robot-details">
      <h2>Robot Details</h2>
      <div className="detail-row">
        <span className="detail-label">ID:</span>
        <span className="detail-value">{robot.robot_id}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Type:</span>
        <span className="detail-value">{robot.robot_type}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Status:</span>
        <span className="detail-value">{robot.status}</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Battery:</span>
        <span className="detail-value">{robot.battery.toFixed(1)}%</span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Position:</span>
        <span className="detail-value">
          ({robot.position.x.toFixed(1)}, {robot.position.y.toFixed(1)})
        </span>
      </div>
      <div className="detail-row">
        <span className="detail-label">Last Updated:</span>
        <span className="detail-value">t={robot.last_updated}s</span>
      </div>
      {robot.task_event && (
        <div className="detail-row">
          <span className="detail-label">Task Event:</span>
          <span className="detail-value">{robot.task_event}</span>
        </div>
      )}
    </div>
  );
}
