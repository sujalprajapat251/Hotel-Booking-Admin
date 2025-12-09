import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCafeTable } from '../../Redux/Slice/cafeTable.slice';
import { SOCKET_URL } from '../../Utils/baseUrl';
import { updateCafeItemStatus } from '../../Redux/Slice/Chef.slice';
import { io } from 'socket.io-client';
import { receiveNotification } from '../../Redux/Slice/notifications.slice';
import { setAlert } from '../../Redux/Slice/alert.slice';
export default function Dashboard() {

  const dispatch = useDispatch();
  const orders = useSelector((state) => state.cafeTable.cafeTable);
  const currentUser = useSelector((state) => state.staff.currentUser);
  useEffect(() => {
    dispatch(getAllCafeTable());
  }, [dispatch]);

  const [menu, setMenu] = useState([]);
  const [activeTableId, setActiveTableId] = useState(null);
  useEffect(() => {
    if (orders?.length) {
      // If no active table is selected, set to first order
      if (!activeTableId) {
        setMenu(orders[0]?.lastUnpaidOrder || []);
        setActiveTableId(orders[0]?.id || orders[0]?._id || null);
      } else {
        // Find the currently active table in the refreshed orders
        const activeTable = orders.find(o => (o.id || o._id) === activeTableId);
        if (activeTable) {
          // Update menu for the active table with fresh data
          setMenu(activeTable?.lastUnpaidOrder || []);
        } else {
          // If active table no longer exists, switch to first order
          setMenu(orders[0]?.lastUnpaidOrder || []);
          setActiveTableId(orders[0]?.id || orders[0]?._id || null);
        }
      }
    } else {
      setMenu([]);
      setActiveTableId(null);
    }
  }, [orders]);

  const calculateItemsTotal = (items = []) => {
    return items.reduce((sum, item) => {
      if (!item || !item.product || !item.product.price) return sum;
      return sum + item.product.price * (item.qty || 1);
    }, 0);
  };
  const total = calculateItemsTotal(menu?.items);
  const handleChnage = (ele) => {
    setMenu(ele?.lastUnpaidOrder);
    setActiveTableId(ele?.id || ele?._id || null);
  }
  const handleserved = async (ele) => {
    let orderData = {
      orderId: menu?._id,
      itemId: ele._id
    };
    const result = await dispatch(updateCafeItemStatus(orderData));
    if (result) {
      dispatch(getAllCafeTable());
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const s = io(SOCKET_URL, { auth: { token, userId }, transports: ['websocket','polling'], withCredentials: true });
    s.on('connect', () => { console.log('socket connected', s.id); });
    s.on('connect_error', (err) => { console.error('socket connect_error', err?.message || err); });
    s.on('error', (err) => { console.error('socket error', err?.message || err); });
    const refresh = () => { dispatch(getAllCafeTable()); };
    s.on('cafe_order_changed', refresh);
    s.on('bar_order_changed', refresh);
    s.on('restaurant_order_changed', refresh);
    s.on('cafe_table_status_changed', refresh);
    s.on('bar_table_status_changed', refresh);
    s.on('restaurant_table_status_changed', refresh);
    s.on('notify', (data) => {
      const myDeptId = currentUser?.department?._id || currentUser?.departmentId;
      if (!data?.departmentId || !myDeptId || String(myDeptId) === String(data.departmentId)) {
        dispatch(receiveNotification(data));
      }
      if (data?.type === 'item_ready') {
        const tbl = data?.tableId || data?.payload?.tableId;
        if (!activeTableId || !tbl || String(activeTableId) === String(tbl)) {
          const title = data?.tableTitle || data?.payload?.tableTitle || '';
          const itemName = data?.itemName || data?.payload?.itemName || '';
          const msg = itemName && title ? `${itemName} is ready on ${title}` : 'Item is ready to serve';
          dispatch(setAlert({ text: msg, color: 'success' }));
          dispatch(getAllCafeTable());
        }
      }
    });
    return () => {
      s.disconnect();
    };
  }, [dispatch]);
  return (
    <div className='p-2 sm:p-4 md:p-6 bg-[#f0f3fb] min-h-screen'>
      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 mt-6 sm:mt-3 md:mt-1">Dashboard</h1>

      <div className="py-4 sm:py-6">
        <div className="block gap-5 md:flex">
          {/* Left column */}
          <aside className="w-full md:w-[30%]">
          
            <div className="space-y-2 mb-6 md:space-y-3">
              {orders.map((o) => {
                const doneCount = o?.lastUnpaidOrder?.items?.filter(i => i.status === "Done").length || 0;
                return (

                  <div
                    key={o.id || o._id}
                    className={`flex items-center justify-between border rounded p-4 bg-white shadow-sm cursor-pointer transition-transform duration-200 ${activeTableId === (o.id || o._id) ? "scale-[103%] shadow-md" : "hover:scale-[1.01]"}`}
                    onClick={() => { handleChnage(o) }}>
                    <div>
                      <div className="font-semibold">{o.title}</div>
                      {/* <div className="text-xs text-gray-500">{o.date}</div> */}
                    </div>
                    {doneCount > 0 && (
                      <div className="text-xs text-red-600 font-medium ms-auto me-3">
                        {doneCount} item{doneCount > 1 ? "s" : ""} unserved
                      </div>
                    )}
                    <div className="text-gray-400">›</div>
                  </div>
                )
              })}
            </div>
          </aside>

          {/* Right column */}
          <main className="w-full md:w-[70%]">
            <div className="border rounded bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order Details</h2>
                </div>
              </div>

              <div className="border-t border-b py-4">
                {menu?.items?.length > 0 ? <div className="space-y-4">
                  {menu?.items?.map((m) => (
                    <div key={m._id} className='py-3 border-b last:border-b-0'>
                      <div className="flex items-center gap-4 ">
                        <img src={`${m?.product?.image}`} alt="dish" className="w-14 h-14 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-medium">{m?.product?.name}</div>
                          <div className="text-sm text-gray-500">Qty: {m.qty}</div>
                          <div className="text-sm text-gray-500">description : {m.description || '--'} </div>
                        </div>
                        <div className="text-sm font-medium">${m?.product?.price * m.qty}.00</div>
                      </div>
                      {m.status === "Done" ?(
                        <div className="flex justify-end gap-3" onClick={()=>handleserved(m)}>
                          <button className="px-4 py-2 rounded text-sm bg-green-700 text-white hover:bg-green-800">Served</button>
                        </div>
                      ):
                      <p className={`ms-auto  text-sm text-end ${m.status === 'Pending' ? 'text-yellow-400' : m.status === 'Preparing' ? 'text-blue-600' : 'text-green-600'}`}>{m.status}</p>
                    }

                    </div>
                  ))}
                </div> :
                  <div className='h-[200px] flex items-center justify-center text-2xl text-gray-500'>
                    No Order Yet
                  </div>
                }

              </div>
              <div className="flex items-center justify-between mt-4 py-3">
                <div className="font-semibold">Total</div>
                <div className="font-semibold">${total}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
