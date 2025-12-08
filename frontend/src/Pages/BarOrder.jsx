import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, RefreshCw, Download, ChevronLeft, ChevronRight, Phone, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import { setAlert } from '../Redux/Slice/alert.slice';
import { getAllBarOrder } from '../Redux/Slice/vieworederadmin.slice';
import { IoEyeSharp } from 'react-icons/io5';

const BarOrder = () => {

  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [visibleColumns, setVisibleColumns] = useState({
    No: true,
    name: true,
    contact: true,
    items: true,
    amount: true,
    payment: true,
    paymentMethod: true,
    from: true,
    date: true,
    actions: true,
  });

  const columnLabels = {
    No: 'No.',
    name: 'Name',
    contact: 'Contact',
    items: 'Items',
    amount: 'Amount',
    payment: 'Payment',
    paymentMethod: 'Payment Method',
    from: 'From',
    date: 'Date',
    actions: 'Actions'
  };

  const { barOrder, loading } = useSelector((state) => state.vieworder);

  const getOrderItemCount = (order) => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, item) => sum + (item?.qty || 1), 0);
  };

  const getOrderTotalAmount = (order) => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((sum, item) => {
      const price = item?.product?.price || 0;
      const qty = item?.qty || 1;
      return sum + price * qty;
    }, 0);
  };

  const getItemPreview = (order) => {
    if (!order?.items?.length) return 'No items added';
    const names = order.items
      .map((item) => item?.product?.name)
      .filter(Boolean);
    if (!names.length) return 'No items added';
    if (names.length <= 2) return names.join(', ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2} more`;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Paid':
        return 'border border-green-500 text-green-600 bg-green-50';
      case 'Unpaid':
        return 'border border-red-500 text-red-600 bg-red-50';
      case 'Pending':
        return 'border border-yellow-500 text-yellow-600 bg-yellow-50';
      default:
        return 'border border-gray-500 text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const filteredOrderHistory = barOrder.filter((order) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const name = (order?.name || '').toLowerCase();
    const contact = (order?.contact || '').toLowerCase();
    const fromSource = (order?.from || '').toLowerCase();
    const payment = (order?.payment || '').toLowerCase();
    const paymentMethod = (order?.paymentMethod || '').toLowerCase();
    const itemNames = order?.items
      ?.map((item) => (item?.product?.name || '').toLowerCase())
      .join(' ') || '';
    let formattedDate = '';
    if (order?.createdAt) {
      const formatted = formatDate(order.createdAt);
      formattedDate = (formatted ? formatted.toLowerCase() : '');
      if (formattedDate && !formattedDate.includes(query)) {
        const dashed = formatted.replace(/\//g, "-").toLowerCase();
        formattedDate += ` ${dashed}`;
      }
    }
    const amountValue = getOrderTotalAmount(order);
    const amount = amountValue.toString().toLowerCase();
    const amountWithCurrency = `$${amountValue}`.toLowerCase();

    return name.includes(query) ||
      contact.includes(query) ||
      fromSource.includes(query) ||
      payment.includes(query) ||
      paymentMethod.includes(query) ||
      itemNames.includes(query) ||
      formattedDate.includes(query) ||
      amount.includes(query) ||
      amountWithCurrency.includes(query);
  });

  const totalItems = filteredOrderHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationTotalPages = Math.max(totalPages, 1);
  const safeCurrentPage = Math.min(currentPage, paginationTotalPages);
  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredOrderHistory.slice(startIndex, endIndex);
  const paginationStart = totalItems === 0 ? 0 : startIndex + 1;
  const paginationEnd = totalItems === 0 ? 0 : Math.min(endIndex, totalItems);

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

  useEffect(() => {
    dispatch(getAllBarOrder());
  }, [dispatch]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleDownloadExcel = () => {
    try {
      if (filteredOrderHistory.length === 0) {
        dispatch(setAlert({ text: "No data to export!", color: 'warning' }));
        return;
      }
      const excelData = filteredOrderHistory.map((order, index) => {
        const row = {};

        if (visibleColumns.No) {
          row['No.'] = index + 1;
        }
        if (visibleColumns.name) {
          row['Name'] = order?.name || '';
        }
        if (visibleColumns.contact) {
          row['Contact'] = order?.contact || '';
        }
        if (visibleColumns.items) {
          row['Items'] = getOrderItemCount(order);
        }
        if (visibleColumns.amount) {
          row['Amount'] = getOrderTotalAmount(order);
        }
        if (visibleColumns.payment) {
          row['Payment'] = order?.payment || '';
        }
        if (visibleColumns.paymentMethod) {
          row['Payment Method'] = order?.paymentMethod || '';
        }
        if (visibleColumns.from) {
          row['From'] = order?.from || '';
        }
        if (visibleColumns.date) {
          row['Date'] = order?.createdAt ? formatDate(order.createdAt) : '';
        }

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bar Order');

      const maxWidth = 20;
      const wscols = Object.keys(excelData[0] || {}).map(() => ({ wch: maxWidth }));
      worksheet['!cols'] = wscols;

      const date = new Date();
      const fileName = `Bar_Order_List_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}.xlsx`;

      XLSX.writeFile(workbook, fileName);
      dispatch(setAlert({ text: "Export completed..!", color: 'success' }));
    } catch (error) {
      dispatch(setAlert({ text: "Export failed..!", color: 'error' }));
    }
  };

  const handleRefresh = () => {
    dispatch(getAllBarOrder());
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <>
      <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
        <section className="py-5">
          <h1 className="text-2xl font-semibold text-black">Bar Order</h1>
        </section>

        <div className="w-full">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="md600:flex items-center justify-between p-3 border-b border-gray-200">
              <div className='flex gap-2 md:gap-5 sm:justify-between'>

                {/* Search Bar */}
                <div className="relative  max-w-md">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                              <span className="ml-2 text-sm text-gray-700">
                                {columnLabels[column] || column}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Refresh" onClick={handleRefresh}>
                    <RefreshCw size={20} />
                  </button>
                  <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download" onClick={handleDownloadExcel}>
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
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.No}</th>
                    )}
                    {visibleColumns.name && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.name}</th>
                    )}
                    {visibleColumns.contact && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.contact}</th>
                    )}
                    {visibleColumns.items && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.items}</th>
                    )}
                    {visibleColumns.amount && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.amount}</th>
                    )}
                    {visibleColumns.payment && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.payment}</th>
                    )}
                    {visibleColumns.paymentMethod && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.paymentMethod}</th>
                    )}
                    {visibleColumns.from && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.from}</th>
                    )}
                    {visibleColumns.date && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755647]">{columnLabels.date}</th>
                    )}
                    {visibleColumns.actions && (
                      <th className="px-5 py-3 md600:py-4 lg:px-6 text-left text-sm font-bold text-[#755567]">{columnLabels.actions}</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <RefreshCw className="w-12 h-12 mb-4 text-[#B79982] animate-spin" />
                          <p className="text-lg font-medium">Loading...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentData?.length > 0 ? (
                    currentData.map((order, index) => {
                      const rowNumber = startIndex + index + 1;
                      const itemCount = getOrderItemCount(order);
                      const orderAmount = getOrderTotalAmount(order);
                      const itemPreview = getItemPreview(order);

                      return (
                        <tr
                          key={order?._id || `${order?.name || 'order'}-${index}`}
                          className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                        >
                          {visibleColumns.No && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{rowNumber}</td>
                          )}
                          {visibleColumns.name && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6 capitalize">
                              {order?.name || '—'}
                            </td>
                          )}
                          {visibleColumns.contact && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6">
                              <div className="flex items-center gap-2 text-sm text-gray-700">
                                <Phone size={16} className='text-green-600' />
                                {order?.contact || '—'}
                              </div>
                            </td>
                          )}
                          {visibleColumns.items && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-800">{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                                <span className="text-xs text-gray-500 truncate max-w-[200px]">{itemPreview}</span>
                              </div>
                            </td>
                          )}
                          {visibleColumns.amount && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">${orderAmount}</td>
                          )}
                          {visibleColumns.payment && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">
                              <span className={`inline-flex items-center justify-center w-24 h-8 rounded-xl text-xs font-semibold ${getStatusStyle(order?.payment)}`}>
                                {order?.payment || 'Pending'}
                              </span></td>
                          )}
                          {visibleColumns.paymentMethod && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">{order?.paymentMethod || '—'}</td>
                          )}
                          {visibleColumns.from && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700 capitalize">{order?.from || '—'}</td>
                          )}
                          {visibleColumns.date && (
                            <td className="px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">{order?.createdAt ? formatDate(order.createdAt) : ''}</td>
                          )}

                          {/* Actions */}
                          {visibleColumns.actions && (
                            <td className=" px-5 py-2 md600:py-3 lg:px-6 text-sm text-gray-700">
                              <div className="mv_table_action flex">
                                <div
                                  onClick={() => handleViewOrder(order)}
                                  className="cursor-pointer transition-opacity"
                                >
                                  <IoEyeSharp className='text-[18px] text-quaternary' />
                                </div>
                              </div>
                            </td>
                          )}

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={Object.values(visibleColumns).filter(Boolean).length} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-lg font-medium">No data available</p>
                          <p className="text-sm mt-1">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-3 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg" >
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
                  {paginationStart} - {paginationEnd} of {totalItems}
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationTotalPages))}
                    disabled={currentPage === paginationTotalPages || totalItems === 0}
                    className="text-gray-600 hover:text-[#876B56] hover:bg-[#F7DF9C]/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[4px] shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="">
              {/* Order ID and Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-[#f9fafb]">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">ORDER ID</p>
                  <p className="text-lg font-bold text-gray-800">#{selectedOrder?._id?.slice(-6) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">DATE & TIME</p>
                  <p className="text-lg font-bold text-gray-800">
                    {selectedOrder?.createdAt ? formatDateTime(selectedOrder.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              <div className='border-t-2 border-gray-100 p-6'>
                <h3 className="text-lg font-bold text-gray-800 mb-3">CUSTOMER DETAILS</h3>
                <div className="space-y-2">
                  <div className='flex items-center gap-2'>
                    <span className="text-sm text-gray-600 min-w-[80px]">Name: </span>
                    <span className="text-sm font-medium text-gray-800 capitalize">{selectedOrder?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 min-w-[80px]">Contact: </span>
                    <Phone size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-800">{selectedOrder?.contact || 'N/A'}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className="text-sm text-gray-600 min-w-[80px]">From: </span>
                    <span className="text-sm font-medium text-gray-800 capitalize">{selectedOrder?.from || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className='border-t-2 border-gray-100 p-6'>
                <h3 className="text-lg font-bold text-gray-800 mb-3">ORDER ITEMS</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className='bg-[#f3f4f6]'>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Item</th>
                        <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Qty</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Price</th>
                        <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder?.items?.length > 0 ? (
                        selectedOrder.items.map((item, index) => {
                          const price = item?.product?.price || 0;
                          const qty = item?.qty || 1;
                          const total = price * qty;
                          return (
                            <tr key={item?._id || index} className="border-b border-gray-100">
                              <td className="py-3 px-3 text-sm text-gray-800">{item?.product?.name || 'N/A'}</td>
                              <td className="py-3 px-3 text-sm text-gray-800 text-center">{qty}</td>
                              <td className="py-3 px-3 text-sm text-gray-800 text-right">${price.toFixed(2)}</td>
                              <td className="py-3 px-3 text-sm text-gray-800 text-right">${total.toFixed(2)}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-sm text-gray-500">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount */}
              <div className='px-6 bg-[#f9fafb] border-t-2 border-gray-100'>
                <div className="flex items-center justify-between py-6">
                  <span className="text-xl font-bold text-gray-800">Total Amount</span>
                  <span className="text-xl font-bold text-gray-800">${getOrderTotalAmount(selectedOrder).toFixed(2)}</span>
                </div>

                {/* Payment Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 py-6">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">PAYMENT STATUS</p>
                    <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${getStatusStyle(selectedOrder?.payment)}`}>
                      {selectedOrder?.payment || 'Unpaid'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">PAYMENT METHOD</p>
                    <p className="text-base font-medium text-gray-800 capitalize">{selectedOrder?.paymentMethod || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BarOrder;