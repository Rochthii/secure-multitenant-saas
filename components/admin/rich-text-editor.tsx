'use client';

import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import CharacterCount from '@tiptap/extension-character-count';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    List, ListOrdered, AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Heading1, Heading2, Heading3, Quote, Code, Code2,
    Link as LinkIcon, Link2Off, ImageIcon, TableIcon,
    Undo, Redo, Palette, Highlighter, Subscript as SubIcon, Superscript as SupIcon,
    Minus, Eraser, Maximize, Minimize,
} from 'lucide-react';
import { compressImageToWebP } from '@/lib/utils/compress-image';
// @ts-ignore
import { uploadImage } from '@/app/actions/admin/upload';
import { toast } from 'sonner';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    minHeight?: string;
}

// Nhóm toolbar buttons
const COLORS = [
    '#000000', '#374151', '#EF4444', '#F97316', '#EAB308',
    '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#9CA3AF',
    '#B45309', '#047857', '#1D4ED8', '#7C3AED', '#BE185D',
];

const HIGHLIGHT_COLORS = [
    '#FEF08A', '#BBF7D0', '#BAE6FD', '#E9D5FF', '#FECACA', '#FED7AA',
];

function ToolbarButton({
    onClick, active = false, disabled = false, title, children, type = "button",
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
    type?: "button" | "submit";
}) {
    return (
        <button
            type={type}
            onMouseDown={(e) => {
                // Quan trọng: Đối với các nút formatting (Bold, Italic...), preventDefault để không mất focus editor.
                // Nhưng đối với các nút mở dialog/file picker, cần sự kiện click thực sự.
                if (title !== "Chèn hình ảnh") {
                    e.preventDefault();
                }
            }}
            onClick={(e) => {
                if (title === "Chèn hình ảnh") {
                    onClick();
                } else if (e.detail === 0) { // Nếu được kích hoạt bởi phím enter
                    onClick();
                }
            }}
            disabled={disabled}
            title={title}
            className={`
                p-1.5 rounded text-sm transition-all duration-100 min-w-[28px] h-7 flex items-center justify-center
                ${active
                    ? 'bg-blue-100 text-blue-700 shadow-inner'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            {children}
        </button>
    );
}

function Separator() {
    return <div className="w-px h-6 bg-gray-200 mx-0.5 self-center shrink-0" />;
}

export function RichTextEditor({ content, onChange, placeholder, minHeight = '400px' }: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showHighlightPicker, setShowHighlightPicker] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Debounce the onChange handler to reduce CPU load during typing
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
            }),
            Underline,
            Image.configure({
                HTMLAttributes: { class: 'max-w-full h-auto rounded-lg my-4 mx-auto block shadow-md' },
                allowBase64: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-blue-600 underline underline-offset-4 hover:text-blue-800 cursor-pointer' },
                autolink: true,
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({
                placeholder: placeholder || 'Bắt đầu viết nội dung...',
                emptyEditorClass: 'is-editor-empty',
            }),
            Subscript,
            Superscript,
            CharacterCount,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        onUpdate: ({ editor }) => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
            debounceTimeout.current = setTimeout(() => {
                onChange(editor.getHTML());
            }, 500); // 500ms debounce
        },
        editorProps: {
            attributes: {
                class: `prose prose-base max-w-none focus:outline-none px-6 py-5`,
                style: `min-height: ${minHeight};`,
            },
        },
        immediatelyRender: false,
    });

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, []);

    // Thoát fullscreen bằng Escape — PHẢI khai báo trước early return
    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
        if (isFullscreen) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isFullscreen]);

    if (!editor) return null;

    const charCount = editor.storage.characterCount?.characters?.() || 0;
    const wordCount = editor.storage.characterCount?.words?.() || 0;

    const handleAddLink = () => {
        const previous = editor.getAttributes('link').href || '';
        const url = window.prompt('Nhập URL:', previous);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().unsetLink().run();
        } else {
            editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
        }
    };

    const handleInsertTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const handleImageUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Vui lòng chọn file hình ảnh');
            return;
        }

        setUploading(true);
        const id = toast.loading('Đang xử lý và tải ảnh lên...');
        try {
            // Nén ảnh sang WebP (giống như ImageUpload component)
            const compressed = await compressImageToWebP(file);

            const formData = new FormData();
            formData.append('file', compressed);
            const result = await uploadImage(formData);

            if (result.success && result.url) {
                editor?.chain().focus().setImage({ src: result.url }).run();
                toast.success('Chèn ảnh thành công');
            } else {
                toast.error(result.error || 'Upload thất bại');
            }
        } catch (err) {
            console.error('RichText Image Upload Error:', err);
            toast.error('Có lỗi khi upload');
        } finally {
            setUploading(false);
            toast.dismiss(id);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleInsertHR = () => editor.chain().focus().setHorizontalRule().run();
    const handleClearFormat = () => editor.chain().focus().clearNodes().unsetAllMarks().run();

    return (
        <div className={`
            ${isFullscreen
                ? 'fixed inset-0 z-[100] flex flex-col bg-white'
                : 'border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm'
            }
        `}>
            {/* === TOOLBAR === */}
            <div className="bg-gray-50 border-b border-gray-200 px-2 py-1.5 flex flex-wrap gap-0.5 items-center">

                {/* Undo / Redo */}
                <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
                    <Undo className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
                    <Redo className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Separator />

                {/* Heading dropdown */}
                <select
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'p') {
                            editor.chain().focus().setParagraph().run();
                        } else {
                            editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
                        }
                        e.target.value = 'p';
                    }}
                    className="h-7 text-xs border border-gray-200 rounded px-1 bg-white text-gray-700 cursor-pointer focus:outline-none"
                    title="Kiểu đoạn văn"
                >
                    <option value="p">Đoạn văn</option>
                    <option value="1">Tiêu đề 1</option>
                    <option value="2">Tiêu đề 2</option>
                    <option value="3">Tiêu đề 3</option>
                    <option value="4">Tiêu đề 4</option>
                    <option value="5">Tiêu đề 5</option>
                    <option value="6">Tiêu đề 6</option>
                </select>

                <Separator />

                {/* Basic formatting */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Đậm (Ctrl+B)">
                    <Bold className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Nghiêng (Ctrl+I)">
                    <Italic className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch dưới (Ctrl+U)">
                    <UnderlineIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
                    <Strikethrough className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Chỉ số dưới">
                    <SubIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Chỉ số trên">
                    <SupIcon className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Separator />

                {/* Color picker */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => { setShowColorPicker(v => !v); setShowHighlightPicker(false); }}
                        active={showColorPicker}
                        title="Màu chữ"
                    >
                        <div className="flex flex-col items-center gap-0">
                            <Palette className="h-3.5 w-3.5" />
                            <div className="w-3.5 h-0.5 rounded" style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000' }} />
                        </div>
                    </ToolbarButton>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-44">
                            <div className="grid grid-cols-5 gap-1">
                                {COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            editor.chain().focus().setColor(c).run();
                                            setShowColorPicker(false);
                                        }}
                                        className="w-7 h-7 rounded border border-gray-200 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColorPicker(false); }}
                                className="mt-1.5 w-full text-xs text-gray-500 hover:text-red-500 text-center"
                            >
                                Xóa màu chữ
                            </button>
                        </div>
                    )}
                </div>

                {/* Highlight picker */}
                <div className="relative">
                    <ToolbarButton
                        onClick={() => { setShowHighlightPicker(v => !v); setShowColorPicker(false); }}
                        active={showHighlightPicker}
                        title="Tô sáng"
                    >
                        <Highlighter className="h-3.5 w-3.5" />
                    </ToolbarButton>
                    {showHighlightPicker && (
                        <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-40">
                            <div className="grid grid-cols-6 gap-1">
                                {HIGHLIGHT_COLORS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            editor.chain().focus().toggleHighlight({ color: c }).run();
                                            setShowHighlightPicker(false);
                                        }}
                                        className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                                        style={{ backgroundColor: c }}
                                        title={c}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
                                className="mt-1.5 w-full text-xs text-gray-500 hover:text-red-500 text-center"
                            >
                                Xóa tô sáng
                            </button>
                        </div>
                    )}
                </div>

                <ToolbarButton onClick={handleClearFormat} title="Xóa định dạng">
                    <Eraser className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Separator />

                {/* Alignment */}
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
                    <AlignLeft className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
                    <AlignCenter className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
                    <AlignRight className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Căn đều">
                    <AlignJustify className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Separator />

                {/* Lists */}
                <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách chấm">
                    <List className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
                    <ListOrdered className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Trích dẫn">
                    <Quote className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Code inline">
                    <Code className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Khối code">
                    <Code2 className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Separator />

                {/* Link + Image + Table */}
                <ToolbarButton onClick={handleAddLink} active={editor.isActive('link')} title="Chèn liên kết (Ctrl+K)">
                    <LinkIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                {editor.isActive('link') && (
                    <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Bỏ liên kết">
                        <Link2Off className="h-3.5 w-3.5" />
                    </ToolbarButton>
                )}
                <ToolbarButton onClick={() => fileInputRef.current?.click()} disabled={uploading} title="Chèn hình ảnh">
                    <ImageIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={handleInsertTable} title="Chèn bảng">
                    <TableIcon className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton onClick={handleInsertHR} title="Đường kẻ ngang">
                    <Minus className="h-3.5 w-3.5" />
                </ToolbarButton>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                    }}
                />

                <Separator />

                {/* Fullscreen */}
                <div className="ml-auto">
                    <ToolbarButton
                        onClick={() => setIsFullscreen(v => !v)}
                        active={isFullscreen}
                        title={isFullscreen ? 'Thu nhỏ (Esc)' : 'Phóng to toàn màn hình'}
                    >
                        {isFullscreen
                            ? <Minimize className="h-3.5 w-3.5" />
                            : <Maximize className="h-3.5 w-3.5" />
                        }
                    </ToolbarButton>
                </div>
            </div>

            {/* Table context toolbar — hiện khi cursor trong bảng */}
            {editor.isActive('table') && (
                <div className="bg-blue-50 border-b border-blue-200 px-2 py-1 flex flex-wrap gap-1 items-center text-xs">
                    <span className="text-blue-600 font-medium mr-1">Bảng:</span>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }} className="px-2 py-0.5 bg-white border border-blue-200 rounded hover:bg-blue-100 text-blue-700">+ Cột trái</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }} className="px-2 py-0.5 bg-white border border-blue-200 rounded hover:bg-blue-100 text-blue-700">+ Cột phải</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }} className="px-2 py-0.5 bg-white border border-blue-200 rounded hover:bg-red-100 text-red-600">- Cột</button>
                    <span className="text-gray-300">|</span>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }} className="px-2 py-0.5 bg-white border border-blue-200 rounded hover:bg-blue-100 text-blue-700">+ Hàng trên</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }} className="px-2 py-0.5 bg-white border border-blue-200 rounded hover:bg-blue-100 text-blue-700">+ Hàng dưới</button>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }} className="px-2 py-0.5 bg-white border border-blue-200 rounded hover:bg-red-100 text-red-600">- Hàng</button>
                    <span className="text-gray-300">|</span>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); }} className="px-2 py-0.5 bg-white border border-red-200 rounded hover:bg-red-100 text-red-600">Xóa bảng</button>
                </div>
            )}

            {/* === EDITOR AREA === */}
            <div
                className={`${uploading ? 'opacity-50 pointer-events-none' : ''} ${isFullscreen ? 'flex-1 overflow-y-auto' : ''}`}
                onClick={() => { setShowColorPicker(false); setShowHighlightPicker(false); }}
            >
                <EditorContent editor={editor} />
            </div>

            {/* === STATUS BAR === */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-1.5 flex justify-between items-center text-xs text-gray-400">
                <div className="flex gap-4">
                    <span>{wordCount.toLocaleString()} từ</span>
                    <span>{charCount.toLocaleString()} ký tự</span>
                </div>
                {uploading && (
                    <span className="text-blue-500 animate-pulse">Đang tải ảnh...</span>
                )}
            </div>
        </div>
    );
}
