import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, Cell, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '6px 10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>
          {payload[0].payload.name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function Example() {

  const getDashboardData = useSelector((state) => state.dashboard.getDashboard);

  const chartData = getDashboardData?.revenueSources
    ? Object.entries(getDashboardData.revenueSources).map(([key, value]) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value
    }))
    : [];


  const getFontSize = () => {
    if (window.innerWidth < 400) return 15;
    if (window.innerWidth < 640) return 12;
    if (window.innerWidth < 1024) return 13;
    return 14;
  };

  const [fontSize, setFontSize] = useState(getFontSize());

  useEffect(() => {
    const handleResize = () => setFontSize(getFontSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  if (!chartData.length) {
    return (<div style={{ padding: 20, textAlign: "center" }}>No data available</div>);
  }

  return (
    <div style={{ width: '100%', maxWidth: '220px', height: '120px' }}>
        <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
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