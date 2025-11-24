import React from 'react'
import { Search } from 'lucide-react';
export default function Dashboard() {

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
        <div className="flex gap-5">
          {/* Left column */}
          <aside className="xl:w-[30%]">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="space-y-3">
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
          <main className="w-full xl:w-[70%]">
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
                <button className="px-4 py-2 rounded text-sm bg-green-700 text-white hover:bg-green-800">Accept</button>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
