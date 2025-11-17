import React,{ useState} from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { useFormik } from 'formik';
import * as Yup from "yup";
import { Search } from "lucide-react";

const TermsTable = () => {
  const initialTerms = [
    {
      title: "Acceptance of Terms",
      description:
        "To use our platform, you must be at least 18 years of age or the age of majority in your jurisdiction. If you are under 18, you may use our services only with the involvement and consent of a parent or legal guardian. By using our platform, you represent and warrant that you meet the eligibility requirements and that you have the legal capacity to enter into a binding agreement with us.",
    },
    {
      title: "User Accounts",
      description:
        "When you create an account on our platform, you agree to provide accurate, complete, and current information at all times. You are responsible for maintaining the confidentiality of your login credentials and all activities that occur under your account. If you believe your account has been compromised, you must notify us immediately. We reserve the right to suspend or terminate accounts that provide false information or violate these Terms.",
    },
    {
      title: "Subscription and Billing",
      description:
        "Access to premium content requires a valid subscription. Fees, renewal terms, and cancellation policies are clearly outlined at the time of subscription. We reserve the right to change pricing with prior notice.",
    },
    {
      title: "Termination of Service",
      description:
        "We reserve the right to suspend, restrict, or permanently terminate your access to our platform at any time and for any reason, including but not limited to violations of these Terms, fraudulent or abusive behavior, non-payment of subscription fees, or any conduct that harms or threatens the integrity of our services or other users. Such termination may occur with or without prior notice, and we are not liable for any resulting loss of access to content or services.",
    },
  ];

  const [terms, setTerms] = useState(initialTerms);
  const [search, setSearch] = useState("");

  const filteredTerms = terms.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.description.toLowerCase().includes(search.toLowerCase())
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
        const nextNo = terms && terms.length ? Math.max(...terms.map(d => d.no)) + 1 : 1;
        const newItem = {
          title: values.title,
          description: values.description,
          status: 'Pending',
        };
        setTerms(prev => [...prev, newItem]);
        resetForm();
        setIsAddModalOpen(false);
      },
    });
    
    const handleAddModalClose = () => {
      setIsAddModalOpen(false);
      formik.resetForm();
    };

  return (
    <div className="bg-[#F0F3FB] text-gray-900 h-full py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-2xl sm:text-3xl font-semibold">Terms & Conditions</h2>
        </div>

        {/* Search and Add Term */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
      
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

            <button onClick={() => setIsAddModalOpen(true)}>
              <div className="mv_Add_btn bg-primary hover:bg-secondary">
                + Add Term
              </div>
            </button>
          </div>
        </div>

        {/* Table for md and up */}
        <div className="hidden md:block">
          <div className="overflow-x-auto border border-gray-200 rounded">
            <table className="w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                {filteredTerms.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-6 font-medium w-1/6 align-top">{item.title}</td>
                    <td className="px-6 py-6 align-top whitespace-normal break-words">{item.description}</td>
                    <td className="px-6 py-6 align-top">
                      <div className="mv_table_action flex">
                        <div><FiEdit className="text-[#6777ef] text-[18px] cursor-pointer" /></div>
                        <div><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden flex flex-col gap-4 mt-2">
          {terms.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-base leading-tight">{item.title}</h3>
                {/* <div className="flex gap-2 ml-2">
                  <button aria-label={`Edit ${item.title}`} className="p-2 rounded border border-gray-300 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h6m-6 4h6M5 7h.01M12 19l7-7 2 2-7 7H5v-2z" />
                    </svg>
                  </button>
                  <button aria-label={`Delete ${item.title}`} className="p-2 rounded border border-gray-300 text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div> */}
                <div className="mv_table_action flex">
                  <div><FiEdit className="text-[#6777ef] text-[18px] cursor-pointer" /></div>
                  <div><RiDeleteBinLine className="text-[#ff5200] text-[18px]" /></div>
                </div>
              </div>

              <p className="text-sm text-gray-700 mt-3 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleAddModalClose}></div>
          <div className="relative w-full max-w-lg rounded-md bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-semibold text-black">Add Terms & Conditions</h2>
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

export default TermsTable;
