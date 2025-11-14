import React from 'react';
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { MdLocalHotel } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { LuNotebook } from "react-icons/lu";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../Style/Sujal.css';
import { CustomActiveShapePieChart } from '../component/CustomActiveShapePieChart ';
import { FaEdit, FaTrash, FaEllipsisV } from 'react-icons/fa';
import { IoDocumentText } from 'react-icons/io5';

const CustomTooltip = ({ active, payload, label }) => {
  console.log('payload', payload);
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-md">
        <p className="font-bold text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="font-medium">
            {entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {

  const data = [
    {
      id: 1,
      Title: 'John',
      value: 20,
      Icon: <LuNotebook />,
      color: "#F7DF9C",  // pale yellow
      barvalue: 50,
      barcolor: '#E3C78A'  // tan
    },
    {
      id: 2,
      Title: 'Jane',
      value: 18,
      Icon: <MdLocalHotel />,
      color: "#B79982",  // muted sand
      barvalue: 50,
      barcolor: '#A3876A'  // taupe brown
    },
    {
      id: 3,
      Title: 'John',
      value: 20,
      Icon: <FaUsers />,
      color: "#876B56",  // brown
      barvalue: 75,
      barcolor: '#755647'  // deep brown
    },
    {
      id: 4,
      Title: 'Jane',
      value: 18,
      Icon: <PiCurrencyDollarSimpleBold />,
      color: "#A3876A",  // taupe brown
      barvalue: 50,
      barcolor: '#B79982'  // muted sand
    }
  ]

  const areaData = [
    {
      name: 'Page A',
      uv: 4000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: 'Page B',
      uv: 3000,
      pv: 1398,
      amt: 2210,
    },
    {
      name: 'Page C',
      uv: 2000,
      pv: 9800,
      amt: 2290,
    },
    {
      name: 'Page D',
      uv: 2780,
      pv: 3908,
      amt: 2000,
    },
    {
      name: 'Page E',
      uv: 1890,
      pv: 4800,
      amt: 2181,
    },
    {
      name: 'Page F',
      uv: 2390,
      pv: 3800,
      amt: 2500,
    },
    {
      name: 'Page G',
      uv: 3490,
      pv: 4300,
      amt: 2100,
    },
  ];

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


        <div className='grid grid-cols-1 md600:grid-cols-2 xl:grid-cols-4 mt-3 gap-5 md600:gap-4'>
          {data.map((item) => (
            <div className='bg-white rounded-lg shadow-md p-4 md600:p-3 md600:m-0'>
              <div className='flex items-center justify-between'>
                <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: item.color }}>
                  <div className='text-[22px] text-white'>{item.Icon}</div>
                </div>
                <div className='text-center'>
                  <h2 className='text-lg font-bold text-gray-800'>{item.Title}</h2>
                  <p className='text-lg font-bold text-gray-800'>{item.value}</p>
                </div>
              </div>
              <div className='w-full h-4 bg-gray-200 rounded-full mt-10 relative '>
                <div className='h-full rounded-full' style={{ width: `${item.barvalue}%`, background: `linear-gradient(90deg, ${item.barcolor} 0%, ${item.barcolor}80 100%)` }}></div>
                <div className='absolute inset-0 flex items-center justify-start pl-2 text-xs text-white font-bold' style={{ width: `${item.barvalue}%` }}>
                  {item.barvalue}%
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-5 flex justify-between gap-5'>
          <div className='bg-white rounded-lg p-5 V_chart_1_div'>
            <div className='flex items-center justify-between'>
              <p className='text-[20px] '>Title</p>
              <p className='text-[20px] '>Actions</p>
            </div>
            <AreaChart
              className='V_chart_1'
              // style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
              responsive
              data={areaData}
              margin={{
                top: 20,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              {/* <CartesianGrid strokeDasharray="3 3" /> */}
              <XAxis dataKey="name" />
              <YAxis width="auto" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="uv" stackId="1" stroke="#B79982" fill="#B79982" />
              <Area type="monotone" dataKey="pv" stackId="1" stroke="#E3C78A" fill="#E3C78A" />
              {/* <Area type="monotone" dataKey="amt" stackId="1" stroke="#ffc658" fill="#ffc658" /> */}
            </AreaChart>
          </div>
          <div className='bg-white rounded-lg p-5 V_chart_2_div'>
            <div className='flex items-center justify-between'>
              <p className='text-[20px] '>Title</p>
              <p className='text-[20px] '>Actions</p>
            </div>
            <CustomActiveShapePieChart />
          </div>
        </div >


        <div className="w-full bg-[#F0F3FB] mt-5">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Booking Details</h2>
              <button className="text-gray-600 hover:text-[#876B56] transition-colors">
                <FaEllipsisV size={20} />
              </button>
            </div>

            {/* Scrollable Table with Custom Scrollbar */}
            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">#</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Check In</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Check Out</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Phone</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Room Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Documents</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-[#755647]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-sm text-gray-700">{booking.checkIn}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{booking.checkOut}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{booking.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <span className="inline-flex items-center justify-center w-24 h-8 rounded-md text-xs font-semibold bg-[#B79982]/20 text-[#755647] border border-[#B79982]/30">
                            {booking.roomType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-[#EC5C09] hover:text-[#EC0927] transition-colors p-2 hover:bg-orange-50 rounded-md">
                          <IoDocumentText size={22} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button className="text-[#4F15E0] hover:text-[#3d0fb3] transition-colors p-2 hover:bg-purple-50 rounded-md">
                            <FaEdit size={18} />
                          </button>
                          <button className="text-[#EC5C09] hover:text-[#EC0927] transition-colors p-2 hover:bg-orange-50 rounded-md">
                            <FaTrash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Custom Scrollbar Styles */}
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

      </div>
    </>
  )
}
