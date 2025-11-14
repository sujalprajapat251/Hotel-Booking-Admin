import React from 'react';
import { Pie, PieChart, Cell, Sector, Tooltip } from 'recharts';
import '../Style/Sujal.css';

// Sample data
const data = [
    { name: 'Group A', value: 400, color: '#F7DF9C' },  // pale yellow
    { name: 'Group B', value: 300, color: '#E3C78A' },  // tan
    { name: 'Group C', value: 300, color: '#B79982' },  // muted sand
    { name: 'Group D', value: 200, color: '#A3876A' },  // taupe brown
    { name: 'Group e', value: 300, color: '#876B56' },  // brown
    { name: 'Group f', value: 200, color: '#755647' },  // deep brown
];

const renderActiveShape = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
}) => {
    const RADIAN = Math.PI / 180;
    const sin = Math.sin(-RADIAN * (midAngle ?? 1));
    const cos = Math.cos(-RADIAN * (midAngle ?? 1));
    const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
    const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
    const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
    const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={payload.color}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={(outerRadius ?? 0) + 6}
                outerRadius={(outerRadius ?? 0) + 10}
                fill={payload.color}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
                {`(Rate ${((percent ?? 1) * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};

export const CustomActiveShapePieChart = ({
    isAnimationActive = true,
    defaultIndex = undefined,
}) => {
    return (
        <PieChart
            className='V_chart_2'
            //   width={500}
            //   height={400}
            responsive
            margin={{
                top: 50,
                right: 120,
                bottom: 0,
                left: 120,
            }}
        >
            <Pie
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                dataKey="value"
                isAnimationActive={isAnimationActive}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
            </Pie>
            <Tooltip content={() => null} defaultIndex={defaultIndex} />
        </PieChart>
    );
};