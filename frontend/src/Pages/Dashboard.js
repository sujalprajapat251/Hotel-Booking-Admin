import React from 'react';
import { PiCurrencyDollarSimpleBold } from "react-icons/pi";
import { MdLocalHotel } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { LuNotebook } from "react-icons/lu";

export const Dashboard = () => {

  const data = [
    {
      id: 1,
      Title: 'John',
      value: 20,
      Icon: <LuNotebook />,
      color: "#000",
      barvalue: 50,
      barcolor: '#EC0927'
    },
    {
      id: 2,
      Title: 'Jane',
      value: 18,
      Icon: <MdLocalHotel />,
      color: "#000",
      barvalue: 50,
      barcolor: '#EC5C09'
    },
    {
      id: 3,
      Title: 'John',
      value: 20,
      Icon: <FaUsers />,
      color: "#000",
      barvalue: 75,
      barcolor: '#4F15E0'
    },
    {
      id: 4,
      Title: 'Jane',
      value: 18,
      Icon: <PiCurrencyDollarSimpleBold />,
      color: "#000",
      barvalue: 50,
      barcolor: '#4EB045'
    }
  ]

  return (
    <>
      <div className='p-3 sm:p-5 md600:p-3 md:p-5 bg-[#F0F3FB] h-full'>

        <div className='sm:flex items-center justify-between'>
          <div>
            <p className='text-[20px] md:text-[24px] xl:text-[28px] font-bold text-gray-800 md600:px-4'>Hi, Welcome back!</p>
            <p className='font-bold text-gray-800 md600:px-4'>Dashboard</p>
          </div>
          <div className='text-end'>
            <h2 className='font-bold text-gray-800 md600:px-4'>Customer Ratings</h2>
            <div className='flex items-center md600:px-4 justify-end'>
              <div className='flex'>
                {[...Array(5)].map((_, i) => (
                  <span key={i} className='relative'>
                    <span className='text-gray-300 text-[16px] md600:text-[18px] lg:text-[20ox]' >★</span>
                    <span
                      className='text-yellow-400 text-[16px] md600:text-[18px] lg:text-[20ox] absolute top-0 left-0 overflow-hidden'
                      style={{ width: i < 4 ? '100%' : (i < 5 ? '50%' : '0%') }}
                    >
                      ★
                    </span>
                  </span>
                ))}
              </div>
              <span className='ml-2 text-gray-700'>4.5/5</span>
            </div>
          </div>
        </div>


        <div className='grid grid-cols-1 md600:grid-cols-2 xl:grid-cols-4 mt-3 gap-5 md600:gap-4'>
          {data.map((item) => (
            <div className='bg-white rounded-lg shadow-md p-4 md600:p-3 md600:m-0'>
              <div className='flex items-center justify-between'>
                <div className='w-12 h-12 rounded-full flex items-center justify-center' style={{ backgroundColor: item.color }}>
                  <div className='text-[22px] text-white'>{item.Icon}</div>
                </div>
                <div className='text-center'>
                  <h2 className='text-lg font-bold text-gray-800'>{item.Title}</h2>
                  <p className='text-lg font-bold text-gray-800'>{item.value}</p>
                </div>
              </div>
              <div className='w-full h-4 bg-gray-200 rounded-full mt-10 relative '>
                <div className='h-full rounded-full' style={{ width: `${item.barvalue}%`, background: `linear-gradient(90deg, ${item.barcolor} 0%, ${item.barcolor}80 100%)` }}></div>
                <div className='absolute inset-0 flex items-center justify-start pl-2 text-xs text-white font-bold' style={{ width: `${item.barvalue}%` }}>
                  {item.barvalue}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div >
    </>
  )
}
