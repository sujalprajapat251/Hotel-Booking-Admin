import React, { useEffect } from 'react'
import tableImg from '../../Images/table.png'
import { useState } from 'react'
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCafeTable } from '../../Redux/Slice/cafeTable.slice';
import { Link } from 'react-router-dom';
export default function Dashboard() {
  const dispatch = useDispatch();

    const getCafeTableData = useSelector((state) => state.cafeTable.cafeTable);
    useEffect(() => {
        dispatch(getAllCafeTable());
      }, [dispatch]);
    return (
        <div className="p-4 md:p-6 bg-[#f0f3fb] h-full">
            <div className="mb-6">
                <h1 className="text-xl md:text-3xl font-bold text-gray-800">Order / Table Management</h1>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-3 md:p-4">
                {getCafeTableData.map((item, idx) => (
                    <Link to={'/waiter/table/'+item._id} className='block' key={item._id || idx}>
                        <div className="p-8 sm:p-10 bg-white rounded-md hover:shadow-xl cursor-pointer relative">
                            <img src={tableImg} alt="table" className="w-24 mx-auto" />
                            <p className='text-center mt-3 text-sm sm:text-base'>
                                {item.title} &nbsp; member: {item.limit}
                            </p>
                            <div className='absolute right-3 top-4'>
                                {item.status === true ?
                                    <p className='bg-green-400 px-2 py-0.5 text-xs rounded-[4px]'>Available</p> :
                                    <p className='bg-red-500 px-2 py-0.5 text-xs rounded-[4px]'>Occupied</p>
                                }
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
