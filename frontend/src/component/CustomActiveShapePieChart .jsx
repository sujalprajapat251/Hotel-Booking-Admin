// // import React from 'react';
// // import { Pie, PieChart, Cell, Sector, Tooltip } from 'recharts';
// // import '../Style/Sujal.css';

// // // Sample data
// // const data = [
// //     { name: 'Group A', value: 400, color: '#F7DF9C' },  // pale yellow
// //     { name: 'Group B', value: 300, color: '#E3C78A' },  // tan
// //     { name: 'Group C', value: 300, color: '#B79982' },  // muted sand
// //     { name: 'Group D', value: 200, color: '#A3876A' },  // taupe brown
// //     { name: 'Group e', value: 300, color: '#876B56' },  // brown
// //     { name: 'Group f', value: 200, color: '#755647' },  // deep brown
// // ];

// // const renderActiveShape = ({
// //     cx,
// //     cy,
// //     midAngle,
// //     innerRadius,
// //     outerRadius,
// //     startAngle,
// //     endAngle,
// //     fill,
// //     payload,
// //     percent,
// //     value,
// // }) => {
// //     const RADIAN = Math.PI / 180;
// //     const sin = Math.sin(-RADIAN * (midAngle ?? 1));
// //     const cos = Math.cos(-RADIAN * (midAngle ?? 1));
// //     const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
// //     const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
// //     const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
// //     const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
// //     const ex = mx + (cos >= 0 ? 1 : -1) * 22;
// //     const ey = my;
// //     const textAnchor = cos >= 0 ? 'start' : 'end';

// //     return (
// //         <g>
// //             <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
// //                 {payload.name}
// //             </text>
// //             <Sector
// //                 cx={cx}
// //                 cy={cy}
// //                 innerRadius={innerRadius}
// //                 outerRadius={outerRadius}
// //                 startAngle={startAngle}
// //                 endAngle={endAngle}
// //                 fill={payload.color}
// //             />
// //             <Sector
// //                 cx={cx}
// //                 cy={cy}
// //                 startAngle={startAngle}
// //                 endAngle={endAngle}
// //                 innerRadius={(outerRadius ?? 0) + 6}
// //                 outerRadius={(outerRadius ?? 0) + 10}
// //                 fill={payload.color}
// //             />
// //             <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
// //             <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
// //             <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text>
// //             <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
// //                 {`(Rate ${((percent ?? 1) * 100).toFixed(2)}%)`}
// //             </text>
// //         </g>
// //     );
// // };

// // export const CustomActiveShapePieChart = ({
// //     isAnimationActive = true,
// //     defaultIndex = undefined,
// // }) => {
// //     return (
// //         <PieChart
// //             className='V_chart_2'
// //             //   width={500}
// //             //   height={400}
// //             responsive
// //             margin={{
// //                 top: 50,
// //                 right: 120,
// //                 bottom: 0,
// //                 left: 120,
// //             }}
// //         >
// //             <Pie
// //                 activeShape={renderActiveShape}
// //                 data={data}
// //                 cx="50%"
// //                 cy="50%"
// //                 innerRadius="60%"
// //                 outerRadius="80%"
// //                 dataKey="value"
// //                 isAnimationActive={isAnimationActive}
// //             >
// //                 {data.map((entry, index) => (
// //                     <Cell key={`cell-${index}`} fill={entry.color} />
// //                 ))}
// //             </Pie>
// //             <Tooltip content={() => null} defaultIndex={defaultIndex} />
// //         </PieChart>
// //     );
// // };


// import React, { useState, useEffect } from 'react';
// import { Pie, PieChart, Cell, Sector, Tooltip } from 'recharts';
// import '../Style/Sujal.css';

// // Sample data
// const data = [
//     { name: 'Group A', value: 400, color: '#F7DF9C' },  // pale yellow
//     { name: 'Group B', value: 300, color: '#E3C78A' },  // tan
//     { name: 'Group C', value: 300, color: '#B79982' },  // muted sand
//     { name: 'Group D', value: 200, color: '#A3876A' },  // taupe brown
//     { name: 'Group e', value: 300, color: '#876B56' },  // brown
//     { name: 'Group f', value: 200, color: '#755647' },  // deep brown
// ];

