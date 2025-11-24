import React,{ useState, useEffect } from 'react'
import { Search, X, Check } from 'lucide-react';
export default function Dashboard() {

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setIsModalOpen(false);
    }
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
  }, [isModalOpen]);

  const orders = [
    { id: 4, title: "Order #table 4", date: "November 24, 2025 at 11:26 AM" },
    { id: 5, title: "Order #table 5", date: "March 17, 2025 at 11:22 AM" },
    { id: 6, title: "Order #table 6", date: "November 20, 2025 at 09:31 AM" },
    ];
    
    const menu = [
    { id: 1, name: "crispy Burger", qty: 1, price: 199 },
    { id: 2, name: "spicy crispy Burger", qty: 1, price: 199 },
    { id: 3, name: "uttapam", qty: 1, price: 199 },
    ];
    
    const total = menu.reduce((s, i) => s + i.price * i.qty, 0);
    
    // Use the uploaded image file path here (will be transformed by the environment)
    const asset = "/mnt/data/19497e2b-f6e6-40d2-86f5-3d75e74f2953.png";

  return (
    <div className='p-2 sm:p-4 md:p-6 bg-[#f0f3fb] min-h-screen'>
      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
 
      <div className="py-6">
        <div className="block gap-5 lg:flex">
          {/* Left column */}
          <aside className="w-full lg:w-[30%]">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="space-y-2 mb-6 md:space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between border rounded p-4 bg-white shadow-sm">
                  <div>
                    <div className="font-semibold">{o.title}</div>
                    <div className="text-xs text-gray-500">{o.date}</div>
                  </div>
                  <div className="text-gray-400">›</div>
                </div>
              ))}
            </div>
          </aside>
 
          {/* Right column */}
          <main className="w-full lg:w-[70%]">
            <div className="border rounded bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Order Details</h2>
                  <div className="text-xs text-gray-400">11/24/2025, 11:26:30 AM</div>
                </div>
                <div className="text-sm text-gray-600">(Table : 6)</div>
              </div>
 
              <div className="border-t border-b py-4">
                <div className="space-y-4">
                  {menu.map((m) => (
                    <div key={m.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                      <img src={asset} alt="dish" className="w-14 h-14 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-sm text-gray-500">Qty: {m.qty}</div>
                      </div>
                      <div className="text-sm font-medium">₹{m.price}.00</div>
                    </div>
                  ))}
                </div>
              </div>
 
              <div className="flex items-center justify-between mt-4 py-3">
                <div className="font-semibold">Total</div>
                <div className="font-semibold">₹ {total}</div>
              </div>
 
              <div className="flex justify-end gap-3 mt-6">
                <button className="px-4 py-2 border rounded text-sm bg-white hover:bg-gray-50">Cancel</button>
                <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 rounded text-sm bg-green-700 text-white hover:bg-green-800">Accept</button>
              </div>
                  
            </div>
          </main>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
          aria-hidden={false}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-modal-title"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[92%] max-w-lg rounded-xl shadow-2xl p-6 relative"
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
            <div className="text-sm text-gray-800 mb-5">Choose how the guest will pay. Total: <span className="font-semibold">₹{total}</span></div>

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
                onClick={() => { alert(`Payment Selected: ${paymentMethod}`); setIsModalOpen(false); setPaymentMethod(''); }}
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
