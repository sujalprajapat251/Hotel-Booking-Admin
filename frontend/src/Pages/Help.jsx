import { useState, useEffect } from "react";
import { Plus, Minus, Search } from "lucide-react";
import { Filter, RefreshCw, Download, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from "yup";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { getAllFaqs, addFaq, deleteFaq, updateFaq } from '../Redux/Slice/faq.slice';

const FAQPage = () => {

  const dispatch = useDispatch();
  const faqs = useSelector((state) => state.faq.faqs) || [];

  const [openIndex, setOpenIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);


  const filteredFaqs = faqs.filter((item) =>
    item.faqQuestion?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
    item.faqAnswer?.toLowerCase().includes(searchQuery?.toLowerCase())
  );

  const formik = useFormik({
    initialValues: {
      faqQuestion: '',
      faqAnswer: '',
    },
    validationSchema: Yup.object({
      faqQuestion: Yup.string().required('Question is required'),
      faqAnswer: Yup.string().required('Answer is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const faqData = {
        faqQuestion: values.faqQuestion,
        faqAnswer: values.faqAnswer,
      };

      try {
        if (isEditModalOpen) {
          await dispatch(updateFaq({ faqId: editData._id, faqData })).unwrap();
        } else {
          await dispatch(addFaq(faqData)).unwrap();
        }
        resetForm();
        dispatch(getAllFaqs());
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);

      } catch (error) {
        console.error('Failed to process FAQ:', error);
      }
    },
  });

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    formik.resetForm();
  };

  const handleDeleteModalClose = () => {
    setIsDeleteModalOpen(false);
    setSelectedFaqId(null);
  };

  const handleDeleteFaqs = async () => {
    if (!selectedFaqId) return;

    try {
      await dispatch(deleteFaq(selectedFaqId)).unwrap();
      dispatch(getAllFaqs());
    } catch (error) {
      console.error("Failed to delete FAQ:", error);
    }

    setIsDeleteModalOpen(false);
    setSelectedFaqId(null);
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  useEffect(() => {
    dispatch(getAllFaqs());
  }, [dispatch]);

  return (
    <>
      <div className="w-full min-h-screen bg-[#F0F3FB] text-black p-4 md:p-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Faq</h1>
        </div>

        <div className="md600:flex items-center justify-between p-3 border-b border-gray-200 bg-white rounded-[4x]">
          <div className='flex gap-2 md:gap-5 sm:justify-between'>
            <p className="text-[16px] font-semibold text-gray-800 text-nowrap content-center">Faqs</p>

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
          <div className='flex'>
            <button onClick={() => setIsAddModalOpen(true)}>
              <div className="mv_Add_btn bg-primary hover:bg-secondary"><span>+ Add</span></div>
            </button>
          </div>
        </div>

        <div className="flex flex-col mt-4 gap-4">
          {filteredFaqs && filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div
                key={faq.id || index}
                className="bg-white border border-gray-200 rounded-lg p-4 transition-all"
              >
                <div
                  className="flex items-center justify-between cursor-pointer text-[16px]"
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-200 border border-gray-300 w-10 h-10 flex items-center justify-center rounded-md text-sm font-semibold">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-sm md:text-base max-w-[200px] sm:max-w-full font-medium">
                      {faq.faqQuestion}
                    </p>
                  </div>

                  <span className="transition-transform duration-200">
                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                  </span>
                </div>

                {openIndex === index && faq.faqAnswer && (
                  <div className="mt-3 ml-14 text-gray-600 text-sm md:text-base pr-6 flex justify-between items-start animate-fadeIn">
                    <p className="max-w-[90%]">{faq.faqAnswer}</p>
                    <div className="mv_table_action flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditData(faq);
                          formik.setValues({
                            faqQuestion: faq.faqQuestion,
                            faqAnswer: faq.faqAnswer,
                          });
                          setIsEditModalOpen(true);
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        <FiEdit className="text-[#6777ef] text-[18px] cursor-pointer" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFaqId(faq._id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="hover:scale-110 transition-transform"
                      >
                        <RiDeleteBinLine className="text-[#ff5200] text-[18px] cursor-pointer" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
              No FAQs found
            </div>
          )}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleAddModalClose}></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Add Faq </h2>
              <button onClick={handleAddModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form className="" onSubmit={formik.handleSubmit}>
              <div className="flex flex-col mb-4">
                <label htmlFor="question" className="text-sm font-medium text-black mb-1">Question</label>
                <input
                  id="question"
                  name="faqQuestion"
                  type="text"
                  placeholder="Enter Question"
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  value={formik.values.faqQuestion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.faqQuestion && formik.errors.faqQuestion ? (
                  <p className="text-sm text-red-500">{formik.errors.faqQuestion}</p>
                ) : null}
              </div>

              <div className="flex flex-col mb-4">
                <label htmlFor="answer" className="text-sm font-medium text-black mb-1">Answer</label>
                <textarea
                  id="answer"
                  name="faqAnswer"
                  rows="4"
                  placeholder="Enter Answer"
                  className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                  value={formik.values.faqAnswer}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                ></textarea>
                {formik.touched.faqAnswer && formik.errors.faqAnswer ? (
                  <p className="text-sm text-red-500">{formik.errors.faqAnswer}</p>
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

      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Edit FAQ</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="flex flex-col mb-4">
                <label className="text-sm font-medium text-black mb-1">Question</label>
                <input
                  type="text"
                  name="faqQuestion"
                  className="w-full rounded-[4px] border px-2 py-2"
                  value={formik.values.faqQuestion}
                  onChange={formik.handleChange}
                />
              </div>

              <div className="flex flex-col mb-4">
                <label className="text-sm font-medium text-black mb-1">Answer</label>
                <textarea
                  name="faqAnswer"
                  rows="4"
                  className="w-full rounded-[4px] border px-2 py-2"
                  value={formik.values.faqAnswer}
                  onChange={formik.handleChange}
                ></textarea>
              </div>

              <div className="flex items-center justify-center pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="mv_user_cancel">Cancel</button>
                <button type="submit" className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleDeleteModalClose}></div>
          <div className="relative w-full max-w-md rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Delete Blog</h2>
              <button onClick={handleDeleteModalClose} className="text-gray-500 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">Are you sure you want to delete?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleDeleteModalClose}
                className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFaqs}
                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default FAQPage;