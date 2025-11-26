import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Upload, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getAllBlog, createBlog, updateBlog } from '../Redux/Slice/blogSlice';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { setAlert } from '../Redux/Slice/alert.slice';
import { IMAGE_URL } from '../Utils/baseUrl';

const BlogForm = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(location?.state?.mode === 'edit');
    const [editingItem, setEditingItem] = useState(null);
    const blogData = location?.state?.blog || null;
    const pageTitle = isEditMode ? 'Edit Blog' : 'Add Blog';

    const fileInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(blogData?.image ? `${IMAGE_URL}${blogData.image}` : null);

    const quillModules = useMemo(() => ({
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ indent: '-1' }, { indent: '+1' }],
            [{ direction: 'rtl' }],
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }],
            [{ align: [] }],
            ['link', 'blockquote', 'code-block'],
            ['clean']
        ],
    }), []);

    const quillFormats = useMemo(() => ([
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'color', 'background',
        'align', 'script', 'code-block'
    ]), []);

    const getImageFileName = (path = '') => {
        if (!path) return '';
        const segments = path.split(/[/\\]/);
        const fileName = segments[segments.length - 1] || '';
        return fileName.replace(/^\d+-/, '');
    };

    const validationSchema = useMemo(() => (
        Yup.object({
            title: Yup.string().required('Title is required'),
            tag: Yup.string().required('Tag is required'),
            subtitle: Yup.string().required('Sub Title is required'),
            description: Yup.string().required('Description is required'),
            image: Yup.mixed()
                .nullable()
                .test('required', 'Image is required', function (value) {
                    if (isEditMode) {
                        return true;
                    }
                    return Boolean(value);
                }),
        })
    ), [isEditMode]);

    useEffect(() => {
      if (isEditMode && blogData) {
        setEditingItem(blogData);
        setImagePreview(blogData.image ? `${IMAGE_URL}${blogData.image}` : null);
      }
    }, [isEditMode, blogData]);

    const formik = useFormik({
      enableReinitialize: true,
      initialValues: {
        title: blogData?.title || '',
        subtitle: blogData?.subtitle || '',
        description: blogData?.description || '',
        tag: blogData?.tag || '',
        image: null,
      },
      validationSchema,
      onSubmit: async (values, { resetForm }) => {
            try {
                if (isEditMode && editingItem) {
                    const payload = {
                        ...values,
                        id: editingItem._id || editingItem.id,
                    };
                    const result = await dispatch(updateBlog(payload));
                    if (updateBlog.fulfilled.match(result)) {
                        dispatch(setAlert({ text: "Blog updated successfully..!", color: 'success' }));
                        resetForm();
                      setIsEditMode(false);
                      setEditingItem(null);
                      setImagePreview(null);
                      dispatch(getAllBlog());
                      navigate('/blog');
                    }
                } else {
                    const result = await dispatch(createBlog(values));
                    if (createBlog.fulfilled.match(result)) {
                        dispatch(setAlert({ text: "Blog created successfully..!", color: 'success' }));
                        resetForm();
                      setIsEditMode(false);
                      setEditingItem(null);
                      setImagePreview(null);
                      dispatch(getAllBlog());
                      navigate('/blog');
                    }
                }
            } catch (error) {
                console.error('Error creating blog:', error);
            }
        },
    });

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    formik.setFieldValue('image', file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    formik.handleSubmit();
  };

  return (
    <div className='p-3 md:p-4 lg:p-5 bg-[#F0F3FB] min-h-screen'>
      <div className="w-full mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-6 py-4">
          <h2 className="text-xl md:text-2xl font-bold text-black">{pageTitle}</h2>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    name="title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter title"
                    className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formik.touched.title && formik.errors.title && <div className="text-red-500 text-xs mt-1">{formik.errors.title}</div>}
                </div>

                <div className="md:col-span-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tag *</label>
                  <input
                    name="tag"
                    value={formik.values.tag}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Select tags or enter comma separated"
                    className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.tag && formik.errors.tag ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formik.touched.tag && formik.errors.tag && <div className="text-red-500 text-xs mt-1">{formik.errors.tag}</div>}
                </div>

                <div className="md:col-span-2 mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle *</label>
                  <input
                    name="subtitle"
                    value={formik.values.subtitle}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter subtitle"
                    className={`w-full px-4 py-2 border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] ${formik.touched.subtitle && formik.errors.subtitle ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formik.touched.subtitle && formik.errors.subtitle && <div className="text-red-500 text-xs mt-1">{formik.errors.subtitle}</div>}
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <div className={`w-full border bg-gray-100 rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#B79982] resize-none  ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-200'} rounded`}>
                  <ReactQuill
                    className="custom-quill"
                    placeholder="Enter Description"
                    value={formik.values.description}
                    onChange={(val) => formik.setFieldValue('description', val)}
                    modules={quillModules}
                    formats={quillFormats}
                  />
                </div>
                {formik.touched.description && formik.errors.description && <div className="text-red-500 text-xs mt-1">{formik.errors.description}</div>}

                <div className="mt-6">
                  <label htmlFor="image" className="text-sm font-semibold text-gray-700 mb-2">Image *</label>
                    <label className="flex w-full cursor-pointer items-center justify-between rounded-[4px] border border-gray-200 px-2 py-2 text-gray-500 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#B79982]">
                        <span className="truncate">
                            {formik.values.image
                                ? formik.values.image.name
                                : (isEditMode && editingItem?.image
                                    ? getImageFileName(editingItem.image)
                                    : 'Choose file')}
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
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <button type="button" onClick={() => navigate('/blog')} className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-4 py-2 rounded">Cancel</button>
            <button
                type="button"
                onClick={handleSubmit}
                className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white"
            >
                {isEditMode ? 'Edit' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BlogForm;