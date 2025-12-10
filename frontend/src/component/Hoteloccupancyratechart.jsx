import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOccupancyrate } from '../Redux/Slice/dashboard.silce';

const colors = {
    primary: '#F7DF9C',
    secondary: '#E3C78A',
    tertiary: '#B79982',
    quaternary: '#A3876A',
    quinary: '#876B56',
    senary: '#755647',
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const HotelOccupancyDashboard = () => {

    const dispatch = useDispatch();

    const getCurrentYear = () => {
        return new Date().getFullYear();
    };

    const getOccupancyrate = useSelector((state) => state.dashboard.getOccupancyrate);

    const formatNumber = (num) => {
        if (!num) return "0";
        return num.toLocaleString("en-IN");
    };

    const chartData = getOccupancyrate?.revenueByMonth?.map((item) => ({
        month: MONTH_NAMES[item.month - 1],
        rate: item.totalRevenue
    })) || [];

    return (
        <div className="flex items-center justify-center">
            <div className="w-full">
                <h2 className="text-2xl font-semibold mb-3" style={{ color: colors.senary }}>
                    Hotel Revenue
                </h2>

                <div className="flex justify-between items-end gap-4 mb-3">
                    <div>
                        <div className="text-[40px] font-bold" style={{ color: colors.quinary }}>
                            ${formatNumber(getOccupancyrate?.currentRevenue)}
                        </div>
                        <div className="text-sm mt-1" style={{ color: colors.quaternary }}>
                            Current Month
                        </div>
                    </div>
                </div>

                <div className="flex gap-8 mb-3">
                    <div>
                        <div className="text-sm mb-1" style={{ color: colors.quaternary }}>
                            Previous Month
                        </div>
                        <div className="text-2xl font-semibold" style={{ color: colors.quinary }}>
                            ${formatNumber(getOccupancyrate?.prevRevenue)}
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={180}>
                    <AreaChart
                        data={chartData}
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
                            tick={{ fill: colors.quaternary, fontSize: 11 }}
                            tickFormatter={(value) => {
                                if (value >= 1_000_000_000) {
                                    return (value / 1_000_000_000) + "B"; // Billions
                                } else if (value >= 1_000_000) {
                                    return (value / 1_000_000) + "M"; // Millions
                                } else if (value >= 1_000) {
                                    return (value / 1_000) + "K"; // Thousands
                                }
                                return value;
                            }}
                        />
 
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'white',
                                border: `1px solid ${colors.secondary}`,
                                borderRadius: '8px',
                                padding: '8px 12px'
                            }}
                            formatter={(value) => [`$${value}`, 'Revenue']}
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