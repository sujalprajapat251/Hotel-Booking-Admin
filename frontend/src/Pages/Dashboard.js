import React, { useEffect, useState } from 'react';
import { LuCircleArrowDown, LuCircleArrowUp } from "react-icons/lu";
import '../Style/Sujal.css';
import { FaEllipsisV, FaWrench } from 'react-icons/fa';
import { HiOutlineDocumentChartBar } from "react-icons/hi2";
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import Newbookingchart from '../component/Newbookingchart';
import Availablerooms from '../component/Availavleroomschart';
import Revenuechart from '../component/Revenuechart';
import Checkoutchart from '../component/Checkoutchart';
import Reservationchart from '../component/Reservationchart';
import { MdBolt, MdPeople, MdBarChart, MdBuild, MdShield, MdPerson, MdDescription, MdSettings, MdNotifications, MdWarning, MdClock, MdLocalDining, MdBusiness, MdBeachAccess, MdLockClock, MdPunchClock, MdAccessTime } from 'react-icons/md';
import { BrickWallShield, BrickWallShieldIcon, LucideBrickWallShield } from 'lucide-react';
import Purpose from '../component/Purpose.jsx';
import HotelOccupancyDashboard from '../component/Hoteloccupancyratechart.jsx';
import BookingTrendsChart from '../component/Bookingtrendschart.jsx';
import { Home, Coffee, Heart, MoreHorizontal } from 'lucide-react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../Redux/Slice/bookingSlice.js';

