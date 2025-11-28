import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteRoom, fetchRoomsPaginated } from '../Redux/Slice/createRoomSlice';
import { fetchRoomTypes } from '../Redux/Slice/roomtypesSlice';
import { fetchBookings, updateBooking } from '../Redux/Slice/bookingSlice';
import GuestModal from '../component/GuestModel';
import GuestDetailsModal from '../component/GuestDetailsModal';
import { ChevronDown } from 'lucide-react';
import { IMAGE_URL } from '../Utils/baseUrl';

const AvailableRooms = () => {
  const dispatch = useDispatch();

  const [statusTypeDropdown, setStatusTypeDropdown] = useState(false);
  const statusTypeRef = useRef(null);
  const [roomTypeDropdown, setRoomTypeDropdown] = useState(false);
  const roomTypeRef = useRef(null);
  const [floorDropdown, setFloorDropdown] = useState(false);
  const floorRef = useRef(null);
  const [bedSizeDropdown, setBedSizeDropdown] = useState(false);
  const bedSizeRef = useRef(null);
  const [housekeepingDropdown, setHousekeepingDropdown] = useState(false);
  const housekeepingRef = useRef(null);

  const statusOptions = ['Available', 'Occupied', 'Maintenance', 'Reserved'];
  const bedSizes = ['Single', 'Double', 'Queen', 'King', 'Twin'];
  const housekeepingOptions = ["Dirty", "Pending", "In-Progress", "Completed", "Clean"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusTypeRef.current && !statusTypeRef.current.contains(event.target)) {
        setStatusTypeDropdown(false);
      }
      if (roomTypeRef.current && !roomTypeRef.current.contains(event.target)) {
        setRoomTypeDropdown(false);
      }
      if (floorRef.current && !floorRef.current.contains(event.target)) {
        setFloorDropdown(false);
      }
      if (bedSizeRef.current && !bedSizeRef.current.contains(event.target)) {
        setBedSizeDropdown(false);
      }
      if (housekeepingRef.current && !housekeepingRef.current.contains(event.target)) {
        setHousekeepingDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const {
    items: rooms,
    page,
    total,
    stats: aggregatedStats = {},
    totalPages,
    limit,
    loading,
    floors
  } = useSelector((state) => state.rooms);

  const { items: roomTypes } = useSelector((state) => state.roomtypes);
  const {
    items: bookings = [],
    loading: bookingLoading
  } = useSelector((state) => state.booking || {});
  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: 'All Status',
    roomType: 'All Types',
    floor: 'All Floors',
    bedSize: 'All Bed Sizes',
    checkInFrom: '',
    checkOutTo: '',
    housekeeping: 'All Status'
  });

  const apiFilters = useMemo(() => {
    const normalized = { ...filters };

    // Normalize room type to send ids to the backend
    if (filters.roomType && filters.roomType !== 'All Types') {
      const selectedRoomType = roomTypes.find((rt) => {
        const roomTypeId = rt?.id || rt?._id;
        return filters.roomType === roomTypeId || filters.roomType === rt?.roomType;
      });

      if (selectedRoomType) {
        normalized.roomType = selectedRoomType.id || selectedRoomType._id;
      } else {
        delete normalized.roomType;
      }
    } else {
      delete normalized.roomType;
    }

    if (!filters.search?.trim()) {
      delete normalized.search;
    }

    if (!filters.checkInFrom) {
      delete normalized.checkInFrom;
    }

    if (!filters.checkOutTo) {
      delete normalized.checkOutTo;
    }

        // Map housekeeping to cleanStatus for backend
        if (filters.housekeeping && filters.housekeeping !== 'All Status') {
          normalized.cleanStatus = filters.housekeeping;
        } else {
          delete normalized.cleanStatus;
        }
        

    return normalized;
  }, [filters, roomTypes]);

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [localPage, setLocalPage] = useState(1);
  const [pageSize] = useState(12);
  const [showModal, setShowModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailsRoom, setDetailsRoom] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const formatDateTimeLabel = useCallback((value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return value;
    }
  }, []);
  // Initial data load + when page or filters change
  useEffect(() => {
    dispatch(
      fetchRoomsPaginated({
        page: localPage,
        limit: pageSize,
        filters: apiFilters
      })
    );
  }, [dispatch, localPage, pageSize, apiFilters]);

  // Room types can be loaded once
  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  console.log(rooms, "rooms");

  // Filter rooms based on filter criteria
  const filteredRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];

    return rooms.filter(room => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const roomNumberMatch = room.roomNumber?.toLowerCase().includes(searchLower);
        const roomTypeMatch = room.roomType?.roomType?.toLowerCase().includes(searchLower);
        if (!roomNumberMatch && !roomTypeMatch) return false;
      }

      // Status filter
      if (filters.status !== 'All Status' && room.status !== filters.status) {
        return false;
      }

      // Room Type filter
      if (filters.roomType !== 'All Types') {
        const selectedRoomType = roomTypes.find(rt => rt.roomType === filters.roomType);
        if (selectedRoomType) {
          const roomTypeId = selectedRoomType.id;
          const roomTypeName = selectedRoomType.roomType;
          // Check if roomType matches by ID or by name (if populated)
          const matches =
            room.roomType?.id === roomTypeId ||
            room.roomType === roomTypeId ||
            room.roomType?.roomType === roomTypeName;
          if (!matches) {
            return false;
          }
        }
      }

      // Floor filter
      if (filters.floor !== 'All Floors' && room.floor !== parseInt(filters.floor)) {
        return false;
      }

      // Bed Size filter
      if (filters.bedSize !== 'All Bed Sizes' && room.bed?.mainBed?.type !== filters.bedSize) {
        return false;
      }

      // Housekeeping filter (using status for now)
      if (filters.housekeeping !== 'All Status' && room.cleanStatus !== filters.housekeeping) {
        return false;
      }

      // Date filters (check-in/check-out) - would need booking data to implement fully
      // For now, we'll skip date filtering as it requires booking information

      return true;
    }).sort((a, b) => {
      // Sort by floor first (ascending), then by room number (ascending)
      if (a.floor !== b.floor) {
        return a.floor - b.floor;
      }
      // Extract numeric part from room number for proper numeric sorting
      const roomNumA = parseInt(a.roomNumber?.replace(/\D/g, '')) || 0;
      const roomNumB = parseInt(b.roomNumber?.replace(/\D/g, '')) || 0;
      return roomNumA - roomNumB;
    });
  }, [rooms, filters, roomTypes]);

  // Calculate room statistics based on filtered rooms
  const roomStats = useMemo(() => {
    const stats = {
      Occupied: 0,
      Reserved: 0,
      Available: 0,
      'Not Ready': 0
    };

    if (filteredRooms && filteredRooms.length > 0) {
      filteredRooms.forEach(room => {
        if (room.status === 'Occupied') {
          stats.Occupied++;
        } else if (room.status === 'Reserved') {
          stats.Reserved++;
        } else if (room.status === 'Available') {
          stats.Available++;
        } else if (room.status === 'Maintenance') {
          stats['Not Ready']++;
        }
      });
    }

    const totalFiltered = Object.values(stats).reduce((sum, val) => sum + val, 0);
    const occupancyRate = totalFiltered > 0 ? Math.round((stats.Occupied / totalFiltered) * 100) : 0;

    return {
      total: totalFiltered,
      available: stats.Available,
      occupied: stats.Occupied,
      occupancyRate
    };
  }, [filteredRooms]);

  const handleAddGuestClick = useCallback((room) => {
    setSelectedRoom(room);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setSelectedRoom(null);
  }, []);

  const handleDeleteClick = useCallback((room) => {
    setRoomToDelete(room);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalOpen(false);
    setRoomToDelete(null);
    setDeleteError(null);
  }, []);

  const refreshRooms = useCallback(() => {
    return dispatch(
      fetchRoomsPaginated({
        page: localPage,
        limit: pageSize,
        filters: apiFilters
      })
    );
  }, [dispatch, localPage, pageSize, apiFilters]);

  const getBookingForRoom = useCallback(
    (roomData) => {
      if (!roomData || !bookings.length) return null;
      const detailRoomId = roomData.id || roomData._id;
      const detailRoomNumber = roomData.roomNumber;

      return (
        bookings.find((booking) => {
          const bookingRoomId = booking.room?.id || booking.room?._id || booking.room;
          const bookingRoomNumber = booking.roomNumber || booking.room?.roomNumber;

          if (detailRoomId && bookingRoomId && bookingRoomId === detailRoomId) {
            return true;
          }

          if (detailRoomNumber && bookingRoomNumber) {
            return String(bookingRoomNumber) === String(detailRoomNumber);
          }

          return false;
        }) || null
      );
    },
    [bookings]
  );

  const bookingForDetailsRoom = useMemo(
    () => getBookingForRoom(detailsRoom),
    [detailsRoom, getBookingForRoom]
  );

  const handleDetailsClose = useCallback(() => {
    setOpen(false);
    setDetailsRoom(null);
  }, []);

  const handleBookingStatusChange = useCallback(
    async (status) => {
      if (!bookingForDetailsRoom?.id) return;
      try {
        await dispatch(
          updateBooking({
            id: bookingForDetailsRoom.id,
            updates: { status }
          })
        ).unwrap();
        await dispatch(fetchBookings());
        await refreshRooms();
        handleDetailsClose();
      } catch (error) {
        console.error('Failed to update booking status', error);
      }
    },
    [bookingForDetailsRoom, dispatch, refreshRooms, handleDetailsClose]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!roomToDelete) return;
    const id = roomToDelete.id || roomToDelete._id;
    if (!id) {
      setDeleteError('Room id is missing.');
      return;
    }
    setDeleteLoading(true);
    try {
      await dispatch(deleteRoom(id)).unwrap();
      await refreshRooms();
      closeDeleteModal();
    } catch (error) {
      setDeleteError(error || 'Failed to delete room.');
    } finally {
      setDeleteLoading(false);
    }
  }, [roomToDelete, dispatch, refreshRooms, closeDeleteModal]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, value); // Add this to debug
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    // Reset to first page when filters change
    setLocalPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'All Status',
      roomType: 'All Types',
      floor: 'All Floors',
      bedSize: 'All Bed Sizes',
      checkInFrom: '',
      checkOutTo: '',
      housekeeping: 'All Status'
    });
    setLocalPage(1);
  };

  const handleRoomAction = (room) => {
    if (room.status === 'Occupied' || room.status === 'Reserved') {
      setDetailsRoom(room);
      setOpen(true);
      return;
    }
    handleAddGuestClick(room);
  };

  const displayStats = useMemo(() => {
    return {
      total: aggregatedStats.total ?? roomStats.total ?? total,
      available: aggregatedStats.available ?? roomStats.available ?? 0,
      occupied: aggregatedStats.occupied ?? roomStats.occupied ?? 0,
      occupancyRate: aggregatedStats.occupancyRate ?? roomStats.occupancyRate ?? 0
    };
  }, [aggregatedStats, roomStats, total]);

  // Card data configuration
  const cards = [
    {
      title: 'TOTAL ROOMS',
      value: displayStats.total,
      color: '#755647', // senary - deep brown
      iconBg: '#876B56', // quinary - brown
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'AVAILABLE',
      value: displayStats.available,
      color: '#A3876A', // quaternary - taupe brown
      iconBg: '#B79982', // tertiary - muted sand
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'OCCUPIED',
      value: displayStats.occupied,
      color: '#876B56', // quinary - brown
      iconBg: '#A3876A', // quaternary - taupe brown
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      title: 'OCCUPANCY RATE',
      value: `${displayStats.occupancyRate}%`,
      color: '#B79982', // tertiary - muted sand
      iconBg: '#E3C78A', // secondary - tan
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 16L11 12L15 8L21 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 14H15V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    }
  ];

  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">Available Rooms</h1>
      </section>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="rounded-lg p-6 relative overflow-hidden shadow-lg"
            style={{ backgroundColor: card.color }}
          >
            {/* Icon in top right */}
            <div
              className="absolute top-4 right-4 w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: card.iconBg }}
            >
              {card.icon}
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="text-white text-4xl font-bold mb-2">
                {card.value}
              </div>
              <div className="text-white text-sm font-medium">
                {card.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Room Filters Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#B79982" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M21 21L15 15" stroke="#755647" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h2 className="text-xl font-bold text-senary">Room Filters</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-1 rounded-full bg-secondary text-senary text-sm font-medium">
              {filteredRooms.length} of {total || rooms.length} rooms
            </div>
            <div className="text-xs text-quinary">
              Page {page} of {totalPages}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filter Rows */}
        <div className="space-y-4">
          {/* First Row - Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="relative" ref={statusTypeRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <button
                type="button"
                onClick={() => setStatusTypeDropdown(!statusTypeDropdown)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              >
                <span className={filters.status ? 'text-gray-800' : 'text-gray-400'}>
                  {filters.status}
                </span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>
              {statusTypeDropdown && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1">
                  <div
                    onClick={() => {
                      handleFilterChange('status', 'All Status');
                      setStatusTypeDropdown(false);
                    }}
                    className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                  >
                    All Status
                  </div>
                  {statusOptions.map((status) => (
                    <div
                      key={status}
                      onClick={() => {
                        handleFilterChange('status', status);
                        setStatusTypeDropdown(false);
                      }}
                      className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Room Type Filter */}
            <div className="relative" ref={roomTypeRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <button
                type="button"
                onClick={() => setRoomTypeDropdown(!roomTypeDropdown)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              >
                <span className={filters.roomType ? 'text-gray-800' : 'text-gray-400'}>
                  {filters.roomType}
                </span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>
              {roomTypeDropdown && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1">
                  <div
                    onClick={() => {
                      handleFilterChange('roomType', 'All Types');
                      setRoomTypeDropdown(false);
                    }}
                    className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                  >
                    All Types
                  </div>
                  {roomTypes.map((rt) => (
                    <div
                      key={rt.id}
                      onClick={() => {
                        handleFilterChange('roomType', rt.roomType);
                        setRoomTypeDropdown(false);
                      }}
                      className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                    >
                      {rt.roomType}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floor Filter */}
            <div className="relative" ref={floorRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <button
                type="button"
                onClick={() => setFloorDropdown(!floorDropdown)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              >
                <span className={filters.floor ? 'text-gray-800' : 'text-gray-400'}>
                  {filters.floor === 'All Floors' ? 'All Floors' : `Floor ${filters.floor}`}
                </span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>
              {floorDropdown && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1">
                  <div
                    onClick={() => {
                      handleFilterChange('floor', 'All Floors');
                      setFloorDropdown(false);
                    }}
                    className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                  >
                    All Floors
                  </div>
                  {floors.map((floor) => (
                    <div
                      key={floor}
                      onClick={() => {
                        handleFilterChange('floor', floor);
                        setFloorDropdown(false);
                      }}
                      className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                    >
                      Floor {floor}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bed Size Filter */}
            {/* Bed Size Filter */}
            <div className="relative" ref={bedSizeRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bed Size</label>
              <button
                type="button"
                onClick={() => setBedSizeDropdown(!bedSizeDropdown)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              >
                <span className={filters.bedSize ? 'text-gray-800' : 'text-gray-400'}>
                  {filters.bedSize}
                </span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>
              {bedSizeDropdown && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1">
                  <div
                    onClick={() => {
                      handleFilterChange('bedSize', 'All Bed Sizes');
                      setBedSizeDropdown(false);
                    }}
                    className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                  >
                    All Bed Sizes
                  </div>
                  {bedSizes.map((size) => (
                    <div
                      key={size}
                      onClick={() => {
                        handleFilterChange('bedSize', size);
                        setBedSizeDropdown(false);
                      }}
                      className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                    >
                      {size}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Second Row - Date Pickers and Housekeeping */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Check-in From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-in From</label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.checkInFrom}
                  onChange={(e) => handleFilterChange('checkInFrom', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Check-out To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Check-out To</label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.checkOutTo}
                  onChange={(e) => handleFilterChange('checkOutTo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Housekeeping Filter */}
            <div className="relative" ref={housekeepingRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">Housekeeping</label>
              <button
                type="button"
                onClick={() => setHousekeepingDropdown(!housekeepingDropdown)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-[#B79982]"
              >
                <span className={filters.housekeeping ? 'text-gray-800' : 'text-gray-400'}>
                  {filters.housekeeping}
                </span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>
              {housekeepingDropdown && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-[4px] shadow-lg mt-1">
                  <div
                    onClick={() => {
                      handleFilterChange('housekeeping', 'All Status');
                      setHousekeepingDropdown(false);
                    }}
                    className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                  >
                    All Status
                  </div>
                  {housekeepingOptions.map((status) => (
                    <div
                      key={status}
                      onClick={() => {
                        handleFilterChange('housekeeping', status);
                        setHousekeepingDropdown(false);
                      }}
                      className="px-4 py-1 hover:bg-[#F7DF9C] cursor-pointer text-sm transition-colors text-black/100"
                    >
                      {status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clear Button */}
        <div className="mt-6">
          <button
            onClick={handleClearFilters}
            className="px-6 py-3 bg-quinary text-white rounded-lg font-medium hover:bg-senary transition-colors flex items-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12C3 7.58172 6.58172 4 11 4C14.3949 4 17.2959 6.11429 18.4576 9M21 12C21 16.4183 17.4183 20 13 20C9.60506 20 6.70414 17.8857 5.54243 15" />
              <path d="M8 4V8H4" />
              <path d="M16 20V16H20" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {/* Room Cards Grid */}
      {loading && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-8 text-center text-quinary text-sm">
          Loading rooms...
        </div>
      )}

      {!loading && filteredRooms.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold text-senary mb-4">Rooms ({filteredRooms.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => {
              // Handle images for each room
              const roomImages = room.images || [];
              const mainImage = roomImages[0] || null;
              const subImages = roomImages;
              const getStatusConfig = (status) => {
                switch (status) {
                  case 'Occupied':
                    return {
                      color: 'bg-senary', text: 'OCCUPIED', icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" q="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )
                    };
                  case 'Available':
                    return {
                      color: 'bg-quaternary', text: 'AVAILABLE', icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      )
                    };
                  case 'Maintenance':
                    return {
                      color: 'bg-tertiary', text: 'CLEANING', icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <path d="M16 17l5-5-5-5"></path>
                          <path d="M21 12H9"></path>
                        </svg>
                      )
                    };
                  case 'Reserved':
                    return {
                      color: 'bg-quinary', text: 'RESERVED', icon: (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      )
                    };
                  default:
                    return { color: 'bg-quaternary', text: status.toUpperCase(), icon: null };
                }
              };

              const statusConfig = getStatusConfig(room.status);
              const maxCapacity = (room.capacity?.adults || 0) + (room.capacity?.children || 0);
              const currentOccupancy = room.status === 'Occupied' ? maxCapacity : 0;
              const isClean = room.status !== 'Maintenance' && !room.maintenanceNotes?.toLowerCase().includes('dirty');
              const roomTypeName = room.roomType?.roomType || 'N/A';
              const bedType = room.bed?.mainBed?.type || 'N/A';
              const price = room.price?.base || 0;
              const isAddGuestAction = room.status !== 'Occupied' && room.status !== 'Reserved';
              const isDirty = room.cleanStatus === 'Dirty';
              const isAddGuestDisabled = isAddGuestAction && isDirty;

              // Get amenities from features
              const amenities = room.features || [];
              console.log(amenities, "amenities");
              const roomBooking = getBookingForRoom(room);
              const guestName = roomBooking?.guest?.fullName || '—';
              const bookingReference =
                roomBooking?.reservation?.bookingReference ||
                roomBooking?.id?.slice(-10)?.toUpperCase() ||
                '—';
              const bookingStatusLabel = roomBooking?.status || '';
              const checkInLabel = formatDateTimeLabel(roomBooking?.reservation?.checkInDate);
              const checkOutLabel = formatDateTimeLabel(roomBooking?.reservation?.checkOutDate);

              // Utility to get date in YYYY-MM-DD
              const getDateString = (date) => {
                if (!date) return null;
                const d = new Date(date);
                return d.toISOString().slice(0, 10);
              };
              const todayStr = getDateString(new Date());
              const checkInStr = getDateString(roomBooking?.reservation?.checkInDate);

              // Get full image URL
              const getImageUrl = (imagePath) => {
                if (!imagePath) return null;
                if (imagePath.startsWith('http')) return imagePath;
                return `${IMAGE_URL}${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
              };

              // RoomCard component for managing selected image state
              const RoomCard = ({ room, statusConfig, maxCapacity, roomTypeName, bedType, price, isAddGuestAction, isAddGuestDisabled, isDirty, amenities, roomBooking, guestName, bookingStatusLabel, checkInLabel, checkOutLabel, getImageUrl, mainImage, subImages, roomImages, onDelete }) => {
                const [selectedImage, setSelectedImage] = useState(mainImage);

                return (
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Image Gallery Section */}
                  <div className="relative">
                    {/* Main Image */}
                    <div className="relative h-64 bg-gray-200 overflow-hidden">
                      {selectedImage ? (
                        <img
                          src={getImageUrl(selectedImage)}
                          alt={`Room ${room.roomNumber}`}
                          className="w-full h-full object-cover"
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
                      
                      {/* Status Badge Overlay */}
                      <div className="absolute top-3 right-3">
                        {room.status !== 'Reserved' || (!checkInStr || todayStr >= checkInStr) ? (
                          <div className={`${statusConfig.color} text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg`}>
                            {statusConfig.icon}
                            {statusConfig.text}
                          </div>
                        ) : null}
                      </div>

                      {/* Image Counter */}
                      {roomImages.length > 0 && (
                        <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-medium">
                          {roomImages.length} {roomImages.length === 1 ? 'Photo' : 'Photos'}
                        </div>
                      )}
                    </div>

                    {/* Sub Images Thumbnails */}
                    {subImages.length > 0 && (
                      <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
                        {subImages.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedImage(img)}
                            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                              selectedImage === img
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
                        {roomImages.length > 5 && (
                          <div className="flex-shrink-0 w-16 h-16 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                            +{roomImages.length - 5}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Header with Room Number */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-senary">ROOM {room.roomNumber}</h3>
                          <p className="text-sm text-quinary mt-0.5">Floor {room.floor}</p>
                        </div>
                        <div className={`text-lg font-bold text-senary`}>
                          ${price}<span className="text-sm font-normal text-quinary">/night</span>
                        </div>
                      </div>
                    </div>

                    {/* Room Details */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-quinary">
                        <span className="font-semibold text-senary">{roomTypeName}</span>
                        <span className="text-tertiary">•</span>
                        <span>{bedType} Bed</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-quinary">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>
                          {room.status === 'Occupied' ? (
                            <>
                              {room.capacity?.adults || 0} Adults, {room.capacity?.children || 0} Children
                            </>
                          ) : (
                            <>
                              {room.capacity?.adults || 0} Adults (Max: {maxCapacity})
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Guest Information (if Occupied or Reserved) */}
                    {(room.status === 'Occupied' || room.status === 'Reserved') && (
                      <div className="mb-4 p-3 bg-secondary rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-senary">Guest Name</span>
                          <span className="px-2 py-0.5 bg-primary text-senary text-xs font-semibold rounded">
                            {guestName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-quinary gap-2 mb-2">
                          <span>Booking Status:</span>
                          {bookingStatusLabel && (
                            <span className="px-2 py-0.5 rounded bg-white text-senary font-semibold">
                              {bookingStatusLabel}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-xs text-tertiary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Check-in: {checkInLabel}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-tertiary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            Check-out: {checkOutLabel}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Amenities */}
                    {amenities.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          {amenities.slice(0, 6).map((feature, idx) => {
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
                          {amenities.length > 6 && (
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                              +{amenities.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Notes */}
                    {room.maintenanceNotes && (
                      <div className="mb-4 p-2.5 bg-primary rounded-lg text-xs text-senary border-l-3 border-yellow-400">
                        <span className="font-semibold">Note: </span>
                        {room.maintenanceNotes}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={() => !isAddGuestDisabled && handleRoomAction(room)}
                        disabled={isAddGuestDisabled}
                        className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 shadow-md ${
                          isAddGuestDisabled
                            ? 'bg-gray-400 cursor-not-allowed opacity-60'
                            : isAddGuestAction
                            ? 'bg-senary hover:bg-quinary hover:shadow-lg'
                            : 'bg-quinary hover:bg-senary hover:shadow-lg'
                        }`}
                        title={isAddGuestDisabled ? 'Room is dirty and needs cleaning before adding a guest' : ''}
                      >
                        {room.status === 'Occupied' || room.status === 'Reserved' ? (
                          <div className='flex items-center gap-2'>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            Guest Details
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                              <circle cx="8.5" cy="7" r="4"></circle>
                              <line x1="20" y1="8" x2="20" y2="14"></line>
                              <line x1="23" y1="11" x2="17" y2="11"></line>
                            </svg>
                            <span>Add Guest</span>
                            {isDirty && (
                              <span className="text-xs bg-red-500 px-2 py-0.5 rounded-full ml-1">
                                Dirty
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => onDelete(room)}
                        className="w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                        Delete Room
                      </button>
                    </div>
                  </div>
                </div>
                );
              };

              return (
                <RoomCard
                  key={room.id || room._id || room.roomNumber}
                  room={room}
                  statusConfig={statusConfig}
                  maxCapacity={maxCapacity}
                  roomTypeName={roomTypeName}
                  bedType={bedType}
                  price={price}
                  isAddGuestAction={isAddGuestAction}
                  isAddGuestDisabled={isAddGuestDisabled}
                  isDirty={isDirty}
                  amenities={amenities}
                  roomBooking={roomBooking}
                  guestName={guestName}
                  bookingStatusLabel={bookingStatusLabel}
                  checkInLabel={checkInLabel}
                  checkOutLabel={checkOutLabel}
                  getImageUrl={getImageUrl}
                  mainImage={mainImage}
                  subImages={subImages}
                  roomImages={roomImages}
                  onDelete={handleDeleteClick}
                />
              );
            })}
          </div>
        </div>
      )}
      {showModal && selectedRoom && (
        <GuestModal
          room={selectedRoom}
          onClose={handleModalClose}
          onBooked={refreshRooms}
        />
      )}
      {open && (
        <GuestDetailsModal
          room={detailsRoom}
          booking={bookingForDetailsRoom}
          loading={bookingLoading}
          onClose={handleDetailsClose}
          onCheckOut={() => handleBookingStatusChange('CheckedOut')}
          onCancelRoom={() => handleBookingStatusChange('Cancelled')}
        />
      )}
      {deleteModalOpen && roomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-senary mb-1">
                  Delete Room {roomToDelete.roomNumber}?
                </h3>
                <p className="text-sm text-quinary">
                  This action cannot be undone. The room and its related data will be permanently removed.
                </p>
              </div>
            </div>
            {deleteError && (
              <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                {typeof deleteError === 'string' ? deleteError : 'Failed to delete room.'}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg border border-gray-200 text-senary hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* No Results Message */}
      {!loading && filteredRooms.length === 0 && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-senary">No rooms found</h3>
          <p className="mt-1 text-sm text-quinary">Try adjusting your filters to see more results.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between bg-white rounded-lg shadow-md px-4 py-3 text-sm text-quinary">
          <div>
            Showing{' '}
            {total === 0
              ? 0
              : (page - 1) * limit + 1}{' '}
            -{' '}
            {Math.min(page * limit, total || (page * limit))}{' '}
            of {total || 'many'} rooms
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocalPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${page <= 1
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-quinary text-senary hover:bg-secondary'
                }`}
            >
              Prev
            </button>
            <span className="text-xs">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setLocalPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${page >= totalPages
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-quinary text-senary hover:bg-secondary'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableRooms;

