import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BarChart, Bar, Cell, XAxis } from 'recharts';

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
    <div className="min-w-full">
      <BarChart
        width={150}
        height={100}
        data={chartData}
        margin={{ top: 15, right: 0, left: 0, bottom: 0 }}
      >
        <XAxis dataKey="name" tick={{ fontSize: fontSize }} />

        <Bar
          dataKey="value"
          shape={<TriangleBar />}
          label={{ position: "top", fontSize: fontSize }}
        >
          {chartData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={warmColors[index % warmColors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </div>
  );
}