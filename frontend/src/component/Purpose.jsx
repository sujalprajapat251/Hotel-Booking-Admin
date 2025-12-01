import { useState } from 'react';
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { IoBedOutline } from "react-icons/io5";
import { useSelector } from 'react-redux';
import { Coffee } from 'lucide-react';
import { GiMartini } from 'react-icons/gi';
import { IoIosRestaurant } from 'react-icons/io';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <div
                className="px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium whitespace-nowrap border border-white/30"
                style={{ backgroundColor: data.payload.color }}
            >
                {data.name}: {data.value} guests
            </div>
        );
    }
    return null;
};

const CenterLabel = ({ totalGuests, activeData }) => {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-300 pointer-events-none">
            <div className="text-[12px] text-[#A3876A] mb-1 font-medium tracking-wide uppercase">
                {activeData ? activeData.name : "Total Amount"}
            </div>

            <div
                className="text-[24px] font-bold leading-none transition-colors duration-300"
                style={{ color: activeData ? activeData.color : "#755647" }}
            >
                {activeData ? activeData.value : totalGuests}
            </div>

            {activeData && (
                <div className="text-[12px] text-[#A3876A] mt-1 font-medium">
                    ({activeData.percent}%)
                </div>
            )}
        </div>
    );
};

const convertApiToChart = (apiArray, colors, icons) => {
    return apiArray.map((item, index) => ({
        name: item.from,
        value: item.totalAmount,
        color: colors[index],
        icon: icons[index]
    }));
};

export default function CustomActiveShapePieChart({ isAnimationActive = true }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const [activeTab, setActiveTab] = useState('cafe');

    const getOrdersummery = useSelector((state) => state.dashboard.getOrdersummery);

    const cafeData = convertApiToChart(
        getOrdersummery?.cafe || [],
        ["#f7df9c", "#B79982"],
        [
            <IoBedOutline className="text-[18px] font-bold" />,
            <Coffee className="text-[18px] font-bold" />
        ]
    );

    const barData = convertApiToChart(
        getOrdersummery?.bar || [],
        ["#f7df9c", "#755647"],
        [
            <IoBedOutline className="text-[18px] font-bold" />,
            <GiMartini className="text-[18px] font-bold" />
        ]
    );

    const restroData = convertApiToChart(
        getOrdersummery?.restro || [],
        ["#E3C78A", "#B79982"],
        [
            <IoBedOutline className="text-[18px] font-bold" />,
            <IoIosRestaurant className="text-[18px] font-bold" />
        ]
    );

    const getCurrentData = () => {
        switch (activeTab) {
            case "cafe": return cafeData;
            case "bar": return barData;
            case "restaurant": return restroData;
            default: return cafeData;
        }
    };

    const currentData = getCurrentData();
    const totalGuests = currentData.reduce((sum, entry) => sum + entry.value, 0);

    const dataWithPercent = currentData.map(item => ({
        ...item,
        percent: totalGuests > 0 ? Math.round((item.value / totalGuests) * 100) : 0
    }));

    const activeData = activeIndex !== null ? dataWithPercent[activeIndex] : null;

    const getTitle = () => {
        switch (activeTab) {
            case 'cafe': return 'Cafe Order';
            case 'bar': return 'Bar Order';
            case 'restaurant': return 'Restaurant Order';
            default: return 'Cafe Order';
        }
    };

    return (
        <div className="w-full bg-white rounded-2xl">
            {/* Header */}
            <div className="mb-5">
                <h2 className="flex items-center gap-2 text-[20px] font-semibold text-[#755647]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#A3876A" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                    </svg>
                    {getTitle()}
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-2 border-[#E3C78A] rounded-lg shadow-sm overflow-auto">
                <button
                    onClick={() => setActiveTab('cafe')}
                    className={`flex-1 py-3 px-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 
                        ${activeTab === 'cafe'
                            ? "text-white bg-gradient-to-br from-[#876B56] to-[#755647] scale-[1] shadow-md"
                            : "text-[#A3876A]"
                        }`}
                >
                    <Coffee className="text-[18px]" /> Cafe
                </button>

                <button
                    onClick={() => setActiveTab('bar')}
                    className={`flex-1 py-3 px-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 border-x border-[#E3C78A]
                        ${activeTab === 'bar'
                            ? "text-white bg-gradient-to-br from-[#876B56] to-[#755647] scale-[1] shadow-md"
                            : "text-[#A3876A]"
                        }`}
                >
                    <GiMartini className="text-[18px]" /> Bar
                </button>

                <button
                    onClick={() => setActiveTab('restaurant')}
                    className={`flex-1 py-3 px-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 
                        ${activeTab === 'restaurant'
                            ? "text-white bg-gradient-to-br from-[#876B56] to-[#755647] scale-[1] shadow-md"
                            : "text-[#A3876A]"
                        }`}
                >
                    <IoIosRestaurant className="text-[18px]" /> Restaurant
                </button>
            </div>

            {/* Chart */}
            <div className="h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={dataWithPercent}
                            cx="50%"
                            cy="50%"
                            innerRadius="50%"
                            outerRadius="75%"
                            paddingAngle={3}
                            dataKey="value"
                            onMouseEnter={(_, i) => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(null)}
                            isAnimationActive={isAnimationActive}
                        >
                            {dataWithPercent.map((entry, index) => (
                                <Cell
                                    key={index}
                                    fill={entry.color}
                                    stroke="none"
                                    style={{
                                        filter:
                                            activeIndex === index
                                                ? "drop-shadow(0 4px 8px rgba(117, 86, 71, 0.4)) brightness(1.1)"
                                                : "drop-shadow(0 2px 4px rgba(117, 86, 71, 0.15))",
                                        transition: "all 0.3s ease",
                                        cursor: "pointer"
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                <CenterLabel totalGuests={totalGuests} activeData={activeData} />
            </div>

            {/* Legend */}
            <div className="bg-white/60 rounded-xl p-3 border border-[#E3C78A]">
                {dataWithPercent.map((entry, index) => (
                    <div
                        key={index}
                        className={`flex justify-between items-center p-2 rounded-md cursor-pointer transition-all 
                            ${index < dataWithPercent.length - 1 ? "border-b border-[#F7DF9C]" : ""}`}
                        onMouseEnter={(e) => { e.currentTarget.classList.add("bg-[#F7DF9C33]", "translate-x-1"); }}
                        onMouseLeave={(e) => { e.currentTarget.classList.remove("bg-[#F7DF9C33]", "translate-x-1"); }}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full border-2 border-white shadow-md"
                                style={{ backgroundColor: entry.color, boxShadow: `${entry.color}80 0px 2px 6px` }}
                            />
                            <span className="text-[15px] font-medium text-[#755647] flex items-center gap-2">
                                {entry.icon}
                                {entry.name}
                            </span>
                        </div>

                        <div className="text-right">
                            <span className="text-[18px] font-bold text-[#755647] mr-2">
                                {entry.value}
                            </span>
                            <span className="text-[13px] text-[#A3876A] font-medium">
                                ({entry.percent}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
