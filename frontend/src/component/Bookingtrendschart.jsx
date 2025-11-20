// import { useState } from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { ChevronDown } from 'lucide-react';

// // Last 7 Days data
// const last7DaysData = [
//   { day: 'Fri', bookings: 58 },
//   { day: 'Sat', bookings: 64 },
//   { day: 'Sun', bookings: 69 },
//   { day: 'Mon', bookings: 71 },
//   { day: 'Tue', bookings: 66 },
//   { day: 'Wed', bookings: 63 },
//   { day: 'Thu', bookings: 73 },
// ];

// // Last 30 Days data (day numbers 22 to 20 of next month)
// const last30DaysData = [
//   { day: '22', bookings: 45 },
//   { day: '23', bookings: 52 },
//   { day: '24', bookings: 48 },
//   { day: '25', bookings: 61 },
//   { day: '26', bookings: 42 },
//   { day: '27', bookings: 58 },
//   { day: '28', bookings: 68 },
//   { day: '29', bookings: 59 },
//   { day: '30', bookings: 55 },
//   { day: '31', bookings: 63 },
//   { day: '1', bookings: 58 },
//   { day: '2', bookings: 65 },
//   { day: '3', bookings: 70 },
//   { day: '4', bookings: 71 },
//   { day: '5', bookings: 67 },
//   { day: '6', bookings: 64 },
//   { day: '7', bookings: 58 },
//   { day: '8', bookings: 66 },
//   { day: '9', bookings: 72 },
//   { day: '10', bookings: 68 },
//   { day: '11', bookings: 61 },
//   { day: '12', bookings: 57 },
//   { day: '13', bookings: 63 },
//   { day: '14', bookings: 70 },
//   { day: '15', bookings: 75 },
//   { day: '16', bookings: 68 },
//   { day: '17', bookings: 62 },
//   { day: '18', bookings: 59 },
//   { day: '19', bookings: 66 },
//   { day: '20', bookings: 71 },
// ];

// // This Year data (monthly)
// const thisYearData = [
//   { day: 'Jan', bookings: 550 },
//   { day: 'Feb', bookings: 675 },
//   { day: 'Mar', bookings: 590 },
//   { day: 'Apr', bookings: 710 },
//   { day: 'May', bookings: 640 },
//   { day: 'Jun', bookings: 600 },
//   { day: 'Jul', bookings: 720 },
//   { day: 'Aug', bookings: 690 },
//   { day: 'Sep', bookings: 650 },
//   { day: 'Oct', bookings: 700 },
//   { day: 'Nov', bookings: 670 },
//   { day: 'Dec', bookings: 728 },
// ];

// const BookingTrendsChart = () => {
//   const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const periods = ['Last 7 Days', 'Last 30 Days', 'This Year'];

//   const getChartData = () => {
//     switch (selectedPeriod) {
//       case 'Last 7 Days':
//         return last7DaysData;
//       case 'Last 30 Days':
//         return last30DaysData;
//       case 'This Year':
//         return thisYearData;
//       default:
//         return last7DaysData;
//     }
//   };

//   const getStats = () => {
//     const data = getChartData();
//     const total = data.reduce((sum, item) => sum + item.bookings, 0);
//     const average = Math.round(total / data.length);

//     return { total, average };
//   };

//   const getYAxisConfig = () => {
//     switch (selectedPeriod) {
//       case 'Last 7 Days':
//         return { domain: [50, 80], ticks: [50, 55, 60, 65, 70, 75, 80] };
//       case 'Last 30 Days':
//         return { domain: [40, 80], ticks: [40, 50, 60, 70, 80] };
//       case 'This Year':
//         return { domain: [500, 750], ticks: [500, 550, 600, 650, 700, 750] };
//       default:
//         return { domain: [50, 80], ticks: [50, 60, 70, 80] };
//     }
//   };

//   const stats = getStats();
//   const chartData = getChartData();
//   const yAxisConfig = getYAxisConfig();

//   return (
//     <div className=" w-full">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold text-gray-800">Booking Trends</h2>

//         <div className="relative">
//           <button
//             onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//             className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//           >
//             {selectedPeriod}
//             <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
//           </button>

