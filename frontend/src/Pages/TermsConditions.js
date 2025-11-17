import React, { useEffect, useState } from 'react'
import { RiDeleteBin6Fill, RiEdit2Fill } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from "yup";
import ReactQuill from 'react-quill';

export default function TermsConditions() {

    // React Quill configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'align': [] }],
            ['link', 'blockquote', 'code-block'],
            ['clean']
        ],
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'color', 'background',
        'align', 'script', 'code-block'
    ];


    return (
        <>
            <div className="mt-1">
                <ReactQuill
                    theme="snow"
                    // value={formik.values.description}
                    // onChange={(value) => formik.setFieldValue('description', value)}
                    modules={modules}
                    formats={formats}
                    placeholder="Enter description..."
                    style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        borderRadius: '6px',
                        minHeight: '200px'
                    }}
                />
            </div>
        </>
    )
}