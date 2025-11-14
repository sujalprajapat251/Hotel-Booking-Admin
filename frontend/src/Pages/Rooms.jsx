import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Rooms = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-senary mb-4">Rooms</h1>
      </div>
      <Outlet />
    </div>
  );
};

export default Rooms;
