import React, { useEffect, useRef, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { Search, Filter, RefreshCw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from "react-redux";
import { setAlert } from '../Redux/Slice/alert.slice';
import { getAllReview } from "../Redux/Slice/review.slice";
import userImg from "../Images/user.png";

const Review = () => {
	const dispatch = useDispatch();
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(5);
	const [showColumnDropdown, setShowColumnDropdown] = useState(false);
	const [imageUrl, setImageUrl] = useState(userImg);

	const { currentUser, loading, success, message } = useSelector(
		(state) => state.staff
	);

	useEffect(() => {
		if (currentUser && currentUser.image) {
			setImageUrl(currentUser.image);
		} else {
			setImageUrl(userImg);
		}
	}, [currentUser]);

	const [visibleColumns, setVisibleColumns] = useState({
		No: true,
		Type: true,
		User: true,
		Title: true,
		CreatedAt: true,
	});
	const dropdownRef = useRef(null);

	const getReview = useSelector((state) => state.review.reviews);

	
	const formatDate = (dateString) => {
		if (!dateString) return '';
		const date = new Date(dateString);
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear();
		return `${day}/${month}/${year}`;
	  };


	// Add filtering logic search functionallty
	const filteredBookings = getReview.filter(staff =>
		staff.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
		staff.reviewType.toLowerCase().includes(searchQuery.toLowerCase()) ||
		staff.userId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
		staff.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
		(staff?.createdAt && ( formatDate(staff.createdAt).toLowerCase().includes(searchQuery.toLowerCase()) || formatDate(staff.createdAt).replace(/\//g, "-").toLowerCase().includes(searchQuery.toLowerCase()))) 
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


	// Calculate rating breakdown from actual review data
	const calculateRatingBreakdown = (reviews) => {
		const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

		reviews.forEach(review => {
			const rating = review.rating;
			if (rating >= 1 && rating <= 5) {
				breakdown[rating]++;
			}
		});

		return [
			{ stars: 5, count: breakdown[5] },
			{ stars: 4, count: breakdown[4] },
			{ stars: 3, count: breakdown[3] },
			{ stars: 2, count: breakdown[2] },
			{ stars: 1, count: breakdown[1] },
		];
	};

	const ratingBreakdown = calculateRatingBreakdown(getReview);
	const totalReviews = ratingBreakdown.reduce((a, b) => a + b.count, 0);

	const calculateAverage = (reviews) => {
		if (reviews.length === 0) return 0;
		const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
		return (sum / reviews.length).toFixed(1);
	};

	const averageRating = calculateAverage(getReview);

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

	const handleDownloadExcel = () => {
		try {
			// Check if there's data to export
			if (filteredBookings.length === 0) {
				dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
				return;
			}
			// Prepare data for Excel
			const excelData = filteredBookings.map((item, index) => {
				const row = {};

				if (visibleColumns.No) {
					row['No.'] = startIndex + index + 1; // Use correct numbering
				}
				if (visibleColumns.Type) {
					row['Type'] = item?.reviewType === "room" ? item?.roomId?.roomType?.roomType : item?.reviewType || '';
				}
				if (visibleColumns.User) {
					row['Reviewer'] = item.userId.name || '';
				}
				if (visibleColumns.Title) {
					row['ReviewText'] = item.title || '';
				}
				if (visibleColumns.Title) {
					row['ReviewTitle'] = item.comment || '';
				}
				if (visibleColumns.CreatedAt) {
					row['Date'] = formatDate(item.createdAt) || '';
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

	const handleRefresh = () => {
		dispatch(getAllReview());
		setSearchQuery("");
		setCurrentPage(1);
	};

	useEffect(() => {
		dispatch(getAllReview());
	}, [dispatch]);

	return (
		<section className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
			<section className="py-5">
				<h1 className="text-2xl font-semibold text-black">Review</h1>
			</section>
			<div className="w-full bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row gap-6">
				<div className="flex flex-col md:flex-row gap-6 w-full md:w-1/2">
					<div className="flex items-center flex-col">
						<img
							src={imageUrl}
							alt="user"
							className="w-20 h-20 rounded-full object-cover"
							onError={(e) => (e.target.src = userImg)}
						/>

						<h2 className="text-lg font-semibold text-gray-800 capitalize">{currentUser?.name || 'No Name'}</h2>

						<div className="flex items-center gap-2 text-sm text-gray-700">
							<span className="font-bold text-lg">{averageRating}</span>
							<AiFillStar className="text-yellow-400" />
							<a className="text-black underline">
								({totalReviews} reviews)
							</a>
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

								<a className="text-black text-sm underline whitespace-nowrap">
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
						{/* <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Reviews</p> */}

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
							<button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh" onClick={handleRefresh}>
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
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">No</th>
								)}
								{visibleColumns.Type && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Type</th>
								)}
								{visibleColumns.User && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Reviewer</th>
								)}
								{visibleColumns.Title && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Review</th>
								)}
								{visibleColumns.CreatedAt && (
									<th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Date</th>
								)}
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-200">
							{paginatedBookings.length === 0 ? (
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
							) : (
								paginatedBookings.map((item, index) => (
									<tr key={index} className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200">
										{visibleColumns.No && (
											<td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{startIndex + index + 1}</td>
										)}

										{visibleColumns.Type && (
											<td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
												{item?.reviewType === "room" ? item?.roomId?.roomType?.roomType : item?.reviewType}
											</td>
										)}

										{visibleColumns.User && (
											<td className="px-5 py-2 md600:py-3 lg:px-6">
												<div className="flex items-center gap-3">
													{item.photo ? (
														<img src={item.photo}
															alt={item.userId.name}
															className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
														/>
													) : (
														<div className="w-10 h-10 rounded-full object-cover bg-[#ECD292] flex items-center justify-center font-[600] text-[#8B752F] text-lg uppercase">
															{(() => {
																if (item.userId.name) {
																	const words = item.userId.name.trim().split(/\s+/);
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
													<span className="text-sm font-medium text-gray-800">{item.userId.name}</span>
												</div>
											</td>
										)}

										{visibleColumns.Title && (
											<td className="px-5 py-2 md600:py-3 lg:px-6">
												<div className="flex flex-col gap-1">
													<div className="flex items-center justify-between">
														{renderStars(item.rating)}
													</div>
													<h4 className="text-sm font-semibold text-gray-900">
														{item.title}
													</h4>
													<p className="text-sm text-gray-600 leading-relaxed whitespace-normal">
														{item.comment}
													</p>
												</div>
											</td>
										)}

										{visibleColumns.CreatedAt && (
											<td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
												{formatDate(item.createdAt)}
											</td>
										)}
									</tr>
								))
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