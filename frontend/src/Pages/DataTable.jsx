import React from "react";
import { IoFilterSharp } from "react-icons/io5";
import { IoMdAddCircleOutline, IoMdRefresh } from "react-icons/io";
import { MdOutlineFileDownload, MdOutlineMailOutline, MdDelete } from "react-icons/md";
import { FiEdit2 } from "react-icons/fi";
import { BsTelephone } from "react-icons/bs";

const bookings = [
    {
        name: "Smita Parikh",
        email: "test@email.com",
        arrival: "02/07/2018",
        departure: "02/10/2018",
        gender: "female",
        mobile: "1234567890",
        room: "Delux",
        payment: "Paid",
        image: "https://i.pravatar.cc/40?img=1",
    },
    {
        name: "Sarah Smith",
        email: "test@email.com",
        arrival: "02/12/2018",
        departure: "02/15/2018",
        gender: "female",
        mobile: "1234567890",
        room: "Super Delux",
        payment: "Unpaid",
        image: "https://i.pravatar.cc/40?img=2",
    },
    {
        name: "Pankaj Sinha",
        email: "test@email.com",
        arrival: "02/11/2018",
        departure: "02/15/2018",
        gender: "male",
        mobile: "1234567890",
        room: "Double",
        payment: "Unpaid",
        image: "https://i.pravatar.cc/40?img=3",
    },
];

const DataTable = () => {
    return (
        <div className="bg-[#f0f3fb] px-4 md:px-8 py-6 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-[#dae1f3] py-3 px-4 rounded-md gap-3">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <h1 className="text-[16px] font-bold text-[#5b626b]">All Booking</h1>
                    <input
                        type="text"
                        placeholder="Search"
                        className="p-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none"
                    />
                </div>
                <ul className="flex gap-4">
                    <li><IoFilterSharp className="text-[#3f51b5] text-2xl cursor-pointer" /></li>
                    <li><IoMdAddCircleOutline className="text-[#4caf50] text-2xl cursor-pointer" /></li>
                    <li><IoMdRefresh className="text-[#795548] text-2xl cursor-pointer" /></li>
                    <li><MdOutlineFileDownload className="text-[#2196f3] text-2xl cursor-pointer" /></li>
                </ul>
            </div>

            {/* Table */}
            <div className="overflow-x-auto mt-5 bg-white rounded-lg shadow-sm">
                <table className="w-full border-collapse">
                    <thead className="bg-[#f5f7fb] text-[#555] uppercase text-xs font-semibold">
                        <tr>
                            <th className="py-3 px-4 text-left">
                                <input type="checkbox" />
                            </th>
                            <th className="py-3 px-4 text-left">Guest Name</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Arrival Date</th>
                            <th className="py-3 px-4 text-left">Departure Date</th>
                            <th className="py-3 px-4 text-left">Gender</th>
                            <th className="py-3 px-4 text-left">Mobile</th>
                            <th className="py-3 px-4 text-left">Room Type</th>
                            <th className="py-3 px-4 text-left">Payment</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((item, index) => (
                            <tr
                                key={index}
                                className="border-b border-gray-200 hover:bg-gray-50 transition"
                            >
                                <td className="py-4 px-4 align-top">
                                    <input type="checkbox" />
                                </td>

                                {/* Guest Name */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <span className="font-semibold text-[#333]">{item.name}</span>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="py-4 px-4 text-gray-700">
                                    <div className="flex items-center gap-2">
                                        <MdOutlineMailOutline className="text-red-500" />
                                        {item.email}
                                    </div>
                                </td>

                                {/* Arrival & Departure */}
                                <td className="py-4 px-4">{item.arrival}</td>
                                <td className="py-4 px-4">{item.departure}</td>

                                {/* Gender */}
                                <td className="py-4 px-4">
                                    <span
                                        className={`px-2 py-1 rounded-md text-xs font-medium ${item.gender === "male"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-purple-100 text-purple-700"
                                            }`}
                                    >
                                        {item.gender}
                                    </span>
                                </td>

                                {/* Mobile */}
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2 text-[#2e7d32]">
                                        <BsTelephone />
                                        {item.mobile}
                                    </div>
                                </td>

                                {/* Room Type */}
                                <td className="py-4 px-4 text-[#333]">{item.room}</td>

                                {/* Payment */}
                                <td className="py-4 px-4">
                                    <span
                                        className={`font-medium ${item.payment === "Paid"
                                            ? "text-green-600"
                                            : "text-red-500"
                                            }`}
                                    >
                                        {item.payment}
                                    </span>
                                </td>

                                {/* Actions */}
                                {/* <td className="items-center flex gap-3 text-lg">
                                    
                                </td> */}
                                <td className="py-4 px-4">
                                    <div className="items-center flex gap-3 ">
                                        <FiEdit2 className="text-[#3f51b5] cursor-pointer" />
                                        <MdDelete className="text-[#f44336] cursor-pointer" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
