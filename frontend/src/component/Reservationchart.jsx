import { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
import { useSelector } from "react-redux";

const formatDayLabel = (dayStr) => {
  const date = new Date(dayStr);
  if (!isNaN(date)) {
    return date.getDate() + " " + date.toLocaleString("en-US", { month: "short" });
  }
  return dayStr;
};


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-gray-600">{entry.name}:</span>
          <span className="text-sm font-semibold text-gray-800">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({ payload, hiddenBars, onClick }) => {
  if (!payload) return null;
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
      {payload.map((entry) => {
        const { dataKey, color, value } = entry;
        const isHidden = hiddenBars[dataKey];

        return (
          <div
            key={dataKey}
            onClick={() => onClick(dataKey)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              opacity: isHidden ? 0.3 : 1,
            }}
          >
            <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }} />
            <span style={{ fontSize: 13 }}>{value}</span>
          </div>
        );
      })}
    </div>
  );
};

// -------------------- MAIN CHART --------------------
const StackedBarChart = () => {

  const apiData = useSelector((state) => state.dashboard.getReservation);
  const [chartData, setChartData] = useState([]);

  const [hiddenBars, setHiddenBars] = useState({
    booked: false,
    cancelled: false,
  });

  const handleLegendClick = useCallback((key) => {
    setHiddenBars((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);


  useEffect(() => {
    if (!apiData) return;

    let list = apiData.map((item) => ({
      date: formatDayLabel(item.day),
      booked: item.booked,
      cancelled: item.cancelled,
    }));

    if (list.length > 7) {
      list = list.slice(list.length - 7);
    }

    setChartData(list);
  }, [apiData]);

  const bookedColor = "#876B56";
  const cancelledColor = "#F7DF9C";

  const dynamicBarSize = chartData.length <= 3 ? 40 : chartData.length <= 5 ? 28 : 20;  

  return (
    <div style={{ width: "100%" }}>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 24, left: 8, bottom: 16 }} barSize={dynamicBarSize}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
            <XAxis dataKey="date" tick={{ fill: "#777", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#777", fontSize: 12 }} axisLine={false} tickLine={false} />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              content={(props) => (
                <div style={{ marginBottom: 14 }}>

                  <CustomLegend payload={props.payload} hiddenBars={hiddenBars} onClick={handleLegendClick} />
                </div>
              )}
            />
        
            <Bar
              dataKey="booked"
              stackId="a"
              name="Booked"
              fill={bookedColor}
              opacity={hiddenBars.booked ? 0.12 : 1}
            >
              <LabelList dataKey="booked" position="center" fill="#fff" fontWeight="700" />
            </Bar>

            <Bar
              dataKey="cancelled"
              stackId="a"
              name="Cancelled"
              fill={cancelledColor}
              opacity={hiddenBars.cancelled ? 0.12 : 1}
            >
              <LabelList dataKey="cancelled" position="center" fill="#876B56" fontWeight="700" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StackedBarChart;
