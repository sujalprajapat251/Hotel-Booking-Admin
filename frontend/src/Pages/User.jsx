import React, { useEffect, useState } from 'react';
import viewImg from '../Images/view.png'
import "../Style/vaidik.css"
import { useDispatch, useSelector } from 'react-redux';
import { getAllUser } from '../Redux/Slice/user.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import { MdOutlineFileDownload, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoFilterSharp } from 'react-icons/io5';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const User = () => {

    const dispatch = useDispatch();

    const users = useSelector((state) => state.user.users);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(4);

    const filteredUsers = users.filter((user) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const formattedDate = user.createdAt ? formatDate(user.createdAt).toLowerCase() : '';

        return name.includes(query) ||
            email.includes(query) ||
            formattedDate.includes(query);
    });

    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUser = filteredUsers.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const handleViewClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };


    useEffect(() => {
        dispatch(getAllUser());
    }, [dispatch])

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery])

    return (
        <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">

            <section className="py-5">
                <h1 className="text-2xl font-semibold text-black">User</h1>
            </section>

            <div className="w-full bg-white rounded-lg pt-6 shadow-md flex flex-col">
                <div className="flex flex-col md:flex-row justify-between items-center px-4 gap-3 mb-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search"
                            className="p-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <ul className="flex gap-4">
                        <li title="Show/Hide Column"><IoFilterSharp className="text-[#3f51b5] text-2xl cursor-pointer" /></li>
                        <li title="Xlsx Download"><MdOutlineFileDownload className="text-[#2196f3] text-2xl cursor-pointer" /></li>
                    </ul>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
                            <tr className="items-start">
                                <th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">
                                    <input
                                        type="checkbox"
                                        class="w-4 h-4 mt-1 align-top bg-white bg-no-repeat bg-center bg-contain border border-[rgba(231,234,243,0.7)] cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">No</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Name</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-[#755647] whitespace-nowrap">Date</th>
                                <th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {paginatedUser.map((item, index) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 align-center">
                                        <input
                                            type="checkbox"
                                            class="w-4 h-4 mt-1 align-top bg-white bg-no-repeat bg-center bg-contain border border-[rgba(231,234,243,0.7)] cursor-pointer"
                                        />
                                    </td>

                                    <td className="px-4 py-3 text-[#333]">
                                        {startIndex + index + 1}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {item.photo ? (
                                                <img
                                                    src={`${IMAGE_URL}/photo/${item.photo}`}
                                                    alt={item.name}
                                                    className="w-11 h-11 rounded-full object-cover border-2 border-[#E3C78A] shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full object-cover shadow-sm bg-[#ECD292] flex items-center justify-center font-[600] text-[#8B752F] text-lg uppercase">
                                                    {(() => {
                                                        if (item.name) {
                                                            const words = item.name.trim().split(/\s+/);
                                                            if (words.length >= 2) {
                                                                return words[0][0] + words[1][0];
                                                            } else {
                                                                return words[0][0];
                                                            }
                                                        }
                                                        return "";
                                                    })()}
                                                </div>
                                            )}
                                            <span className="font-semibold text-[#333]">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {item.email}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {item.createdAt ? formatDate(item.createdAt) : ''}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-3 w-14">
                                            <div className="cursor-pointer" onClick={() => handleViewClick(item)}><img src={viewImg} alt="view" /></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex flex-col sm:flex-row justify-end items-center px-4 py-4 gap-4 border-t border-gray-200">
                        {/* Left side - Items per page */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Items per page:</span>
                            <div className="relative">
                                <select
                                    value={itemsPerPage}
                                    onChange={handleItemsPerPageChange}
                                    className="appearance-none bg-white border border-gray-300 rounded px-3 py-1.5 pr-8 text-sm focus:outline-none focus:border-[#B79982] cursor-pointer"
                                >
                                    <option value={5}>5</option>
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                                <MdKeyboardArrowRight className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
                            </div>
                        </div>

                        {/* Center - Page info */}
                        <div className="text-sm text-gray-600">
                            {startIndex + 1} – {Math.min(endIndex, totalItems)} of {totalItems}
                        </div>

                        {/* Right side - Navigation buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`p-1.5 rounded hover:bg-gray-100 transition ${currentPage === 1 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                            >
                                <MdKeyboardArrowLeft className="text-xl text-gray-600" />
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className={`p-1.5 rounded hover:bg-gray-100 transition ${currentPage === totalPages || totalPages === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                            >
                                <MdKeyboardArrowRight className="text-xl text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default User;

