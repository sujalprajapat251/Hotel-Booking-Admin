import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllCafecategory } from '../../Redux/Slice/cafecategorySlice';
import { getAllCafeitem } from '../../Redux/Slice/cafeitemSlice';
import { IMAGE_URL } from '../../Utils/baseUrl';
import { useParams } from 'react-router-dom';
import { addItemToTableOrder, removeItemFromOrder } from '../../Redux/Slice/Waiter.slice';
import { getCafeTableById, updateCafeTable } from '../../Redux/Slice/cafeTable.slice';

export default function TableOrder() {
    const dispatch = useDispatch();
    const [activeCategory, setActiveCategory] = useState("All");
    const [selected, setSelected] = useState([]); // CART ITEMS
    const {id} = useParams()
    const cafecategory = useSelector((state) => state.cafecategory.cafecategory);
    const cafe = useSelector((state) => state.cafe.cafe);
    const singleTable = useSelector((state) => state.cafeTable.singleTable);
    const previousOrder = useSelector((state) => state.cafeTable.currentOrder);

    useEffect(() => {
        dispatch(getAllCafecategory());
        dispatch(getAllCafeitem());
        dispatch(getCafeTableById(id));
    }, [dispatch, id]);

    // Filter products based on selected category
    const filteredItems =
        activeCategory === "All"
            ? cafe
            : cafe.filter((item) => item.category.name === activeCategory);


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

    // total showned
    const total = selected.reduce((sum, item) => {
        return sum + item.product.price * item.qty;
    }, 0);

    const [name,setName] = useState(singleTable?.name || '')
    const [contact,setContact] = useState(singleTable?.contact || '')
    const handleAddOrder = async ()=>{
        try{
            for(const i of selected){
                await dispatch(addItemToTableOrder({
                    tableId: id,
                    product: i.product._id,
                    qty: i.qty,
                    decription: i.description || "",
                    name,
                    contact
                })).unwrap();
            }
            setSelected([]);
            dispatch(getCafeTableById(id));
        }catch(error){
        }
    }

    return (
        <div className="p-4 md:p-6 bg-[#f0f3fb] h-full">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Order</h1>
                    {singleTable && (
                        <button
                            className="px-3 py-2 rounded bg-senary text-white"
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

            <div className="flex">
                <div className="w-[70%]">

                    <div className="p-4 flex flex-wrap">
                        <div className="p-3">
                            <div
                                onClick={() => setActiveCategory("All")}
                                className={`p-4 rounded-md cursor-pointer 
                                    ${activeCategory === "All" ? "shadow-xl bg-senary text-white" : "hover:shadow bg-white text-senary"}`}
                            >
                                <h3>All</h3>
                            </div>
                        </div>

                        {cafecategory.map((item, idx) => (
                            <div key={idx} className="p-3">
                                <div
                                    onClick={() => setActiveCategory(item.name)}
                                    className={`p-4 rounded-md cursor-pointer 
                                        ${activeCategory === item.name
                                            ? "shadow-xl bg-senary text-white"
                                            : "hover:shadow bg-white text-senary"}`}
                                >
                                    <h3>{item.name}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 flex flex-wrap items-stretch">
                        {filteredItems.map((item, idx) => (
                            <div key={idx} className="p-3 w-1/5 flex mt-3">
                                <div
                                    className={`p-4 w-full bg-white rounded-md hover:shadow-xl cursor-pointer 
                                        ${item.available === false ? "opacity-40" : "opacity-100"}`}
                                >
                                    <img
                                        src={`${IMAGE_URL}${item.image}`}
                                        alt={item.name}
                                        className="w-24 aspect-square mx-auto rounded-full relative bottom-10 shadow-xl"
                                    />

                                    <div className="flex flex-col">
                                        <div className="mt-[-30px] flex justify-between">
                                            <h3 className="font-semibold">{item.name}</h3>
                                        </div>

                                        <div className="flex justify-between h-full">
                                            <p
                                                className="px-3 bg-quinary text-white rounded-xl mt-auto cursor-pointer"
                                                onClick={() => item.available === false ? null : handleAdd(item)}
                                            >
                                                + add
                                            </p>

                                            <p className="text-secondary mt-auto">Rs.{item.price}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="w-[30%] h-full bg-white p-4">
                    <h1 className="text-center text-xl border-b p-2">Order Detail</h1>

                    <div className="mt-4 h-[400px] overflow-auto">
                        {previousOrder ? (
                            <div className="mb-4">
                                {previousOrder.items.map((oi) => (
                                    <div key={oi._id} className="border-b py-3 opacity-80">
                                        <div className="flex items-center">
                                            <img
                                                src={`${IMAGE_URL}${oi.product?.image}`}
                                                alt={oi.product?.name}
                                                className="w-14 aspect-square rounded-xl"
                                            />
                                            <div className="ms-3">
                                                <h3 className="font-semibold">{oi.product?.name}</h3>
                                                <p className="text-sm text-gray-500">Rs.{oi.product?.price}</p>
                                                <p className="text-xs text-gray-500">Qty: {oi.qty}</p>
                                                {oi.decription && <p className="text-xs text-gray-400">{oi.decription}</p>}
                                            </div>
                                            <div className="ms-auto">
                                                {oi.status === 'Pending' && (
                                                    <button
                                                        className=" text-red-500 text-sm"
                                                        onClick={async () => {
                                                            await dispatch(removeItemFromOrder({ orderId: previousOrder._id, itemId: oi._id })).unwrap();
                                                            dispatch(getCafeTableById(id));
                                                        }}
                                                    >
                                                        Cancle
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                        {selected.length === 0 ? (
                            <p className="text-center text-gray-500">No items added</p>
                        ) : (
                            selected.map((item, idx) => (
                                <div key={item.product._id} className="border-b py-3">

                                    {/* ITEM ROW */}
                                    <div className="flex items-center">
                                        <img
                                            src={`${IMAGE_URL}${item.product.image}`}
                                            alt={item.product.name}
                                            className="w-14 aspect-square rounded-xl"
                                        />

                                        <div className="ms-3">
                                            <h3 className="font-semibold">{item.product.name}</h3>
                                            <p className="text-sm text-gray-500">Rs.{item.product.price}</p>
                                        </div>

                                        <div className="flex items-center gap-2 ms-auto">
                                            <button
                                                onClick={() => decQty(item.product._id)}
                                                className="px-2 bg-gray-300 rounded"
                                            >
                                                -
                                            </button>

                                            <span>{item.qty}</span>

                                            <button
                                                onClick={() => incQty(item.product._id)}
                                                className="px-2 bg-gray-300 rounded"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* DESCRIPTION SECTION */}
                                    <div className="flex items-center py-3">
                                        {desIdx === idx ? (
                                            <textarea
                                                className="w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-senary"
                                                placeholder="Add description..."
                                                value={item.description}
                                                onChange={(e) => updateDescription(item.product._id, e.target.value)}
                                            ></textarea>
                                        ) :
                                            <p className='w-full text-xs'>
                                                {item.description}</p>}

                                        {desIdx === idx ? (
                                            <p
                                                className="text-senary text-xs ms-3 cursor-pointer"
                                                onClick={() => setDesIdx(null)}
                                            >
                                                cancel
                                            </p>
                                        ) : (
                                            <p
                                                className="text-senary text-xs ms-3 cursor-pointer text-nowrap"
                                                onClick={() => setDesIdx(idx)}
                                            >
                                                add description
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                    </div>
                    <div className=' border-b p-2'>
                        <input value={name} onChange={(e)=>{setName(e.target.value)}} className="w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-senary my-2" placeholder='name'
                        ></input>
                        <input value={contact} onChange={(e)=>{setContact(e.target.value)}} className="w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-senary my-2" placeholder='contact'
                        ></input>
                    </div>
                    <div className='py-3 flex justify-between'>
                        <h3 className='font-semibold text-lg'>Total</h3>
                        <p>Rs . {total}</p>
                    </div>
                    <div className='text-center bg-senary text-white py-2 rounded-lg' onClick={handleAddOrder}>Add order</div>
                </div>
            </div>
        </div>
    );
}
