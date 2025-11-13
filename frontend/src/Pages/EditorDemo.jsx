import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Link, Image, Code, Quote, Heading1, Heading2, Type, Undo, Redo, Trash2, Eye, EyeOff } from 'lucide-react';

const EditorDemo = () => {
    const [content, setContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [selectedFont, setSelectedFont] = useState('Arial');
    const editorRef = useRef(null);

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value);
        editorRef.current?.focus();
    };

    const handleInput = () => {
        if (editorRef.current) {
            setContent(editorRef.current.innerHTML);
        }
    };

    const insertLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            execCommand('createLink', url);
        }
    };

    const insertImage = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    const handleClear = () => {
        if (editorRef.current) {
            editorRef.current.innerHTML = '';
            setContent('');
        }
    };

    const formatBlock = (tag) => {
        execCommand('formatBlock', tag);
    };

    const handleFontChange = (e) => {
        const font = e.target.value;
        setSelectedFont(font);
        execCommand('fontName', font);
    };

    useEffect(() => {
        if (editorRef.current && content === '') {
            editorRef.current.innerHTML = '';
        }
    }, [content]);

    const ToolbarButton = ({ onClick, icon: Icon, title }) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="p-2 hover:bg-indigo-100 rounded transition-colors text-gray-700 hover:text-indigo-600"
            onMouseDown={(e) => e.preventDefault()}
        >
            <Icon size={18} />
        </button>
    );

    return (
        <div className="min-h-screen bg-[#333333] flex items-center">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-6">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Text Editor
                        </h1>
                    </div>

                    <div className="mb-4">
                        <div className="bg-gray-50 border border-gray-300 rounded-t-lg p-2 flex flex-wrap gap-1">
                            <div className="flex gap-1 border-r border-gray-300 pr-2">
                                <ToolbarButton onClick={() => execCommand('undo')} icon={Undo} title="Undo" />
                                <ToolbarButton onClick={() => execCommand('redo')} icon={Redo} title="Redo" />
                            </div>

                            <div className="flex gap-1 border-r border-gray-300 pr-2">
                                <ToolbarButton onClick={() => formatBlock('h1')} icon={Heading1} title="Heading 1" />
                                <ToolbarButton onClick={() => formatBlock('h2')} icon={Heading2} title="Heading 2" />
                                <ToolbarButton onClick={() => formatBlock('p')} icon={Type} title="Paragraph" />
                            </div>

                            <div className="border-r border-gray-300 pr-2 flex items-center">
                                <select
                                    value={selectedFont}
                                    onChange={handleFontChange}
                                    className="p-2 bg-white border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    title="Font Family"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Verdana">Verdana</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    <option value="Georgia">Georgia</option>
                                    <option value="Courier New">Courier New</option>
                                    <option value="Tahoma">Tahoma</option>
                                    <option value="Trebuchet MS">Trebuchet MS</option>
                                </select>
                            </div>

                            <div className="flex gap-1 border-r border-gray-300 pr-2">
                                <ToolbarButton onClick={() => execCommand('bold')} icon={Bold} title="Bold" />
                                <ToolbarButton onClick={() => execCommand('italic')} icon={Italic} title="Italic" />
                                <ToolbarButton onClick={() => execCommand('underline')} icon={Underline} title="Underline" />
                            </div>

                            <div className="flex gap-1 border-r border-gray-300 pr-2">
                                <ToolbarButton onClick={() => execCommand('justifyLeft')} icon={AlignLeft} title="Align Left" />
                                <ToolbarButton onClick={() => execCommand('justifyCenter')} icon={AlignCenter} title="Align Center" />
                                <ToolbarButton onClick={() => execCommand('justifyRight')} icon={AlignRight} title="Align Right" />
                            </div>

                            <div className="flex gap-1 border-r border-gray-300 pr-2">
                                <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={List} title="Bullet List" />
                                <ToolbarButton onClick={() => execCommand('insertOrderedList')} icon={ListOrdered} title="Numbered List" />
                            </div>

                            <div className="flex gap-1 border-r border-gray-300 pr-2">
                                <ToolbarButton onClick={insertLink} icon={Link} title="Insert Link" />
                                <ToolbarButton onClick={insertImage} icon={Image} title="Insert Image" />
                            </div>

                            <div className="flex gap-1">
                                <ToolbarButton onClick={() => formatBlock('blockquote')} icon={Quote} title="Quote" />
                                <ToolbarButton onClick={() => formatBlock('pre')} icon={Code} title="Code Block" />
                            </div>
                        </div>

                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleInput}
                            className="bg-white border border-t-0 border-gray-300 rounded-b-lg p-4 min-h-64 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            style={{ maxHeight: '400px', overflowY: 'auto' }}
                            suppressContentEditableWarning
                        />
                    </div>

                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                            {showPreview ? 'Hide' : 'Show'}
                        </button>
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Clear
                        </button>
                    </div>

                    {showPreview && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-3">
                                Preview
                            </h2>
                            <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 min-h-32">
                                {content ? (
                                    <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: content }}
                                    />
                                ) : (
                                    <p className="text-gray-400 italic">No content to preview</p>
                                )}
                            </div>
                        </div>
                    )}

                    {content && (
                        <div className="mt-6">
                            <details className="bg-gray-50 rounded-lg p-4">
                                <summary className="cursor-pointer font-semibold text-gray-700">
                                    HTML Output
                                </summary>
                                <pre className="mt-3 bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
                                    {content}
                                </pre>
                            </details>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        [contenteditable] {
          caret-color: #4f46e5;
        }
        [contenteditable]:empty:before {
          content: 'Start typing your content here...';
          color: #9ca3af;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
        }
        [contenteditable] pre {
          background-color: #1f2937;
          color: #10b981;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          font-family: monospace;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          margin: 1em 0;
        }
        [contenteditable] a {
          color: #4f46e5;
          text-decoration: underline;
        }
      `}</style>
        </div>
    );
}

export default EditorDemo