export const Dashboard = () => {

  const dispatch = useDispatch();
  const [booking, setBooking] = useState([]);
  console.log('booking', booking);

  const {
    items
  } = useSelector((state) => state.booking);

  // ADD THIS useEffect - Transform Redux data to local state

  // ADD THIS useEffect - Transform Redux data to local state
  useEffect(() => {
    if (items && items.length > 0) {
      const formattedBookings = items
        .map((item, index) => ({
          id: item._id || item.id || index,
          name: item.guest?.fullName || 'N/A',
          checkIn: item.reservation?.checkInDate?.slice(0, 10) || 'N/A',
          checkOut: item.reservation?.checkOutDate?.slice(0, 10) || 'N/A',
          status: item.payment?.status || 'Pending',
          phone: item.guest?.phone || 'N/A',
          roomType: item.room?.roomType?.roomType || 'N/A',
          createdAt: item.createdAt || item.reservation?.checkInDate // For sorting by latest
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by latest first
        .slice(0, 8); // Take only first 10
      setBooking(formattedBookings);
    }
  }, [items]);



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

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case 'Paid':
  //       return '#4EB045';
  //     case 'Unpaid':
  //       return '#EC0927';
  //     case 'Pending':
  //       return '#F7DF9C';
  //     default:
  //       return '#gray';
  //   }
  // };

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

  const quickAccessItems = [
    { title: "Room Management", icon: <MdBusiness className="text-4xl" />, badge: 3, bgColor: "bg-primary/30", iconColor: "text-senary", description: "Manage room availability and assignments" },
    { title: "Staff Roster", icon: <MdPeople className="text-4xl" />, bgColor: "bg-secondary/40", iconColor: "text-quinary" },
    { title: "Reports", icon: <MdBarChart className="text-4xl" />, bgColor: "bg-primary/40", iconColor: "text-quaternary" },
    { title: "Maintenance", icon: <FaWrench className="text-4xl" />, badge: 7, bgColor: "bg-tertiary/30", iconColor: "text-senary" },
    { title: "Housekeeping", icon: <LucideBrickWallShield className="text-4xl" />, badge: 12, bgColor: "bg-quaternary/30", iconColor: "text-senary" },
    { title: "Guest Services", icon: <MdPerson className="text-4xl" />, bgColor: "bg-secondary/30", iconColor: "text-quinary" },
    { title: "Billing", icon: <MdDescription className="text-4xl" />, bgColor: "bg-primary/30", iconColor: "text-senary" },
    { title: "Settings", icon: <MdSettings className="text-4xl" />, badge: 3, bgColor: "bg-tertiary/40", iconColor: "text-quaternary" },
  ];

  const serviceSummary = [
    { label: "PENDING", count: 3, color: "text-yellow-600" },
    { label: "IN PROGRESS", count: 2, color: "text-quinary" },
    { label: "HIGH PRIORITY", count: 2, color: "text-red-600" },
  ];

  const recentRequests = [
    {
      title: "Extra towels and pillows",
      room: "Room 205",
      time: "39h ago",
      timeValue: "10m",
      status: "Pending",
      borderColor: "border-primary",
      bgColor: "bg-primary/10",
      icon: <MdLocalDining className="text-quaternary text-2xl" />
    },
    {
      title: "Air conditioning not working",
      room: "Room 312",
      time: "39h ago",
      timeValue: "45m",
      status: "In_progress",
      borderColor: "border-quinary",
      bgColor: "bg-quinary/10",
      icon: <FaWrench className="text-senary text-xl" />
    },
    {
      title: "Urgent cleaning required",
      room: "Room 108",
      time: "39h ago",
      timeValue: "20m",
      status: "Pending",
      borderColor: "border-red-400",
      bgColor: "bg-red-50",
      icon: <LucideBrickWallShield className="text-red-500 text-2xl" />
    },
  ];

  const revenueItems = [
    {
      icon: <Home className="w-6 h-6" />,
      name: 'Room Bookings',
      amount: '$89,520',
      percentage: '69.7%',
      growth: '+8.5%',
      bgColor: '#F7DF9C',
      iconColor: '#755647',
      isPositive: true
    },
    {
      icon: <Coffee className="w-6 h-6" />,
      name: 'Food & Beverage',
      amount: '$23,680',
      percentage: '18.4%',
      growth: '+12.3%',
      bgColor: '#E3C78A',
      iconColor: '#876B56',
      isPositive: true
    },
    {
      icon: <Heart className="w-6 h-6" />,
      name: 'Spa & Wellness',
      amount: '$8,750',
      percentage: '6.8%',
      growth: '-2.1%',
      bgColor: '#B79982',
      iconColor: '#FAF7F2',
      isPositive: false
    },
    {
      icon: <MoreHorizontal className="w-6 h-6" />,
      name: 'Other Services',
      amount: '$6,500',
      percentage: '5.1%',
      growth: '+5.7%',
      bgColor: '#A3876A',
      iconColor: '#FAF7F2',
      isPositive: true
    }
  ];

  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: 'Alis Smith',
      avatar: 'https://i.pravatar.cc/150?img=1',
      time: 'a week ago',
      rating: 3.5,
      review: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vel rutrum ex, at ornare mi. In quis scelerisque dui, eget rhoncus orci. Fusce et sodales ipsum. Nam id nunc euismod, aliquet arcu quis, mattis nisi.',
      likes: 0,
      dislikes: 0,
      userLiked: null // null = no action, true = liked, false = disliked
    },
    {
      id: 2,
      name: 'John Dio',
      avatar: 'https://i.pravatar.cc/150?img=2',
      time: 'a week ago',
      rating: 2.5,
      review: 'Nam quis ligula est. Nunc sed risus non turpis tristique tempor. Ut sollicitudin faucibus magna nec gravida. Suspendisse ullamcorper justo vel porta imperdiet. Nunc nec ipsum vel augue placerat faucibus.',
      likes: 0,
      dislikes: 0,
      userLiked: null
    }
  ]);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        // Full star
        stars.push(
          <svg key={i} className="w-5 h-5" viewBox="0 0 24 24" style={{ fill: '#755647' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        // Half star
        stars.push(
          <svg key={i} className="w-5 h-5" viewBox="0 0 24 24">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" style={{ stopColor: '#755647' }} />
                <stop offset="50%" style={{ stopColor: '#755647', stopOpacity: 0 }} />
              </linearGradient>
            </defs>
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={`url(#half-${i})`}
              stroke="#755647"
              strokeWidth="1"
            />
          </svg>
        );
      } else {
        // Empty star
        stars.push(
          <svg key={i} className="w-5 h-5 fill-none" viewBox="0 0 24 24" strokeWidth="1.5" style={{ stroke: '#755647' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      }
    }
    return stars;
  };

  const handleLike = (reviewId) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        if (review.userLiked === true) {
          // Already liked, remove like
          return { ...review, likes: review.likes - 1, userLiked: null };
        } else if (review.userLiked === false) {
          // Was disliked, switch to like
          return { ...review, likes: review.likes + 1, dislikes: review.dislikes - 1, userLiked: true };
        } else {
          // No action yet, add like
          return { ...review, likes: review.likes + 1, userLiked: true };
        }
      }
      return review;
    }));
  };

  const handleDislike = (reviewId) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        if (review.userLiked === false) {
          // Already disliked, remove dislike
          return { ...review, dislikes: review.dislikes - 1, userLiked: null };
        } else if (review.userLiked === true) {
          // Was liked, switch to dislike
          return { ...review, likes: review.likes - 1, dislikes: review.dislikes + 1, userLiked: false };
        } else {
          // No action yet, add dislike
          return { ...review, dislikes: review.dislikes + 1, userLiked: false };
        }
      }
      return review;
    }));
  };


  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);


  return (
    <>
      <div className='bg-[#F0F3FB] px-4 md:px-8 py-6 h-full'>

        <div className='sm:flex items-center justify-between'>
          <div>
            <p className='text-2xl font-semibold text-black'>Hi, Welcome back!</p>
            <p className='font-bold text-black'>Dashboard</p>
          </div>
          <div className='text-end'>
            <h2 className='font-bold md600:px-4 text-black'>Customer Ratings</h2>
            <div className='flex items-center md600:px-4 justify-end'>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='relative'>
                    <span className='text-gray-300 text-[16px] md600:text-[18px] lg:text-[20ox]' >★</span>
                    <span
                      className='text-[16px] md600:text-[18px] lg:text-[20ox] absolute top-0 left-0 overflow-hidden'
                      style={{
                        width: i < 4 ? '100%' : (i < 5 ? '50%' : '0%'),
                        color: '#F7DF9C'
                      }}
                    >
                      ★
                    </span>
                  </span>
                ))}
              </div>
              <span className='ml-2 text-black'>4.5/5</span>
            </div>
          </div>
        </div>


        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5'>
          <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-end'>
              <div className='mb-5'>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>New Booking</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>1879</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowUp className='text-[20px] text-green-500' />
                  <p className='text-green-500'>+7.5%</p>
                </div>
              </div>
              <div className='w-[220px] ms-auto'>
                <Newbookingchart />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-end'>
              <div className='mb-5'>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Available Rooms</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>55</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowDown className='text-[20px] text-red-500' />
                  <p className='text-red-500'>-5.7%</p>
                </div>
              </div>
              <div className='w-[180px] ms-auto'>
                <Availablerooms />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-end'>
              <div className='mb-5'>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Revenue</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>$2287</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowUp className='text-[20px] text-green-500' />
                  <p className='text-green-500'>+5.3%</p>
                </div>
              </div>
              <div className='w-[220px] h-[80px] ms-auto'>
                <Revenuechart />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-end'>
              <div className='mb-5'>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Checkout</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>567</p>
                <div className='flex gap-1 items-center mt-5'>
                  <LuCircleArrowDown className='text-[20px] text-red-500' />
                  <p className='text-red-500'>-2.4%</p>
                </div>
              </div>
              <div className='w-[220px] ms-auto'>
                <Checkoutchart />
              </div>
            </div>
          </div>
        </div>


        <div className='mt-5 rounded-lg shadow-sm w-full'>
          <div className='lg:flex gap-5 justify-between'>
            <div className='bg-white p-3 lg:p-5 rounded-xl lg:w-[32.33%] border-2' style={{
              borderColor: '#E3C78A',
              boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
            }}>
              <h2 className="text-lg font-semibold mb-3" style={{ color: '#755647' }}>Room Availability</h2>
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
                    <span className="text-sm mb-1" style={{ color: '#A3876A' }}>{stat.label}</span>
                    <p className="text-3xl font-semibold" style={{ color: '#755647' }}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='bg-white p-3 lg:p-5 rounded-xl lg:w-[66.34%] mt-5 lg:mt-0 border-2' style={{
              borderColor: '#E3C78A',
              boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
            }}>
              <h2 className="text-lg font-semibold" style={{ color: '#755647' }}>Reservation</h2>
              <Reservationchart />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 2xl:grid-cols-3 gap-5 mt-5">
          {/* Quick Access Section */}
          <div className="bg-white rounded-xl border-2 p-3 md:p-5" style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className="flex items-center gap-2 mb-6">
              <MdBolt className="text-2xl" style={{ color: '#755647' }} />
              <h2 className="text-lg md:text-xl font-semibold" style={{ color: '#755647' }}>Quick Access</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2  gap-5 ">
              {quickAccessItems.map((item, index) => (
                <div
                  key={index}
                  className="relative flex sm:flex-row 2xl:flex-col 2xl:text-center 3xl:flex-row items-center gap-4 3xl:gap-2 4xl:gap-4 p-3 md:p-5 3xl:p-2 4xl:p-5 rounded-xl border-2 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white"
                  style={{
                    borderColor: '#E3C78A'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#B79982';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E3C78A';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {index === 0 && (
                    <div className="absolute -top-16 left-0 text-white text-xs px-3 py-2 3xl:px-2 3xl:py-1 4xl:px-3 4xl:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-20" style={{
                      backgroundColor: '#755647'
                    }}>
                      {item.description}
                      <div className="absolute -bottom-1 left-4 w-2 h-2 transform rotate-45" style={{
                        backgroundColor: '#755647'
                      }}></div>
                    </div>
                  )}

                  <div className={`relative ${item.bgColor} ${item.iconColor} p-2 md:p-3 lg:p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    {item.icon}
                    {item.badge && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] md:text-[12px] font-bold rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center shadow-lg">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-sm md:text-base font-medium" style={{ color: '#755647' }}>
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Service Requests Section */}
          <div className="bg-white rounded-xl border-2 p-3 md:p-5" style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className="flex items-center gap-2 mb-4">
              <MdNotifications className="text-2xl" style={{ color: '#755647' }} />
              <h2 className="text-lg md:text-xl font-semibold" style={{ color: '#755647' }}>Service Requests</h2>
            </div>

            <p className="text-sm mb-6" style={{ color: '#A3876A' }}>Active requests requiring attention</p>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 2xl:grid-cols-1 3xl:grid-cols-3 gap-3 md:gap-4 mb-3">
              {serviceSummary.map((item, index) => (
                <div key={index} className="text-center 2xl:flex 3xl:flex-col 3xl:gap-0  items-center 2xl:gap-5 p-2 md:p-3 lg:p-4 rounded-lg" style={{
                  backgroundColor: 'rgba(247, 223, 156, 0.2)'
                }}>
                  <p className={`text-[20px] md:text-[24px] lg:text-[28px] font-bold ${item.color} mb-1`}>
                    {item.count}
                  </p>
                  <p className="text-[12px] md:text-[14px] lg:text-[18px] md:text-sm font-medium" style={{ color: '#755647' }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Requests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: '#755647' }}>Recent Requests</h3>
                <button className="text-sm font-medium transition-colors" style={{ color: '#876B56' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#755647'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#876B56'}
                >
                  View All
                </button>
              </div>

              {recentRequests.map((request, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 mdLgap-3 p-2 md:p-3 lg:p-4 rounded-lg border-l-4 ${request.borderColor} ${request.bgColor} hover:shadow-md transition-shadow duration-200`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {request.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm md:text-base" style={{ color: '#755647' }}>
                      {request.title}
                    </p>
                    <p className="text-xs md:text-sm mt-1" style={{ color: '#A3876A' }}>
                      {request.room} · {request.time}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${request.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                      }`}>
                      {request.status}
                    </span>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#A3876A' }}>
                      <MdAccessTime className="text-sm" />
                      <span>{request.timeValue}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="relative flex items-center justify-center gap-2 px-3 py-2 md:px-4 md:py-3 bg-white border-2 rounded-lg transition-all duration-200"
                  style={{ borderColor: '#E3C78A' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#B79982';
                    e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E3C78A';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <MdAccessTime className='text-[20px]' style={{ color: '#876B56' }} />
                  <span className="text-sm font-medium" style={{ color: '#755647' }}>Handle Pending</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>
                <button className="relative flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 rounded-lg transition-all duration-200"
                  style={{ borderColor: '#E3C78A' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#B79982';
                    e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E3C78A';
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <MdWarning className="text-red-500 text-[20px]" />
                  <span className="text-sm font-medium" style={{ color: '#755647' }}>Urgent Only</span>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    2
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <Purpose />
          </div>
        </div>


        <div className="w-full mt-5">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2" style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className="flex items-center justify-between p-4 border-b-2" style={{
              borderColor: '#E3C78A',
              background: 'linear-gradient(135deg, rgba(247, 223, 156, 0.1) 0%, rgba(227, 199, 138, 0.1) 100%)'
            }}>
              <h2 className="text-xl font-semibold" style={{ color: '#755647' }}>Current Booking Details</h2>
              <button className="transition-colors" style={{ color: '#A3876A' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#876B56'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#A3876A'}
              >
                <FaEllipsisV size={20} />
              </button>
            </div>

            <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)]" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#B79982 rgba(247, 223, 156, 0.2)'
            }}>
              <style>{`
                .themed-scrollbar::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                .themed-scrollbar::-webkit-scrollbar-track {
                  background: rgba(247, 223, 156, 0.2);
                  border-radius: 10px;
                }
                .themed-scrollbar::-webkit-scrollbar-thumb {
                  background: #B79982;
                  border-radius: 10px;
                }
                .themed-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: #876B56;
                }
              `}</style>
              <table className="w-full min-w-[1000px] themed-scrollbar">
                <thead className="sticky top-0 z-10 shadow-sm" style={{
                  background: 'linear-gradient(135deg, #F7DF9C 0%, #E3C78A 100%)'
                }}>
                  <tr>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>#</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Name</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Check In</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Check Out</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Status</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Phone</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Room Type</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Documents</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: '#E3C78A' }}>
                  {booking.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className="transition-all duration-200"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'linear-gradient(to right, rgba(247, 223, 156, 0.1), rgba(227, 199, 138, 0.1))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm font-medium" style={{ color: '#876B56' }}>{index + 1}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <div className="flex items-center gap-3">
                          {/* <div className="relative">
                            <img
                              src={booking.image}
                              alt={booking.name}
                              className="w-11 h-11 rounded-full object-cover border-2 shadow-sm"
                              style={{ borderColor: '#E3C78A' }}
                            />
                            <div className="absolute -bottom-0 -right-0 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(booking.status) }}></div>
                          </div> */}
                          <span className="text-sm font-semibold" style={{ color: '#755647' }}>{booking.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>{booking.checkIn}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>{booking.checkOut}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>{booking.phone}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-24 h-8 rounded-md text-xs font-semibold border" style={{
                            backgroundColor: 'rgba(183, 153, 130, 0.2)',
                            color: '#755647',
                            borderColor: 'rgba(183, 153, 130, 0.3)'
                          }}>
                            {/* {booking.roomType} */}
                            {booking.roomType?.split(' ')[0] || 'N/A'}
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
        </div>


        <div className='mt-5 rounded-lg shadow-sm w-full'>
          <div className='lg:flex gap-5 justify-between'>
            <div className='bg-white p-3 lg:p-5 rounded-xl w-full xl:w-[66.34%]  border-2' style={{
              borderColor: '#E3C78A',
              boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
            }}>
              <BookingTrendsChart />
            </div>
            <div className='bg-white p-3 lg:p-5 rounded-xl w-full xl:w-[32.33%] border-2 mt-5 lg:mt-0' style={{
              borderColor: '#E3C78A',
              boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
            }}>
              <HotelOccupancyDashboard />
            </div>
          </div>
        </div>

        {/* <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm"> */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5'>
          <div className="bg-white rounded-xl border-2 p-3 md:p-5" style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <h2 className="text-lg font-semibold" style={{ color: '#755647' }}>Revenue Summary</h2>
            <div className="text-center py-3">
              <div className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#755647' }}>$128,450</div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="font-medium" style={{ color: '#4EB045' }}>↗ +$13,220 (+11.5%)</span>
              </div>
              <div className="text-sm mt-1" style={{ color: '#A3876A' }}>vs. Previous Month</div>
            </div>

            <hr className='py-2' style={{ borderColor: '#E3C78A' }}></hr>

            {/* Revenue Breakdown Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#755647' }}>Revenue Breakdown</h2>
              {revenueItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                  style={{ backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(247, 223, 156, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Icon */}
                  <div className="p-3 rounded-lg flex-shrink-0" style={{
                    backgroundColor: item.bgColor,
                    color: item.iconColor
                  }}>
                    {item.icon}
                  </div>
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium" style={{ color: '#755647' }}>{item.name}</h3>
                      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: '#876B56' }}>{item.percentage}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="text-lg font-bold" style={{ color: '#755647' }}>{item.amount}</div>
                      <span className={`text-xs font-medium whitespace-nowrap`} style={{
                        color: item.isPositive ? '#4EB045' : '#EC0927'
                      }}>
                        {item.isPositive ? '↗' : '↘'} {item.growth}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className=" bg-white rounded-xl shadow-lg p-3 md:p-5 border-2" style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: '#755647' }}>Customer Review</h2>
              <a href="#" className="text-sm font-medium hover:underline transition-colors" style={{ color: '#876B56' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#755647'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#876B56'}
              >
                View All
              </a>
            </div>

            <hr className="mb-6" style={{ borderColor: '#E3C78A' }} />

            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="pb-6">
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={review.avatar}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2"
                      style={{ borderColor: '#E3C78A' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium px-3 py-1 rounded text-sm" style={{
                          color: '#755647',
                          backgroundColor: '#F7DF9C'
                        }}>
                          {review.name}
                        </span>
                        <span className="text-sm" style={{ color: '#A3876A' }}>{review.time}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed mb-3 ml-0" style={{ color: '#755647' }}>
                    {review.review}
                  </p>

                  <div className="flex items-center gap-2 ml-0">
                    <button
                      onClick={() => handleLike(review.id)}
                      className="flex items-center gap-1 transition-colors"
                      style={{
                        color: review.userLiked === true ? '#876B56' : '#A3876A'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#876B56'}
                      onMouseLeave={(e) => e.currentTarget.style.color = review.userLiked === true ? '#876B56' : '#A3876A'}
                    >
                      <ThumbsUp className="w-5 h-5" fill={review.userLiked === true ? 'currentColor' : 'none'} />
                      {review.likes > 0 && <span className="text-xs">{review.likes}</span>}
                    </button>
                    <button
                      onClick={() => handleDislike(review.id)}
                      className="flex items-center gap-1 transition-colors"
                      style={{
                        color: review.userLiked === false ? '#EC0927' : '#A3876A'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#EC0927'}
                      onMouseLeave={(e) => e.currentTarget.style.color = review.userLiked === false ? '#EC0927' : '#A3876A'}
                    >
                      <ThumbsDown className="w-5 h-5" fill={review.userLiked === false ? 'currentColor' : 'none'} />
                      {review.dislikes > 0 && <span className="text-xs">{review.dislikes}</span>}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 pt-4 border-t" style={{ borderColor: '#E3C78A' }}>
              <a href="#" className="text-sm font-medium hover:underline transition-colors" style={{ color: '#876B56' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#755647'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#876B56'}
              >
                View all Customer Reviews
              </a>
            </div>
          </div>

        </div>
        {/* </div> */}

      </div>
    </>
  )
}
