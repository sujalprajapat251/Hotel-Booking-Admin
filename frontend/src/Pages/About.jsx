import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import editImg from '../Images/edit.svg';
import deleteImg from '../Images/delete.svg';
import "../Style/vaidik.css";
import { useFormik } from 'formik';
import * as Yup from "yup";

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
    <div className="bg-[#F8FAFC] px-4 md:px-8 py-6 min-h-screen">
      <section className="py-5">
        <h1 className="text-2xl font-semibold text-senary">About</h1>
      </section>

      <div className="flex flex-col md:flex-row justify-between items-center bg-[#876B56] py-3 px-4 rounded-md gap-3">
        <div>
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full sm:w-64 focus:outline-none"
          />
        </div>

        <div className='flex'>
          <Link className='me-3' to=''>
            <div className='mv_View_btn'><span>View</span></div>
          </Link>
          <button onClick={() => setIsAddModalOpen(true)}>
              <div className="mv_Add_btn bg-primary hover:bg-secondary"><span>+ Add</span></div>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto mt-5 bg-white rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead className="bg-[#f5f7fb] text-[#555] uppercase text-xs font-semibold">
            <tr>
              <th className="py-3 px-4 text-left">No</th>
              <th className="py-3 px-4 text-left">Image</th>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Description</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                <td className="py-4 px-4">{item.no}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <img
                        src={item.image}
                        alt={item.name}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-700">
                  <div className="flex items-center gap-2">
                      {item.title}
                  </div>
                </td>
                {/* <td className="py-4 px-4 text-gray-700">
                  <div className="flex items-center gap-2">
                      {item.subtitle}
                  </div>
                </td> */}
                <td className="py-4 px-4">{item.description}</td>

                <td className="py-4 px-4">
                  <div className="mv_table_action flex">
                    {/* <FiEdit2 className="text-[#3f51b5] cursor-pointer" />
                      <MdDelete className="text-[#f44336] cursor-pointer" /> */}
                      <div className="cursor-pointer" onClick={() => {
                        setEditItem(item);
                        setEditTitle(item.title || "");
                        setEditDescription(item.description || "");
                        setEditImageFile(null);
                        setEditImagePreview(item.image || null);
                        setIsEditOpen(true);
                      }}><img src={editImg} alt='edit' /></div>
                      <div><img src={deleteImg} alt='delete' /></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setIsEditOpen(false)} />
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className='flex items-start justify-between mb-4'>
              <h2 className="text-2xl font-semibold text-quinary">Edit About Us</h2>
              <button
                className="text-gray-500 hover:text-black text-3xl"
                onClick={() => setIsEditOpen(false)}
              >
                &times;
              </button>
            </div>

            <div className="mt-3 mb-3">
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full rounded-[4px] h-20 border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
              />
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
                className="mv_user_cancel hover:bg-quinary"
                onClick={() => {
                  setIsEditOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="mv_user_add bg-quinary hover:bg-white"
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

export default About;