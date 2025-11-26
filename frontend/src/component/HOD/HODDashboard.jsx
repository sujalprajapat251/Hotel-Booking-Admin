import React from 'react';
import { LuCircleArrowDown, LuCircleArrowUp } from "react-icons/lu";
import Newbookingchart from '../Newbookingchart';
import Availablerooms from '../Availavleroomschart';
import Revenuechart from '../Revenuechart';
import Checkoutchart from '../Checkoutchart';
import Reservationchart from '../Reservationchart';

const HODDashboard = () => {

  const roomData = {
    occupied: 125,
    reserved: 87,
    available: 57,
    notReady: 25
  };

  const total = roomData.occupied + roomData.reserved + roomData.available + roomData.notReady;

  const percentages = {
    occupied: (roomData.occupied / total) * 100,
    reserved: (roomData.reserved / total) * 100,
    available: (roomData.available / total) * 100,
    notReady: (roomData.notReady / total) * 100
  };

  const colors = {
    primary: '#F7DF9C',
    secondary: '#E3C78A',
    tertiary: '#B79982',
    quaternary: '#A3876A',
    quinary: '#876B56',
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

  return (
    <div className="p-4 md:p-6 bg-[#f0f3fb] h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">HOD Dashboard</h1>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5'>
        <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
          borderColor: '#E3C78A',
          boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
        }}>
          <div className='sm:flex justify-between items-end'>
            <div className='mb-5'>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>New Booking</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>1879</p>
              <div className='flex gap-1 items-center mt-5'>
                <LuCircleArrowUp className='text-[20px] text-green-500' />
                <p className='text-green-500'>+7.5%</p>
              </div>
            </div>
            <div className='w-[220px] ms-auto'>
              <Newbookingchart />
            </div>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
          borderColor: '#E3C78A',
          boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
        }}>
          <div className='sm:flex justify-between items-end'>
            <div className='mb-5'>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Available Rooms</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>55</p>
              <div className='flex gap-1 items-center mt-5'>
                <LuCircleArrowDown className='text-[20px] text-red-500' />
                <p className='text-red-500'>-5.7%</p>
              </div>
            </div>
            <div className='w-[180px] ms-auto'>
              <Availablerooms />
            </div>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
          borderColor: '#E3C78A',
          boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
        }}>
          <div className='sm:flex justify-between items-end'>
            <div className='mb-5'>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Revenue</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>$2287</p>
              <div className='flex gap-1 items-center mt-5'>
                <LuCircleArrowUp className='text-[20px] text-green-500' />
                <p className='text-green-500'>+5.3%</p>
              </div>
            </div>
            <div className='w-[220px] h-[80px] ms-auto'>
              <Revenuechart />
            </div>
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
          borderColor: '#E3C78A',
          boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
        }}>
          <div className='sm:flex justify-between items-end'>
            <div className='mb-5'>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Checkout</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>567</p>
              <div className='flex gap-1 items-center mt-5'>
                <LuCircleArrowDown className='text-[20px] text-red-500' />
                <p className='text-red-500'>-2.4%</p>
              </div>
            </div>
            <div className='w-[220px] ms-auto'>
              <Checkoutchart />
            </div>
          </div>
        </div>
      </div>

      <div className='mt-5 rounded-lg shadow-sm w-full'>
        <div className='lg:flex gap-5 justify-between'>
          <div className='bg-white p-3 lg:p-5 rounded-xl lg:w-[32.33%] border-2' style={{
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

            <div className="grid grid-cols-2 md:gap-3 lg:gap-5">
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
    </div>
  );
};

export default HODDashboard;