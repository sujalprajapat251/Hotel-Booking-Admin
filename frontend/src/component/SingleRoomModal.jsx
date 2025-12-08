import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getRoomById } from '../Redux/Slice/createRoomSlice';
import { IMAGE_URL } from '../Utils/baseUrl';

export default function SingleRoomModal({ id, onClose }) {
    const room = useSelector((state) => state.rooms.selectedRoom)
    const [selectedImage, setSelectedImage] = useState(null);
    useEffect(() => {
        setSelectedImage(room?.images?.[0])

    }, [room])
    const getImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http')) return imagePath;
        return `${IMAGE_URL}${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
    };
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(getRoomById(id))
    }, [id])

    useEffect(() => {
        const scrollY = window.scrollY;
    
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
    
        return () => {
          document.body.style.position = '';
          document.body.style.top = '';
          document.body.style.width = '';
          window.scrollTo(0, scrollY);
        };
      }, []);
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-md shadow-[0_25px_60px_rgba(117,86,71,0.25)] border border-primary/40 backdrop-blur-md scrollbar-hide">
                <div className="flex items-center justify-between px-6 py-4   rounded-t-md shadow-inner sticky top-0 left-0 bg-white z-10">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                        <span className="text-xl font-semibold">
                            Room Detail
                        </span>
                    </div>

                    <button
                        onClick={onClose}
                        className=" text-3xl leading-none hover:text-gray-200 transition-colors"
                    >
                        ×
                    </button>
                </div>
                <div className='py-5'>
                <div className='px-5'>
                    <h1 className='text-3xl font-semibold text-senary'>{room?.roomNumber}</h1>
                    <div className='py-2 flex flex-wrap gap-3'>
                        <span className='capitalize text-sm text-senary bg-senary/20 px-2 py-1 mx-1 rounded text-nowrap'>{room?.viewType}</span>
                        <span className='capitalize text-sm text-senary bg-senary/20 px-2 py-1  mx-1 rounded text-nowrap'>{room?.roomType?.roomType}</span>
                        <span className='capitalize text-sm text-senary bg-senary/20 px-2 py-1  mx-1 rounded text-nowrap'>{room?.floor} floor</span>
                    </div>
                </div>

                <div className='flex flex-col md:flex-row  p-5 gap-8 '>
                    <div className='lg:w-1/3 md:1/2 w-full h-full'>
                        {selectedImage ? (
                            <img
                                src={getImageUrl(selectedImage)}
                                alt={`Room ${room?.roomNumber}`}
                                className="w-full h-full object-cover aspect-square"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                        {room?.images?.length > 0 && (
                            <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100 justify-start overflow-auto">
                                {room?.images?.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${selectedImage === img
                                            ? 'border-senary shadow-md scale-105'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={getImageUrl(img)}
                                            alt={`Room ${room.roomNumber} view ${idx + 2}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/64x64?text=No+Image';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className='lg:w-2/3 md:1/2 w-full'>

                        <div className='py-2 capitalize border-b-2'>
                            <h2 className='text-lg font-semibold capitalize text-senary'>capacity</h2>
                            <div className='flex text-xs  p-2'>
                                <div className='capitalize text-senary  bg-senary/20 px-2 py-1 mx-1 rounded'>adults : {room?.capacity?.adults}</div>
                                <div className='capitalize text-senary bg-senary/20 px-2 py-1 mx-1 rounded'>children : {room?.capacity?.children}</div>
                            </div>
                        </div>
                        <div className='py-2 capitalize border-b-2'>
                            <h2 className='text-lg font-semibold capitalize text-senary'>price</h2>
                            <div className='flex text-xs  p-2'>
                                <div className='capitalize text-senary bg-senary/20 px-2 py-1 mx-1 rounded'>base :  ${room?.price?.base}</div>
                                <div className='capitalize text-senary bg-senary/20 px-2 py-1 mx-1 rounded'>weekend :  ${room?.price?.weekend}</div>
                            </div>
                        </div>
                        <div className='py-2 capitalize border-b-2'>
                            <h2 className='text-lg font-semibold capitalize text-senary'>Bed</h2>
                            <div className='flex text-xs  p-2'>
                                <div className='capitalize text-senary bg-senary/20 px-2 py-1 mx-1 rounded'>child: {room?.bed?.childBed?.count} {room?.bed?.childBed?.type}</div>
                                <div className='capitalize text-senary bg-senary/20 px-2 py-1 mx-1 rounded'>main :  {room?.bed?.mainBed?.count} {room?.bed?.mainBed?.type}</div>
                            </div>
                        </div>
                        {/* Amenities */}
                        {room?.features?.length > 0 && (
                            <div className='py-2 capitalize border-b-2'>
                                <h2 className='text-lg font-semibold capitalize text-senary'>Amenities</h2>
                                <div className="flex flex-wrap items-center gap-1.5  p-2 text-xs">
                                    {room?.features?.map((feature, idx) => {
                                        const label =
                                            typeof feature === 'object' && feature.feature
                                                ? feature.feature
                                                : feature;
                                        return (
                                            <span
                                                key={idx}
                                                className="px-2.5 py-1 rounded-full bg-secondary text-senary font-medium"
                                                title={label}
                                            >
                                                {label}
                                            </span>
                                        );
                                    })}

                                </div>
                            </div>
                        )}
                        <div className='py-3 capitalize border-b-2'>
                            <h2 className='text-lg font-semibold capitalize text-senary'>Pet Friendly : {room?.isPetFriendly ? <span className='capitalize text-green-800 text-xs bg-green-800/20 px-2 py-1 mx-1 rounded'>yes</span> : <span className='capitalize text-red-800 text-xs bg-red-800/20 px-2 py-1 mx-1 rounded'>no</span>}</h2>
                        </div>
                        <div className='py-3 capitalize border-b-2'>
                            <h2 className='text-lg font-semibold capitalize text-senary'>Smoking Allowed : {room?.isSmokingAllowed ? <span className='capitalize text-green-800 text-xs bg-green-800/20 px-2 py-1 mx-1 rounded'>yes</span> : <span className='capitalize text-red-800 text-xs bg-red-800/20 px-2 py-1 mx-1 rounded'>no</span>}</h2>
                        </div>
                        <div className='py-3 capitalize border-b-2'>
                            <h2 className='text-lg font-semibold capitalize text-senary'>cleaning status : {room?.cleanStatus === 'Dirty' ? <span className='capitalize text-red-800 text-xs bg-red-800/20 px-2 py-1 mx-1 rounded'>Dirty</span> : room?.cleanStatus === 'Pending' ? <span className='capitalize text-yellow-600 text-xs bg-yellow-600/20 px-2 py-1 mx-1 rounded'>Pending</span> : room?.cleanStatus === 'In-Progress' ? <span className='capitalize text-blue-800 text-xs bg-blue-800/20 px-2 py-1 mx-1 rounded'>In Progress</span> : room?.cleanStatus === 'Completed' ? <span className='capitalize text-green-800 text-xs bg-green-800/20 px-2 py-1 mx-1 rounded'>Completed</span> : <span className='capitalize text-senary text-xs bg-senary/20 px-2 py-1 mx-1 rounded'>clean</span>}</h2>
                        </div>
                    </div>
                </div>
                {room?.currentBooking && (
                    <div className='p-5 pb-0 '>
                        <h2 className='text-lg font-semibold capitalize text-senary'>current booking</h2>
                        <div className='md:p-3 capitalize flex justify-between border-b-2'>
                            <div>
                                <h2 className='text-lg font-medium'>{room?.currentBooking?.guest?.fullName}</h2>
                                <span className='md:text-xs text-[10px] text-gray-500'>{room?.currentBooking?.guest?.email}  / {room?.currentBooking?.guest?.countrycode ? room?.currentBooking?.guest?.countrycode : ""} {room?.currentBooking?.guest?.phone}</span>
                            </div>
                            <div>
                                {room?.currentBooking?.payment?.status === 'Paid' ? <span className='capitalize text-green-800 text-xs bg-green-800/20 px-2 py-1 ms-auto rounded mb-2'>Paid</span> : <span className='capitalize text-red-800 text-xs bg-red-800/20 px-2 py-1 ms-auto rounded mb-2'>unpaid</span>}
                                <p className='md:text-xs text-[10px] text-gray-500'>{room?.currentBooking?.reservation?.checkInDate.split('T')[0]}  To {room?.currentBooking?.reservation?.checkOutDate.split('T')[0]}</p>
                            </div>
                        </div>
                    </div>
                )}
                {room?.futureBookings.length > 0 && (
                    <div className='p-5'>
                        <h2 className='text-lg font-semibold capitalize text-senary'>Upcoming booking</h2>
                        {room?.futureBookings?.map((booking,ind)=>{
                            return (
                                <div className='md:p-3 capitalize flex flex-wrap gap-2 justify-between border-b-2'>
                                <div>
                                    <h2 className='text-lg font-medium'>{booking?.guest?.fullName}</h2>
                                    <span className='md:text-xs text-[10px] text-gray-500'>{booking?.guest?.email}  / {booking?.guest?.countrycode ? booking?.guest?.countrycode : ""} {booking?.guest?.phone}</span>
                                </div>
                                <div>
                                    {booking?.payment?.status === 'Paid' ? <span className='capitalize text-green-800 text-xs bg-green-800/20 px-2 py-1 ms-auto rounded mb-2'>Paid</span> : <span className='capitalize text-red-800 text-xs bg-red-800/20 px-2 py-1 ms-auto rounded mb-2'>unpaid</span>}
                                    <p className='md:text-xs text-[10px] text-gray-500 mt-1'>{booking?.reservation?.checkInDate.split('T')[0]}  To {booking?.reservation?.checkOutDate.split('T')[0]}</p>
                                </div>
                            </div>
                            )
                        })}
                       
                    </div>
                )}
                </div>
               
            </div>
        </div>
    )
}
