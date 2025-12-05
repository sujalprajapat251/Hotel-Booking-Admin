import { useSelector } from 'react-redux';
import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const COLORS = ['#F7DF9C', '#B79982', '#755647'];

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '6px 10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: '#fff', fontSize: '12px' }}>
                    {payload[0].name}: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export default function CustomActiveShapePieChart({
    isAnimationActive = true,
    defaultIndex = undefined,
}) {

    const getHodDashboard = useSelector((state) => state.HODDashboard.getHodDashboard);

    const chartData = getHodDashboard?.departmentStaff
        ? Object.entries(getHodDashboard.departmentStaff).map(([key, value]) => ({
            name: key,
            value: value
        }))
        : [];

    if (!chartData.length) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No data available</div>;
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '220px',
            height: '120px',
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart
                    margin={{
                        top: 20,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    }}
                >
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius="0%"
                        outerRadius="100%"
                        dataKey="value"
                        nameKey="name"
                        isAnimationActive={isAnimationActive}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}