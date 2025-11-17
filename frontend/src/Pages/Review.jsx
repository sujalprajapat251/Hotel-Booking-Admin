import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { IoFilterSharp } from "react-icons/io5";
import { IoMdAddCircleOutline, IoMdRefresh } from "react-icons/io";
import { MdOutlineFileDownload, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";

const Review = () => {

	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(4);

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
	let filteredBookings;
	filteredBookings = bookings.filter((item) => {
		const query = searchQuery.toLowerCase();
		return (
			item.name.toLowerCase().includes(query) ||
			item.room.toLowerCase().includes(query) ||
			item.reviewTitle.toLowerCase().includes(query) ||
			item.reviewText.toLowerCase().includes(query) ||
			item.arrival.includes(query)
		);
	});

	const totalItems = filteredBookings.length;
	const totalPages = Math.ceil(totalItems / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

	const handlePageChange = (page) => {
		if (page >= 1 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const handleItemsPerPageChange = (e) => {
		setItemsPerPage(Number(e.target.value));
		setCurrentPage(1); // Reset to first page when items per page changes
	};

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
		alert(`Removing review of ${item.name}`);
		filteredBookings = filteredBookings.filter(booking => booking.id !== item.id);
	}

	return (
		<section className="p-10">
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

			<div className="w-full bg-white rounded-lg pt-6 shadow-md flex flex-col mt-8">
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
						<li><IoFilterSharp className="text-[#3f51b5] text-2xl cursor-pointer" /></li>
						<li><IoMdAddCircleOutline className="text-[#4caf50] text-2xl cursor-pointer" /></li>
						<li><IoMdRefresh className="text-[#795548] text-2xl cursor-pointer" /></li>
						<li><MdOutlineFileDownload className="text-[#2196f3] text-2xl cursor-pointer" /></li>
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
								<th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Rooms</th>
								<th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Reviewer</th>
								<th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Review</th>
								<th className="px-4 py-3 text-left text-sm font-bold text-[#755647] whitespace-nowrap">Date</th>
								<th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Status</th>
								<th className="px-4 py-3 text-left text-sm font-bold text-[#755647]">Actions</th>
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-200">
							{paginatedBookings.map((item, index) => (
								<tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
									<td className="px-4 py-3 align-center">
										<input
											type="checkbox"
											class="w-4 h-4 mt-1 align-top bg-white bg-no-repeat bg-center bg-contain border border-[rgba(231,234,243,0.7)] cursor-pointer"
										/>
									</td>

									<td className="px-4 py-3 text-[#333]">
										{item.room}
									</td>

									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<img
												src={item.image}
												alt={item.name}
												className="w-11 h-11 rounded-full object-cover border-2 border-[#E3C78A] shadow-sm"
											/>
											<span className="font-semibold text-[#333]">{item.name}</span>
										</div>
									</td>

									<td className="px-4 py-3">
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

									<td className="px-4 py-3 whitespace-nowrap">
										{item.arrival}
									</td>

									<td className="px-4 py-3">
										<span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(item.gender)}`}>
											{item.gender}
										</span>
									</td>

									<td className="px-4 py-3">
										<div className="flex gap-3 w-14">
											<div className="cursor-pointer"><FiEdit className="text-[#6777ef] text-[18px]" /></div>
											<div className="cursor-pointer" onClick={() => handleRemoveReview(item)}><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
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
		</section>
	);
};

export default Review;