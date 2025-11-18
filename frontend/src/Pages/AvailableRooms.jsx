import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRoomsPaginated } from '../Redux/Slice/createRoomSlice';
import { fetchRoomTypes } from '../Redux/Slice/roomtypesSlice';
import GuestModal from '../component/GuestModel';

const AvailableRooms = () => {
  const dispatch = useDispatch();
  const {
    items: rooms,
    page,
    total,
    stats: aggregatedStats = {},
    totalPages,
    limit,
    loading
  } = useSelector((state) => state.rooms);

  const { items: roomTypes } = useSelector((state) => state.roomtypes);

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

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [localPage, setLocalPage] = useState(1);
  const [pageSize] = useState(12);
  const [showModal, setShowModal] = useState(false);
  // Initial data load + when page or filters change
  useEffect(() => {
    dispatch(
      fetchRoomsPaginated({
        page: localPage,
        limit: pageSize,
        filters
      })
    );
  }, [dispatch, localPage, pageSize, filters]);

  // Room types can be loaded once
  useEffect(() => {
    dispatch(fetchRoomTypes());
  }, [dispatch]);

  // Get unique floors from rooms
  const uniqueFloors = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    const floors = [...new Set(rooms.map(room => room.floor))].sort((a, b) => a - b);
    return floors;
  }, [rooms]);
  
  console.log(rooms,"rooms");
  
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
      if (filters.housekeeping !== 'All Status' && room.status !== filters.housekeeping) {
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

  const refreshRooms = useCallback(() => {
    dispatch(
      fetchRoomsPaginated({
        page: localPage,
        limit: pageSize,
        filters
      })
    );
  }, [dispatch, localPage, pageSize, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
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
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
          <path d="M3 3V21H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M7 16L11 12L15 8L21 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M21 14H15V20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  return (
    <div className="p-6" style={{ minHeight: '100vh' }}>
      <h1 className="text-2xl font-bold text-senary mb-6">Available Rooms</h1>
      
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
              <path d="M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="#B79982" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 21L15 15" stroke="#755647" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>All Status</option>
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Reserved</option>
                  <option>Maintenance</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Room Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Type</label>
              <div className="relative">
                <select
                  value={filters.roomType}
                  onChange={(e) => handleFilterChange('roomType', e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>All Types</option>
                  {roomTypes.map((rt) => (
                    <option key={rt.id} value={rt.roomType}>
                      {rt.roomType}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Floor Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
              <div className="relative">
                <select
                  value={filters.floor}
                  onChange={(e) => handleFilterChange('floor', e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>All Floors</option>
                  {uniqueFloors.map((floor) => (
                    <option key={floor} value={floor}>
                      Floor {floor}
                    </option>
                  ))}
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Bed Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bed Size</label>
              <div className="relative">
                <select
                  value={filters.bedSize}
                  onChange={(e) => handleFilterChange('bedSize', e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>All Bed Sizes</option>
                  <option>Single</option>
                  <option>Double</option>
                  <option>Queen</option>
                  <option>King</option>
                  <option>Twin</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Housekeeping</label>
              <div className="relative">
                <select
                  value={filters.housekeeping}
                  onChange={(e) => handleFilterChange('housekeeping', e.target.value)}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option>All Status</option>
                  <option>Available</option>
                  <option>Occupied</option>
                  <option>Reserved</option>
                  <option>Maintenance</option>
                </select>
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
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
              const getStatusConfig = (status) => {
                switch (status) {
                  case 'Occupied':
                    return { color: 'bg-senary', text: 'OCCUPIED', icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    )};
                  case 'Available':
                    return { color: 'bg-quaternary', text: 'AVAILABLE', icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5"></path>
                      </svg>
                    )};
                  case 'Maintenance':
                    return { color: 'bg-tertiary', text: 'CLEANING', icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <path d="M16 17l5-5-5-5"></path>
                        <path d="M21 12H9"></path>
                      </svg>
                    )};
                  case 'Reserved':
                    return { color: 'bg-quinary', text: 'RESERVED', icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    )};
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

              // Get amenities from features
              const amenities = room.features || [];

              return (
                <div key={room.id} className="bg-white rounded-lg shadow-md p-5 relative">
                  {/* Header with Room Number and Status Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-senary">ROOM {room.roomNumber}</h3>
                      <p className="text-sm text-quinary">Floor {room.floor}</p>
                    </div>
                    <div className={`${statusConfig.color} text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                      {statusConfig.icon}
                      {statusConfig.text}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-quinary">
                      <span className="font-medium">{roomTypeName}</span>
                      <span className="text-tertiary">•</span>
                      <span>{bedType} Bed</span>
                    </div>
                    
                    <div className="text-sm text-quinary">
                      {room.status === 'Occupied' ? (
                        <>
                          {room.capacity?.adults || 0} Adults, {room.capacity?.children || 0} Children (Max: {maxCapacity})
                        </>
                      ) : (
                        <>
                          {room.capacity?.adults || 0} Adults (Max: {maxCapacity})
                        </>
                      )}
                    </div>

                    <div className={`text-lg font-semibold ${price > 200 ? 'text-quaternary' : 'text-senary'}`}>
                      ${price} /night
                    </div>
                  </div>

                  {/* Guest Information (if Occupied or Reserved) */}
                  {(room.status === 'Occupied' || room.status === 'Reserved') && (
                    <div className="mb-4 p-3 bg-secondary rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-senary">Guest Name</span>
                        <span className="px-2 py-0.5 bg-primary text-senary text-xs font-semibold rounded">VIP</span>
                      </div>
                      <div className="text-xs text-quinary">Booking ID: {room.id?.slice(-12).toUpperCase()}</div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-xs text-tertiary">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Check-in: {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}, 12:00 AM
                        </div>
                        <div className="flex items-center gap-2 text-xs text-tertiary">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          Check-out: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}, 12:00 AM
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Amenities */}
                  {amenities.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex flex-wrap items-center gap-1 text-xs text-quinary">
                        {amenities.slice(0, 5).map((feature, idx) => {
                          const label =
                            typeof feature === 'object' && feature.feature
                              ? feature.feature
                              : feature;
                          return (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-secondary text-senary"
                              title={label}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Special Notes */}
                  {room.maintenanceNotes && (
                    <div className="mb-4 p-2 bg-primary rounded text-xs text-senary">
                      {room.maintenanceNotes}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => handleRoomAction(room)}
                    disabled={!isAddGuestAction}
                    className={`w-full py-2.5 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-colors ${
                      isAddGuestAction
                        ? 'bg-senary hover:bg-quinary'
                        : 'bg-quinary cursor-not-allowed opacity-60'
                    }`}
                  >
                    {room.status === 'Occupied' || room.status === 'Reserved' ? (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Guest Details
                      </>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="8.5" cy="7" r="4"></circle>
                          <line x1="20" y1="8" x2="20" y2="14"></line>
                          <line x1="23" y1="11" x2="17" y2="11"></line>
                        </svg>
                        <span>Add Guest</span>
                      </div>
                    )}
                  </button>
                </div>
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
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                page <= 1
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
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                page >= totalPages
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