// const renderActiveShape = (isSmallScreen) => ({
//     cx,
//     cy,
//     midAngle,
//     innerRadius,
//     outerRadius,
//     startAngle,
//     endAngle,
//     fill,
//     payload,
//     percent,
//     value,
// }) => {
//     const RADIAN = Math.PI / 180;

//     if (isSmallScreen) {
//         // Center tooltip for small screens
//         return (
//             <g>
//                 <text x={cx} y={cy} dy={-15} textAnchor="middle" fill="#755647" fontSize="14" fontWeight="bold">
//                     {payload.name}
//                 </text>
//                 <Sector
//                     cx={cx}
//                     cy={cy}
//                     innerRadius={innerRadius}
//                     outerRadius={outerRadius}
//                     startAngle={startAngle}
//                     endAngle={endAngle}
//                     fill={payload.color}
//                 />
//                 <Sector
//                     cx={cx}
//                     cy={cy}
//                     startAngle={startAngle}
//                     endAngle={endAngle}
//                     innerRadius={(outerRadius ?? 0) + 6}
//                     outerRadius={(outerRadius ?? 0) + 10}
//                     fill={payload.color}
//                 />
//                 <text x={cx} y={cy} dy={5} textAnchor="middle" fill="#333" fontSize="13" fontWeight="600">
//                     PV {value}
//                 </text>
//                 <text x={cx} y={cy} dy={22} textAnchor="middle" fill="#999" fontSize="12">
//                     {((percent ?? 1) * 100).toFixed(2)}%
//                 </text>
//             </g>
//         );
//     }

//     // Original tooltip for larger screens
//     const sin = Math.sin(-RADIAN * (midAngle ?? 1));
//     const cos = Math.cos(-RADIAN * (midAngle ?? 1));
//     const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
//     const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
//     const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
//     const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
//     const ex = mx + (cos >= 0 ? 1 : -1) * 22;
//     const ey = my;
//     const textAnchor = cos >= 0 ? 'start' : 'end';

//     return (
//         <g>
//             <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
//                 {payload.name}
//             </text>
//             <Sector
//                 cx={cx}
//                 cy={cy}
//                 innerRadius={innerRadius}
//                 outerRadius={outerRadius}
//                 startAngle={startAngle}
//                 endAngle={endAngle}
//                 fill={payload.color}
//             />
//             <Sector
//                 cx={cx}
//                 cy={cy}
//                 startAngle={startAngle}
//                 endAngle={endAngle}
//                 innerRadius={(outerRadius ?? 0) + 6}
//                 outerRadius={(outerRadius ?? 0) + 10}
//                 fill={payload.color}
//             />
//             <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
//             <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
//             <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text>
//             <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
//                 {`(Rate ${((percent ?? 1) * 100).toFixed(2)}%)`}
//             </text>
//         </g>
//     );
// };

// export const CustomActiveShapePieChart = ({
//     isAnimationActive = true,
//     defaultIndex = undefined,
// }) => {
//     const [isSmallScreen, setIsSmallScreen] = useState(false);

//     useEffect(() => {
//         const checkScreenSize = () => {
//             setIsSmallScreen(window.innerWidth < 1920);
//         };

//         checkScreenSize();
//         window.addEventListener('resize', checkScreenSize);

//         return () => window.removeEventListener('resize', checkScreenSize);
//     }, []);

