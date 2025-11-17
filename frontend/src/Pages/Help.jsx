import { useState } from "react";
import { Plus, Minus, Search } from "lucide-react";
import { useFormik } from 'formik';
import * as Yup from "yup";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");
  const initialFaqs = [
    {
      id: 1,
      question: "How do I connect my device to my TV for streaming?",
      answer:
        "You can connect devices like smartphones, tablets, or laptops to your TV using an HDMI cable or wirelessly via Chromecast, Apple TV, or other streaming devices.",
    },
    { id: 2, question: "What are some popular OTT platforms?", answer: "Some popular OTT platforms include Netflix, Amazon Prime Video, Hulu, Disney+, and HBO Max." },
    { id: 3, question: "What is the difference between OTT and IPTV?", answer: "OTT delivers content over the internet, while IPTV delivers content through a private network." },
    { id: 4, question: "Are there parental control options?", answer: "You can connect devices like smartphones, tablets or other streaming devices." },
    {
      id: 5,
      question: "How do I find specific content on an OTT platform?",
      answer: "Most OTT platforms have search functions and categorized sections to help you find specific movies, shows, or genres easily.",
    },
    {
      id: 6,
      question: "What kind of content is available on OTT platforms?",
      answer: "OTT platforms offer a wide range of content including movies, TV shows, documentaries, live sports, and original programming across various genres.",
    },
  ];

  const [faqs, setFaqs] = useState(initialFaqs);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredFaqs = faqs.filter((item) =>
    item.question.toLowerCase().includes(search.toLowerCase()) ||
    item.answer.toLowerCase().includes(search.toLowerCase())
  );

  const formik = useFormik({
    initialValues: {
      question: '',
      answer: '',
    },
    validationSchema: Yup.object({
      question: Yup.string().required('Question is required'),
      answer: Yup.string().required('Answer is required'),
    }),
    onSubmit: (values, { resetForm }) => {
      const nextId = faqs && faqs.length ? Math.max(...faqs.map(d => d.id || 0)) + 1 : 1;
      const newItem = {
        id: nextId,
        question: values.question,
        answer: values.answer,
        status: 'Pending',
      };
      setFaqs(prev => [...prev, newItem]);
      resetForm();
      setIsAddModalOpen(false);
    },
  });

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    formik.resetForm();
  };

  return (
    <div className="w-full min-h-screen bg-[#F0F3FB] text-black p-4 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Faq</h1>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-white py-3 px-4 mt-2 rounded-md gap-3">
  
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
          <button onClick={() => setIsAddModalOpen(true)}>
            <div className="mv_Add_btn bg-primary hover:bg-secondary"><span>+ Add</span></div>
          </button>
        </div>
      </div>

      <div className="flex flex-col mt-4 gap-4">
        {filteredFaqs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-white border border-gray-200 rounded-lg p-4 transition-all"
          >
            <div
              className="flex items-center justify-between cursor-pointer text-[16px]"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-center gap-3">
                <span className="bg-gray-200 border border-gray-300 w-10 h-10 flex items-center justify-center rounded-md text-sm">
                  {String(faq.id).padStart(2, "0")}
                </span>
                <p className="text-sm md:text-base max-w-[200px] sm:max-w-full">
                  {faq.question}
                </p>
              </div>

              <span>
                {openIndex === index ? <Minus /> : <Plus />}
              </span>
            </div>

            {openIndex === index && faq.answer && (
              <div className="mt-3 ml-14 text-gray-600 text-sm md:text-base pr-6 flex justify-between items-start">
                <p className="max-w-[90%]">{faq.answer}</p>
                <div className="mv_table_action flex">
                  <div><FiEdit className="text-[#6777ef] text-[18px] cursor-pointer" /></div>
                  <div><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Add Modal */}
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
                      name="question"
                      type="text"
                      placeholder="Enter Question"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.question}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                  />
                  {formik.touched.question && formik.errors.question ? (
                      <p className="text-sm text-red-500">{formik.errors.question}</p>
                  ) : null}
              </div>

              <div className="flex flex-col mb-4">
                  <label htmlFor="answer" className="text-sm font-medium text-black mb-1">Answer</label>
                  <textarea
                      id="answer"
                      name="answer"
                      rows="4"
                      placeholder="Enter Answer"
                      className="w-full rounded-[4px] border border-gray-200 px-2 py-2 focus:outline-none bg-[#1414140F]"
                      value={formik.values.answer}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                  ></textarea>
                  {formik.touched.answer && formik.errors.answer ? (
                      <p className="text-sm text-red-500">{formik.errors.answer}</p>
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
}

export default FAQPage;