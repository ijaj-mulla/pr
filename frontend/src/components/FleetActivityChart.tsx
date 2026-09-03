import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FleetActivityChartProps {
  data: Array<{ time: number; activity: number }>;
}

export function FleetActivityChart({ data }: FleetActivityChartProps) {
  return (
    <div className="fleet-activity-chart">
      <h2>Fleet Activity Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            label={{ value: 'Activity %', angle: -90, position: 'insideLeft' }}
            domain={[0, 100]}
          />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="activity" 
            stroke="#8884d8" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
