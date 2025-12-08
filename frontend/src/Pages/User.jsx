import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Plus, RefreshCw, Download, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUser } from '../Redux/Slice/user.slice';
import { IMAGE_URL } from '../Utils/baseUrl';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';

const User = () => {

    const dispatch = useDispatch();

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const [visibleColumns, setVisibleColumns] = useState({
        No: true,
        name: true,
        email: true,
        date: true,
    });

    const { users, loading } = useSelector((state) => state.user);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const filteredUsers = users.filter((user) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase().trim();
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        let formattedDate = '';
        if (user?.createdAt) {
            const formatted = formatDate(user.createdAt);
            formattedDate = (formatted ? formatted.toLowerCase() : '');
            if (formattedDate && !formattedDate.includes(query)) {
                const dashed = formatted.replace(/\//g, "-").toLowerCase();
                formattedDate += ` ${dashed}`;
            }
        }
        return name.includes(query) ||
            email.includes(query) ||
            formattedDate.includes(query);
    });

    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredUsers.slice(startIndex, endIndex);

    const toggleColumn = (column) => {
        setVisibleColumns(prev => ({
            ...prev,
            [column]: !prev[column]
        }));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowColumnDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        dispatch(getAllUser());
    }, [dispatch]);

    const handleDownloadExcel = () => {
        try {
            if (currentData.length === 0) {
                dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
                return;
            }
            // Prepare data for Excel
            const excelData = filteredUsers.map((user, index) => {
                const row = {};

                if (visibleColumns.No) {
                    row['No.'] = index + 1;
                }
                if (visibleColumns.name) {
                    row['Name'] = user.name || '';
                }
                if (visibleColumns.email) {
                    row['Email'] = user.email || '';
                }
                if (visibleColumns.date) {
                    row['Date'] = user.createdAt ? formatDate(user.createdAt) : '';
                }

                return row;
            });

            // Create a new workbook
            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

            // Auto-size columns
            const maxWidth = 20;
            const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
            worksheet['!cols'] = wscols;

            // Generate file name with current date
            const date = new Date();
            const fileName = `Users_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

            // Download the file
            XLSX.writeFile(workbook, fileName);
            dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
        } catch (error) {
            dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
        }
    };

    const handleRefresh = () => {
        dispatch(getAllUser());
        setSearchQuery("");
        setCurrentPage(1);
    };

    return (
        <>
            <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
                <section className="py-5">
                    <h1 className="text-2xl font-semibold text-black">All User</h1>
                </section>

                <div className="w-full">
                    <div className="bg-white rounded-lg shadow-md">
                        {/* Header */}
                        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
                            <div className='flex gap-2 md:gap-5 sm:justify-between'>

                                {/* Search Bar */}
                                <div className="relative  max-w-md">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                            </div>

                            <div>
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 justify-end mt-2">
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                                            className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors"
                                            title="Show/Hide Columns"
                                        >
                                            <Filter size={20} />
                                        </button>

                                        {showColumnDropdown && (
                                            <div className="absolute right-0 mt-2 w-44 md600:w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ">
                                                <div className="px-3 py-2 md600:px-4 md:py-3 border-b border-gray-200">
                                                    <h3 className="text-sm font-semibold text-gray-700">Show/Hide Column</h3>
                                                </div>
                                                <div className="max-h-44 overflow-y-auto">
                                                    {Object.keys(visibleColumns).map((column) => (
                                                        <label
                                                            key={column}
                                                            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={visibleColumns[column]}
                                                                onChange={() => toggleColumn(column)}
                                                                className="w-4 h-4 text-[#876B56] bg-gray-100 border-gray-300 rounded focus:ring-[#B79982] focus:ring-2"
                                                            />
                                                            <span className="ml-2 text-sm text-gray-700 capitalize">
                                                                {column}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh" onClick={handleRefresh}>
                                        <RefreshCw size={20} />
                                    </button>
                                    <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download" onClick={handleDownloadExcel}>
                                        <Download size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap">
                                <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10">
                                    <tr>
                                        {visibleColumns.No && (
                                            <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">No.</th>
                                        )}
                                        {visibleColumns.name && (
                                            <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Name</th>
                                        )}
                                        {visibleColumns.email && (
                                            <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Email</th>
                                        )}
                                        {visibleColumns.date && (
                                            <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Date</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                                                    <p className="text-lg font-medium">Loading...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : currentData.length > 0 ? (
                                        currentData.map((user, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                                            >
                                                {visibleColumns.No && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{index + 1}</td>
                                                )}
                                                {visibleColumns.name && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-3">
                                                            {user.photo ? (
                                                                <img src={user.photo}
                                                                    alt={user.name}
                                                                    className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-full object-cover bg-[#ECD292] flex items-center justify-center font-[600] text-[#8B752F] text-lg uppercase">
                                                                    {(() => {
                                                                        if (user.name) {
                                                                            const words = user.name.trim().split(/\s+/);
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
                                                            <span className="text-sm font-medium text-gray-800 capitalize">{user.name}</span>
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.email && (
                                                    <td className="px-5 py-2 md600:py-3 lg:px-6">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Mail size={16} className='text-red-600' />
                                                            {user.email}
                                                        </div>
                                                    </td>
                                                )}
                                                {visibleColumns.date && (
                                                    <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{user.createdAt ? formatDate(user.createdAt) : ''}</td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-500">
                                                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                    </svg>
                                                    <p className="text-lg font-medium">No data available</p>
                                                    <p className="text-sm mt-1">Try adjusting your search or filters</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                            <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
                                <span className="text-sm text-gray-600">Items per page:</span>
                                <div className="relative">
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => {
                                            setItemsPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B79982] appearance-none bg-white cursor-pointer"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-3  md600:gap-2 md:gap-3">
                                <span className="text-sm text-gray-600">
                                    {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems}
                                </span>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default User;