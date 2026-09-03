import type { RobotState } from '../types';

interface RobotMapProps {
  robots: Record<string, RobotState>;
  selectedRobotId: string | null;
  onRobotClick: (robotId: string) => void;
  layoutImage: string;
}

const MAP_WIDTH = 900;
const MAP_HEIGHT = 560;
const DOT_RADIUS = 6; // 12px diameter

export function RobotMap({ robots, selectedRobotId, onRobotClick, layoutImage }: RobotMapProps) {
  const robotList = Object.values(robots);
  
  // Calculate label positions to avoid edge clipping and overlapping
  const getLabelPosition = (robot: RobotState, index: number) => {
    const x = robot.position.x;
    const y = robot.position.y;
    const labelWidth = 60;
    const labelHeight = 30;
    const labelOffset = 20; // Distance from dot to label
    
    // Add small offset based on index to reduce overlap when robots are close
    const offsetX = (index % 3) * 8 - 8;
    const offsetY = Math.floor(index / 3) * 8 - 8;
    
    // Determine best label position based on robot location
    let adjustedX = x + offsetX;
    let adjustedY = y + offsetY - labelOffset; // Default: above
    
    // If near top edge, position below instead
    if (y < labelOffset + labelHeight) {
      adjustedY = y + labelOffset + DOT_RADIUS;
    }
    
    // If near bottom edge, position above
    if (y > MAP_HEIGHT - labelOffset - labelHeight) {
      adjustedY = y - labelOffset - DOT_RADIUS;
    }
    
    // If near left edge, shift right
    if (x < labelWidth / 2 + DOT_RADIUS) {
      adjustedX = x + labelWidth / 2 + DOT_RADIUS;
    }
    
    // If near right edge, shift left
    if (x > MAP_WIDTH - labelWidth / 2 - DOT_RADIUS) {
      adjustedX = x - labelWidth / 2 - DOT_RADIUS;
    }
    
    // Final boundary checks to prevent clipping
    if (adjustedX + labelWidth / 2 > MAP_WIDTH) {
      adjustedX = MAP_WIDTH - labelWidth / 2;
    }
    if (adjustedX - labelWidth / 2 < 0) {
      adjustedX = labelWidth / 2;
    }
    if (adjustedY + labelHeight > MAP_HEIGHT) {
      adjustedY = MAP_HEIGHT - labelHeight;
    }
    if (adjustedY < 0) {
      adjustedY = 0;
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  // Get visual dot position (constrained by radius to prevent clipping)
  const getDotPosition = (x: number, y: number) => {
    // Keep actual state coordinates, but constrain visual position by dot radius
    const visualX = Math.max(DOT_RADIUS, Math.min(MAP_WIDTH - DOT_RADIUS, x));
    const visualY = Math.max(DOT_RADIUS, Math.min(MAP_HEIGHT - DOT_RADIUS, y));
    return { x: visualX, y: visualY };
  };

  return (
    <div className="robot-map-container">
      <div className="robot-map">
        <img src={layoutImage} alt="Warehouse Layout" className="layout-image" />
        {robotList.map((robot, index) => {
          const labelPos = getLabelPosition(robot, index);
          const dotPos = getDotPosition(robot.position.x, robot.position.y);
          return (
            <div key={robot.robot_id}>
              {/* Robot dot - visual position constrained by radius */}
              <div
                className={`robot-dot ${robot.robot_id === selectedRobotId ? 'selected' : ''}`}
                style={{
                  left: `${dotPos.x}px`,
                  top: `${dotPos.y}px`,
                }}
                onClick={() => onRobotClick(robot.robot_id)}
                title={`${robot.robot_id}: ${robot.status} (${Math.round(robot.position.x)}, ${Math.round(robot.position.y)})`}
              />
              {/* Label */}
              <div
                className={`robot-label ${robot.robot_id === selectedRobotId ? 'selected' : ''}`}
                style={{
                  left: `${labelPos.x}px`,
                  top: `${labelPos.y}px`,
                }}
                onClick={() => onRobotClick(robot.robot_id)}
              >
                <div className="robot-id">{robot.robot_id}</div>
                <div className="robot-status">{robot.status}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
