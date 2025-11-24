import React, { useEffect } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { IMAGE_URL } from '../../Utils/baseUrl';
import { getAllRestaurantitem } from '../../Redux/Slice/restaurantitemSlice';

export default function Dashboard() {

    const dispatch = useDispatch();
    const restaurant = useSelector((state) => state.restaurant.restaurant);
    const [selected, setSelected] = useState(restaurant[0]);

    useEffect(() => {
        setSelected(restaurant[0]);
    }, [restaurant]);

    useEffect(() => {
        dispatch(getAllRestaurantitem());
    }, [dispatch]);

    return (
        <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                <div className="w-full max-h-screen p-5">
                    <div className='bg-white rounded-lg shadow-md'>
                        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-150px)] sm:max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56] rounded-t-lg">
                            <ul className="space-y-2 p-2 sm:p-3">
                                {restaurant.length === 0 ? (
                                    <div className="bg-white px-4 py-8 sm:px-6 sm:py-10 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-base sm:text-lg font-medium">No data available</p>
                                            <p className="text-xs sm:text-sm mt-1">Try adjusting your search or filters</p>
                                        </div>
                                    </div>
                                ) : (
                                    restaurant.map((item, index) => (
                                        <li
                                            key={item.id}
                                            onClick={() => setSelected(item)}
                                            className={`flex items-center gap-2 sm:gap-3 cursor-pointer p-2 sm:p-4 rounded-xl border transition hover:bg-primary ${
                                                selected?._id === item._id ? "bg-primary" : "bg-white"
                                            }`}
                                        >
                                            {/* Index */}
                                            <div className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                {index + 1}
                                            </div>

                                            {/* Image & Name */}
                                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                <img
                                                    src={`${IMAGE_URL}${item.image}`}
                                                    alt={item.name}
                                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-[#E3C78A] flex-shrink-0"
                                                />
                                                <span className="text-xs sm:text-sm font-medium text-gray-800 truncate">
                                                    {item.name}
                                                </span>
                                            </div>

                                            {/* Category - Hidden on very small screens */}
                                            <div className="hidden sm:block px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                {item.category?.name}
                                            </div>

                                            {/* Price */}
                                            <div className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                                                ₹{item.price}
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="w-full max-h-screen p-5">
                    <div className="bg-white rounded-2xl shadow p-6 h-">
                        <h2 className="text-xl font-semibold mb-4">Details</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-lg font-semibold">{selected?.name || selected?.name}</p>
                                <p className="text-gray-500 text-sm">Category: {selected?.category?.name}</p>
                            </div>


                            {selected?.image && (
                                <img
                                    src={`${IMAGE_URL}${selected?.image}`}
                                    alt={selected?.name}
                                    className="w-20 rounded-xl shadow"
                                />
                            )}


                            <p className="text-gray-700">{selected?.description}</p>


                            <div className="flex items-center gap-3">
                                <p className="font-semibold">Price:</p>
                                <p className="text-green-600 font-bold">₹ {selected?.price}</p>
                            </div>


                            <div className="flex items-center gap-3">
                                <span className="font-semibold">Available:</span>
                                <span className={selected?.available ? "text-green-600" : "text-red-600"}>
                                    {selected?.available ? "Yes" : "No"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
