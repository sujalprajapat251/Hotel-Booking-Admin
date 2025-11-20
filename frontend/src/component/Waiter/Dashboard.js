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
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order / Table Management</h1>
            </div>
            <div className=" p-4 flex flex-wrap">
                {getCafeTableData.map((item, idx) => (
                    <Link to={'/waiter/table/'+item._id} className='p-3 w-1/6 '>
                        <div key={idx} className=" p-8 bg-white rounded-md hover:shadow-xl cursor-pointer relative">
                            <img src={tableImg} alt="table" className="w-24 mx-auto" />
                            <div className='flex justify-between items-center '>
                                <h3>{item.title}</h3>
                                <p>member : {item.limit}</p>
                            </div>
                            <div className='absolute right-4 top-4'>
                                {item.status === true ?
                                    <p className='bg-green-400 px-2 text-xs rounded-[4px]'>Avaible</p> :
                                    <p className='bg-red-500 px-2 text-xs  rounded-[4px]'>occupide</p>
                                }
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
