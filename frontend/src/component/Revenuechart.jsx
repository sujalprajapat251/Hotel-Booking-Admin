import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

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

export default function Example() {
    return (
        <div style={{
            width: '100%',
            maxWidth: '200px',
            height: '100px',
        }}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <defs>
                        <linearGradient id="warmGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#F7DF9C" />
                            <stop offset="20%" stopColor="#E3C78A" />
                            <stop offset="40%" stopColor="#B79982" />
                            <stop offset="60%" stopColor="#A3876A" />
                            <stop offset="80%" stopColor="#876B56" />
                            <stop offset="100%" stopColor="#755647" />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '8px',
                            color: 'white',
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="url(#warmGradient)"
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}