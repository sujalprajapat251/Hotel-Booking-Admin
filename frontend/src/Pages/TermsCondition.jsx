import React, { useState, useEffect } from 'react';
import { RiDeleteBinLine } from 'react-icons/ri';
import { FiEdit } from 'react-icons/fi';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllTerms, createTerms, updateTerms, deleteTerms } from '../Redux/Slice/terms.slice';

const TermsTable = () => {
  // const initialTerms = [
  //   {
  //     title: 'Acceptance of Terms',
  //     description:
  //       'To use our platform, you must be at least 18 years of age or the age of majority in your jurisdiction. If you are under 18, you may use our services only with the involvement and consent of a parent or legal guardian. By using our platform, you represent and warrant that you meet the eligibility requirements and that you have the legal capacity to enter into a binding agreement with us.',
  //   },
  //   {
  //     title: 'User Accounts',
  //     description:
  //       'When you create an account on our platform, you agree to provide accurate, complete, and current information at all times. You are responsible for maintaining the confidentiality of your login credentials and all activities that occur under your account. If you believe your account has been compromised, you must notify us immediately. We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.',
  //   },
  //   {
  //     title: 'Subscription and Billing',
  //     description:
  //       'Access to premium content requires a valid subscription. Fees, renewal terms, and cancellation policies are clearly outlined at the time of subscription. We reserve the right to change pricing with prior notice.',
  //   },
  //   {
  //     title: 'Termination of Service',
  //     description:
  //       'We reserve the right to suspend, restrict, or permanently terminate your access to our platform at any time and for any reason, including but not limited to violations of these Terms, fraudulent or abusive behavior, non-payment of subscription fees, or any conduct that harms or threatens the integrity of our services or other users. Such termination may occur with or without prior notice, and we are not liable for any resulting loss of access to content or services.',
  //   },
  // ];

  // const [terms, setTerms] = useState(initialTerms);

  const dispatch = useDispatch();
  const { terms } = useSelector((state) => state.terms);

  const [search, setSearch] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // 🔹 Initial API Call
  useEffect(() => {
    dispatch(getAllTerms());
  }, [dispatch]);

  const filteredTerms = terms?.filter(
    (item) =>
      item?.title?.toLowerCase().includes(search.toLowerCase()) ||
      item?.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required'),
      description: Yup.string().required('Description is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      if (isEditMode) {
        const targetId = editingItem?._id || editingItem?.id;
        dispatch(updateTerms({ id: targetId, ...values })).then(() => {
          dispatch(getAllTerms());
        });
      } else {
        dispatch(createTerms(values)).then(() => {
          dispatch(getAllTerms());
        });
      }
      resetForm();
      setIsAddModalOpen(false);
      setIsEditMode(false);
      setEditingItem(null);
    },
  });

  const handleEditClick = (item) => {
    setIsEditMode(true);
    setEditingItem(item);
    formik.setValues({
      title: item.title,
      description: item.description,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

const handleDeleteConfirm = () => {
    if (itemToDelete) {
      const targetId = itemToDelete._id || itemToDelete.id;
      dispatch(deleteTerms({ id: targetId })).then(() => {
        dispatch(getAllTerms());
      });
    }
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-full min-h-screen bg-[#F0F3FB] text-black p-4 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-2xl font-bold">Terms & Conditions</h1>
      </div>

      <div className="md600:flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-[4x]">
        <div className='flex gap-2 md:gap-6 sm:justify-between'>
          <p className="text-[15px] font-semibold text-gray-800 text-nowrap content-center">Terms & Conditions</p>

          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search Terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B79982] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <div className='flex'>
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingItem(null);
              formik.resetForm();
              setIsAddModalOpen(true);
            }}
          >
            <div className="mv_Add_btn bg-primary hover:bg-secondary"><span>+ Add Term</span></div>
          </button>
        </div>
      </div>

      <div className="block mt-4">
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-10 py-4 text-left text-sm font-semibold tracking-wide w-[20%]">Title</th>
                <th className="px-10 py-4 text-left text-sm font-semibold tracking-wide w-[65%]">Description</th>
                <th className="px-4 py-4 text-left text-sm font-semibold tracking-wide w-[15%]">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {[...filteredTerms].reverse().map((item, index) => (
                <tr key={index} className="hover:bg-gradient-to-r hover:from-[#F7DF9C]/10 hover:to-[#E3C78A]/10">
                  <td className="px-10 py-6 font-medium text-gray-800 align-top text-[15px]">{item.title}</td>
                  <td className="px-10 py-6 text-gray-700 align-top leading-relaxed text-[15px]">{item.description}</td>
                  <td className="px-2 py-6 align-top">
                    <div className="mv_table_action flex">
                      <div onClick={() => handleEditClick(item)}>
                        <FiEdit className="text-[#6777ef] text-[18px]" /></div>
                      <div onClick={() => handleDeleteClick(item)}><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTerms?.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4">
                    No terms found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsAddModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
                <h2 className="text-2xl font-semibold text-black">
                    {isEditMode ? 'Edit Terms & Conditions' : 'Add Terms & Conditions'}
                </h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-500 hover:text-gray-800">
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

              <div className="flex items-center justify-center pt-4">
                  <button
                      type="button"
                      onClick={() => setIsAddModalOpen(false)}
                      className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
                  >
                      Cancel
                  </button>
                  <button
                      type="submit"
                      className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
                  >
                      {isEditMode ? 'Edit' : 'Add'}
                  </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Term</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete?</p>
            <div className="flex items-center justify-center gap-3">
              <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TermsTable;