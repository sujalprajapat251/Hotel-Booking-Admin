import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Cafe = () => {
  return (
    <div className="p-6 bg-[#F0F3FB]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-senary mb-4">Cafe</h1>
      </div>
      <Outlet />
    </div>
  );
};

export default Cafe;
