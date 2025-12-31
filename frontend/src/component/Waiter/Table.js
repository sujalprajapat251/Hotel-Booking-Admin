import React, { useEffect, useCallback } from 'react'
import tableImg from '../../Images/table.png'
import { useDispatch, useSelector } from 'react-redux';
import { getAllCafeTable } from '../../Redux/Slice/cafeTable.slice';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../../Utils/baseUrl';

export default function Dashboard() {
  const dispatch = useDispatch();
  const getCafeTableData = useSelector((state) => state.cafeTable.cafeTable);

  // Memoized refresh function
  const refresh = useCallback(() => {
    dispatch(getAllCafeTable());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllCafeTable());
  }, [dispatch]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const s = io(SOCKET_URL, { auth: { token, userId }, transports: ['websocket','polling'], withCredentials: true });
    s.on('connect', () => { console.log('socket connected', s.id); });
    s.on('connect_error', (err) => { console.error('socket connect_error', err?.message || err); });
    s.on('error', (err) => { console.error('socket error', err?.message || err); });
    
    s.on('cafe_order_changed', refresh);
    s.on('bar_order_changed', refresh);
    s.on('restaurant_order_changed', refresh);
    s.on('cafe_table_status_changed', refresh);
    s.on('bar_table_status_changed', refresh);
    s.on('restaurant_table_status_changed', refresh);
    
    return () => {
      s.off('cafe_order_changed', refresh);
      s.off('bar_order_changed', refresh);
      s.off('restaurant_order_changed', refresh);
      s.off('cafe_table_status_changed', refresh);
      s.off('bar_table_status_changed', refresh);
      s.off('restaurant_table_status_changed', refresh);
      s.disconnect();
    };
  }, [dispatch, refresh]);
  return (
    <div className="p-4 md:p-6 bg-[#f0f3fb] h-full">
      <div className="mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800">Order / Table Management</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-3 md:p-4">
        {getCafeTableData.map((item, idx) => (
          <Link to={'/waiter/table/' + item._id} className='block' key={item._id || idx}>
            <div className="p-8 sm:p-10 bg-white rounded-md hover:shadow-xl cursor-pointer relative">
              <img src={tableImg} alt="table" className="w-24 mx-auto" />
              <p className='text-center mt-3 text-sm sm:text-base'>
                {item.title} &nbsp; member: {item.limit}
              </p>  
              <div className='absolute right-3 top-4'>
                {item.status === true ?
                  <p className='px-2 py-0.5 text-xs rounded-xl border border-green-500 text-green-600 bg-green-50'>Available</p> :
                  <p className='px-2 py-0.5 text-xs rounded-xl border border-red-500 text-red-600 bg-red-50'>Occupied</p>
                }
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
