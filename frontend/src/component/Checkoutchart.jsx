import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from 'recharts';

const COLORS = ['#F7DF9C', '#E3C78A', '#B79982', '#A3876A', '#876B56', '#755647'];

const data = [
    { name: 'Vila', value: 400 },
    { name: 'Dilux', value: 300 },
    { name: 'Single', value: 300 },
    { name: 'Double', value: 200 },
    { name: 'Double', value: 200 },
    { name: 'Vila', value: 400 },
];

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
    return (
        <div style={{
            width: '100%',
            maxWidth: '220px',
            height: '130px',
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
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="0%"
                        outerRadius="100%"
                        dataKey="value"
                        isAnimationActive={isAnimationActive}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}