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

const data = [
    { name: 'Jan', profit: 211 },
    { name: 'Feb', profit: 422 },
    { name: 'Mar', profit: 422 },
    { name: 'Apr', profit: 422 },
    { name: 'May', profit: 322 },
    { name: 'Jun', profit: 378 },
    { name: 'Jul', profit: 422 },
    { name: 'Aug', profit: 289 },
    { name: 'Sep', profit: 422 },
];

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

const SimpleBarChart = () => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '200px',
            height: '100px',
            background: 'white',
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                    <XAxis
                        dataKey="name"
                        hide={true}
                    />
                    <YAxis hide={true} />
                    <Tooltip
                        contentStyle={{
                            background: 'rgba(0, 0, 0, 0.7)',
                            border: 'none',
                            borderRadius: '2px',
                            color: 'white'
                        }}
                    />
                    <Bar
                        dataKey="profit"
                        shape={<RoundedBar />}
                        maxBarSize={11}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SimpleBarChart;