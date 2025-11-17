import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "../Style/vaidik.css";
import { useFormik } from 'formik';
import * as Yup from "yup";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { Search } from "lucide-react";

const initialData = [
  { no: 1, name: "Smita Parikh", title: "Hiiu", description: "AAAAAAA", image: "https://i.pravatar.cc/40?img=1" },
  { no: 2, name: "Sarah Smith", title: "yyuy", description: "BBBBB", image: "https://i.pravatar.cc/40?img=2" },
  { no: 3, name: "Pankaj Sinha", title: "fgg", description: "CCCCCCCCC", image: "https://i.pravatar.cc/40?img=3" },
];

const About = () => {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Add modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredData = data.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase()) ||
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const formik = useFormik({
    initialValues: {
      title: '',
      subtitle: '',
      description: '',
      image: null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
      image: Yup.mixed().required('Image is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      const nextNo = data && data.length ? Math.max(...data.map(d => d.no)) + 1 : 1;
      const imageUrl = values.image ? URL.createObjectURL(values.image) : '';
      const newItem = {
        no: nextNo,
        name: values.subtitle || 'Admin',
        title: values.title,
        description: values.description,
        image: imageUrl,
        status: 'Pending',
      };
      setData(prev => [...prev, newItem]);
      resetForm();
      setIsAddModalOpen(false);
    },
  });

  // const handleViewClick = (item) => {
  //   setSelectedItem(item);
  //   setIsModalOpen(true);
  // };
  
  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    formik.resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid':
          return '#4EB045';
      case 'Unpaid':
          return '#EC0927';
      case 'Pending':
          return '#F7DF9C';
      default:
          return '#gray';
    }
  };
  
  return (
    <div className="bg-[#F0F3FB] px-4 md:px-8 py-6 h-full">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-black">About</h1>
      </section>

      <div className='shadow-md rounded-md'>
        <div className="flex flex-col md:flex-row justify-between items-center bg-white py-3 px-4 rounded-md gap-3">

          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search Faq..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className='flex'>
            <Link className='me-3' to=''>
              <div className='mv_Add_btn bg-primary hover:bg-secondary'><span>View</span></div>
            </Link>
            <button onClick={() => setIsAddModalOpen(true)}>
                <div className="mv_Add_btn bg-primary hover:bg-secondary"><span>+ Add</span></div>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-[#B79982] scrollbar-track-[#F7DF9C]/20 hover:scrollbar-thumb-[#876B56]">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
              <tr>
                  <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">No</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Image</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Title</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Description</th>
                  <th className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4 text-left text-sm font-bold text-[#755647]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredData.map((item, index) => (
                  <tr
                      key={index}
                      className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10 transition-all duration-200"
                  >
                    <td className="py-4 px-4">{item.no}</td>

                    {/* Guest Name */}
                    <td className="px-3 py-2 md:px-4 md:py-3 xxl:px-6 2xl:py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 rounded-full object-cover border-2 border-[#E3C78A] shadow-sm"
                          />
                          <div className="absolute -bottom-0 -right-0 w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(item.status) }}></div>
                        </div>
                        {/* <span className="text-sm font-semibold text-gray-800">{item.name}</span> */}
                      </div>
                    </td>

                    {/* title */}
                    <td className="py-4 px-4 whitespace-normal break-words max-w-[160px]">
                      <div className="flex items-center gap-2">
                          {item.title}
                      </div>
                    </td>

                    <td className="py-4 px-4 whitespace-normal break-words max-w-[160px]">{item.description}</td>

                    <td className="py-4 px-4">
                      <div className="mv_table_action flex">
                        {/* <button onClick={() => handleViewClick(item)} className="cursor-pointer"><div><img src={viewImg} alt="view" /></div></button> */}
                        <div><FiEdit 
                            className="text-[#6777ef] text-[18px] cursor-pointer" 
                            onClick={() => {
                              setEditItem(item);
                              setEditTitle(item.title);
                              setEditDescription(item.description);
                              setEditImagePreview(item.image);
                              setIsEditOpen(true);
                            }}
                          />
                        </div>
                        <div><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditOpen(false)} />
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className='flex items-start justify-between mb-5'>
              <h2 className="text-2xl font-semibold text-black">Edit About Us</h2>
              <button
                className="text-gray-500 hover:text-gray-800 text-3xl"
                onClick={() => setIsEditOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="flex flex-col mb-4">
              <label className="text-sm font-medium text-black mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
              />
            </div>

            <div className="flex flex-col mb-4">
              <label className="text-sm font-medium text-black mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-[4px] h-20 border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
              />
            </div>

            <div className="flex flex-col mb-4">
              <label htmlFor="editImage" className="text-sm font-medium text-black mb-1">Image</label>
              <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-200 px-2 py-2 text-gray-500 bg-[#1414140F]">
                <span className="truncate">
                  {editImageFile ? editImageFile.name : (editImagePreview ? 'Current image selected' : 'Choose file')}
                </span>
                <span className="rounded-[4px] bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-1 text-black text-sm">Browse</span>
                <input
                  id="editImage"
                  name="editImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.currentTarget.files && event.currentTarget.files[0];
                    if (file) {
                      setEditImageFile(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </label>
            </div>

            <div className="flex items-center justify-center pt-4">
              <button
                className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                onClick={() => {
                  setIsEditOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                onClick={() => {
                  // Apply update to data
                  if (!editItem) return;
                  const updated = data.map(d => {
                    if (d.no === editItem.no) {
                      return {
                        ...d,
                        title: editTitle,
                        description: editDescription,
                        image: editImagePreview || d.image,
                      };
                    }
                    return d;
                  });
                  setData(updated);
                  setIsEditOpen(false);
                }}
              >
                Update
              </button>
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
              <h2 className="text-2xl font-semibold text-black">Add About Us</h2>
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
                      // className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#e3c78a1a]"
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
                      <span className="rounded-[4px] bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-1 text-black text-sm">Browse</span>
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
                    className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
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

export default About;