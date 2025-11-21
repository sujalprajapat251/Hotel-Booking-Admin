import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, LabelList } from 'recharts';

const data = [
    {
        date: '1 Jan',
        cancled: 40,
        booked: 24,
    },
    {
        date: '2 Jan',
        cancled: 30,
        booked: 13,
    },
    {
        date: '3 Jan',
        cancled: 20,
        booked: 98,
    },
    {
        date: '4 Jan',
        cancled: 27,
        booked: 39,
    },
    {
        date: '5 Jan',
        cancled: 18,
        booked: 48,
    },
    {
        date: '6 Jan',
        cancled: 23,
        booked: 38,
    },
    {
        date: '7 Jan',
        cancled: 34,
        booked: 43,
    },
];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const total = payload.reduce((sum, entry) => sum + entry.value, 0);

        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                <p className="font-semibold text-gray-800 mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{entry.name}:</span>
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
    }
    return null;
};

const StackedBarChart = () => {
    const getBarSize = () => {
        const width = window.innerWidth;
        if (width < 600) return 16; 
        if (601 < width < 768) return 24     
        if (769 < width < 1024) return 30;   
        return 36;                     
    };

    const getfontsize = () => {
        const width = window.innerWidth;
        if (width < 600) return 8;
        if (601 < width < 768) return 12;
        if (769 < width < 1024) return 14;
        return 14;
    };

    return (
        <div className="recharts-wrapper">
            <BarChart
                style={{ width: '100%', aspectRatio: 1.618 }}
                responsive
                data={data}
                margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 5,
                }}
                barSize={getBarSize()}
            >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="gray" />
                <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#999', fontSize: 12 }}
                />
                <YAxis
                    width="auto"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#999', fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    iconType="square"
                    align="right"
                    verticalAlign="top"
                    wrapperStyle={{ padding: '10px 0px 10px 0px' }}
                />
                <Bar
                    dataKey="booked"
                    stackId="a"
                    fill="#876B56"
                    radius={[0, 0, 4, 4]}
                >
                    <LabelList
                        dataKey="booked"
                        position="center"
                        fill="#fff"
                        fontSize={getfontsize()}
                        fontWeight="bold"
                    />
                </Bar>
                <Bar
                    dataKey="cancled"
                    stackId="a"
                    fill="#F7DF9C"
                    radius={[4, 4, 0, 0]}
                >
                    <LabelList
                        dataKey="cancled"
                        position="center"
                        fill="#876B56"
                        fontSize={getfontsize()}
                        fontWeight="bold"
                    />
                </Bar>
            </BarChart>
        </div>
    );
};

export default StackedBarChart;