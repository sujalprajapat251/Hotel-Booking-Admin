import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import "../Style/vaidik.css"
import { IoEyeSharp } from 'react-icons/io5';
import { getAllContact } from '../Redux/Slice/contactSlice';

const bookings = [
  {
      no: 1,
      name: "Smita Parikh",
      email: "hello@gmail.com",
      mobileno: "	9585742658",
      description: "AAAAAAA",
      image: "https://i.pravatar.cc/40?img=1",
  },
  {
      no: 2,
      name: "Sarah Smith",
      email: "hello@gmail.com",
      mobileno: "7894561230",
      description: "BBBBB",
      image: "https://i.pravatar.cc/40?img=12",
  },
  {
      no: 3,
      name: "Pankaj Sinha",
      email: "hello@gmail.com",
      mobileno: "9328430104",
      description: "CCCCCCCCC",
      image: "https://i.pravatar.cc/40?img=13",
  },
];

const Contact = () => {

  const [isModalOpen, setIsModalOpen] = useState(false);
    const dispatch = useDispatch();
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const contact = useSelector((state) => state.contact.contact)

    useEffect(() => {
      dispatch(getAllContact());
    }, [dispatch]);

    const handleViewClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };

    const formik = useFormik({
        initialValues: {
            title: '',
            subtitle: '',
            description: '',
            image: null,
        },
        validationSchema: Yup.object({
            title: Yup.string().required('Title is required'),
            subtitle: Yup.string().required('Sub Title is required'),
            description: Yup.string().required('Description is required'),
            image: Yup.mixed().required('Image is required'),
        }),
        onSubmit: (values, { resetForm }) => {
            console.log('Submitting About Us form', values);
            resetForm();
        },
    });

    // Filter bookings based on search term
    const filteredBookings = bookings.filter((item) => {
      const searchLower = searchTerm.toLowerCase();
      return (
          item.title?.toLowerCase().includes(searchLower) ||
          item.subtitle?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.date?.toLowerCase().includes(searchLower) ||
          item.name?.toLowerCase().includes(searchLower)
      );
  });

    return (
        <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">

            <section className="py-5">
                <h1 className="text-2xl font-semibold text-black">Contact</h1>
            </section>

            {/* Header */}
            <div className='shadow-md rounded-md'>
                <div className="flex flex-col md:flex-row justify-between items-center bg-white py-3 px-4 rounded-md gap-3">
                    <div>
                        <input
                            type="text"
                            placeholder="Search"
                            className="p-2 rounded-sm border border-gray-300 w-full sm:w-64 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">No</th>
                                <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Name</th>
                                <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Email</th>
                                <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Mobile No.</th>
                                <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Message</th>
                                <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredBookings.map((item, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                                >
                                    <td className="py-4 px-4">{item.no}</td>

                                    {/* Name */}
                                    <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                        </div>
                                    </td>

                                    {/* email */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            {item.email}
                                        </div>
                                    </td>

                                    {/* email */}
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            {item.email}
                                        </div>
                                    </td>

                                    {/* description */}
                                    <td className="py-4 px-4">{item.description}</td>

                                    {/* Actions */}
                                    <td className="py-4 px-4">
                                        <div className="mv_table_action flex">
                                            <div onClick={() => handleViewClick(item)}><IoEyeSharp className='text-[18px]' /></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            {isModalOpen && selectedItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>

                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[80%] sm:max-w-md max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 overflow-wrap-anywhere">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-black">Contact Details</h3>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="inline-flex items-center justify-center p-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="md:flex justify-between gap-4">

                                    {/* Image */}
                                    <div className="flex items-center me-4 md:mb-0 mb-4 flex-shrink-0">
                                        <img
                                            src={selectedItem.image}
                                            alt={selectedItem.name}
                                            className="min-w-32 h-32 m-auto"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[100px] flex-shrink-0">Name:</span>
                                            <span className="text-gray-900 break-words flex-1 min-w-0">{selectedItem.name}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[100px] flex-shrink-0">Email:</span>
                                            <span className="text-gray-900 break-all flex-1 min-w-0">{selectedItem.email}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[100px] flex-shrink-0">Mobile No.:</span>
                                            <span className="text-gray-900 break-words flex-1 min-w-0">{selectedItem.mobileno}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[100px] flex-shrink-0">Message:</span>
                                            <span className="text-gray-900 break-words flex-1 min-w-0">{selectedItem.description}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Contact;