//           {isDropdownOpen && (
//             <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//               {periods.map((period) => (
//                 <button
//                   key={period}
//                   onClick={() => {
//                     setSelectedPeriod(period);
//                     setIsDropdownOpen(false);
//                   }}
//                   className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
//                     selectedPeriod === period ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
//                   }`}
//                 >
//                   {period}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="flex gap-12 mb-8">
//         <div>
//           <div className="text-5xl font-bold text-indigo-600">{stats.total}</div>
//           <div className="text-sm text-gray-500 mt-1">Total Bookings</div>
//         </div>
//         <div>
//           <div className="text-5xl font-bold text-indigo-600">{stats.average}</div>
//           <div className="text-sm text-gray-500 mt-1">Daily Average</div>
//         </div>
//       </div>

//       <ResponsiveContainer width="100%" height={280}>
//         <LineChart
//           data={chartData}
//           margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//           <XAxis 
//             dataKey="day" 
//             axisLine={false}
//             tickLine={false}
//             tick={{ fill: '#9ca3af', fontSize: 11 }}
//             dy={10}
//             interval={selectedPeriod === 'Last 30 Days' ? 1 : 0}
//           />
//           <YAxis 
//             axisLine={false}
//             tickLine={false}
//             tick={{ fill: '#9ca3af', fontSize: 11 }}
//             domain={yAxisConfig.domain}
//             ticks={yAxisConfig.ticks}
//             label={{ 
//               value: 'Number of Bookings', 
//               angle: -90, 
//               position: 'center',
//               style: { fill: '#9ca3af', fontSize: 14 , margin: '10px'}
//             }}
//           />
//           <Tooltip 
//             contentStyle={{ 
//               backgroundColor: 'white', 
//               border: '1px solid #e5e7eb',
//               borderRadius: '8px',
//               padding: '8px 12px'
//             }}
//             formatter={(value) => [value, 'Bookings']}
//             labelFormatter={(label) => selectedPeriod === 'Last 30 Days' ? `Day ${label}` : label}
//           />
//           <Line 
//             type="monotone" 
//             dataKey="bookings" 
//             stroke="#6366f1" 
//             strokeWidth={2.5}
//             dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
//             activeDot={{ r: 6, fill: '#6366f1' }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default BookingTrendsChart;




import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronDown } from 'lucide-react';

// Last 7 Days data
const last7DaysData = [
    { day: 'Fri', bookings: 58 },
    { day: 'Sat', bookings: 64 },
    { day: 'Sun', bookings: 69 },
    { day: 'Mon', bookings: 71 },
    { day: 'Tue', bookings: 66 },
    { day: 'Wed', bookings: 63 },
    { day: 'Thu', bookings: 73 },
];

// Last 30 Days data (day numbers 22 to 20 of next month)
const last30DaysData = [
    { day: '22', bookings: 45 },
    { day: '23', bookings: 52 },
    { day: '24', bookings: 48 },
    { day: '25', bookings: 61 },
    { day: '26', bookings: 42 },
    { day: '27', bookings: 58 },
    { day: '28', bookings: 68 },
    { day: '29', bookings: 59 },
    { day: '30', bookings: 55 },
    { day: '31', bookings: 63 },
    { day: '1', bookings: 58 },
    { day: '2', bookings: 65 },
    { day: '3', bookings: 70 },
    { day: '4', bookings: 71 },
    { day: '5', bookings: 67 },
    { day: '6', bookings: 64 },
    { day: '7', bookings: 58 },
    { day: '8', bookings: 66 },
    { day: '9', bookings: 72 },
    { day: '10', bookings: 68 },
    { day: '11', bookings: 61 },
    { day: '12', bookings: 57 },
    { day: '13', bookings: 63 },
    { day: '14', bookings: 70 },
    { day: '15', bookings: 75 },
    { day: '16', bookings: 68 },
    { day: '17', bookings: 62 },
    { day: '18', bookings: 59 },
    { day: '19', bookings: 66 },
    { day: '20', bookings: 71 },
];

// This Year data (monthly)
const thisYearData = [
    { day: 'Jan', bookings: 550 },
    { day: 'Feb', bookings: 675 },
    { day: 'Mar', bookings: 590 },
    { day: 'Apr', bookings: 710 },
    { day: 'May', bookings: 640 },
    { day: 'Jun', bookings: 600 },
    { day: 'Jul', bookings: 720 },
    { day: 'Aug', bookings: 690 },
    { day: 'Sep', bookings: 650 },
    { day: 'Oct', bookings: 700 },
    { day: 'Nov', bookings: 670 },
    { day: 'Dec', bookings: 728 },
];

