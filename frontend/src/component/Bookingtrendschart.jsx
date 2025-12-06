import { useSelector } from 'react-redux';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const colors = {
    primary: '#F7DF9C',
    secondary: '#E3C78A',
    tertiary: '#B79982',
    quaternary: '#A3876A',
    quinary: '#876B56',
    senary: '#755647',
};

const BookingTrendsChart = () => {
    const bookingTrends = useSelector(state => state.dashboard.getBookingtrends);

    const chartData = bookingTrends?.timeline || [];

    const stats = {
        total: bookingTrends?.totalBookings || 0,
        average: bookingTrends?.dailyAverage || 0
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-[16px] font-semibold" style={{ color: colors.senary }}>
                    Booking Trends
                </h2>
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
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={colors.tertiary} />
                            <stop offset="50%" stopColor={colors.quinary} />
                            <stop offset="100%" stopColor={colors.senary} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.quaternary, fontSize: 11 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.quaternary, fontSize: 11 }}
                        label={{
                            value: 'Bookings',
                            angle: -90,
                            position: 'insideLeft',
                            style: { fill: colors.quaternary, fontSize: 12 }
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
                    />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="url(#lineGradient)"
                        strokeWidth={3}
                        dot={{ fill: colors.tertiary, r: 4 }}
                        activeDot={{ r: 6, fill: colors.senary, stroke: colors.primary, strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BookingTrendsChart;