import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Upload, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { createAbout, updateAbout, getAllAbout } from '../Redux/Slice/about.slice';
import { IMAGE_URL } from '../Utils/baseUrl';

const AboutForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location?.state?.mode === 'edit';
  const aboutData = location?.state?.about || null;
  const pageTitle = isEditMode ? 'Edit About Section' : 'Add About Section';

  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(() =>
    aboutData?.image ? `${IMAGE_URL}${aboutData.image}` : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    image: Yup.mixed()
      .nullable()
      .test('required', 'Image is required', function (value) {
        if (isEditMode && (aboutData?.image || imagePreview)) {
          return true;
        }
        return Boolean(value);
      }),
  });

  const formik = useFormik({
    initialValues: {
      title: aboutData?.title || '',
      description: aboutData?.description || '',
      image: null,
    },
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      try {
        if (isEditMode && aboutData) {
          const payload = {
            id: aboutData._id || aboutData.id,
            title: values.title,
            description: values.description,
          };
          if (values.image) {
            payload.image = values.image;
          } else if (aboutData.image) {
            payload.image = aboutData.image;
          }
          await dispatch(updateAbout(payload)).unwrap();
        } else {
          await dispatch(createAbout(values)).unwrap();
        }
        await dispatch(getAllAbout());
        navigate('/about/about');
      } catch (error) {
        console.error('Failed to submit about form', error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (aboutData?.image) {
      setImagePreview(`${IMAGE_URL}${aboutData.image}`);
    }
  }, [aboutData]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      formik.setFieldValue('image', file);
      formik.setFieldTouched('image', true);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    formik.setFieldValue('image', null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImageFileName = (path = '') => {
    if (!path) return 'Choose file';
    const segments = path.split(/[/\\]/);
    return segments[segments.length - 1] || 'Choose file';
  };

  return (
    <div className="p-3 md:p-4 lg:p-5 bg-[#F0F3FB] min-h-full">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] px-6 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-black">{pageTitle}</h2>
          <button
            type="button"
            onClick={() => navigate('/about/about')}
            className="text-sm text-[#755647] underline underline-offset-4"
          >
            Back to About List
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter title"
                className={`w-full rounded-[4px] border px-3 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#B79982] ${
                  formik.touched.title && formik.errors.title ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {formik.touched.title && formik.errors.title && (
                <span className="text-xs text-red-500 mt-1">{formik.errors.title}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <div className={`rounded-[4px] border ${formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-200'}`}>
                <ReactQuill
                  theme="snow"
                  value={formik.values.description}
                  onChange={(content) => formik.setFieldValue('description', content)}
                  onBlur={() => formik.setFieldTouched('description', true)}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Write detailed content..."
                />
              </div>
              {formik.touched.description && formik.errors.description && (
                <span className="text-xs text-red-500 mt-1">{formik.errors.description}</span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Cover Image *</label>
              <div className={`rounded-[4px] border border-dashed px-3 py-3 bg-gray-50 flex flex-col gap-3 ${
                formik.touched.image && formik.errors.image ? 'border-red-500' : 'border-[#B79982]'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-md border border-[#E3C78A] bg-white flex items-center justify-center overflow-hidden">
                      {imagePreview ? (
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="text-[#B79982]" size={24} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {formik.values.image?.name ||
                          (imagePreview && aboutData?.image && getImageFileName(aboutData.image)) ||
                          'No file selected'}
                      </p>
                      <p className="text-xs text-gray-500">Supported: JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-1 px-3 py-2 border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors"
                      >
                        <X size={14} />
                        Remove
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mv_user_add px-4 py-2 bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white text-sm"
                    >
                      Choose File
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      onChange={handleFileChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>
                </div>
                {formik.touched.image && formik.errors.image && (
                  <span className="text-xs text-red-500">{formik.errors.image}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/about/about')}
              className="mv_user_cancel hover:bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mv_user_add bg-gradient-to-r from-[#F7DF9C] to-[#E3C78A] hover:from-white hover:to-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AboutForm;