// Color palette
const colors = {
    primary: '#F7DF9C',
    secondary: '#E3C78A',
    tertiary: '#B79982',
    quaternary: '#A3876A',
    quinary: '#876B56',
    senary: '#755647',
};

const BookingTrendsChart = () => {
    const [selectedPeriod, setSelectedPeriod] = useState('Last 7 Days');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const periods = ['Last 7 Days', 'Last 30 Days', 'This Year'];

    const getChartData = () => {
        switch (selectedPeriod) {
            case 'Last 7 Days':
                return last7DaysData;
            case 'Last 30 Days':
                return last30DaysData;
            case 'This Year':
                return thisYearData;
            default:
                return last7DaysData;
        }
    };

    const getStats = () => {
        const data = getChartData();
        const total = data.reduce((sum, item) => sum + item.bookings, 0);
        const average = Math.round(total / data.length);

        return { total, average };
    };

    const getYAxisConfig = () => {
        switch (selectedPeriod) {
            case 'Last 7 Days':
                return { domain: [50, 80], ticks: [50, 55, 60, 65, 70, 75, 80] };
            case 'Last 30 Days':
                return { domain: [40, 80], ticks: [40, 50, 60, 70, 80] };
            case 'This Year':
                return { domain: [500, 750], ticks: [500, 550, 600, 650, 700, 750] };
            default:
                return { domain: [50, 80], ticks: [50, 60, 70, 80] };
        }
    };

    const stats = getStats();
    const chartData = getChartData();
    const yAxisConfig = getYAxisConfig();

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[16px] font-semibold" style={{ color: colors.senary }}>
                    Booking Trends
                </h2>

                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-white rounded-lg transition-colors border"
                        style={{
                            color: colors.quinary,
                            borderColor: colors.secondary
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                        {selectedPeriod}
                        <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10 border" style={{ borderColor: colors.secondary }}>
                            {periods.map((period) => (
                                <button
                                    key={period}
                                    onClick={() => {
                                        setSelectedPeriod(period);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
                                    style={{
                                        backgroundColor: selectedPeriod === period ? 'rgba(247, 223, 156, 0.2)' : 'transparent',
                                        color: selectedPeriod === period ? colors.senary : colors.quinary
                                    }}
                                    onMouseEnter={(e) => {
                                        if (selectedPeriod !== period) {
                                            e.currentTarget.style.backgroundColor = 'rgba(227, 199, 138, 0.1)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedPeriod !== period) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                    }}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-12 mb-3">
                <div>
                    <div className="text-[36px] font-bold" style={{ color: colors.tertiary }}>
                        {stats.total}
                    </div>
                    <div className="text-sm mt-1" style={{ color: colors.quaternary }}>
                        Total Bookings
                    </div>
                </div>
                <div>
                    <div className="text-[36px] font-bold" style={{ color: colors.quinary }}>
                        {stats.average}
                    </div>
                    <div className="text-sm mt-1" style={{ color: colors.quaternary }}>
                        Daily Average
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={240}>
                <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={colors.tertiary} />
                            <stop offset="50%" stopColor={colors.quinary} />
                            <stop offset="100%" stopColor={colors.senary} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.quaternary, fontSize: 11 }}
                        dy={10}
                        interval={selectedPeriod === 'Last 30 Days' ? 1 : 0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.quaternary, fontSize: 11 }}
                        domain={yAxisConfig.domain}
                        ticks={yAxisConfig.ticks}
                        label={{
                            value: 'Number of Bookings',
                            angle: -90,
                            position: 'insideleft',
                            offset : -10,
                            textanchor: 'middle',
                            style: { fill: colors.quaternary, fontSize: 14 }
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'white',
                            border: `1px solid ${colors.secondary}`,
                            borderRadius: '8px',
                            padding: '8px 12px'
                        }}
                        formatter={(value) => [value, 'Bookings']}
                        labelFormatter={(label) => selectedPeriod === 'Last 30 Days' ? `Day ${label}` : label}
                    />
                    <Line
                        type="monotone"
                        dataKey="bookings"
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={{ fill: colors.tertiary, r: 4, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: colors.senary, stroke: colors.primary, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BookingTrendsChart;