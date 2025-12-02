import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, } from "recharts";
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

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: 300 }}>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 24, left: 8, bottom: 16 }}>

            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" name="Revenue" fill="#876B56">
              <LabelList dataKey="revenue" position="top" fill="#876B56" fontWeight="700" />
            </Bar>

          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default StackedBarChart;
