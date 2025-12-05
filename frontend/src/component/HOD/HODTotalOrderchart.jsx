import { useSelector } from 'react-redux';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        <p style={{ margin: 0 }}>
          {payload[0].payload.name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Example() {

  const getDashboardData = useSelector(
    (state) => state.HODDashboard.getHodDashboard
  );

  const chartData = getDashboardData?.orderSources
    ? Object.entries(getDashboardData.orderSources).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value,
    }))
    : [];

  if (!chartData.length) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>No data available</div>;
  }

  return (
    <div style={{ width: '100%', maxWidth: '220px', height: '120px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="warmGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F7DF9C" />
              <stop offset="20%" stopColor="#E3C78A" />
              <stop offset="40%" stopColor="#B79982" />
              <stop offset="60%" stopColor="#A3876A" />
              <stop offset="80%" stopColor="#876B56" />
              <stop offset="100%" stopColor="#755647" />
            </linearGradient>
          </defs>

          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#warmGradient)"
            fill="url(#warmGradient)"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}