import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCafecategory } from '../../Redux/Slice/cafecategorySlice';
import { getAllCafeitem } from '../../Redux/Slice/cafeitemSlice';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { IMAGE_URL, SOCKET_URL } from '../../Utils/baseUrl';
import { addItemToTableOrder, removeItemFromOrder } from '../../Redux/Slice/Waiter.slice';
import { getCafeTableById, updateCafeTable } from '../../Redux/Slice/cafeTable.slice';
import { getAllBarcategory } from '../../Redux/Slice/barcategorySlice';
import { getAllBaritem } from '../../Redux/Slice/baritemSlice';
import { getAllRestaurantcategory } from '../../Redux/Slice/restaurantcategorySlice';
import { getAllRestaurantitem } from '../../Redux/Slice/restaurantitemSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function TableOrder() {
    const dispatch = useDispatch();
    const [activeCategory, setActiveCategory] = useState("All");
    const [selected, setSelected] = useState([]); // CART ITEMS
    const { id } = useParams()
    const [socket, setSocket] = useState(null);
    const { currentUser, loading, success, message } = useSelector((state) => state.staff);
    const cafeCategory = useSelector(state => state.cafecategory.cafecategory);
    const cafeItems = useSelector(state => state.cafe.cafe);

    const barCategory = useSelector(state => state.barcategory.barcategory);
    const barItems = useSelector(state => state.bar.barItem);

    const restCategory = useSelector(state => state.restaurantcategory.restaurantcategory);
    const restItems = useSelector(state => state.restaurant.restaurant);
    const dept = currentUser?.department?.name?.toLowerCase();

    const Category = dept === "cafe" ? cafeCategory : dept === "bar" ? barCategory : restCategory;

    const Items = dept === "cafe" ? cafeItems : dept === "bar" ? barItems : restItems;

    const singleTable = useSelector((state) => state.cafeTable.singleTable);
    const previousOrder = useSelector((state) => state.cafeTable.currentOrder);

    useEffect(() => {
        if (!currentUser) return;

        const dept = currentUser?.department?.name?.toLowerCase();

        if (dept === "cafe") {
            dispatch(getAllCafecategory());
            dispatch(getAllCafeitem());
        }
        else if (dept === "bar") {
            dispatch(getAllBarcategory());
            dispatch(getAllBaritem());
        }
        else {
            dispatch(getAllRestaurantcategory());
            dispatch(getAllRestaurantitem());
        }

    }, [dispatch, currentUser]);

    useEffect(() => {
        dispatch(getCafeTableById(id));
    }, [id])

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const s = io(SOCKET_URL, { auth: { token, userId }, transports: ['websocket', 'polling'], withCredentials: true });
        s.on('connect', () => { console.log('socket connected', s.id); });
        s.on('connect_error', (err) => { console.error('socket connect_error', err?.message || err); });
        s.on('error', (err) => { console.error('socket error', err?.message || err); });
        setSocket(s);
        s.on('cafe_order_changed', ({ tableId }) => {
            if (tableId === id) {
                dispatch(getCafeTableById(id));
            }
        });
        s.on('cafe_table_status_changed', ({ tableId }) => {
            if (tableId === id) {
                dispatch(getCafeTableById(id));
            }
        });
        s.on('bar_order_changed', ({ tableId }) => {
            if (tableId === id) {
                dispatch(getCafeTableById(id));
            }
        });
        s.on('bar_table_status_changed', ({ tableId }) => {
            if (tableId === id) {
                dispatch(getCafeTableById(id));
            }
        });
        s.on('restaurant_order_changed', ({ tableId }) => {
            if (tableId === id) {
                dispatch(getCafeTableById(id));
            }
        });
        s.on('restaurant_table_status_changed', ({ tableId }) => {
            if (tableId === id) {
                dispatch(getCafeTableById(id));
            }
        });
        return () => {
            s.disconnect();
        };
    }, [dispatch, id]);

    // Filter products based on selected category
    const filteredItems =
        activeCategory === "All"
            ? Items
            : Items.filter((item) => item.category.name === activeCategory);


    const handleAdd = (item) => {
        setSelected((prev) => {
            const exists = prev.find((i) => i.product._id === item._id);

            if (exists) {
                return prev.map((i) =>
                    i.product._id === item._id ? { ...i, qty: i.qty + 1 } : i
                );
            }

            return [...prev, { product: item, qty: 1, description: "" }];
        });
    };

    const incQty = (id) => {
        setSelected(prev =>
            prev.map(i =>
                i.product._id === id ? { ...i, qty: i.qty + 1 } : i
            )
        );
    };

    const decQty = (id) => {
        setSelected(prev =>
            prev
                .map(i =>
                    i.product._id === id ? { ...i, qty: i.qty - 1 } : i
                )
                .filter(i => i.qty > 0)
        );
    };

    const updateDescription = (id, desc) => {
        setSelected(prev =>
            prev.map(i =>
                i.product._id === id ? { ...i, description: desc } : i
            )
        );
    };
    const [desIdx, setDesIdx] = useState(null);

    // Helper function to calculate items total
    const calculateItemsTotal = (items = []) => {
        return items
            .filter(item => item.status !== "Reject by chef")
            .reduce((sum, item) => {
                if (!item || !item.product || !item.product.price) return sum;
                return sum + item.product.price * (item.qty || 1);
            }, 0);
    };

    // Final calculation
    const previousTotal = calculateItemsTotal(previousOrder?.items);
    const newItemsTotal = calculateItemsTotal(selected);

    const total = previousTotal + newItemsTotal;

    const addOrderForm = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: previousOrder?.name || '',
            contact: previousOrder?.contact || ''
        },
        validationSchema: Yup.object({
            name: Yup.string().trim().required('Name is required').min(2, 'Name must be at least 2 characters').max(50, 'Name must be at most 50 characters'),
            contact: Yup.string().trim().required('Contact is required').matches(/^[0-9]{10,15}$/, 'Contact must be 10-15 digits')
        }),
        onSubmit: async (values) => {
            try {
                for (const i of selected) {
                    await dispatch(addItemToTableOrder({
                        tableId: id,
                        product: i.product._id,
                        qty: i.qty,
                        description: i.description || '',
                        name: values.name,
                        contact: values.contact
                    })).unwrap();
                }
                setSelected([]);
                dispatch(getCafeTableById(id));
            } catch (error) {
            }
        }
    });

    return (
        <div className="p-2 sm:p-4 md:p-6 bg-[#f0f3fb] min-h-screen">
            <div className="mb-3 sm:mb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-800 mt-6 sm:mt-1">Order</h1>
                    {singleTable && (
                        <button
                            className="px-2 py-1.5 sm:px-3 sm:py-2 sm:mt-2 text-xs sm:text-sm rounded bg-senary text-white whitespace-nowrap"
                            onClick={async () => {
                                const nextStatus = !(singleTable.status ?? true);
                                await dispatch(updateCafeTable({ id, status: nextStatus })).unwrap();
                                dispatch(getCafeTableById(id));
                            }}
                        >
                            {singleTable.status ? 'Mark Occupied' : 'Mark Available'}
                        </button>
                    )}
                </div>
            </div>

            <div className=" flex-col-reverse xl:flex-row gap-3 sm:gap-4 flex">
                <div className="w-full xl:w-[70%]">

                    <div className="p-2 sm:p-4">
                        <div className="flex flex-wrap gap-2 sm:gap-0">
                            <div className="sm:p-2 flex-shrink-0">
                                <div
                                    onClick={() => setActiveCategory("All")}
                                    className={`py-1 px-2 rounded-md cursor-pointer text-xs sm:text-base
                                        ${activeCategory === "All" ? "shadow-xl bg-senary text-white" : "hover:shadow bg-white text-senary"}`}
                                >
                                    <h3>All</h3>
                                </div>
                            </div>

                            {Category?.map((item, idx) => (
                                <div key={idx} className="sm:p-2 flex-shrink-0">
                                    <div
                                        onClick={() => setActiveCategory(item.name)}
                                        className={`py-1 px-2 rounded-md cursor-pointer text-xs sm:text-base
                                            ${activeCategory === item.name
                                                ? "shadow-xl bg-senary text-white"
                                                : "hover:shadow bg-white text-senary"}`}
                                    >
                                        <h3>{item.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className=" flex flex-wrap items-stretch gap-0 sm:gap-0 mt-5">
                        {filteredItems && filteredItems.length === 0 ? (
                            <div className="w-full p-8 sm:p-6 xl:p-14 text-center text-gray-500">No Items Found</div>
                        ) : (
                            filteredItems?.map((item, idx) => (
                                <div key={idx} className="w-1/2 sm:w-1/2 md:w-1/2 lg:w-1/2 xl:w-1/4 p-1.5 sm:p-3 flex mb-3">
                                    <div
                                        className={`p-2 sm:p-4 w-full min-h-[120px] bg-white rounded-md hover:shadow-xl cursor-pointer 
                                            ${item.available === false ? "opacity-40" : "opacity-100"}`}
                                    >
                                        <img
                                            src={`${item.image}`}
                                            alt={item.name}
                                            className="w-16 sm:w-16 md:w-20 lg:w-24 aspect-square mx-auto rounded-full relative bottom-6 sm:bottom-8 md:bottom-10 shadow-xl"
                                        />

                                        <div className="flex flex-col">
                                            <div className="mt-[-20px] sm:mt-[-25px] md:mt-[-30px] flex justify-between">
                                                <h3 className="font-semibold text-xs sm:text-sm md:text-base truncate pr-1">{item.name}</h3>
                                            </div>

                                            <div className="flex justify-between items-center h-full mt-4 sm:mt-2">
                                                <p
                                                    className="px-2 sm:px-3 py-1 bg-quinary text-white rounded-xl text-xs sm:text-sm cursor-pointer"
                                                    onClick={() => item.available === false ? null : handleAdd(item)}
                                                >
                                                    + Add
                                                </p>

                                                <p className="text-quinary text-xs sm:text-sm">${item.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className='p-p-1.5 sm:p-3 w-full xl:w-[30%] '>
                    <div className="bg-white p-2 sm:p-4 sticky bottom-0 lg:static lg:h-full lg:max-h-screen flex flex-col">
                        <h1 className="text-center text-base sm:text-xl border-b p-1.5 sm:p-2">Order Detail</h1>

                        <div className="mt-2 sm:mt-4 max-h-[250px] sm:max-h-[300px] md:max-h-[400px] overflow-auto flex-1">
                            {previousOrder ? (
                                <div className="mb-4">
                                    {previousOrder.items.map((oi) => (
                                        <div key={oi._id} className="border-b py-2 sm:py-3 opacity-80">
                                            <div className="flex items-center gap-1 sm:gap-2">
                                                <img
                                                    src={`${oi.product?.image}`}
                                                    alt={oi.product?.name}
                                                    className="w-10 sm:w-12 md:w-14 aspect-square rounded-xl flex-shrink-0"
                                                />
                                                <div className="ms-1 sm:ms-3 flex-1 min-w-0">
                                                    <h3 className="font-semibold text-xs sm:text-sm truncate">{oi.product?.name}</h3>
                                                    <p className="text-xs sm:text-sm text-gray-500">${oi.product?.price}</p>
                                                    <p className="text-xs text-gray-500">Qty: {oi.qty}</p>
                                                    {oi.description && <p className="text-xs text-gray-400 truncate">{oi.description}</p>}
                                                </div>
                                                <div className="ms-auto flex-shrink-0">
                                                    {oi.status === 'Pending' && (
                                                        <button
                                                            className="text-red-500 text-xs sm:text-sm px-1 sm:px-2"
                                                            onClick={async () => {
                                                                await dispatch(removeItemFromOrder({ orderId: previousOrder._id, itemId: oi._id })).unwrap();
                                                                dispatch(getCafeTableById(id));
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                    {oi.status === 'Reject by chef' &&(
                                                        <span  className="text-red-500 text-xs sm:text-sm px-1 sm:px-2">
                                                            {oi.status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                            {selected.length === 0 ? (
                                <p className="text-center text-gray-500 text-xs sm:text-sm py-4">No items added</p>
                            ) : (
                                selected.map((item, idx) => (
                                    <div key={item.product._id} className="border-b py-2 sm:py-3">

                                        {/* ITEM ROW */}
                                        <div className="flex items-center gap-1">
                                            <img
                                                src={`${item.product.image}`}
                                                alt={item.product.name}
                                                className="w-10 sm:w-12 md:w-14 aspect-square rounded-xl flex-shrink-0"
                                            />

                                            <div className="ms-1 sm:ms-3 flex-1 min-w-0">
                                                <h3 className="font-semibold text-xs sm:text-sm truncate">{item.product.name}</h3>
                                                <p className="text-xs sm:text-sm text-gray-500">Rs.{item.product.price}</p>
                                            </div>

                                            <div className="flex items-center gap-1 sm:gap-2 ms-auto flex-shrink-0">
                                                <button
                                                    onClick={() => decQty(item.product._id)}
                                                    className="px-1.5 sm:px-2 py-1 bg-gray-300 rounded text-xs sm:text-sm"
                                                >
                                                    -
                                                </button>

                                                <span className="text-xs sm:text-sm min-w-[20px] text-center">{item.qty}</span>

                                                <button
                                                    onClick={() => incQty(item.product._id)}
                                                    className="px-1.5 sm:px-2 py-1 bg-gray-300 rounded text-xs sm:text-sm"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* DESCRIPTION SECTION */}
                                        <div className="flex items-start gap-1 sm:gap-2 p-2 px-3">
                                            {desIdx === idx ? (
                                                <>
                                                    <textarea
                                                        className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-senary text-xs sm:text-sm"
                                                        placeholder="Add description..."
                                                        value={item.description}
                                                        onChange={(e) => updateDescription(item.product._id, e.target.value)}
                                                        rows="2"
                                                    ></textarea>
                                                    <p
                                                        className="text-senary text-xs cursor-pointer flex-shrink-0 mt-1"
                                                        onClick={() => setDesIdx(null)}
                                                    >
                                                        cancel
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className='w-full text-xs break-words'>{item.description}</p>
                                                    <p
                                                        className="text-senary text-xs cursor-pointer flex-shrink-0 whitespace-nowrap"
                                                        onClick={() => setDesIdx(idx)}
                                                    >
                                                        add desc
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <form onSubmit={addOrderForm.handleSubmit}>
                            <div className='border-b p-1.5 sm:p-2'>
                                <input
                                    name='name'
                                    value={addOrderForm.values.name}
                                    onChange={addOrderForm.handleChange}
                                    onBlur={addOrderForm.handleBlur}
                                    className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-senary my-1 sm:my-2 text-xs sm:text-sm"
                                    placeholder='name'
                                ></input>
                                {addOrderForm.touched.name && addOrderForm.errors.name ? (
                                    <p className="text-red-600 text-xs">{addOrderForm.errors.name}</p>
                                ) : null}
                                <input
                                    name='contact'
                                    value={addOrderForm.values.contact}
                                    onChange={addOrderForm.handleChange}
                                    onBlur={addOrderForm.handleBlur}
                                    className="w-full px-2 sm:px-4 py-1.5 sm:py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-senary my-1 sm:my-2 text-xs sm:text-sm"
                                    placeholder='contact'
                                ></input>
                                {addOrderForm.touched.contact && addOrderForm.errors.contact ? (
                                    <p className="text-red-600 text-xs">{addOrderForm.errors.contact}</p>
                                ) : null}
                            </div>
                            <div className='py-2 sm:py-3 flex justify-between items-center'>
                                <h3 className='font-semibold text-sm sm:text-lg'>Total</h3>
                                <p className='text-sm sm:text-base'>${total}</p>
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    type='submit'
                                    className='ms-auto text-center bg-senary text-white py-2 px-3 rounded-sm text-sm sm:text-base cursor-pointer active:opacity-80'
                                >
                                    Add order
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
