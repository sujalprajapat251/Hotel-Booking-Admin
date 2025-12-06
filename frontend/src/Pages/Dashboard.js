import React, { useEffect, useState } from 'react';
import '../Style/Sujal.css';
import { FaWrench } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';
import Newbookingchart from '../component/Newbookingchart';
import Availablerooms from '../component/Availavleroomschart';
import Revenuechart from '../component/Revenuechart';
import Checkoutchart from '../component/Checkoutchart';
import Reservationchart from '../component/Reservationchart';
import { MdBolt, MdPeople, MdPerson, MdNotifications, MdBusiness, MdAccessTime, MdCheckCircle, MdCleaningServices } from 'react-icons/md';
import Purpose from '../component/Purpose.jsx';
import HotelOccupancyDashboard from '../component/Hoteloccupancyratechart.jsx';
import BookingTrendsChart from '../component/Bookingtrendschart.jsx';
import { Coffee, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../Redux/Slice/bookingSlice.js';
import { getAllReview } from '../Redux/Slice/review.slice.js';
import { Link, useNavigate } from 'react-router-dom'
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAllDashboard, getAllOrdersummery, getAllReservation, getAllRevenue, getAllRoomAvailability, getAllServicerequests } from '../Redux/Slice/dashboard.silce.js';
import { IoBedOutline } from "react-icons/io5";
import { IoIosRestaurant } from "react-icons/io";
import { GiMartini } from "react-icons/gi";
import { PiBroomLight } from 'react-icons/pi';
import { VscChecklist } from 'react-icons/vsc';
import { CiCoffeeCup } from 'react-icons/ci';
dayjs.extend(relativeTime);

