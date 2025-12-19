import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, } from "recharts";
import { useSelector } from "react-redux";

const StackedBarChart = () => {
  const getMonthlyRevenue = useSelector((state) => state.HODDashboard.getMonthlyRevenue);

  const [chartData, setChartData] = useState([]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  useEffect(() => {
    if (!getMonthlyRevenue) return;

    const list = getMonthlyRevenue?.monthlyRevenue?.map((item) => ({
      month: monthNames[item.month - 1],
      revenue: item.revenue,
    }));

    setChartData(list);
  }, [getMonthlyRevenue]);

  // compute a reasonable chart width so on small screens the chart can scroll horizontally
  const chartWidth = Math.max((chartData?.length || 6) * 68, 520);

  // custom label renderer to ensure labels render above the bar and do not fall below other bars
  const renderCustomizedLabel = (props) => {
    const { x, y, width, value } = props;
    const cx = x + width / 2;
    // place label at least 14px above the bar; if the bar is very small y will be near bottom so subtract
    const offset = 14;
    const labelY = y - offset;
    return (
      <text x={cx} y={labelY} fill="#876B56" fontWeight={700} textAnchor="middle">
        {`$${value}`}
      </text>
    );
  };
  return (
    <div style={{ width: "100%" }}>
      {/* horizontal scroll wrapper so small screens can scroll to see all months */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: chartWidth, height: 300 }}>
          <BarChart
            width={chartWidth}
            height={300}
            data={chartData}
            margin={{ top: 32, right: 24, left: 8, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" interval={0} />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#876B56">
              <LabelList dataKey="revenue" content={renderCustomizedLabel} />
            </Bar>
          </BarChart>
        </div>
      </div>
    </div>
  );
};


export default StackedBarChart;
