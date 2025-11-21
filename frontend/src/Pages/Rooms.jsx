import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const Rooms = () => {
  return (
    <>
    {/* <div className="p-6 bg-[#F0F3FB]"> */}
        {/* <h1 className="text-2xl font-bold text-senary">Rooms</h1> */}
        <Outlet />
    {/* </div> */}
    </>
  );
};

export default Rooms;
