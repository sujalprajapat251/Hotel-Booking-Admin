import { useState } from 'react';
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { BsSuitcaseLg } from "react-icons/bs";
import { TiWeatherSunny } from "react-icons/ti";
import { IoLocationOutline } from "react-icons/io5";
import { SlCursor } from "react-icons/sl";
import { BsGlobe2 } from "react-icons/bs";
import { FiUsers, FiUser } from "react-icons/fi";
import { LuUserCheck, LuUserPlus } from "react-icons/lu";

const purposeData = [
    { name: 'Business', value: 156, color: '#876B56', icon: <BsSuitcaseLg className='text-[18px] font-bold' /> },
    { name: 'Leisure', value: 96, color: '#B79982', icon: <TiWeatherSunny className='text-[18px] font-bold' /> },
];

const originData = [
    { name: 'Local', value: 78, color: '#F7DF9C', icon: <IoLocationOutline className='text-[18px] font-bold' /> },
    { name: 'Domestic', value: 124, color: '#A3876A', icon: <SlCursor className='text-[18px] font-bold' /> },
    { name: 'International', value: 50, color: '#755647', icon: <BsGlobe2 className='text-[18px] font-bold' /> },
];

const ageData = [
    { name: '18-30', value: 63, color: '#E3C78A', icon: <FiUsers className='text-[18px] font-bold' /> },
    { name: '31-45', value: 101, color: '#B79982', icon: <FiUser className='text-[18px] font-bold' /> },
    { name: '46-60', value: 63, color: '#876B56', icon: <LuUserCheck className='text-[18px] font-bold' /> },
    { name: '60+', value: 25, color: '#755647', icon: <LuUserPlus className='text-[18px] font-bold' /> },
];

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
                {activeData ? activeData.name : "Total Guests"}
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

export default function CustomActiveShapePieChart({ isAnimationActive = true }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const [activeTab, setActiveTab] = useState('purpose');

    const getCurrentData = () => {
        switch (activeTab) {
            case 'purpose': return purposeData;
            case 'origin': return originData;
            case 'age': return ageData;
            default: return purposeData;
        }
    };

    const currentData = getCurrentData();
    const totalGuests = currentData.reduce((sum, entry) => sum + entry.value, 0);

    const dataWithPercent = currentData.map(item => ({
        ...item,
        percent: Math.round((item.value / totalGuests) * 100)
    }));

    const activeData = activeIndex !== null ? dataWithPercent[activeIndex] : null;

    const getTitle = () => {
        switch (activeTab) {
            case 'purpose': return 'Guest Purpose';
            case 'origin': return 'Guest Origin';
            case 'age': return 'Age Groups';
            default: return 'Guest Purpose';
        }
    };

    return (
        <div className="p-3 md:p-5 w-full  bg-white rounded-2xl border border-[#E3C78A] shadow-lg shadow-[#7556471f]">
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
            <div className="flex border-2 border-[#E3C78A] rounded-lg  shadow-sm overflow-auto ">
                {/* PURPOSE TAB */}
                <button
                    onClick={() => setActiveTab('purpose')}
                    className={`flex-1 py-3 px-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 
                    ${activeTab === 'purpose'
                            ? "text-white bg-gradient-to-br from-[#876B56] to-[#755647] scale-[1] shadow-md"
                            : "text-[#A3876A]"
                        }`}
                >
                    <BsSuitcaseLg className="text-[18px]" /> Purpose
                </button>

                {/* ORIGIN TAB */}
                <button
                    onClick={() => setActiveTab('origin')}
                    className={`flex-1 py-3 px-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 border-x border-[#E3C78A]
                    ${activeTab === 'origin'
                            ? "text-white bg-gradient-to-br from-[#876B56] to-[#755647] scale-[1] shadow-md"
                            : "text-[#A3876A]"
                        }`}
                >
                    <IoLocationOutline className="text-[18px]" /> Origin
                </button>

                {/* AGE TAB */}
                <button
                    onClick={() => setActiveTab('age')}
                    className={`flex-1 py-3 px-3 font-semibold text-sm transition-all flex items-center justify-center gap-2 
                    ${activeTab === 'age'
                            ? "text-white bg-gradient-to-br from-[#876B56] to-[#755647] scale-[1] shadow-md"
                            : "text-[#A3876A]"
                        }`}
                >
                    <FiUsers className="text-[18px]" /> Age
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

            {/* Footer */}
            <div className="mt-6 pt-5 border-t-2 border-[#E3C78A] text-center">
                <span className="text-[14px] text-[#876B56] font-semibold tracking-wide flex justify-center items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B79982" strokeWidth="2.5">
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                    </svg>
                    {totalGuests} total active guests
                </span>
            </div>
        </div>
    );
}
