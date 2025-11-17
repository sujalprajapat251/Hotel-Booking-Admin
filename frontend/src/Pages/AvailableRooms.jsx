import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRooms } from '../Redux/Slice/createRoomSlice';

const AvailableRooms = () => {
  const dispatch = useDispatch();
  const { items: rooms } = useSelector((state) => state.rooms);
  console.log(rooms);

  useEffect(() => {
    dispatch(fetchRooms());
  }, [dispatch]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-senary mb-4">Available Rooms</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-quinary">Available Rooms list will be implemented here.</p>
      </div>
    </div>
  );
};

export default AvailableRooms;

