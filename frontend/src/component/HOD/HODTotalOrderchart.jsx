import { useSelector } from 'react-redux';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function Example() {

  const getDashboardData = useSelector(
    (state) => state.HODDashboard.getHodDashboard
  );

  const chartData = getDashboardData?.orderSources
    ? Object.entries(getDashboardData.orderSources).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      profit: value,
    }))
    : [];

  if (!chartData.length) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No data available</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '200px', height: '100px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F7DF9C" />
              <stop offset="20%" stopColor="#E3C78A" />
              <stop offset="40%" stopColor="#B79982" />
              <stop offset="60%" stopColor="#A3876A" />
              <stop offset="80%" stopColor="#876B56" />
              <stop offset="100%" stopColor="#755647" />
            </linearGradient>
          </defs>

          <Tooltip />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="url(#warmGradient)"
            strokeWidth={8}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}