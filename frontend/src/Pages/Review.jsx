import React, { useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { IoFilterSharp } from "react-icons/io5";
import { IoMdAddCircleOutline, IoMdRefresh } from "react-icons/io";
import { MdOutlineFileDownload } from "react-icons/md";
import editImg from '../Images/edit.svg'
import deleteImg from '../Images/delete.svg'

const Review = () => {

	const [searchQuery, setSearchQuery] = useState("");

	const bookings = [
		{
			id: 1,
			name: "Amanda Harvey",
			email: "amanda@site.com",
			arrival: "07-02-2018",
			review: "Good Service and friendly staff.",
			gender: "Published",
			mobile: "1234567890",
			room: "Delux",
			payment: "Paid",
			image: "https://i.pravatar.cc/40?img=5",
			rating: 5,
			reviewTitle: "I just love it!",
			reviewText: 'I bought this hat for my boyfriend, but then i found out he cheated on me so I kept it and I love it! I wear it all the time and there is no problem with the fit even though its a mens" hat.'
		},
		{
			id: 2,
			name: "David Harrison",
			email: "david@site.com",
			arrival: "12-02-2021",
			review: "Average experience, could be better.",
			gender: "Pending",
			mobile: "1234567890",
			room: "Super Delux",
			payment: "Unpaid",
			image: "https://i.pravatar.cc/40?img=9",
			rating: 3,
			reviewTitle: "Good product",
			reviewText: "A really well built shoe. It looks great and wears just as well. A great staple in tall caps.",
		},
		{
			id: 3,
			name: "Bob Dean",
			email: "bob@site.com",
			arrival: "23-05-2019",
			review: "Excellent amenities and great location.",
			gender: "Pending",
			mobile: "1234567890",
			room: "Double",
			payment: "Unpaid",
			image: "https://i.pravatar.cc/40?img=8",
			rating: 4,
			reviewTitle: "Very nice",
			reviewText: "These boots are awesome! They look great and are super comfortable. I wear them all the time and get compliments on them constantly.",
		},
		{
			id: 4,
			name: "Ella Lauda",
			email: "ella@site.com",
			arrival: "08-11-2020",
			review: "pleasant stay with helpful staff.",
			gender: "Published",
			mobile: "81234567890",
			room: "Premium",
			payment: "Paid",
			image: "https://i.pravatar.cc/40?img=15",
			rating: 2,
			reviewTitle: "Amazing boots",
			reviewText: "really comfortable and stylish. I get compliments on them all the time. Highly recommend to anyone looking for a great pair of boots!",
		},
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

			<div className="w-full bg-white rounded-lg py-6 shadow-md flex flex-col mt-8">
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
							{filteredBookings.map((item, index) => (
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
												className="w-10 h-10 rounded-full object-cover"
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
											<div className="cursor-pointer"><img src={editImg} alt="edit" /></div>
											<div className="cursor-pointer" onClick={() => handleRemoveReview(item)}><img src={deleteImg} alt="delete" /></div>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
};

export default Review;