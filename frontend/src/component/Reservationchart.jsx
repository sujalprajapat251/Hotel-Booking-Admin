import { useState, useEffect, useCallback } from 'react';
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
} from 'recharts';

const data = [
  { date: '1 Jan', cancled: 40, booked: 24 },
  { date: '2 Jan', cancled: 30, booked: 13 },
  { date: '3 Jan', cancled: 20, booked: 98 },
  { date: '4 Jan', cancled: 27, booked: 39 },
  { date: '5 Jan', cancled: 18, booked: 48 },
  { date: '6 Jan', cancled: 23, booked: 38 },
  { date: '7 Jan', cancled: 34, booked: 43 },
];


const CustomTooltip = ({ active, payload, label, hiddenBars }) => {
  if (!active || !payload || !payload.length) return null;


  const visiblePayload = payload.filter((p) => {
    const key = p && p.dataKey; 
    return key ? !hiddenBars[key] : true;
  });

  if (!visiblePayload.length) return null;

  const total = visiblePayload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
      <p className="font-semibold text-gray-800 mb-2">{label}</p>
      {visiblePayload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
          <span className="text-sm text-gray-600">{entry.name || entry.dataKey}:</span>
          <span className="text-sm font-semibold text-gray-800">{entry.value}</span>
        </div>
      ))}
      <div className="border-t border-gray-200 mt-2 pt-2">
        <div className="flex justify-between">
          <span className="text-sm font-semibold text-gray-600">Total:</span>
          <span className="text-sm font-bold text-gray-800">{total}</span>
        </div>
      </div>
    </div>
  );
};

const CustomLegend = ({ payload, hiddenBars, onClick }) => {
  if (!payload) return null;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'flex-end', padding: '10px 0' }}>
      {payload.map((entry) => {
        const { dataKey, color, value } = entry;
        const isHidden = !!hiddenBars[dataKey];
        return (
          <div
            key={dataKey}
            onClick={() => onClick(dataKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              opacity: isHidden ? 0.35 : 1,
              userSelect: 'none',
            }}
            title={value}
          >
            <div style={{ width: 12, height: 12, background: color, borderRadius: 2 }} />
            <div style={{ fontSize: 13, color: '#666' }}>{value}</div>
          </div>
        );
      })}
    </div>
  );
};

// -------------------- MAIN CHART --------------------
const StackedBarChart = () => {

  const [hiddenBars, setHiddenBars] = useState({
    booked: false,
    cancled: false,
  });

  const [barSize, setBarSize] = useState(40);
  const [fontSize, setFontSize] = useState(16);


  const handleLegendClick = useCallback((dataKey) => {
    setHiddenBars((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  }, []);

  const getBarSize = (width) => {
    if (width < 600) return 14;
    if (width <= 768) return 22;
    if (width <= 1024) return 28;
    return 40;
  };

  const getFontSize = (width) => {
    if (width < 600) return 10;
    if (width <= 768) return 12;
    if (width <= 1024) return 14;
    return 16;
  };

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setBarSize(getBarSize(w));
      setFontSize(getFontSize(w));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const bookedColor = '#876B56';
  const cancledColor = '#F7DF9C';

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 24, left: 8, bottom: 16 }}
            barSize={barSize}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6e6e6" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />

            <Tooltip content={<CustomTooltip hiddenBars={hiddenBars} />} />

            <Legend
              verticalAlign="top"
              align="right"
              content={(props) => (

                <CustomLegend payload={props.payload} hiddenBars={hiddenBars} onClick={handleLegendClick} />
              )}
            />

            <Bar
              dataKey="booked"
              stackId="a"
              fill={bookedColor}
              radius={[0, 0, 6, 6]}
              opacity={hiddenBars.booked ? 0.12 : 1} 
            >
              <LabelList
                dataKey="booked"
                position="center"
                fill="#fff"
                fontWeight="700"
                style={{ opacity: hiddenBars.booked ? 0 : 1, fontSize }}
              />
            </Bar>

            <Bar
              dataKey="cancled"
              stackId="a"
              fill={cancledColor}
              radius={[6, 6, 0, 0]}
              opacity={hiddenBars.cancled ? 0.12 : 1}
            >
              <LabelList
                dataKey="cancled"
                position="center"
                fill="#876B56"
                fontWeight="700"
                style={{ opacity: hiddenBars.cancled ? 0 : 1, fontSize }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StackedBarChart;