//     return (
//         <PieChart
//             className='V_chart_2'
//             width="100%"
//             height="100%"
//             margin={isSmallScreen ? {
//                 top: 20,
//                 right: 20,
//                 bottom: 20,
//                 left: 20,
//             } : {
//                 top: 20,
//                 right: 20,
//                 bottom: 20,
//                 left: 20,
//             }}
//         >
//             <Pie
//                 activeShape={renderActiveShape(isSmallScreen)}
//                 data={data}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={isSmallScreen ? "70%" : "50%"}
//                 outerRadius={isSmallScreen ? "100%" : "80%"}
//                 dataKey="value"
//                 isAnimationActive={isAnimationActive}
//             >
//                 {data.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                 ))}
//             </Pie>
//             <Tooltip content={() => null} defaultIndex={defaultIndex} />
//         </PieChart>
//     );
// };




import React, { useState, useEffect } from 'react';
import { Pie, PieChart, Cell, Sector, Tooltip } from 'recharts';
import '../Style/Sujal.css';

// Sample data
const data = [
    { name: 'Group A', value: 400, color: '#F7DF9C' },
    { name: 'Group B', value: 300, color: '#E3C78A' },
    { name: 'Group C', value: 300, color: '#B79982' },
    { name: 'Group D', value: 200, color: '#A3876A' },
    { name: 'Group e', value: 300, color: '#876B56' },
    { name: 'Group f', value: 200, color: '#755647' },
];

const renderActiveShape = (textSize) => ({
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    payload,
    percent,
    value,
}) => {
    return (
        <g>
            <text 
                x={cx} 
                y={cy} 
                dy={textSize.nameOffset} 
                textAnchor="middle" 
                fill="#755647" 
                fontSize={textSize.name} 
                fontWeight="bold"
            >
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
                innerRadius={(outerRadius ?? 0) + textSize.ringGap}
                outerRadius={(outerRadius ?? 0) + textSize.ringWidth}
                fill={payload.color}
            />
            <text 
                x={cx} 
                y={cy} 
                dy={textSize.valueOffset} 
                textAnchor="middle" 
                fill="#333" 
                fontSize={textSize.value} 
                fontWeight="600"
            >
                PV {value}
            </text>
            <text 
                x={cx} 
                y={cy} 
                dy={textSize.percentOffset} 
                textAnchor="middle" 
                fill="#999" 
                fontSize={textSize.percent} 
                fontWeight="500"
            >
                Rate {((percent ?? 1) * 100).toFixed(2)}%
            </text>
        </g>
    );
};

export const CustomActiveShapePieChart = ({
    isAnimationActive = true,
    defaultIndex = undefined,
}) => {
    const [textSize, setTextSize] = useState({
        name: 18,
        value: 16,
        percent: 14,
        nameOffset: -25,
        valueOffset: 0,
        percentOffset: 22,
        ringGap: 6,
        ringWidth: 10
    });

    useEffect(() => {
        const updateTextSize = () => {
            const width = window.innerWidth;
            
            if (width <= 768) {
                // Extra Small Mobile (320-374px)
                setTextSize({
                    name: 24,
                    value: 20,
                    percent: 16,
                    nameOffset: -25,
                    valueOffset: 3,
                    percentOffset: 25,
                    ringGap: 5,
                    ringWidth: 5
                });
            } else if (width <= 1023) {
                // Tablet Large (769-1023px)
                setTextSize({
                    name: 16,
                    value: 14,
                    percent: 13,
                    nameOffset: -22,
                    valueOffset: 0,
                    percentOffset: 20,
                    ringGap: 5,
                    ringWidth: 9
                });
            } else {
                // Desktop (1024px+)
                setTextSize({
                    name: 18,
                    value: 16,
                    percent: 14,
                    nameOffset: -25,
                    valueOffset: 0,
                    percentOffset: 22,
                    ringGap: 6,
                    ringWidth: 10
                });
            }
        };

        updateTextSize();
        window.addEventListener('resize', updateTextSize);

        return () => window.removeEventListener('resize', updateTextSize);
    }, []);

    return (
        <PieChart
            className='V_chart_2'
            width="100%"
            height="100%"
            margin={{
                top: 20,
                right: 20,
                bottom: 20,
                left: 20,
            }}
        >
            <Pie
                activeShape={renderActiveShape(textSize)}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="70%"
                outerRadius="100%"
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