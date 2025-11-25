import React, { useEffect, useMemo } from 'react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { IMAGE_URL } from '../../Utils/baseUrl';
import { getCafeOrderStatus, updateCafeItemStatus, setPreparingOrder, clearPreparingOrder } from '../../Redux/Slice/Chef.slice';
import { setAlert } from '../../Redux/Slice/alert.slice';
import { getUserById } from '../../Redux/Slice/user.slice';

export default function Dashboard() {

    const dispatch = useDispatch();
    const data = useSelector((state) => state.chef.orderData);
    const preparingOrder = useSelector((state) => state.chef.preparingOrder);
    const currentUser = useSelector((state) => state.user.currentUser);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        dispatch(getCafeOrderStatus());
        dispatch(getUserById()); // Get current user details
    }, [dispatch]);

    useEffect(() => {
        if (data && data.length > 0) {
            const userPreparingItem = data.find(item => item.status === "Preparing" && item.preparedBy === currentUser?._id);
            if (userPreparingItem) {
                dispatch(setPreparingOrder(userPreparingItem));
            } else if (preparingOrder && preparingOrder.preparedBy !== currentUser?._id) {
                dispatch(clearPreparingOrder());
            }
        }
    }, [data, dispatch, currentUser]);

    const handleAcceptOrder = async (order) => {
        if (order.status === "Preparing" && order.preparedBy && order.preparedBy !== currentUser?._id) {
            dispatch(setAlert({ text: "This order is being prepared by another chef", color: 'error' }));
            return;
        }

        if (order.status === "Preparing" && (!preparingOrder || preparingOrder._id !== order._id)) {
            dispatch(setAlert({ text: "You can only mark your own preparing orders as done", color: 'error' }));
            return;
        }

        if (order.status === "Pending" && preparingOrder) {
            dispatch(setAlert({ text: "You must complete the current order before accepting a new one", color: 'error' }));
            return;
        }

        let orderData = {
            orderId: order.orderId,
            itemId: order._id
        };

        try {
            if (order.status === "Pending") {
                setSelected({ ...order, status: "Preparing" });
            } else if (order.status === "Preparing") {
                setSelected({ ...order, status: "Done" });
            }

            const result = await dispatch(updateCafeItemStatus(orderData));

            if (updateCafeItemStatus.fulfilled.match(result)) {
                if (order.status === "Pending") {
                    localStorage.setItem("itemId", order._id);
                    dispatch(setPreparingOrder(result.payload.items.find(item => item._id === order._id)));
                    dispatch(setAlert({ text: "Order accepted and is now being prepared", color: 'success' }));
                }
                else if (order.status === "Preparing") {
                    let getItemId = localStorage.getItem("itemId");
                    if (getItemId) {
                        localStorage.removeItem("itemId");
                    }
                    dispatch(clearPreparingOrder());
                    dispatch(setAlert({ text: "Order marked as done", color: 'success' }));
                }
            }
        } catch (error) {
            setSelected(order);
            dispatch(setAlert({ text: "Failed to update order status", color: 'error' }));
        }
    }

    const getButtonText = (order) => {
        if (!order) return "Accept";

        if (order.status === "Preparing" && order.preparedBy && order.preparedBy !== currentUser?._id) {
            return "Prepared by another chef";
        }

        if (preparingOrder && preparingOrder._id === order._id) {
            if (order.status === "Preparing") {
                return "Done this order";
            }
        }

        if (order.status === "Pending") {
            return "Accept";
        } else if (order.status === "Preparing") {
            return "Done this order";
        }
        return "Accept";
    }

    const isButtonDisabled = (order) => {
        if (!order) return true;

        // Disable if order is being prepared by another chef
        if (order.status === "Preparing" && order.preparedBy && order.preparedBy !== currentUser?._id) {
            return true;
        }

        // Disable if this is not the order the user is currently preparing and they're trying to mark as done
        if (order.status === "Preparing" && (!preparingOrder || preparingOrder._id !== order._id)) {
            return true;
        }

        // Disable if order is not in a state that allows action
        return !(order.status === "Pending" || (order.status === "Preparing" && preparingOrder && preparingOrder._id === order._id));
    }

    // Check if an order is being prepared by another chef
    const isOrderPreparedByAnotherChef = (order) => {
        return order.status === "Preparing" && order.preparedBy && order.preparedBy !== currentUser?._id;
    }

    useEffect(() => {
        if (selected && data) {
            const updatedSelected = data.find(item => item._id === selected._id);
            if (updatedSelected && updatedSelected.status !== selected.status) {
                setSelected(updatedSelected);
            }
        }
    }, [data, selected]);

    return (
        <>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
                <div className="w-full max-h-screen p-5">
                    <div className='bg-white rounded-xl shadow-md overflow-hidden'>
                        <div className="flex items-center justify-between border-b border-gray-200">
                            <div className="py-3 px-4">
                                <h2 className="text-lg font-semibold text-gray-800">Pending Orders</h2>
                            </div>
                        </div>
                        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
                            <ul className="space-y-2 p-3">
                                {data
                                    ?.filter(item => item.status !== "Done" && item.status !== "Served")
                                    .length === 0 ? (

                                    <div className="bg-white px-4 py-10 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <p className="text-base sm:text-lg font-medium">No pending orders</p>
                                            <p className="text-xs sm:text-sm mt-1">All orders are completed</p>
                                        </div>
                                    </div>
                                ) : (
                                    data.filter(item => item.status !== "Done" && item.status !== "Served").map((item, index) => (
                                        <li
                                            key={index}
                                            onClick={() => !isOrderPreparedByAnotherChef(item) && setSelected(item)}
                                            className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all duration-200 ${selected?._id === item._id
                                                ? "bg-blue-50 border-blue-300 shadow-sm"
                                                : isOrderPreparedByAnotherChef(item)
                                                    ? "bg-gray-100 border-gray-300 opacity-70 cursor-not-allowed"
                                                    : "bg-white border-[#E3C78A] hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="relative">
                                                    <img
                                                        src={`${IMAGE_URL}${item?.product?.image}`}
                                                        alt={item.name}
                                                        className={`w-10 h-10 rounded-lg object-cover border-2 flex-shrink-0 ${isOrderPreparedByAnotherChef(item) 
                                                            ? "border-gray-400" 
                                                            : "border-[#E3C78A]"}`}
                                                    />
                                                    {preparingOrder && preparingOrder._id === item._id && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                                                    )}
                                                    {isOrderPreparedByAnotherChef(item) && (
                                                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate ${isOrderPreparedByAnotherChef(item) ? "text-gray-500" : "text-gray-800"}`}>
                                                        {item?.product?.name}
                                                    </p>
                                                    <p className={`text-xs ${isOrderPreparedByAnotherChef(item) ? "text-gray-400" : "text-gray-500"}`}>
                                                        Qty: {item?.qty} • From: {item?.from}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    item.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                                                        item.status === 'Done' ? 'bg-green-100 text-green-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="w-full max-h-screen p-5">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-200">
                            <div className="py-3 px-4">
                                <h2 className="text-lg font-semibold text-gray-800">Order Details</h2>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto">
                            {selected ? (
                                <div className="space-y-5">
                                    <div className="text-center">
                                        <h3 className={`text-xl font-bold ${isOrderPreparedByAnotherChef(selected) ? "text-gray-500" : "text-gray-800"}`}>{selected?.product?.name}</h3>
                                    </div>

                                    {selected?.product?.image && (
                                        <div className="rounded-lg overflow-hidden shadow-sm">
                                            <img
                                                src={`${IMAGE_URL}${selected?.product?.image}`}
                                                alt={selected?.product?.name}
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                                            <span className="text-gray-600 text-[14px]">Quantity</span>
                                            <span className={`font-semibold ${isOrderPreparedByAnotherChef(selected) ? "text-gray-500" : "text-gray-800"}`}>{selected?.qty}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                                            <span className="text-gray-600 text-[14px]">From</span>
                                            <span className={`font-semibold capitalize text-[15px] ${isOrderPreparedByAnotherChef(selected) ? "text-gray-500" : "text-gray-800"}`}>{selected?.from}</span>
                                        </div>

                                        <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                                            <span className="text-gray-600 text-[14px]">Status</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${selected?.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                selected?.status === 'Preparing' ? 'bg-blue-100 text-blue-800' :
                                                    selected?.status === 'Done' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {selected?.status}
                                            </span>
                                        </div>

                                        {/* {selected?.description && ( */}
                                        <div className="pb-1 border-b border-gray-100">
                                            <span className="text-gray-600 block mb-1 text-[14px]">Description</span>
                                            <p className="text-[#755647]">{selected?.description}</p>
                                        </div>
                                        {/* )} */}
                                    </div>

                                    <div>
                                        <button
                                            className={`w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${isButtonDisabled(selected)
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : selected?.status === 'Preparing'
                                                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                                    : 'bg-[#755647] hover:bg-[#876B56] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                                }`}
                                            onClick={() => handleAcceptOrder(selected)}
                                            disabled={isButtonDisabled(selected)}
                                        >
                                            {getButtonText(selected)}
                                        </button>
                                    </div>

                                    {preparingOrder && preparingOrder._id !== selected?._id && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                                            <p className="text-sm text-orange-700">
                                                <span className="font-semibold">Note:</span> You're preparing "{preparingOrder?.product?.name}".
                                                Complete it before accepting new orders.
                                            </p>
                                        </div>
                                    )}

                                    {preparingOrder && preparingOrder._id === selected?._id && selected?.status === "Preparing" && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                                            <p className="text-sm text-blue-700">
                                                This order is currently being prepared. Click "Done this order" when completed.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-700 mb-1">No Order Selected</h3>
                                    <p className="text-gray-500 text-sm">Select an order from the list to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
