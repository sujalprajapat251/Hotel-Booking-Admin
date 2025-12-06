import { useSelector } from 'react-redux';
import { AreaChart, Area, Tooltip, ResponsiveContainer, Bar, BarChart, Cell } from 'recharts';

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

const warmColors = ["#F7DF9C", "#E3C78A", "#B79982", "#A3876A", "#876B56", "#755647"];


const getPath = (x, y, width, height) => {
  return `M${x},${y + height}
    C${x + width / 3},${y + height}
     ${x + width / 2},${y + height / 3}
     ${x + width / 2},${y}
    C${x + width / 2},${y + height / 3}
     ${x + (2 * width) / 3},${y + height}
     ${x + width},${y + height}
    Z`;
};

const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;
  return <path d={getPath(Number(x), Number(y), Number(width), Number(height))} fill={fill} />;
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
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="value"
            shape={<TriangleBar />}
          >
            {chartData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={warmColors[index % warmColors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}