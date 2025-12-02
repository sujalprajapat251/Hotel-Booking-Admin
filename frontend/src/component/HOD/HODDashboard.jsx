import React, { useEffect } from 'react';
import HODbookingchart from '../HOD/HODbookingchart';
import HODtotalRevenue from '../HOD/HODtotalRevenuechart';
import TotalOrderchart from '../HOD/HODTotalOrderchart';
import HODtotalStaffchart from '../HOD/HODtotalStaffchart';
import HOdMonthlyRevenue from '../HOD/HODMonthlyRevenuechart';
import { getAllHodDashboard, getAllMonthlyRevenue, getAllPaymentMethod } from '../../Redux/Slice/HODdashboard.silce';
import { useDispatch, useSelector } from 'react-redux';

const HODDashboard = () => {

  const dispatch = useDispatch();
  const getHodDashboard = useSelector((state) => state.HODDashboard.getHodDashboard);
  const getPaymentMethod = useSelector((state) => state.HODDashboard.getPaymentMethod);

  const paymentMethods = getPaymentMethod?.paymentMethodSummary || {};
  const fixedOrder = ["card", "cash", "upi"];

  const paymentStats = Object.entries(paymentMethods)
  .sort((a, b) => fixedOrder.indexOf(a[0]) - fixedOrder.indexOf(b[0]))
  .map(([key, value]) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: value.revenue,
  }));

  const totalRevenue = paymentStats.reduce((sum, item) => sum + item.value, 0);

  const colors = [ '#F7DF9C', '#B79982', '#876B56', '#755647', '#E3C78A', '#A3876A' ];

  const stats = paymentStats.map((item, index) => ({
    ...item,
    percentage: totalRevenue ? (item.value / totalRevenue) * 100 : 0,
    color: colors[index % colors.length],
  }));

  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const getCurrentYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    return year;
  };

  useEffect(() => {
    const yearMonth = getCurrentYearMonth();
    const currentYear = getCurrentYear();

    dispatch(getAllHodDashboard(yearMonth));
    dispatch(getAllPaymentMethod());
    dispatch(getAllMonthlyRevenue(currentYear));
  }, [dispatch]);

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
            <div className=''>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>New Orders</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>{getHodDashboard?.newOrders}</p>
            </div>
          </div>
          <div className='w-[220px] ms-auto'>
            <HODbookingchart />
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
          borderColor: '#E3C78A',
          boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
        }}>
          <div className='sm:flex justify-between items-end'>
            <div className=''>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Total Revenue</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>{getHodDashboard?.totalRevenue}</p>
            </div>
          </div>
          <div className='w-[180px] ms-auto'>
            <HODtotalRevenue />
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
          borderColor: '#E3C78A',
          boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
        }}>
          <div className='sm:flex justify-between items-end'>
            <div className=''>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Total Order</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>{getHodDashboard?.totalOrder}</p>
            </div>
          </div>
          <div className='w-[220px] h-[80px] ms-auto'>
            <TotalOrderchart />
          </div>
        </div>
        <div className='bg-white p-4 rounded-xl shadow-lg border-2' style={{
          borderColor: '#E3C78A',
          boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
        }}>
          <div className='sm:flex justify-between items-end'>
            <div className=''>
              <p className='text-[20px] font-semibold' style={{ color: '#755647' }}>Total Staff</p>
              <p className='text-[16px] font-semibold' style={{ color: '#876B56' }}>{getHodDashboard?.totalStaff}</p>
            </div>
          </div>
          <div className='w-[220px] ms-auto'>
            <HODtotalStaffchart />
          </div>
        </div>
      </div>

      <div className='mt-5 rounded-lg shadow-sm w-full'>
        <div className='lg:flex gap-5 justify-between'>
          <div className='bg-white p-3 lg:p-5 rounded-xl lg:w-[32.33%] border-2'
            style={{
              borderColor: '#E3C78A',
              boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
            }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: '#755647' }}>
              Payment Method
            </h2>

            {/* Progress Bar */}
            <div className="flex h-8 xl:h-10 2xl:h-12 rounded-lg overflow-hidden mb-8">
              {stats.map((item, index) => (
                <div
                  key={index}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color
                  }}
                ></div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:gap-3 lg:gap-5">
              {stats.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col border-l-4 pl-3"
                  style={{ borderColor: item.color }}
                >
                  <span className="text-sm mb-1" style={{ color: '#A3876A' }}>{item.label}</span>
                  <p className="text-3xl font-semibold" style={{ color: '#755647' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className='bg-white p-3 lg:p-5 rounded-xl lg:w-[66.34%] mt-5 lg:mt-0 border-2' style={{
            borderColor: '#E3C78A',
            boxShadow: '0 8px 32px rgba(117, 86, 71, 0.12), 0 2px 8px rgba(163, 135, 106, 0.08)'
          }}>
            <h2 className="text-lg font-semibold" style={{ color: '#755647' }}>Monthly Revenue</h2>
            <HOdMonthlyRevenue />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HODDashboard;