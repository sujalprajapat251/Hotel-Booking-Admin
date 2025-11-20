// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { TrendingUp } from 'lucide-react';

// const data = [
//     { month: 'Jan', rate: 66 },
//     { month: 'Feb', rate: 69 },
//     { month: 'Mar', rate: 72 },
//     { month: 'Apr', rate: 75 },
//     { month: 'May', rate: 78 },
//     { month: 'Jun', rate: 76 },
//     { month: 'Jul', rate: 79 },
//     { month: 'Aug', rate: 77 },
//     { month: 'Sep', rate: 73 },
//     { month: 'Oct', rate: 77 },
//     { month: 'Nov', rate: 80 },
//     { month: 'Dec', rate: 78.5 },
// ];

// const HotelOccupancyDashboard = () => {
//     return (
//         <div className=" flex items-center justify-center">
//             <div className=" w-full ">
//                 <h2 className="text-2xl font-semibold text-gray-800 mb-6">Hotel Occupancy Rate</h2>

//                 <div className="flex justify-between items-end gap-4 mb-5">
//                     <div>
//                         <div className="text-6xl font-bold text-red-400">78.5%</div>
//                         <div className="text-gray-500 text-sm mt-1">Current Month</div>
//                     </div>

//                     <div className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg flex items-center gap-1 mb-2">
//                         <TrendingUp size={16} />
//                         <span className="font-semibold text-sm">+6.2%</span>
//                     </div>
//                 </div>

//                 <div className="flex gap-8 mb-8">
//                     <div>
//                         <div className="text-gray-500 text-sm mb-1">Previous Month</div>
//                         <div className="text-2xl font-semibold text-gray-700">72.3%</div>
//                     </div>
//                     <div>
//                         <div className="text-gray-500 text-sm mb-1">YTD Average</div>
//                         <div className="text-2xl font-semibold text-gray-700">75.8%</div>
//                     </div>
//                 </div>

//                 <ResponsiveContainer width="100%" height={200}>
//                     <AreaChart
//                         data={data}
//                         margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
//                     >
//                         <defs>
//                             <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
//                                 <stop offset="5%" stopColor="#f87171" stopOpacity={0.6} />
//                                 <stop offset="95%" stopColor="#f87171" stopOpacity={0.05} />
//                             </linearGradient>
//                         </defs>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
//                         <XAxis
//                             dataKey="month"
//                             axisLine={false}
//                             tickLine={false}
//                             tick={{ fill: '#9ca3af', fontSize: 12 }}
//                         />
//                         <YAxis
//                             axisLine={false}
//                             tickLine={false}
//                             tick={{ fill: '#9ca3af', fontSize: 12 }}
//                             domain={[60, 90]}
//                             ticks={[60, 65, 70, 75, 80, 85, 90]}
//                             tickFormatter={(value) => `${value}%`}
//                         />
//                         <Tooltip
//                             contentStyle={{
//                                 backgroundColor: 'white',
//                                 border: '1px solid #e5e7eb',
//                                 borderRadius: '8px',
//                                 padding: '8px 12px'
//                             }}
//                             formatter={(value) => [`${value}%`, 'Occupancy']}
//                         />
//                         <Area
//                             type="monotone"
//                             dataKey="rate"
//                             stroke="#f87171"
//                             strokeWidth={2}
//                             fill="url(#colorRate)"
//                             dot={{ fill: '#f87171', r: 4, strokeWidth: 0 }}
//                             activeDot={{ r: 6, fill: '#f87171' }}
//                         />
//                     </AreaChart>
//                 </ResponsiveContainer>
//             </div>
//         </div>
//     );
// };

// export default HotelOccupancyDashboard;


import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
    { month: 'Jan', rate: 66 },
    { month: 'Feb', rate: 69 },
    { month: 'Mar', rate: 72 },
    { month: 'Apr', rate: 75 },
    { month: 'May', rate: 78 },
    { month: 'Jun', rate: 76 },
    { month: 'Jul', rate: 79 },
    { month: 'Aug', rate: 77 },
    { month: 'Sep', rate: 73 },
    { month: 'Oct', rate: 77 },
    { month: 'Nov', rate: 80 },
    { month: 'Dec', rate: 78.5 },
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

const HotelOccupancyDashboard = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="w-full">
                <h2 className="text-2xl font-semibold mb-3" style={{ color: colors.senary }}>
                    Hotel Occupancy Rate
                </h2>

                <div className="flex justify-between items-end gap-4 mb-3">
                    <div>
                        <div className="text-[40px] font-bold" style={{ color: colors.quinary }}>
                            78.5%
                        </div>
                        <div className="text-sm mt-1" style={{ color: colors.quaternary }}>
                            Current Month
                        </div>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg flex items-center gap-1 mb-2" style={{
                        backgroundColor: 'rgba(74, 222, 128, 0.1)',
                        color: '#16a34a'
                    }}>
                        <TrendingUp size={16} />
                        <span className="font-semibold text-sm">+6.2%</span>
                    </div>
                </div>

                <div className="flex gap-8 mb-3">
                    <div>
                        <div className="text-sm mb-1" style={{ color: colors.quaternary }}>
                            Previous Month
                        </div>
                        <div className="text-2xl font-semibold" style={{ color: colors.quinary }}>
                            72.3%
                        </div>
                    </div>
                    <div>
                        <div className="text-sm mb-1" style={{ color: colors.quaternary }}>
                            YTD Average
                        </div>
                        <div className="text-2xl font-semibold" style={{ color: colors.quinary }}>
                            75.8%
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorOccupancy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors.tertiary} stopOpacity={0.6} />
                                <stop offset="95%" stopColor={colors.primary} stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis
                            dataKey="month"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: colors.quaternary, fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: colors.quaternary, fontSize: 12 }}
                            domain={[60, 90]}
                            ticks={[60, 65, 70, 75, 80, 85, 90]}
                            tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: `1px solid ${colors.secondary}`,
                                borderRadius: '8px',
                                padding: '8px 12px'
                            }}
                            formatter={(value) => [`${value}%`, 'Occupancy']}
                        />
                        <Area
                            type="monotone"
                            dataKey="rate"
                            stroke={colors.quinary}
                            strokeWidth={2.5}
                            fill="url(#colorOccupancy)"
                            dot={{ fill: colors.quinary, r: 4, strokeWidth: 0 }}
                            activeDot={{ r: 6, fill: colors.senary }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default HotelOccupancyDashboard;