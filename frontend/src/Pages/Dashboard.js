import React from 'react';
import { LuCircleArrowDown, LuCircleArrowUp} from "react-icons/lu";
import '../Style/Sujal.css';
import { FaEllipsisV } from 'react-icons/fa';
import { HiOutlineDocumentChartBar } from "react-icons/hi2";
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import Newbookingchart from '../component/Newbookingchart';
import Availablerooms from '../component/Availavleroomschart';
import Revenuechart from '../component/Revenuechart';
import Checkoutchart from '../component/Checkoutchart';
import Reservationchart from '../component/Reservationchart';

export const Dashboard = () => {

  const bookings = [
    {
      id: 1,
      name: 'John Deo',
      image: 'https://i.pravatar.cc/150?img=1',
      checkIn: '12-08-2019',
      checkOut: '15-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      roomType: 'Single'
    },
    {
      id: 2,
      name: 'Jens Brincker',
      image: 'https://i.pravatar.cc/150?img=2',
      checkIn: '13-08-2019',
      checkOut: '16-08-2019',
      status: 'Unpaid',
      phone: '(123)123456',
      roomType: 'Double'
    },
    {
      id: 3,
      name: 'Mark Hay',
      image: 'https://i.pravatar.cc/150?img=3',
      checkIn: '15-08-2019',
      checkOut: '18-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      roomType: 'Single'
    },
    {
      id: 4,
      name: 'Anthony Davie',
      image: 'https://i.pravatar.cc/150?img=4',
      checkIn: '16-08-2019',
      checkOut: '17-08-2019',
      status: 'Unpaid',
      phone: '(123)123456',
      roomType: 'King'
    },
    {
      id: 5,
      name: 'Alan Gilchrist',
      image: 'https://i.pravatar.cc/150?img=5',
      checkIn: '21-08-2019',
      checkOut: '23-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      roomType: 'Appartment'
    },
    {
      id: 6,
      name: 'Sue Woodger',
      image: 'https://i.pravatar.cc/150?img=6',
      checkIn: '25-08-2019',
      checkOut: '26-08-2019',
      status: 'Pending',
      phone: '(123)123456',
      roomType: 'Single'
    },
    {
      id: 7,
      name: 'David Perry',
      image: 'https://i.pravatar.cc/150?img=7',
      checkIn: '26-08-2019',
      checkOut: '29-08-2019',
      status: 'Unpaid',
      phone: '(123)123456',
      roomType: 'Single'
    },
    {
      id: 8,
      name: 'Sneha Pandit',
      image: 'https://i.pravatar.cc/150?img=8',
      checkIn: '27-08-2019',
      checkOut: '28-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      roomType: 'Double'
    },
    {
      id: 9,
      name: 'David Perry',
      image: 'https://i.pravatar.cc/150?img=7',
      checkIn: '26-08-2019',
      checkOut: '29-08-2019',
      status: 'Unpaid',
      phone: '(123)123456',
      roomType: 'Single'
    },
    {
      id: 10,
      name: 'Sneha Pandit',
      image: 'https://i.pravatar.cc/150?img=8',
      checkIn: '27-08-2019',
      checkOut: '28-08-2019',
      status: 'Paid',
      phone: '(123)123456',
      roomType: 'Double'
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'border border-green-500 text-green-600 bg-green-50';
      case 'Unpaid':
        return 'border border-red-500 text-red-600 bg-red-50';
      case 'Pending':
        return 'border border-yellow-500 text-yellow-600 bg-yellow-50';
      default:
        return 'border border-gray-500 text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
        return '#4EB045';
      case 'Unpaid':
        return '#EC0927';
      case 'Pending':
        return '#F7DF9C';
      default:
        return '#gray';
    }
  };

  const roomData = {
    occupied: 125,
    reserved: 87,
    available: 57,
    notReady: 25
  };

  const total = roomData.occupied + roomData.reserved + roomData.available + roomData.notReady;
  const percentages = {
    occupied: (roomData.occupied / total) * 100,
    reserved: (roomData.reserved / total) * 100,
    available: (roomData.available / total) * 100,
    notReady: (roomData.notReady / total) * 100
  };

  const colors = {
    primary: '#F7DF9C',
    secondary: '#E3C78A',
    tertiary: '#B79982',
    quaternary: '#A3876A',
    quinary: '#876B56',
    senary: '#755647',
  };


  const stats = [
    {
      label: 'Occupied',
      value: roomData.occupied,
      color: colors.primary
    },
    {
      label: 'Reserved',
      value: roomData.reserved,
      color: colors.tertiary
    },
    {
      label: 'Available',
      value: roomData.available,
      color: colors.quinary
    },
    {
      label: 'Not Ready',
      value: roomData.notReady,
      color: colors.senary
    }
  ];

  const dashboardData = {
    quickAccess: [
      { title: "Room Management", icon: "🏠", badge: 3 },
      { title: "Staff Roster", icon: "👥" },
      { title: "Reports", icon: "📊" },
      { title: "Maintenance", icon: "🛠️", badge: 7 },
      { title: "Housekeeping", icon: "🛡️", badge: 12 },
      { title: "Guest Services", icon: "🧑‍💼" },
      { title: "Billing", icon: "📄" },
      { title: "Settings", icon: "⚙️" },
    ],

    serviceSummary: [
      { label: "PENDING", count: 3, color: "text-yellow-500" },
      { label: "IN PROGRESS", count: 2, color: "text-blue-500" },
      { label: "HIGH PRIORITY", count: 2, color: "text-red-500" },
    ],

    recentRequests: [
      { title: "Extra towels and pillows", room: "Room 205", time: "20m", status: "Pending", color: "border-yellow-400" },
      { title: "Air conditioning not working", room: "Room 312", time: "45m", status: "In_progess", color: "border-blue-500" },
      { title: "Urgent cleaning required", room: "Room 108", time: "10m", status: "Pending", color: "border-red-500" },
    ],

    guestPurpose: {
      total: 252,
      chartData: [
        { name: "Business", value: 156, color: "#2F80ED" },
        { name: "Leisure", value: 96, color: "#27AE60" },
      ],
    },
  };



  return (
    <>
      <div className='p-3 sm:p-5 md600:p-3 md:p-5 bg-[#F0F3FB] h-full'>

        <div className='sm:flex items-center justify-between'>
          <div>
            <p className='text-[20px] md:text-[24px] xl:text-[28px] font-bold text-gray-800 md600:px-4'>Hi, Welcome back!</p>
            <p className='font-bold text-gray-800 md600:px-4'>Dashboard</p>
          </div>
          <div className='text-end'>
            <h2 className='font-bold text-gray-800 md600:px-4'>Customer Ratings</h2>
            <div className='flex items-center md600:px-4 justify-end'>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='relative'>
                    <span className='text-gray-300 text-[16px] md600:text-[18px] lg:text-[20ox]' >★</span>
                    <span
                      className='text-yellow-400 text-[16px] md600:text-[18px] lg:text-[20ox] absolute top-0 left-0 overflow-hidden'
                      style={{ width: i < 4 ? '100%' : (i < 5 ? '50%' : '0%') }}
                    >
                      ★
                    </span>
                  </span>
                ))}
              </div>
              <span className='ml-2 text-gray-700'>4.5/5</span>
            </div>
          </div>
        </div>


        <div className='grid grid-cols-1  md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5'>
          <div className='bg-white p-4  rounded-md'>
            <div className='sm:flex justify-between items-end '> {/* items-end aligns to bottom */}
              <div className='mb-5'>
                <p className='text-[20px] font-semibold'>New Booking</p>
                <p className='text-[16px] font-semibold'>1879</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowUp className='text-[20px] text-green-500' />
                  <p className='text-green-500'>+7.5%</p>
                </div>
              </div>
              <div className='w-[220px] ms-auto'> {/* Fixed width for chart */}
                <Newbookingchart />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-md'>
            <div className='sm:flex justify-between items-end'> {/* items-end aligns to bottom */}
              <div className='mb-5'>
                <p className='text-[20px] font-semibold'>Available Rooms</p>
                <p className='text-[16px] font-semibold'>55</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowDown className='text-[20px] text-red-500' />
                  <p className='text-red-500'>-5.7%</p>
                </div>
              </div>
              <div className='w-[180px] ms-auto'> {/* Fixed width for chart */}
                <Availablerooms />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-md'>
            <div className='sm:flex justify-between items-end'>
              <div className='mb-5'>
                <p className='text-[20px] font-semibold'>Revenue</p>
                <p className='text-[16px] font-semibold'>$2287</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowUp className='text-[20px] text-green-500' />
                  <p className='text-green-500'>+5.3%</p>
                </div>
              </div>
              <div className='w-[220px] h-[80px] ms-auto'> {/* Added height! */}
                <Revenuechart />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-md'>
            <div className='sm:flex justify-between items-end'> {/* items-end aligns to bottom */}
              <div className='mb-5'>
                <p className='text-[20px] font-semibold'>Checkout</p>
                <p className='text-[16px] font-semibold'>567</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowDown className='text-[20px] text-red-500' />
                  <p className='text-red-500'>-2.4%</p>
                </div>
              </div>
              <div className='w-[220px] ms-auto'> {/* Fixed width for chart */}
                <Checkoutchart />
              </div>
            </div>
          </div>
        </div>


        <div className=' mt-5 rounded-lg shadow-sm w-full'>
          <div className='lg:flex gap-5 justify-between'>
            <div className='bg-white p-3 lg:p-5 rounded-lg  lg:w-[35%]'>
              <h2 className="text-lg font-semibold mb-3 ">Room Availability</h2>
              <div className="flex h-8 xl:h-10 2xl:h-12 rounded-lg overflow-hidden mb-8">
                <div
                  style={{
                    width: `${percentages.occupied}%`,
                    backgroundColor: colors.primary
                  }}
                ></div>
                <div
                  style={{
                    width: `${percentages.reserved}%`,
                    backgroundColor: colors.tertiary
                  }}
                ></div>
                <div
                  style={{
                    width: `${percentages.available}%`,
                    backgroundColor: colors.quinary
                  }}
                ></div>
                <div
                  style={{
                    width: `${percentages.notReady}%`,
                    backgroundColor: colors.senary
                  }}
                ></div>
              </div>

              <div className="grid grid-cols-2 md:gap-3 lg:gap-5">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex flex-col border-l-4 pl-3"
                    style={{ borderColor: stat.color }}
                  >
                    <span className="text-sm text-gray-600 mb-1">{stat.label}</span>
                    <p className="text-3xl font-semibold">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-white p-3 lg:p-5 rounded-lg lg:w-[65%] mt-5 lg:mt-0'>
              <h2 className="text-lg font-semibold ">Reservation</h2>
              <Reservationchart />
            </div>
          </div>
        </div>


        <div className='grid grid-cols-3 gap-3'>

        </div>
        <div className='grid grid-cols-3 gap-3'>

        </div>
        <div className='grid grid-cols-3 gap-3'>

        </div>



        <div className="w-full bg-[#F0F3FB] mt-5">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Booking Details</h2>
              <button className="text-gray-600 hover:text-[#876B56] transition-colors">
                <FaEllipsisV size={20} />
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">#</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Name</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Check In</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Check Out</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Status</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Phone</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Room Type</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Documents</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                    >
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm font-medium text-gray-700">{index + 1}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={booking.image}
                              alt={booking.name}
                              className="w-11 h-11 rounded-full object-cover border-2 border-[#E3C78A] shadow-sm"
                            />
                            <div className="absolute -bottom-0 -right-0 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(booking.status) }}></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">{booking.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm text-gray-700">{booking.checkIn}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm text-gray-700">{booking.checkOut}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm text-gray-700">{booking.phone}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <div className="flex items-center ">
                          <span className="inline-flex items-center justify-center w-24 h-8 rounded-md text-xs font-semibold bg-[#B79982]/20 text-[#755647] border border-[#B79982]/30">
                            {booking.roomType}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <button className="text-[#EC5C09] hover:text-[#EC0927] transition-colors p-2 hover:bg-orange-50 rounded-md">
                          <HiOutlineDocumentChartBar size={22} />
                        </button>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <div className="flex items-center gap-3">
                          <button className="text-[#4F15E0] hover:text-[#3d0fb3] transition-colors p-2 hover:bg-purple-50 rounded-md">
                            <FiEdit size={18} />
                          </button>
                          <button className="text-[#EC5C09] hover:text-[#EC0927] transition-colors p-2 hover:bg-orange-50 rounded-md">
                            <RiDeleteBinLine size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(247, 223, 156, 0.2);
          border-radius: 10px;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #B79982;
          border-radius: 10px;
          transition: background 0.3s ease;
        }
        
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #876B56;
        }
      `}</style>
        </div>

      </div >
    </>
  )
}
