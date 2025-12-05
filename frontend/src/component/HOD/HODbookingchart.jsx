import { useSelector } from 'react-redux';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

const COLORS = ['#F7DF9C', '#E3C78A', '#B79982', '#A3876A', '#876B56', '#755647'];

const RoundedBar = (props) => {
    const { fill, x, y, width, height } = props;
    const radius = Math.min(width / 2, 12);

    return (
        <rect
            x={x}
            y={y}
            width={width}
            height={height}
            fill={fill}
            rx={radius}
            ry={radius}
        />
    );
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '8px 12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px'
            }}>
                <p style={{ margin: 0 }}>
                    Date: {payload[0].payload.name}, Bookings: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

const SimpleBarChart = () => {
    const getHodDashboard = useSelector((state) => state.HODDashboard.getHodDashboard);

    const orderTrend = getHodDashboard?.orderTrend || [];

    const chartData = [...orderTrend]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-8)
        .map(item => ({
            name: item.date,
            profit: item.count
        }));


    if (!chartData.length) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No data available</div>;
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '220px',
            height: '120px',
            background: 'white',
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                    <XAxis dataKey="name" hide={true} />
                    <YAxis hide={true} />
                    <Tooltip content={<CustomTooltip />} />

                    <Bar
                        dataKey="profit"
                        shape={<RoundedBar />}
                        maxBarSize={11}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SimpleBarChart;