export const Dashboard = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [booking, setBooking] = useState([]);

  const {
    items
  } = useSelector((state) => state.booking);

  const getRevenueData = useSelector((state) => state.dashboard.getRevenue);
  const getDashboardData = useSelector((state) => state.dashboard.getDashboard);
  const getRoomAvailability = useSelector((state) => state.dashboard.getRoomAvailability);
  const getServicerequests = useSelector((state) => state.dashboard.getServicerequests);

  useEffect(() => {
    if (items && items.length > 0) {
      const formattedBookings = items
        .map((item, index) => ({
          id: item._id || item.id || index,
          name: item.guest?.fullName || 'N/A',
          roomNo: item.roomNumber || 'N/A',
          checkIn: item.reservation?.checkInDate?.slice(0, 10) || 'N/A',
          checkOut: item.reservation?.checkOutDate?.slice(0, 10) || 'N/A',
          status: item.payment?.status || 'Pending',
          phone: item.guest?.phone || 'N/A',
          countrycode: item.guest?.countrycode || 'N/A',
          roomType: item.room?.roomType?.roomType || 'N/A',
          createdAt: item.createdAt || item.reservation?.checkInDate
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 8);
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

  const roomData = {
    occupied: getRoomAvailability?.occupied || 0,
    reserved: getRoomAvailability?.reserved || 0,
    available: getRoomAvailability?.available || 0,
    notReady: getRoomAvailability?.notReady || 0
  };

  const totalRooms = roomData.occupied + roomData.reserved + roomData.available + roomData.notReady;

  const percentages = {
    occupied: totalRooms > 0 ? (roomData.occupied / totalRooms) * 100 : 0,
    reserved: totalRooms > 0 ? (roomData.reserved / totalRooms) * 100 : 0,
    available: totalRooms > 0 ? (roomData.available / totalRooms) * 100 : 0,
    notReady: totalRooms > 0 ? (roomData.notReady / totalRooms) * 100 : 0
  };

  const colors = {
    primary: '#F4D9A6',
    tertiary: '#A3876A',
    quinary: '#8B6F47',
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
    {
      title: "Room Management",
      icon: <MdBusiness className="text-3xl" />,
      badge: 3,
      bgColor: "bg-primary/30",
      iconColor: "text-senary",
      description: "Monitor room availability, status, and assignments in real-time",
      path: "/rooms/available"
    },
    {
      title: "Staff Details",
      icon: <MdPeople className="text-3xl" />,
      bgColor: "bg-secondary/40",
      iconColor: "text-quinary",
      description: "View and manage staff profiles, roles, and shift schedules",
      path: "/staff/staffdetails"
    },
    {
      title: "Bookings",
      icon: <VscChecklist className="text-3xl" />,
      bgColor: "bg-primary/40",
      iconColor: "text-quaternary",
      description: "Track all reservations, check-ins, and guest booking details",
      path: "/allbookings"
    },
    {
      title: "User List",
      icon: <MdPerson className="text-3xl" />,
      bgColor: "bg-secondary/30",
      iconColor: "text-quinary",
      description: "Manage registered users, access levels, and account status",
      path: "/user"
    },
    {
      title: "Housekeeping",
      icon: <PiBroomLight className="text-3xl" />,
      badge: 12,
      bgColor: "bg-quaternary/30",
      iconColor: "text-senary",
      description: "Assign cleaning tasks and track housekeeping progress live",
      path: "/housekeeping"
    },
    {
      title: "Cafe Order",
      icon: <CiCoffeeCup className="text-3xl" />,
      badge: 7,
      bgColor: "bg-tertiary/30",
      iconColor: "text-senary",
      description: "Manage cafe orders, preparation status, and billing updates",
      path: "/cafe/cafeorder"
    },
    {
      title: "Bar Order",
      icon: <GiMartini className="text-3xl" />,
      bgColor: "bg-primary/30",
      iconColor: "text-senary",
      description: "Track bar orders, beverage inventory, and serving status",
      path: "/bar/barorder"
    },
    {
      title: "Restaurant Order",
      icon: <IoIosRestaurant className="text-3xl" />,
      badge: 3,
      bgColor: "bg-tertiary/40",
      iconColor: "text-quaternary",
      description: "Oversee restaurant orders, table requests, and kitchen workflow",
      path: "/restaurant/restaurantorder"
    },
  ];

  const serviceSummary = [
    { label: "PENDING", count: getServicerequests?.counts?.pending || 0, color: "text-yellow-600" },
    { label: "IN PROGRESS", count: getServicerequests?.counts?.inProgress || 0, color: "text-blue-600" },
    { label: "COMPLETED", count: getServicerequests?.counts?.completed || 0, color: "text-green-600" },
  ];

  const statusConfig = {
    Pending: {
      icon: <MdCleaningServices className="text-yellow-700 text-2xl" />,
      borderColor: "border-yellow-500",
      bgColor: "bg-yellow-50",
      statusColor: "bg-yellow-100 text-yellow-700"
    },

    InProgress: {
      icon: <FaWrench className="text-blue-700 text-2xl" />,
      borderColor: "border-blue-500",
      bgColor: "bg-blue-50",
      statusColor: "bg-blue-100 text-blue-700"
    },

    Completed: {
      icon: <MdCheckCircle className="text-green-700 text-2xl" />,
      borderColor: "border-green-500",
      bgColor: "bg-green-50",
      statusColor: "bg-green-100 text-green-700"
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const recentRequests = ([...(getServicerequests?.latestRequests || [])])
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 3).map((req) => {
      const normalizedStatus = req.cleanStatus.replace(/[-\s]/g, "");
      const config = statusConfig[normalizedStatus] || statusConfig["Pending"];

      return {
        title: `Cleaning requested by ${req?.cleanassign?.name ?? "Guest"}`,
        room: `Room ${req.roomNumber}`,
        time: formatTimeAgo(req.updatedAt),
        timeValue: formatTimeAgo(req.updatedAt),
        status: normalizedStatus,
        icon: config.icon,
        borderColor: config.borderColor,
        bgColor: config.bgColor,
        statusColor: config.statusColor
      };
    });

  const revenueItems = [
    {
      name: 'Room Bookings',
      icon: <IoBedOutline className="w-6 h-6" />,
      bgColor: '#F7DF9C',
      iconColor: '#755647',
    },
    {
      name: 'Cafe',
      icon: <Coffee className="w-6 h-6" />,
      bgColor: '#E3C78A',
      iconColor: '#876B56',
    },
    {
      name: 'Restaurant',
      icon: <IoIosRestaurant className="w-6 h-6" />,
      bgColor: '#A3876A',
      iconColor: '#FAF7F2',
    },
    {
      name: 'Bar',
      icon: <GiMartini className="w-6 h-6" />,
      bgColor: '#B79982',
      iconColor: '#FAF7F2',
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
      userLiked: null
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
          return { ...review, likes: review.likes - 1, userLiked: null };
        } else if (review.userLiked === false) {
          return { ...review, likes: review.likes + 1, dislikes: review.dislikes - 1, userLiked: true };
        } else {
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
          return { ...review, dislikes: review.dislikes - 1, userLiked: null };
        } else if (review.userLiked === true) {
          return { ...review, likes: review.likes - 1, dislikes: review.dislikes + 1, userLiked: false };
        } else {
          return { ...review, dislikes: review.dislikes + 1, userLiked: false };
        }
      }
      return review;
    }));
  };

  const mergedRevenueData = getRevenueData?.breakdown?.map((item) => {
    const match = revenueItems.find(ui => ui.name === item.name);

    return {
      ...item,
      ...match,
      isPositive: Number(item.trend) >= 0
    };
  });

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const getReview = useSelector((state) => state.review.reviews);
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

  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const formatNumber = (num) => {
    if (!num) return "0";
    return num.toLocaleString("en-IN");
  };

  useEffect(() => {
    const yearMonth = getCurrentYearMonth();

    dispatch(getAllReview());
    dispatch(getAllRevenue(yearMonth));
    dispatch(getAllDashboard(yearMonth));
    dispatch(getAllRoomAvailability());
    dispatch(getAllReservation());
    dispatch(getAllOrdersummery());
    dispatch(getAllServicerequests());
  }, [dispatch]);

  const handleNavigateQuickAccess = (route) => {
    navigate(route);
  }

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
              <div className="flex">
                {[...Array(5)].map((_, i) => {
                  const filledPercent = Math.min(Math.max(averageRating - i, 0), 1) * 100;
                  return (
                    <span key={i} className="relative">
                      <span className="text-gray-300 text-[16px] md600:text-[18px] lg:text-[20px]">★</span>
                      <span
                        className="text-yellow-400 text-[16px] md600:text-[18px] lg:text-[20px] absolute top-0 left-0 overflow-hidden"
                        style={{ width: `${filledPercent}%` }}
                      >
                        ★
                      </span>
                    </span>
                  );
                })}
              </div>
              <span className='ml-2 text-black'>{`${averageRating}/5`}</span>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md600:grid-cols-2 xl:grid-cols-4 gap-4 mt-5'>
          <div className=' bg-white p-4 rounded-xl shadow-lg border-2 ' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-center gap-1 h-full w-full'>
              <div className=''>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>New Booking</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>{getDashboardData?.newBookings}</p>
                <div className='flex gap-1 items-center'>
                  <p className='text-green-500'></p>
                </div>
              </div>
              <div className='w-[220px] md:ms-auto mx-auto'>
                <Newbookingchart />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-center h-full gap-1 w-full'>
              <div className=''>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Available Rooms</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>{getDashboardData?.availableRooms}</p>
                <div className='flex gap-1 items-center'>
                  <p className='text-red-500'></p>
                </div>
              </div>
              <div className='w-[220px] md:ms-auto mx-auto'>
                <Availablerooms />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-xl shadow-lg border-2 w-full' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-center gap-1 h-full w-full'>
              <div className=''>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Revenue</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>${getDashboardData?.totalRevenue}</p>
                <div className='flex gap-1 items-center'>
                  <p className='text-green-500'></p>
                </div>
              </div>
              <div className='w-[220px] md:ms-auto mx-auto'>
                <Revenuechart />
              </div>
            </div>
          </div>
          <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className='sm:flex justify-between items-center gap-1 h-full w-full'>
              <div className=''>
                <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Checkout</p>
                <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>{getDashboardData?.checkoutCount}</p>
                <div className='flex gap-1 items-center'>
                  <p className='text-red-500'></p>
                </div>
              </div>
              <div className='w-[220px] md:ms-auto mx-auto'>
                <Checkoutchart />
              </div>
            </div>
          </div>
        </div>

        <div className='mt-5 rounded-lg shadow-sm w-full'>
          <div className='lg:flex gap-5 justify-between'>
            <div className='bg-white p-4 lg:p-5 rounded-xl lg:w-[32.33%] border-2' style={{
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

              <div className="grid grid-cols-2 gap-5">
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
                  onClick={() => handleNavigateQuickAccess(item.path)}
                >
                  <div className="text-wrap absolute -top-10 left-0 text-white text-xs px-3 py-2 3xl:px-2 3xl:py-1 4xl:px-3 4xl:py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-20" style={{
                    backgroundColor: '#755647'
                  }}>
                    {item.description}
                    <div className="absolute -bottom-1 left-4 w-2 h-2 transform rotate-45" style={{
                      backgroundColor: '#755647'
                    }}></div>
                  </div>

                  <div className={`relative ${item.bgColor} ${item.iconColor} p-2 md:p-1 lg:p-4 rounded-xl group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                    {item.icon}
                    {/* {item.badge && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] md:text-[12px] font-bold rounded-full w-4 h-4 md:w-6 md:h-6 flex items-center justify-center shadow-lg">
                        {item.badge}
                      </span>
                    )} */}
                  </div>

                  <p className="text-sm md:text-md lg:text-[15px] font-medium" style={{ color: '#755647' }}>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 2xl:grid-cols-1 3xl:grid-cols-3 gap-3 md:gap-4 mb-3">
              {serviceSummary.map((item, index) => (
                <div key={index} className="text-center p-3 rounded-lg" style={{
                  backgroundColor: 'rgba(247, 223, 156, 0.2)'
                }}>
                  <p className={`text-[22px] sm:text-[24px] font-bold ${item.color}`}>{item.count}</p>
                  <p className="text-[12px] sm:text-[14px] font-medium" style={{ color: "#755647" }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Requests */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: '#755647' }}>Recent Requests</h3>
                <button className="text-sm font-medium transition-colors cursor-pointer" style={{ color: '#876B56' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#755647'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#876B56'}
                  onClick={() => (navigate('/housekeeping'))}
                >
                  View All
                </button>
              </div>

              {recentRequests.map((request, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${request.borderColor} ${request.bgColor}`}
                >
                  <div className="flex-shrink-0 mt-1">{request.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm" style={{ color: "#755647" }}>
                      {request.title}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "#A3876A" }}>
                      {request.room}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${request.statusColor}`}>
                      {request.status}
                    </span>
                    <div className="flex items-center gap-1 text-xs" style={{ color: '#A3876A' }}>
                      <MdAccessTime />
                      <span>{request.timeValue}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 p-2 md:p-5 border-[#E3C78A] shadow-lg shadow-[#7556471f]">
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
              <Link to="/allbookings" className="text-sm font-medium hover:underline transition-colors" style={{ color: '#876B56' }}>
                View All
              </Link>
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
              <table className="w-full min-w-[1000px] themed-scrollbar whitespace-nowrap">
                <thead className="sticky top-0 z-10 shadow-sm bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]">
                  <tr>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>#</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Name</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Room No</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Check In</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Check Out</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Status</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Phone</th>
                    <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold" style={{ color: '#755647' }}>Room Type</th>
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
                          <span className="text-sm font-semibold" style={{ color: '#755647' }}>{booking.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>{booking.roomNo}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>{booking.checkIn}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>{booking.checkOut}</td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-sm" style={{ color: '#876B56' }}>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone
                            size={16} className='text-green-600' />
                            {booking.countrycode ? booking.countrycode : ""} {booking.phone}
                        </div>
                      </td>
                      <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-24 h-8 rounded-md text-xs font-semibold border" style={{
                            backgroundColor: 'rgba(183, 153, 130, 0.2)',
                            color: '#755647',
                            borderColor: 'rgba(183, 153, 130, 0.3)'
                          }}>
                            {booking.roomType?.split(' ')[0] || 'N/A'}
                          </span>
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
              <div className="text-3xl lg:text-4xl font-bold mb-2" style={{ color: '#755647' }}>${formatNumber(getRevenueData.totalRevenue)}</div>
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="font-medium" style={{ color: getRevenueData.difference >= 0 ? '#4EB045' : '#EC0927' }}>
                  {getRevenueData.difference >= 0 ? '↗ +' : '↘ -'}
                  ${formatNumber(Math.abs(getRevenueData.difference))}
                  {" "}
                  ({getRevenueData.percentageChange >= 0 ? (<><span style={{ color: '#4EB045' }}>+{getRevenueData.percentageChange}%</span></>
                  ) : (<><span style={{ color: '#EC0927' }}>{getRevenueData.percentageChange}%</span></>)})
                </span>
              </div>
              <div className="text-sm mt-1" style={{ color: '#A3876A' }}>vs. Previous Month</div>
            </div>

            <hr className='py-2' style={{ borderColor: '#E3C78A' }}></hr>

            {/* Revenue Breakdown Section */}
            <div>
              <h2 className="text-lg font-semibold mb-2" style={{ color: '#755647' }}>Revenue Breakdown</h2>
              {mergedRevenueData?.map((item, index) => (
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
                      <span className="text-sm font-semibold whitespace-nowrap" style={{ color: '#876B56' }}>{item.percent}%</span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <div className="text-lg font-bold" style={{ color: '#755647' }}>${formatNumber(item.amount)}</div>
                      <span className={`text-xs font-medium whitespace-nowrap`} style={{
                        color: item.isPositive ? '#4EB045' : '#EC0927'
                      }}>
                        {item.isPositive ? '↗' : '↘'} {item.trend}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col bg-white rounded-xl shadow-lg p-3 md:p-5 border-2" style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold" style={{ color: '#755647' }}>Customer Review</h2>
              <Link to="/review" className="text-sm font-medium hover:underline transition-colors" style={{ color: '#876B56' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#755647'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#876B56'}
              >
                View All
              </Link>
            </div>

            <hr className="mb-6" style={{ borderColor: '#E3C78A' }} />

            <div className="flex-1 space-y-2">
              {getReview.slice(0, 3).map((review, index) => (
                <div key={index} className="pb-2">
                  <div className="flex items-center gap-3 mb-3">
                    {review.photo ? (
                      <img src={review.photo}
                        alt={review.userId.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full object-cover bg-[#ECD292] flex items-center justify-center font-[600] text-[#8B752F] text-lg uppercase">
                        {(() => {
                          if (review.userId.name) {
                            const words = review.userId.name.trim().split(/\s+/);
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium px-3 py-1 rounded text-sm" style={{
                          color: '#755647',
                          backgroundColor: '#F7DF9C'
                        }}>
                          {review.userId.name}
                        </span>
                        <span className="text-sm" style={{ color: '#A3876A' }}>{dayjs(review.createdAt).fromNow()}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-[#755647]">
                    {review.title}
                  </h4>
                  <p className="text-sm leading-relaxed ml-0 line-clamp-1" style={{ color: '#755647' }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center mt-6 pt-4 border-t" style={{ borderColor: '#E3C78A' }}>
              <Link to="/review" className="text-sm font-medium hover:underline transition-colors" style={{ color: '#876B56' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#755647'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#876B56'}
              >
                View all Customer Reviews
              </Link>
            </div>
          </div>

        </div>

      </div>
    </>
  )
}
