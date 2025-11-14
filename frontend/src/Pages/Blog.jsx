import React from 'react';
import { Link } from 'react-router-dom';
import editImg from '../Images/edit.svg'
import deleteImg from '../Images/delete.svg'
import "../Style/vaidik.css"

const bookings = [
  {
      no: 1,
      name: "Smita Parikh",
      title: "Hello",
      subtitle: "Hello",
      date: "02/07/2018",
      description: "AAAAAAA",
      image: "https://i.pravatar.cc/40?img=1",
  },
  {
      no: 2,
      name: "Sarah Smith",
      title: "Hello",
      subtitle: "Hello",
      date: "02/12/2018",
      description: "BBBBB",
      image: "https://i.pravatar.cc/40?img=1",
  },
  {
      no: 3,
      name: "Pankaj Sinha",
      title: "Hello",
      subtitle: "Hello",
      date: "02/11/2018",
      description: "CCCCCCCCC",
      image: "https://i.pravatar.cc/40?img=1",
  },
];

const Blog = () => {

  return (
    <div className="bg-[#F8FAFC] px-4 md:px-8 py-6 min-h-screen">

    <section className="py-5">
      <h1 className="text-2xl font-semibold text-senary">Blog</h1>
    </section>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#876B56] py-3 px-4 rounded-md gap-3">
            <div>
                <input
                    type="text"
                    placeholder="Search"
                    className="p-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none"
                />
            </div>
            <div className='flex'>
                <Link className='me-3' to=''>
                    <div className='mv_View_btn'><span>View</span></div>
                </Link>
                <Link to=''>
                    <div className="mv_Add_btn bg-primary hover:bg-secondary"><span>+ Add</span></div>
                </Link>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-5 bg-white rounded-lg shadow-sm">
            <table className="w-full border-collapse">
                <thead className="bg-[#f5f7fb] text-[#555] uppercase text-xs font-semibold">
                    <tr>
                        <th className="py-3 px-4 text-left">No</th>
                        <th className="py-3 px-4 text-left">Image</th>
                        <th className="py-3 px-4 text-left">Title</th>
                        <th className="py-3 px-4 text-left">Sub Title</th>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((item, index) => (
                        <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                            <td className="py-4 px-4">{item.no}</td>

                            {/* Guest Name */}
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </div>
                            </td>

                            {/* title */}
                            <td className="py-4 px-4 text-gray-700">
                                <div className="flex items-center gap-2">
                                    {item.title}
                                </div>
                            </td>

                            {/* subtitle */}
                            <td className="py-4 px-4 text-gray-700">
                                <div className="flex items-center gap-2">
                                    {item.subtitle}
                                </div>
                            </td>

                            {/* Arrival & Departure */}
                            <td className="py-4 px-4">{item.description}</td>
                            <td className="py-4 px-4">{item.date}</td>

                            {/* Actions */}
                            {/* <td className="items-center flex gap-3 text-lg">
                                
                            </td> */}
                            <td className="py-4 px-4">
                                <div className="mv_table_action flex">
                                    {/* <FiEdit2 className="text-[#3f51b5] cursor-pointer" />
                                    <MdDelete className="text-[#f44336] cursor-pointer" /> */}
                                    <div><img src={editImg} alt='edit' /></div>
                                    <div><img src={deleteImg} alt='delete' /></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
  );
};

export default Blog;

