import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { Search, X, Check } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCafeUnpaid, updateCafePayment, updateCafeItemStatus } from '../../Redux/Slice/Accountant.slice';
import { SOCKET_URL } from '../../Utils/baseUrl';
import { io } from 'socket.io-client';
function Dashboard() {

  const dispatch = useDispatch();
  const orders = useSelector((state) => state.accountant?.orderData || []);
  const refreshTimeoutRef = useRef(null);
  const isRefreshingRef = useRef(false);
  useEffect(() => {
    dispatch(getAllCafeUnpaid());
  }, [dispatch]);

  const refresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(async () => {
      if (isRefreshingRef.current) return;
      isRefreshingRef.current = true;
      await dispatch(getAllCafeUnpaid());
      isRefreshingRef.current = false;
      refreshTimeoutRef.current = null;
    }, 300);
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
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [dispatch, refresh]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("");

  const [menu, setMenu] = useState([]);
  const [activeTableId, setActiveTableId] = useState(null);
  useEffect(() => {
    if (orders && orders.length > 0) {
      setMenu(orders[0]);
      setActiveTableId(orders[0]?.id || orders[0]?._id || null);
    } else {
      setMenu(null);
      setActiveTableId(null);
    }
  }, [orders])

  const calculateItemsTotal = useCallback((items = []) => {
    return items
      .filter(item => item.status !== "Reject by chef")
      .reduce((sum, item) => {
        if (!item || !item.product || !item.product.price) return sum;
        return sum + item.product.price * (item.qty || 1);
      }, 0);
  }, []);

  const total = useMemo(() => calculateItemsTotal(menu?.items), [calculateItemsTotal, menu?.items]);
  const hasOrder = (menu?.items?.length || 0) > 0;
  
  const handleChnage = useCallback((ele) => {
    setMenu(ele);
    setActiveTableId(ele?.id || ele?._id || null);
  }, []);
  
  const lastActionRef = useRef(0);
  const handleserved = useCallback(async (ele) => {
    const now = Date.now();
    if (now - lastActionRef.current < 1500) return;
    lastActionRef.current = now;
    const orderId = menu?.orderId || menu?._id;
    if (!orderId) return;
    try {
      await dispatch(updateCafeItemStatus({ orderId, itemId: ele._id }));
      dispatch(getAllCafeUnpaid());
    } catch {}
  }, [menu?.orderId, menu?._id, dispatch]);

  const onKey = useCallback((e) => {
    if (e.key === "Escape") setIsModalOpen(false);
  }, []);
  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    }
  }, [isModalOpen, onKey]);

  return (
    <div className='p-2 sm:p-4 md:p-6 bg-[#f0f3fb] min-h-screen'>
      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 mt-6 sm:mt-3 md:mt-2">Dashboard</h1>

      <div className="py-4 sm:py-5 md:py-6">
        <div className="block gap-5 lg:flex">
          {/* Left column */}
          <aside className="w-full lg:w-[30%]">
            {/* <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div> */}
            <div className="space-y-2 mb-6 md:space-y-3">
              {orders.length > 0 ? (
                orders.map((o) => {
                  const items = o?.items || [];
                  const title = (o?.from === 'cafe' || o.from ==="bar" || o.from==="restaurant") ? `Table: ${o?.table?.title || o?.table}` : `Room: ${o?.room || o?.name || 'Guest'}`;
                  return (

                    <div 
                    key={o.id || o._id}
                    className={`flex items-center justify-between border rounded p-4 bg-white shadow-sm cursor-pointer transition-transform duration-200 ${activeTableId === (o.id || o._id) ? "scale-[103%] shadow-md" : "hover:scale-[1.01]"}`} 
                    onClick={() => { handleChnage(o) }}>
                      <div className='w-full'>
                        <div className='flex justify-between items-center flex-wrap gap-1 sm:gap-0'>
                        <div className="font-semibold text-[14px] sm:text-base">{title}</div>
                        <div className="font-semibold text-xs ms-auto text-gray-500 break-all sm:break-normal">#{o._id}</div>

                        </div>
                        <div className="text-xs text-gray-500">{o?.name || ''}</div>
                        <div className="text-xs text-gray-500">{ o?.contact  || ''}</div>
                      </div>

                    </div>
                  )
                })
              ) : (
                <div className="border rounded p-8 bg-white shadow-sm">
                  <div className="text-center text-gray-500 text-lg">
                    No payment pending
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Right column */}
          <main className="w-full lg:w-[70%]">
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
                        <img src={ `${m.product.image}`} alt="dish" className="w-14 h-14 rounded-full object-cover" />
                        <div className="flex-1">
                          <div className="font-medium">{m.product.name}</div>
                          <div className="text-sm text-gray-500">Qty: {m.qty}</div>
                          <div className="text-sm text-gray-500">description : {m.description || '--'} </div>
                        </div>
                        <div className="text-sm font-medium">${m.product.price}.00</div>
                        <p className={`ms-auto  text-sm text-end ${m.status === 'Pending' ? 'text-yellow-400' : m.status === 'Preparing' ? 'text-blue-600' :  m.status === 'Done' ? 'text-green-600' : m.status === 'Reject by chef' ? 'text-red-400' : 'text-gray-500'}`}>{m.status}</p>
                      </div>
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

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { if (hasOrder) setIsModalOpen(true); }}
                  disabled={!hasOrder}
                  className={`px-4 py-2 rounded text-sm ${hasOrder ? 'bg-green-700 text-white hover:bg-green-800' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                >
                  Pay
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
          aria-hidden={false}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[92%] max-w-lg rounded-[4px] shadow-2xl p-6 relative"
          >
            {/* Close Icon */}
            <button
              onClick={() => { setIsModalOpen(false); setPaymentMethod(''); }}
              className="absolute right-5 top-5 text-gray-500 hover:text-black"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>

            {/* Modal Content */}
            <h2 id="payment-modal-title" className="text-lg font-semibold mb-2">
              Select Payment Method
            </h2>
            <div className="text-sm text-gray-800 mb-5">Choose how the guest will pay. Total: <span className="font-semibold">${total}</span></div>

            <div className="space-y-4">
              {[
                { id: 'upi', label: 'UPI', desc: 'Fast UPI payment' },
                { id: 'card', label: 'Credit Card', desc: 'Visa/Mastercard' },
                { id: 'cash', label: 'Cash', desc: 'Pay in hand' },
              ].map((p) => {
                const selected = paymentMethod === p.id;
                return (
                  <label
                    key={p.id}
                    className={`flex items-center justify-between gap-2 border p-3 rounded-lg cursor-pointer hover:shadow-sm transition-all ${selected ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value={p.id}
                        checked={selected}
                        onChange={() => setPaymentMethod(p.id)}
                        className="sr-only"
                        aria-checked={selected}
                      />
                      <div
                        className={`w-5 h-5 flex items-center justify-center rounded-full border ${selected ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'}`}
                        aria-hidden
                      >
                        <span className={`${selected ? 'block w-2 h-2 rounded-full bg-white' : 'hidden'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{p.label}</span>
                        <span className="text-xs text-gray-500">{p.desc}</span>
                      </div>
                    </div>
                    <div className="ml-2">
                      {selected ? <Check size={20} className="text-green-600" /> : null}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => { setIsModalOpen(false); setPaymentMethod(''); }}
                className="w-full sm:w-auto px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const orderId = menu?.orderId || menu?._id;
                  if (!orderId) return;
                  await dispatch(updateCafePayment({ orderId, paymentMethod }));
                  // dispatch(getAllCafeUnpaid());
                  setIsModalOpen(false);
                  setPaymentMethod('');
                }}
                className={`w-full sm:w-auto px-5 py-2 rounded-md text-white font-medium ${paymentMethod ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
                disabled={!paymentMethod}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default React.memo(Dashboard);
