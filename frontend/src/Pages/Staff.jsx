import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Plus, RefreshCw, Download, ChevronLeft, ChevronRight, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import { FiEdit } from 'react-icons/fi';
import { RiDeleteBinLine } from 'react-icons/ri';

const StaffTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    No: true,
    name: true,
    designation: true,
    mobile: true,
    email: true,
    joiningDate: true,
    address: true,
    actions: true
  });

  const staffData = [
    { id: 1, name: 'Bertie Jones', designation: 'Cook', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Sarah Smith', designation: 'Kitchen Manager', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/12/2018', address: '22,tilak appt. surat', image: 'https://i.pravatar.cc/150?img=2' },
    { id: 3, name: 'Bethaney Spence', designation: 'Casino Host', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '201, Shyamal, Puna', image: 'https://i.pravatar.cc/150?img=3' },
    { id: 4, name: 'Jay Soni', designation: 'Driver', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=4' },
    { id: 5, name: 'Pam Abbott', designation: 'Purchase Officer', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=5' },
    { id: 6, name: 'Wesley Casey', designation: 'Receptionist', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=6' },
    { id: 7, name: 'Ivan Bell', designation: 'Kitchen Manager', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=7' },
    { id: 8, name: 'Jay Soni', designation: 'Events Manager', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=8' },
    { id: 9, name: 'Robin Graves', designation: 'Driver', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=9' },
    { id: 10, name: 'Elsie Cruz', designation: 'Driver', mobile: '1234567890', email: 'test@email.com', joiningDate: '02/25/2018', address: '11,Shyam appt. Rajkot', image: 'https://i.pravatar.cc/150?img=10' },
    { id: 11, name: 'Mike Johnson', designation: 'Chef', mobile: '1234567890', email: 'test@email.com', joiningDate: '03/15/2018', address: '15,Park street, Mumbai', image: 'https://i.pravatar.cc/150?img=11' },
    { id: 12, name: 'Lisa Anderson', designation: 'Manager', mobile: '1234567890', email: 'test@email.com', joiningDate: '04/10/2018', address: '28,Beach road, Goa', image: 'https://i.pravatar.cc/150?img=12' },
    { id: 13, name: 'Tom Wilson', designation: 'Security', mobile: '1234567890', email: 'test@email.com', joiningDate: '05/20/2018', address: '33,Lake view, Pune', image: 'https://i.pravatar.cc/150?img=13' },
    { id: 14, name: 'Emma Davis', designation: 'Housekeeping', mobile: '1234567890', email: 'test@email.com', joiningDate: '06/08/2018', address: '42,River side, Delhi', image: 'https://i.pravatar.cc/150?img=14' },
    { id: 15, name: 'Chris Brown', designation: 'Waiter', mobile: '1234567890', email: 'test@email.com', joiningDate: '07/12/2018', address: '55,Hill top, Shimla', image: 'https://i.pravatar.cc/150?img=15' },
    { id: 16, name: 'Anna Taylor', designation: 'Receptionist', mobile: '1234567890', email: 'test@email.com', joiningDate: '08/25/2018', address: '67,Market road, Jaipur', image: 'https://i.pravatar.cc/150?img=16' }
  ];

  const filteredData = staffData.filter(staff =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.mobile.includes(searchTerm) ||
    staff.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const toggleColumn = (column) => {
    setVisibleColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowColumnDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className='p-3 md:p-4 lg:p-5  bg-[#F0F3FB]'>
        <p className=' text-[20px] font-semiboldtext-black '>All Staffs</p>
        <div className="w-full mt-3 md:mt-5">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
              <div className='flex gap-2 md:gap-5 sm:justify-between'>
                <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">All Staffs</p>

                {/* Search Bar */}
                <div className="relative  max-w-md">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              <div>
                {/* Action Buttons */}
                <div className="flex items-center gap-1 justify-end mt-2">
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                      className="p-2 text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors"
                      title="Show/Hide Columns"
                    >
                      <Filter size={20} />
                    </button>

                    {showColumnDropdown && (
                      <div className="absolute right-0 mt-2 w-44 md600:w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 ">
                        <div className="px-3 py-2 md600:px-4 md:py-3 border-b border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700">Show/Hide Column</h3>
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {Object.keys(visibleColumns).map((column) => (
                            <label
                              key={column}
                              className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={visibleColumns[column]}
                                onChange={() => toggleColumn(column)}
                                className="w-4 h-4 text-[#876B56] bg-gray-100 border-gray-300 rounded focus:ring-[#B79982] focus:ring-2"
                              />
                              <span className="ml-2 text-sm text-gray-700 capitalize">
                                {column === 'joiningDate' ? 'Joining Date' : column}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh">
                    <RefreshCw size={20} />
                  </button>
                  <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download">
                    <Download size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full whitespace-nowrap">
                <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10">
                  <tr>
                    {visibleColumns.No && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">NO.</th>
                    )}
                    {visibleColumns.name && (
                      <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Name</th>
                    )}
                    {visibleColumns.designation && (
                      <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Designation</th>
                    )}
                    {visibleColumns.mobile && (
                      <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Mobile</th>
                    )}
                    {visibleColumns.email && (
                      <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Email</th>
                    )}
                    {visibleColumns.joiningDate && (
                      <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Joining Date</th>
                    )}
                    {visibleColumns.address && (
                      <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Address</th>
                    )}
                    {visibleColumns.actions && (
                      <th className=" px-5 py-3 md600:py-4 lg:px-6  text-left text-sm font-bold text-[#755647]">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentData.map((staff, index) => (
                    <tr
                      key={staff.id}
                      className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                    >
                      {visibleColumns.No && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{index + 1}</td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={staff.image}
                              alt={staff.name}
                              className="w-10 h-10 rounded-full object-cover border-2 border-[#E3C78A]"
                            />
                            <span className="text-sm font-medium text-gray-800">{staff.name}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.designation && (
                        <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{staff.designation}</td>
                      )}
                      {visibleColumns.mobile && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6">
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <Phone size={16} />
                            {staff.mobile}
                          </div>
                        </td>
                      )}
                      {visibleColumns.email && (
                        <td className="px-5 py-2 md600:py-3 lg:px-6">
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <Mail size={16} />
                            {staff.email}
                          </div>
                        </td>
                      )}
                      {visibleColumns.joiningDate && (
                        <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{staff.joiningDate}</td>
                      )}
                      {visibleColumns.address && (
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2 text-sm text-orange-600">
                            <MapPin size={16} />
                            {staff.address}
                          </div>
                        </td>
                      )}
                      {visibleColumns.actions && (
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                              <FiEdit size={16} />
                            </button>
                            <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                              <RiDeleteBinLine size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-1 sm:gap-3 md600:gap-2 md:gap-3">
                <span className="text-sm text-gray-600">Items per page:</span>
                <div className="relative">
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#B79982] appearance-none bg-white cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-3  md600:gap-2 md:gap-3">
                <span className="text-sm text-gray-600">
                  {startIndex + 1} - {Math.min(endIndex, filteredData.length)} of {filteredData.length}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffTable;