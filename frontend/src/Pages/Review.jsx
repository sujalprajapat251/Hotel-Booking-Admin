import React, { useEffect, useRef, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { Search, Filter, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDispatch } from "react-redux";
import { setAlert } from '../Redux/Slice/alert.slice';

const Review = () => {
 	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(4);
	const [showColumnDropdown, setShowColumnDropdown] = useState(false);
	const [visibleColumns, setVisibleColumns] = useState({
		No: true,
		Room: true,
		Reviewer: true,
		Review: true,
		Date: true,
		Status: true,
		Actions: true
	});
	const dropdownRef = useRef(null);

	const bookings = [
		{
			id: 1,
			name: "Liam Carter",
			email: "liam.carter@example.com",
			arrival: "14-03-2022",
			review: "Very peaceful stay and excellent service.",
			gender: "Published",
			mobile: "9876543210",
			room: "Executive Suite",
			payment: "Paid",
			image: "https://i.pravatar.cc/40?img=5",
			rating: 4,
			reviewTitle: "Great Experience!",
			reviewText: "I really enjoyed the stay here. The staff was helpful and the room was clean. Highly recommended!"
		},
		{
			id: 2,
			name: "Sophia Reed",
			email: "sophia.reed@example.com",
			arrival: "21-08-2020",
			review: "Good room but service was slow.",
			gender: "Pending",
			mobile: "9090909090",
			room: "Luxury King",
			payment: "Unpaid",
			image: "https://i.pravatar.cc/40?img=9",
			rating: 3,
			reviewTitle: "Decent Stay",
			reviewText: "The room was great but the food service took a long time. Needs improvement."
		},
		{
			id: 3,
			name: "Nathan Brooks",
			email: "nathan.brooks@example.com",
			arrival: "10-01-2019",
			review: "Amazing location and beautiful views.",
			gender: "Pending",
			mobile: "9988776655",
			room: "Ocean View",
			payment: "Unpaid",
			image: "https://i.pravatar.cc/40?img=8",
			rating: 5,
			reviewTitle: "Loved It!",
			reviewText: "The view from the balcony was incredible. I would stay here again for sure."
		},
		{
			id: 4,
			name: "Clara Jensen",
			email: "clara.jensen@example.com",
			arrival: "05-07-2023",
			review: "Staff were friendly and helpful.",
			gender: "Published",
			mobile: "8765432109",
			room: "Premium Deluxe",
			payment: "Paid",
			image: "https://i.pravatar.cc/40?img=15",
			rating: 4,
			reviewTitle: "Very Good",
			reviewText: "Comfortable room and good food. I really liked the cleanliness of the property."
		},
		{
			id: 5,
			name: "Oliver Shaw",
			email: "oliver.shaw@example.com",
			arrival: "18-09-2021",
			review: "Quiet environment and good ambience.",
			gender: "Published",
			mobile: "9123456789",
			room: "Business Class",
			payment: "Paid",
			image: "https://i.pravatar.cc/40?img=16",
			rating: 5,
			reviewTitle: "Outstanding!",
			reviewText: "Everything was perfect—from check-in to check-out. A very refreshing experience."
		},
		{
			id: 6,
			name: "Emily Stone",
			email: "emily.stone@example.com",
			arrival: "27-04-2020",
			review: "Food quality can be improved.",
			gender: "Pending",
			mobile: "7001234567",
			room: "Superior Twin",
			payment: "Unpaid",
			image: "https://i.pravatar.cc/40?img=21",
			rating: 2,
			reviewTitle: "Not Satisfied",
			reviewText: "The room was good but the food didn’t meet expectations. Hoping they improve it."
		},
		{
			id: 7,
			name: "Henry Walsh",
			email: "henry.walsh@example.com",
			arrival: "30-11-2019",
			review: "Good place for family stay.",
			gender: "Pending",
			mobile: "8654321900",
			room: "Family Suite",
			payment: "Unpaid",
			image: "https://i.pravatar.cc/40?img=23",
			rating: 4,
			reviewTitle: "Comfortable Stay",
			reviewText: "My family loved the stay. Spacious room and friendly service. Worth the price."
		},
		{
			id: 8,
			name: "Zara Mitchell",
			email: "zara.mitch@example.com",
			arrival: "19-02-2024",
			review: "Loved the interior and facilities.",
			gender: "Published",
			mobile: "8080808080",
			room: "Royal Suite",
			payment: "Paid",
			image: "https://i.pravatar.cc/40?img=25",
			rating: 5,
			reviewTitle: "Absolutely Wonderful",
			reviewText: "Everything exceeded expectations. From decor to cleanliness—fantastic stay!"
		}
	];

	// Add filtering logic search functionallty
	const filteredBookings = bookings.filter(staff =>
		staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		staff.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
		staff.reviewTitle.includes(searchQuery) ||
		staff.reviewText.toLowerCase().includes(searchQuery.toLowerCase()) ||
		staff.arrival.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

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

	const ratingBreakdown = [
		{ stars: 5, count: 90 },
		{ stars: 4, count: 21 },
		{ stars: 3, count: 30 },
		{ stars: 2, count: 14 },
		{ stars: 1, count: 9 },
	];

	const totalReviews = ratingBreakdown.reduce((a, b) => a + b.count, 0);

	const getStatusStyle = (status) => {
		switch (status) {
			case 'Published':
				return 'border border-green-500 text-green-600 bg-green-50';
			case 'Pending':
				return 'border border-yellow-500 text-yellow-600 bg-yellow-50';
			default:
				return 'border border-gray-500 text-gray-600 bg-gray-50';
		}
	};

	const renderStars = (count) => {
		return (
			<div className="flex items-center gap-1 text-[#F6A623]">
				{Array.from({ length: 5 }).map((_, i) => (
					<AiFillStar key={i}
						className={i < count ? "opacity-100" : "opacity-20"}
					/>
				))}
			</div>
		);
	};

	const handleRemoveReview = (item) => {
		dispatch(setAlert({ text: `Removing review of ${item.name}`, color: 'success' }));
		// filteredBookings = filteredBookings.filter(booking => booking.id !== item.id);
	}

	const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return dateString.replace(/-/g, '/');
    };

	const handleDownloadExcel = () => {
    try {
        // Check if there's data to export
        if (filteredBookings.length === 0) {
            dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
            return;
        }

        // Prepare data for Excel
        const excelData = filteredBookings.map((user, index) => {
            const row = {};

            if (visibleColumns.No) {
                row['No.'] = startIndex + index + 1; // Use correct numbering
            }
            if (visibleColumns.Room) {
                row['Room'] = user.room || '';
            }
            if (visibleColumns.Reviewer) {
                row['Reviewer'] = user.name || '';
            }
            if (!visibleColumns.reviewText) {
                row['ReviewText'] = user.reviewText || '';
            }
			if (!visibleColumns.reviewTitle) {
                row['ReviewTitle'] = user.reviewTitle || '';
            }
            if (visibleColumns.Date) {
                row['Date'] = formatDate(user.arrival) || '';
            }
            if (visibleColumns.Status) {
                row['Status'] = user.gender || '';
            }

            return row;
        });

        // Create a new workbook
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Reviews');

        // Auto-size columns
        const maxWidth = 30;
        const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
        worksheet['!cols'] = wscols;

        // Generate file name with current date
        const date = new Date();
        const fileName = `Reviews_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

        // Download the file
        XLSX.writeFile(workbook, fileName);
        dispatch(setAlert({ text: "Export completed successfully!", color: 'success' }));
    } catch (error) {
        console.error('Export error:', error);
        dispatch(setAlert({ text: "Export failed! Please try again.", color: 'error' }));
    }
};

	return (
		<section className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
			<section className="py-5">
				<h1 className="text-2xl font-semibold text-black">Review</h1>
			</section>
			<div className="w-full bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-6">
				<div className="flex flex-col md:flex-row gap-6 w-full md:w-1/2">
					<div className="flex items-center flex-col">
						<img
							src="https://i.pravatar.cc/54?img=47"
							alt="user"
							className="w-20 h-20 rounded-full object-cover"
						/>

						<h2 className="text-lg font-semibold text-gray-800">Ella Jones</h2>

						<div className="flex items-center gap-2 text-sm text-gray-700">
							<span className="font-bold text-lg">4.1</span>
							<AiFillStar className="text-yellow-400" />
							<a href="#" className="text-black underline">
								({totalReviews} reviews)
							</a>
						</div>
					</div>

					<div className="space-y-3">
						<div className="space-y-2">
							{["Communication", "Pricing", "Amazing Staff", "Food quality"].map((item, idx) => (
								<div key={idx} className="flex gap-3 items-center">
									<div className="flex text-yellow-400">
										<AiFillStar /> <AiFillStar /> <AiFillStar /> <AiFillStar /> <AiFillStar />
									</div>
									<span className="text-sm text-gray-700">{item}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				<div className="w-full md:w-1/2 space-y-3">
					{ratingBreakdown.map((item, index) => {
						const percent = (item.count / totalReviews) * 100;
						return (
							<div key={index} className="flex items-center gap-3 w-full">
								<span className="flex items-center justify-center w-10 text-sm text-gray-700">
									{item.stars} <AiFillStar className="text-[#F6A623]" />
								</span>

								<div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
									<div
										className="h-full bg-[#7c5e4c] rounded-full"
										style={{ width: `${percent}%` }}
									></div>
								</div>

								<a href="#" className="text-black text-sm underline whitespace-nowrap">
									{item.count} reviews
								</a>
							</div>
						);
					})}
				</div>
			</div>

			<div className="w-full bg-white rounded-lg shadow-md flex flex-col mt-8">
				<div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
					<div className='flex gap-2 md:gap-5 sm:justify-between'>
						<p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Reviews</p>

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
														{column === 'joiningDate' ? 'Joining Date' : column}
													</span>
												</label>
											))}
										</div>
									</div>
								)}
							</div>
							<button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh">
								<RefreshCw size={20} />
							</button>
							<button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download" onClick={handleDownloadExcel}>
								<Download size={20} />
							</button>
						</div>
					</div>
				</div>

				<div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
					<table className="w-full min-w-[1000px]">
						<thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10">
							<tr>
								{visibleColumns.No && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">#</th>
								)}
								{visibleColumns.Room && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Rooms</th>
								)}
								{visibleColumns.Reviewer && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Reviewer</th>
								)}
								{visibleColumns.Review && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Review</th>
								)}
								{visibleColumns.Date && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Date</th>
								)}
								{visibleColumns.Status && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Status</th>
								)}
								{visibleColumns.Actions && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Actions</th>
								)}
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-200">
							{paginatedBookings.map((item, index) => (
								<tr key={index} className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200">
									{visibleColumns.No && (
										<td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{index + 1}</td>
									)}

									{visibleColumns.Room && (
										<td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
											{item.room}
										</td>
									)}

									{visibleColumns.Reviewer && (
										<td className="px-5 py-2 md600:py-3 lg:px-6">
											<div className="flex items-center gap-3">
												<img
													src={item.image}
													alt={item.name}
													className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
												/>
												<span className="text-sm font-medium text-gray-800">{item.name}</span>
											</div>
										</td>
									)}

									{visibleColumns.Review && (
										<td className="px-5 py-2 md600:py-3 lg:px-6">
											<div className="flex flex-col gap-1">
												<div className="flex items-center justify-between">
													{renderStars(item.rating)}
												</div>
												<h4 className="text-sm font-semibold text-gray-900">
													{item.reviewTitle}
												</h4>
												<p className="text-sm text-gray-600 leading-relaxed whitespace-normal">
													{item.reviewText}
												</p>
											</div>
										</td>
									)}

									{visibleColumns.Date && (
										<td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
											{item.arrival}
										</td>
									)}

									{visibleColumns.Status && (
										<td className="px-5 py-2 md600:py-3 lg:px-6">
											<span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(item.gender)}`}>
												{item.gender}
											</span>
										</td>
									)}

									{visibleColumns.Actions && (
										<td className="px-5 py-2 md600:py-3 lg:px-6">
											<div className="flex gap-3 w-14">
												<div className="cursor-pointer"><FiEdit className="text-[#6777ef] text-[18px]" /></div>
												<div className="cursor-pointer" onClick={() => handleRemoveReview(item)}><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
											</div>
										</td>
									)}
								</tr>
							))}
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
							{startIndex + 1} - {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length}
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
		</section>
	);
};

export default Review;