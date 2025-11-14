import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import viewImg from '../Images/view.png'
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      setIsAddModalOpen(false);
    },
  });

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    formik.resetForm();
  };

  return (
    <div className="bg-[#F8FAFC] px-4 md:px-8 py-6">

    <section className="py-5">
      <h1 className="text-2xl font-semibold text-senary">Blog</h1>
    </section>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-quinary py-3 px-4 rounded-md gap-3">
            <div>
                <input
                    type="text"
                    placeholder="Search"
                    className="p-2 rounded-sm w-full sm:w-64 focus:outline-none"
                />
            </div>
            <div className='flex'>
                {/* <Link className='me-3' to=''>
                    <div className='mv_View_btn'><span>View</span></div>
                </Link> */}
                <button onClick={() => setIsAddModalOpen(true)}>
                    <div className="mv_Add_btn bg-primary hover:bg-secondary"><span>+ Add</span></div>
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-5 bg-white rounded-sm shadow-sm">
            <table className="w-full border-collapse">
                <thead className="bg-[#ffffff] text-balck border-b border-[#14141433]">
                    <tr>
                        <th className="py-4 px-4 text-left">No</th>
                        <th className="py-4 px-4 text-left">Image</th>
                        <th className="py-4 px-4 text-left">Title</th>
                        <th className="py-4 px-4 text-left">Sub Title</th>
                        <th className="py-4 px-4 text-left">Description</th>
                        <th className="py-4 px-4 text-left">Date</th>
                        <th className="py-4 px-4 text-left">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((item, index) => (
                        <tr
                            key={index}
                            className="hover:bg-gray-50 transition"
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
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                    {item.title}
                                </div>
                            </td>

                            {/* subtitle */}
                            <td className="py-4 px-4">
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
                                    <button onClick={() => handleViewClick(item)} className="cursor-pointer"><div><img src={viewImg} alt="view" /></div></button>
                                    <div><img src={editImg} alt='edit' /></div>
                                    <div><img src={deleteImg} alt='delete' /></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* View Modal */}
        {isModalOpen && selectedItem && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleCloseModal}></div>
                
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-[80%] sm:max-w-md">
                        {/* Modal Header */}
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                            <div className="flex items-start justify-between mb-4">
                                <h3 className="text-lg font-semibold text-quinary">Blog Details</h3>
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
                            <div className="md:flex justify-between">
                                    
                                    {/* Image */}
                                    <div className="flex items-center me-4 md:mb-0 mb-4">
                                        <img
                                            src={selectedItem.image}
                                            alt={selectedItem.name}
                                            className="min-w-32 h-32 m-auto"
                                        />
                                    </div>
                                    
                                    {/* Details */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Name:</span>
                                            <span className="text-gray-900">{selectedItem.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Title:</span>
                                            <span className="text-gray-900">{selectedItem.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Sub Title:</span>
                                            <span className="text-gray-900">{selectedItem.subtitle}</span>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Description:</span>
                                            <span className="text-gray-900">{selectedItem.description}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-gray-700 min-w-[120px]">Date:</span>
                                            <span className="text-gray-900">{selectedItem.date}</span>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Add Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={handleAddModalClose}></div>
            <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-semibold text-quinary">Add About Us</h2>
                <button onClick={handleAddModalClose} className="text-gray-500 hover:text-gray-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form className="" onSubmit={formik.handleSubmit}>
                <div className="flex flex-col mb-4">
                  <label htmlFor="title" className="text-sm font-medium text-black mb-1">Title</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter Title"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.title && formik.errors.title ? (
                    <p className="text-sm text-red-500">{formik.errors.title}</p>
                  ) : null}
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="subtitle" className="text-sm font-medium text-black mb-1">Sub Title</label>
                  <input
                    id="subtitle"
                    name="subtitle"
                    type="text"
                    placeholder="Enter Sub Title"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    value={formik.values.subtitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.subtitle && formik.errors.subtitle ? (
                    <p className="text-sm text-red-500">{formik.errors.subtitle}</p>
                  ) : null}
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="description" className="text-sm font-medium text-black mb-1">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    placeholder="Enter Description"
                    className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  ></textarea>
                  {formik.touched.description && formik.errors.description ? (
                    <p className="text-sm text-red-500">{formik.errors.description}</p>
                  ) : null}
                </div>

                <div className="flex flex-col mb-4">
                  <label htmlFor="image" className="text-sm font-medium text-black mb-1">Image</label>
                  <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-200 px-2 py-2 text-gray-500 bg-[#1414140F]">
                    <span className="truncate">
                      {formik.values.image ? formik.values.image.name : 'Choose file'}
                    </span>
                    <span className="rounded-[4px] bg-quinary px-4 py-1 text-white text-sm">Browse</span>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.currentTarget.files && event.currentTarget.files[0];
                        formik.setFieldValue('image', file);
                      }}
                      onBlur={formik.handleBlur}
                    />
                  </label>
                  {formik.touched.image && formik.errors.image ? (
                    <p className="text-sm text-red-500">{formik.errors.image}</p>
                  ) : null}
                </div>

                <div className="flex items-center justify-center pt-4">
                  <button
                    type="button"
                    onClick={handleAddModalClose}
                    className="mv_user_cancel hover:bg-quinary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="mv_user_add bg-quinary hover:bg-white"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
    </div>
  );
};

export default Blog;

