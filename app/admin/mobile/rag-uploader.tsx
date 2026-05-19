'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2, CheckCircle2, AlertCircle, BookOpen, Hash, User, Library, ShieldCheck, Globe, Link, Rocket } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RagManagement from './rag-management';

interface AcademicMetadata {
    sutta_code: string;       // Sn 2.4 | DN 2 | MN 22...
    verse_number: string;     // 262 | "1-10" | ""
    book_name: string;        // Sutta Nipāta | Dīgha Nikāya...
    translator: string;       // Hòa thượng Thích Minh Châu...
    publisher: string;        // Viện Nghiên Cứu Phật Học VN...
    source_tier: string;      // PRIMARY | COMMENTARY | MODERN...
}

interface RagUploaderProps {
    onUploadComplete?: () => void;
}

export default function RagUploader({ onUploadComplete }: RagUploaderProps = {}) {
    const [activeTab, setActiveTab] = useState('upload');
    const [sourceType, setSourceType] = useState<'file' | 'url'>('file');
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [previewText, setPreviewText] = useState('');
    const [childLinks, setChildLinks] = useState<{title: string, url: string}[]>([]);
    const [isIndexPage, setIsIndexPage] = useState(false);
    const [canOverwrite, setCanOverwrite] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Batch Processing States
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [batchStats, setBatchStats] = useState({ total: 0, current: 0, success: 0, failed: 0, currentTitle: '', status: '' });

    // Metadata học thuật — tùy chọn nhưng được khuyến khích
    const [metadata, setMetadata] = useState<AcademicMetadata>({
        sutta_code: '',
        verse_number: '',
        book_name: '',
        translator: '',
        publisher: '',
        source_tier: 'MODERN', // Mặc định là Hiện đại
    });

    // Tải danh sách chuyên đề khi component mount
    React.useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const res = await fetch('/api/admin/ai/get-categories');
                const data = await res.json();
                if (data.success) {
                    setCategories(data.categories);
                }
            } catch (err) {
                console.error("Lỗi khi tải chuyên đề:", err);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleExtract = async () => {
        if (sourceType === 'file') {
            if (!file || !title) {
                setError('Vui lòng nhập tên tài liệu và chọn file PDF.');
                return;
            }
        } else {
            if (!url) {
                setError('Vui lòng nhập link website.');
                return;
            }
        }
        if (!selectedCategoryId) {
            setError('Vui lòng chọn một chuyên đề cho tài liệu này.');
            return;
        }

        setIsProcessing(true);
        setError('');
        setSuccess('');
        setProgress(0);

        try {
            let rawText = '';
            let pages = 0;
            let currentTitle = title;

            if (sourceType === 'file') {
                if (!file) throw new Error('Vui lòng chọn file PDF.');
                
                // Bước 1: Đọc PDF thành Text
                setStatusText('Đang phân tích PDF...');
                const formData = new FormData();
                formData.append('file', file);

                const parseRes = await fetch('/api/admin/ai/parse-pdf', {
                    method: 'POST',
                    body: formData
                });

                if (parseRes.status === 413) {
                    throw new Error('Dung lượng file PDF quá lớn (vượt quá giới hạn server 4.5MB). Vui lòng chia nhỏ PDF hoặc nén file trước khi nạp.');
                }

                if (!parseRes.ok) {
                    const errorText = await parseRes.text();
                    console.error("Server error response:", errorText);
                    throw new Error(`Lỗi máy chủ (${parseRes.status}). Vui lòng liên lạc kỹ thuật viên.`);
                }

                const parseData = await parseRes.json();
                if (!parseData.success) {
                    throw new Error(parseData.error || 'Lỗi đọc PDF');
                }

                rawText = parseData.text;
                pages = parseData.pages;
            } else {
                if (!url) throw new Error('Vui lòng nhập link website.');
                
                // Bước 1: Quét URL và trích xuất Text bằng AI
                setStatusText('Đang quét và bóc tách nội dung website...');
                const parseRes = await fetch('/api/admin/ai/parse-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url })
                });

                if (!parseRes.ok) {
                    const errorData = await parseRes.json();
                    throw new Error(errorData.error || 'Lỗi đọc website');
                }

                const parseData = await parseRes.json();
                rawText = parseData.text;
                pages = 1;

                // Cập nhật thông tin từ AI Discovery
                if (parseData.isIndex) {
                    setIsIndexPage(true);
                    setChildLinks(parseData.childLinks || []);
                } else {
                    setIsIndexPage(false);
                    setChildLinks([]);
                }

                if (!currentTitle && parseData.title) {
                    currentTitle = parseData.title;
                    setTitle(currentTitle);
                }

                // Tự động điền Metadata nếu AI tìm thấy
                if (parseData.metadata) {
                    setMetadata(prev => ({
                        ...prev,
                        sutta_code: prev.sutta_code || parseData.metadata.sutta_code || '',
                        translator: prev.translator || parseData.metadata.translator || '',
                        source_tier: prev.source_tier || parseData.metadata.source_tier || 'MODERN',
                    }));
                }
            }

            if (!currentTitle) {
                throw new Error('Không thể xác định được tiêu đề bài viết. Vui lòng nhập tiêu đề thủ công.');
            }

            if (!rawText || rawText.trim().length === 0) {
                throw new Error('Nội dung rỗng hoặc không thể đọc được chữ.');
            }

            setStatusText('Đang phân tích siêu dữ liệu...');
            // Nếu các trường metadata chính bị trống, dùng AI để bóc tách tự động
            let finalMetadata = { ...metadata };
            if (!metadata.sutta_code || !metadata.book_name || !metadata.translator) {
                setStatusText('✨ AI đang phân tích dữ liệu học thuật từ PDF...');
                try {
                    const extractRes = await fetch('/api/admin/ai/extract-metadata', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: rawText })
                    });
                    const extractData = await extractRes.json();
                    if (extractData.success && extractData.metadata) {
                        const aiMeta = extractData.metadata;
                        // Chỉ điền vào các trường còn trống, ưu tiên dữ liệu người dùng đã nhập
                        finalMetadata = {
                            sutta_code: metadata.sutta_code || aiMeta.sutta_code || '',
                            verse_number: metadata.verse_number || aiMeta.verse_number || '',
                            book_name: metadata.book_name || aiMeta.book_name || '',
                            translator: metadata.translator || aiMeta.translator || '',
                            publisher: metadata.publisher || aiMeta.publisher || '',
                            source_tier: metadata.source_tier || aiMeta.source_tier || 'MODERN',
                        };
                        // Cập nhật UI để người dùng thấy kết quả
                        setMetadata(finalMetadata);
                        setStatusText('✨ Đã tự động bóc tách Metadata thành công.');
                    }
                } catch (extractErr) {
                    console.error("Lỗi AI extraction:", extractErr);
                }
            }

            setPreviewText(rawText);
            setStep('preview');
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Có lỗi xảy ra trong quá trình xử lý.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalize = async (allowOverwrite = false) => {
        setIsProcessing(true);
        setError('');
        setSuccess('');
        setCanOverwrite(false);
        setProgress(10);
        setStatusText('Đang băm dữ liệu theo ngữ nghĩa...');

        try {
            // Bước 2: Semantic Chunking (Băm dữ liệu theo đoạn văn)
            const targetChunkSize = 1500;
            const chunks: string[] = [];
            
            // Chia text thành các đoạn văn (cách nhau bởi ít nhất 1 dòng trống)
            const paragraphs = previewText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
            
            let currentChunk = '';
            
            for (let i = 0; i < paragraphs.length; i++) {
                const p = paragraphs[i].trim();
                
                // Nếu 1 đoạn đơn lẻ quá dài, cắt cứng nó
                if (p.length > targetChunkSize) {
                    if (currentChunk.trim().length > 0) {
                        chunks.push(currentChunk.trim());
                        currentChunk = '';
                    }
                    let start = 0;
                    while (start < p.length) {
                        const end = start + targetChunkSize;
                        chunks.push(p.substring(start, end).trim());
                        start = end - 300; // 300 overlap
                    }
                    continue;
                }
                
                // Gom đoạn
                if (currentChunk.length + p.length > targetChunkSize && currentChunk.length > 0) {
                    chunks.push(currentChunk.trim());
                    // Tạo overlap bằng đoạn trước đó nếu không quá dài
                    const prevP = i > 0 ? paragraphs[i-1].trim() : '';
                    if (prevP.length > 0 && prevP.length < 500) {
                         currentChunk = prevP + '\n\n' + p + '\n\n';
                    } else {
                         currentChunk = p + '\n\n';
                    }
                } else {
                    currentChunk += p + '\n\n';
                }
            }
            
            if (currentChunk.trim().length > 0) {
                chunks.push(currentChunk.trim());
            }

            // Bước 3: Khởi tạo Document kèm Chuyên đề và source_metadata
            const docMetadata: any = {
                translator: metadata.translator || undefined,
                publisher: metadata.publisher || undefined,
                book_name: metadata.book_name || undefined,
                source_tier: metadata.source_tier || undefined,
            };

            if (sourceType === 'url') {
                docMetadata.source_url = url;
            }

            const initRes = await fetch('/api/admin/ai/init-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    tenantId: 'GLOBAL',
                    categoryId: selectedCategoryId,
                    sourceMetadata: docMetadata,
                    allowOverwrite,
                })
            });
            const initData = await initRes.json();
            if (!initRes.ok || !initData.success) {
                if (initData.canOverwrite) {
                    setCanOverwrite(true);
                }
                throw new Error(initData.error || 'Lỗi khởi tạo tài liệu');
            }
            const documentId = initData.document.id;

            // Bước 4: Vòng lặp Embed từng Chunk kèm metadata học thuật
            // Tối ưu hóa: Xử lý đồng thời (Batching) để tăng tốc độ vector hóa
            const batchSize = 3;
            let completed = 0;
            
            // Cải tiến: Thêm cơ chế Retry chống đứt kết nối (Network Timeout / Vercel limits)
            const embedWithRetry = async (chunk: string, chunkMeta: any, index: number, retries = 3) => {
                for (let attempt = 1; attempt <= retries; attempt++) {
                    try {
                        const embedRes = await fetch('/api/admin/ai/embed-chunk', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                documentId,
                                chunkText: chunk,
                                metadata: chunkMeta,
                            })
                        });

                        if (!embedRes.ok) {
                            const embedData = await embedRes.json();
                            throw new Error(embedData.error || `Lỗi băm đoạn`);
                        }
                        return; // Thành công
                    } catch (err: any) {
                        if (attempt === retries) {
                            throw new Error(`Đoạn ${index + 1} thất bại sau ${retries} lần thử: ${err.message}`);
                        }
                        // Chờ trước khi retry: 1s, 2s, 3s
                        await new Promise(res => setTimeout(res, attempt * 1000));
                        console.warn(`[Retry] Đang thử lại đoạn ${index + 1} (lần ${attempt})...`);
                    }
                }
            };

            for (let i = 0; i < chunks.length; i += batchSize) {
                const batch = chunks.slice(i, i + batchSize);
                
                const promises = batch.map(async (chunk, batchIndex) => {
                    const globalIndex = i + batchIndex;
                    const chunkMeta: Record<string, string> = {};
                    if (metadata.sutta_code) chunkMeta.sutta_code = metadata.sutta_code;
                    if (metadata.verse_number) chunkMeta.verse_number = metadata.verse_number;
                    if (metadata.book_name) chunkMeta.book_name = metadata.book_name;

                    await embedWithRetry(chunk, chunkMeta, globalIndex);
                });
                
                await Promise.all(promises);
                
                completed += batch.length;
                setProgress(10 + Math.floor((completed / chunks.length) * 90));
                setStatusText(`Đang vector hóa đoạn ${completed}/${chunks.length}...`);
            }

            setProgress(100);
            setStatusText('Hoàn tất!');
            setSuccess(`Đã nạp thành công "${title}" vào hệ thống RAG (${chunks.length} đoạn vector).`);
            setFile(null);
            setUrl('');
            setTitle('');
            setPreviewText('');
            setStep('input');
            setMetadata({ sutta_code: '', verse_number: '', book_name: '', translator: '', publisher: '', source_tier: 'MODERN' });
            // Thông báo cho parent cập nhật stats và danh sách tài liệu
            onUploadComplete?.();

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Có lỗi xảy ra trong quá trình xử lý.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBatchIngest = async () => {
        if (!selectedCategoryId) {
            setError('Vui lòng chọn chuyên đề trước khi nạp tự động hàng loạt.');
            return;
        }

        setIsBatchProcessing(true);
        setBatchStats({ total: childLinks.length, current: 0, success: 0, failed: 0, currentTitle: '', status: 'Đang khởi động tiến trình...' });
        setError('');
        setSuccess('');

        let successCount = 0;
        let failedCount = 0;

        for (let i = 0; i < childLinks.length; i++) {
            const link = childLinks[i];
            setBatchStats(prev => ({ ...prev, current: i + 1, currentTitle: link.title, status: 'Đang bóc tách dữ liệu...' }));

            try {
                // 1. Quét URL
                const parseRes = await fetch('/api/admin/ai/parse-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: link.url })
                });

                if (!parseRes.ok) throw new Error('Lỗi quét URL');
                const parseData = await parseRes.json();
                
                // Trích xuất metadata AI hoặc dùng metadata chung
                const docMeta = {
                    sutta_code: parseData.metadata?.sutta_code || metadata.sutta_code || '',
                    verse_number: parseData.metadata?.verse_number || metadata.verse_number || '',
                    translator: parseData.metadata?.translator || metadata.translator || '',
                    source_tier: parseData.metadata?.source_tier || metadata.source_tier || 'MODERN',
                    book_name: parseData.metadata?.book_name || metadata.book_name || '',
                    publisher: metadata.publisher || '',
                    source_url: link.url,
                };

                // 2. Chunking
                setBatchStats(prev => ({ ...prev, status: 'Đang băm dữ liệu...' }));
                const rawText = parseData.text as string;
                const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
                const chunks: string[] = [];
                const targetChunkSize = 1500;
                let currentChunk = '';
                
                for (let j = 0; j < paragraphs.length; j++) {
                    const p = paragraphs[j].trim();
                    if (p.length > targetChunkSize) {
                        if (currentChunk.trim().length > 0) {
                            chunks.push(currentChunk.trim());
                            currentChunk = '';
                        }
                        let start = 0;
                        while (start < p.length) {
                            const end = start + targetChunkSize;
                            chunks.push(p.substring(start, end).trim());
                            start = end - 300;
                        }
                        continue;
                    }
                    if (currentChunk.length + p.length > targetChunkSize && currentChunk.length > 0) {
                        chunks.push(currentChunk.trim());
                        const prevP = j > 0 ? paragraphs[j-1].trim() : '';
                        if (prevP.length > 0 && prevP.length < 500) {
                             currentChunk = prevP + '\n\n' + p + '\n\n';
                        } else {
                             currentChunk = p + '\n\n';
                        }
                    } else {
                        currentChunk += p + '\n\n';
                    }
                }
                if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());

                // 3. Init Document (Allow Overwrite by default in batch mode to avoid halting)
                setBatchStats(prev => ({ ...prev, status: 'Đang khởi tạo tài liệu...' }));
                const initRes = await fetch('/api/admin/ai/init-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: link.title,
                        tenantId: 'GLOBAL',
                        categoryId: selectedCategoryId,
                        sourceMetadata: docMeta,
                        allowOverwrite: true, // Batch mode ưu tiên ghi đè nếu đã tồn tại
                    })
                });
                
                const initData = await initRes.json();
                if (!initRes.ok || !initData.success) throw new Error('Lỗi init doc');
                const documentId = initData.document.id;

                // 4. Embed Chunks with Retry
                setBatchStats(prev => ({ ...prev, status: 'Đang nạp Vector...' }));
                const embedWithRetry = async (chunk: string, chunkMeta: any, index: number, retries = 3) => {
                    for (let attempt = 1; attempt <= retries; attempt++) {
                        try {
                            const embedRes = await fetch('/api/admin/ai/embed-chunk', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ documentId, chunkText: chunk, metadata: chunkMeta })
                            });
                            if (!embedRes.ok) throw new Error();
                            return;
                        } catch (err: any) {
                            if (attempt === retries) throw new Error(`Đoạn ${index} lỗi`);
                            await new Promise(res => setTimeout(res, attempt * 1000));
                        }
                    }
                };

                const batchSize = 3;
                for (let k = 0; k < chunks.length; k += batchSize) {
                    const batch = chunks.slice(k, k + batchSize);
                    const promises = batch.map(async (chunk, batchIndex) => {
                        const globalIndex = k + batchIndex;
                        const chunkMeta: Record<string, string> = {};
                        if (docMeta.sutta_code) chunkMeta.sutta_code = docMeta.sutta_code;
                        if (docMeta.verse_number) chunkMeta.verse_number = docMeta.verse_number;
                        if (docMeta.book_name) chunkMeta.book_name = docMeta.book_name;
                        await embedWithRetry(chunk, chunkMeta, globalIndex);
                    });
                    await Promise.all(promises);
                }

                successCount++;
                setBatchStats(prev => ({ ...prev, success: successCount }));

                // Nghỉ 2 giây để tránh bị Rate Limit từ website nguồn
                await new Promise(res => setTimeout(res, 2000));

            } catch (err: any) {
                console.error("Batch error for link:", link.url, err);
                failedCount++;
                setBatchStats(prev => ({ ...prev, failed: failedCount }));
            }
        }

        setIsBatchProcessing(false);
        setSuccess(`Đã nạp tự động hoàn tất! Thành công: ${successCount}, Thất bại: ${failedCount}`);
        onUploadComplete?.();
    };

    return (
        <div className="space-y-6">
            {/* ===== NGUỒN DỮ LIỆU ===== */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant={sourceType === 'file' ? 'default' : 'outline'}
                        onClick={() => setSourceType('file')}
                        className="flex-1"
                        disabled={isProcessing}
                    >
                        <Upload className="w-4 h-4 mr-2" /> File PDF
                    </Button>
                    <Button
                        type="button"
                        variant={sourceType === 'url' ? 'default' : 'outline'}
                        onClick={() => setSourceType('url')}
                        className="flex-1"
                        disabled={isProcessing}
                    >
                        <Globe className="w-4 h-4 mr-2" /> Link Website
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-1">
                            <BookOpen className="w-4 h-4 text-primary" /> Chuyên đề Phật học <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={selectedCategoryId}
                            onValueChange={setSelectedCategoryId}
                            disabled={isProcessing || isLoadingCategories}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isLoadingCategories ? "Đang tải..." : "Chọn chuyên đề..."} />
                            </SelectTrigger>
                            <SelectContent className="max-h-[400px]">
                                {(() => {
                                    // Phân nhóm categories dựa trên group_name hoặc fallback "Nhóm - Tên"
                                    const groups: Record<string, typeof categories> = {};
                                    const others: typeof categories = [];

                                    categories.forEach((cat: any) => {
                                        const groupName = cat.group_name || (cat.name.includes(' - ') ? cat.name.split(' - ')[0] : null);
                                        if (groupName && groupName !== 'Khác') {
                                            if (!groups[groupName]) groups[groupName] = [];
                                            groups[groupName].push(cat);
                                        } else {
                                            others.push(cat);
                                        }
                                    });

                                    return (
                                        <>
                                            {Object.entries(groups).map(([groupName, groupItems]) => (
                                                <div key={groupName} className="mb-2">
                                                    <div className="px-2 py-1.5 text-xs font-bold text-amber-600 bg-amber-50 rounded-sm mb-1 uppercase tracking-wider">
                                                        {groupName}
                                                    </div>
                                                    {groupItems.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id} className="pl-4">
                                                            {cat.name.includes(' - ') ? cat.name.split(' - ')[1] : cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            ))}
                                            {others.length > 0 && (
                                                <div className="mb-2">
                                                    <div className="px-2 py-1.5 text-xs font-bold text-gray-500 bg-gray-50 rounded-sm mb-1 uppercase tracking-wider">
                                                        Khác
                                                    </div>
                                                    {others.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id} className="pl-4">
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="scripture-title" className="text-sm font-medium">Tên Kinh sách / Tiêu đề {sourceType === 'file' && <span className="text-red-500">*</span>}</label>
                        <Input
                            id="scripture-title"
                            placeholder={sourceType === 'url' ? "AI sẽ tự động lấy tiêu đề nếu để trống" : "VD: Kinh Tụng Nam Tông Theravada"}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    {sourceType === 'file' ? (
                        <>
                            <label htmlFor="pdf-upload" className="text-sm font-medium">Chọn file PDF (.pdf) <span className="text-red-500">*</span></label>
                            <Input
                                id="pdf-upload"
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                disabled={isProcessing}
                            />
                        </>
                    ) : (
                        <>
                            <label htmlFor="url-input" className="text-sm font-medium">Dán link website bài viết <span className="text-red-500">*</span></label>
                            <Input
                                id="url-input"
                                type="url"
                                placeholder="https://example.com/bai-kinh-phat"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={isProcessing}
                            />
                            <p className="text-[10px] text-gray-500">Hệ thống sẽ tự động bóc tách nội dung văn bản từ link này.</p>
                        </>
                    )}
                </div>
            </div>

            {/* ===== METADATA HỌC THUẬT (TÙY CHỌN) ===== */}
            <div className="border border-dashed border-amber-300 rounded-lg p-4 bg-amber-50/50 space-y-3">
                <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Metadata Học thuật (Tùy chọn — Giúp AI trích dẫn chính xác theo kệ số)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Mã Kinh (Sutta Code)</label>
                        <Input
                            placeholder="VD: Sn 2.4 | DN 2 | MN 22"
                            value={metadata.sutta_code}
                            onChange={(e) => setMetadata(m => ({ ...m, sutta_code: e.target.value }))}
                            disabled={isProcessing || isBatchProcessing}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Số Kệ / Section</label>
                        <Input
                            placeholder="VD: 262 | 1-38 | Phẩm 1"
                            value={metadata.verse_number}
                            onChange={(e) => setMetadata(m => ({ ...m, verse_number: e.target.value }))}
                            disabled={isProcessing || isBatchProcessing}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Bộ Kinh (Book Name)</label>
                        <Input
                            placeholder="VD: Sutta Nipāta | Dīgha Nikāya"
                            value={metadata.book_name}
                            onChange={(e) => setMetadata(m => ({ ...m, book_name: e.target.value }))}
                            disabled={isProcessing || isBatchProcessing}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Bậc tài liệu (Source Tier)</label>
                        <Select
                            value={metadata.source_tier}
                            onValueChange={(val) => setMetadata(m => ({ ...m, source_tier: val }))}
                            disabled={isProcessing || isBatchProcessing}
                        >
                            <SelectTrigger className="text-sm h-10">
                                <SelectValue placeholder="Chọn bậc..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="PRIMARY">Kinh gốc (Canonical)</SelectItem>
                                <SelectItem value="COMMENTARY">Chú giải (Commentary)</SelectItem>
                                <SelectItem value="MODERN">Hiện đại (Modern)</SelectItem>
                                <SelectItem value="TRANSLATION">Bản dịch (Translation)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            <User className="w-3 h-3" /> Người dịch
                        </label>
                        <Input
                            placeholder="VD: HT. Thích Minh Châu"
                            value={metadata.translator}
                            onChange={(e) => setMetadata(m => ({ ...m, translator: e.target.value }))}
                            disabled={isProcessing || isBatchProcessing}
                            className="text-sm"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            <Library className="w-3 h-3" /> Nhà xuất bản
                        </label>
                        <Input
                            placeholder="VD: Viện Nghiên Cứu PGVN"
                            value={metadata.publisher}
                            onChange={(e) => setMetadata(m => ({ ...m, publisher: e.target.value }))}
                            disabled={isProcessing || isBatchProcessing}
                            className="text-sm"
                        />
                    </div>
                </div>
                <p className="text-xs text-amber-700 italic">
                    💡 Điền đầy đủ sẽ giúip AI trích dẫn dạng: <strong>"... Hiếu dưỡng cha mẹ ..." (Sn 2.4, kệ 262, HT. Thích Minh Châu)</strong>
                </p>
                <p className="text-xs text-orange-600 font-medium border-t border-amber-200 pt-2">
                    ⚠️ Metadata này áp dụng cho <strong>toàn bộ đoạn</strong> trong file PDF. Nếu PDF chứa nhiều bài kinh khác nhau, hãy tách thành các file riêng để mã kinh được gắn đúng cho từng bài.
                </p>
            </div>

            {/* ===== BƯỚC 2: PREVIEW NỘI DUNG (HUMAN-IN-THE-LOOP) ===== */}
            {step === 'preview' && (
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-2">Kiểm tra nội dung văn bản trước khi Vector hóa</h3>
                        <p className="text-sm text-blue-600 mb-4">
                            Dưới đây là nội dung văn bản (Markdown) đã được AI bóc tách. Bạn có thể xem trước, sửa lỗi chính tả, xóa các đoạn rác còn sót lại trước khi hệ thống băm nhỏ (chunking) và nạp vào Vector DB.
                        </p>
                        <textarea
                            className="w-full h-64 p-3 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            value={previewText}
                            onChange={(e) => setPreviewText(e.target.value)}
                            disabled={isProcessing}
                        />
                    </div>

                    {isIndexPage && childLinks.length > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                            <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                                <Link className="w-4 h-4" /> Phát hiện đây là trang Mục lục
                            </h3>
                            <p className="text-sm text-amber-700">
                                AI đã tìm thấy {childLinks.length} link bài viết con trong trang này.
                            </p>
                            
                            {/* BATCH PROGRESS UI */}
                            {isBatchProcessing ? (
                                <div className="space-y-3 p-3 bg-white rounded border border-amber-200">
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-amber-700">Tiến trình nạp tự động ({batchStats.current}/{batchStats.total})</span>
                                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                    </div>
                                    <Progress value={(batchStats.current / batchStats.total) * 100} className="h-2" />
                                    <div className="text-xs text-gray-600 truncate">
                                        <strong>Đang xử lý:</strong> {batchStats.currentTitle}
                                    </div>
                                    <div className="text-xs text-gray-500 italic">
                                        Trạng thái: {batchStats.status}
                                    </div>
                                    <div className="flex gap-4 text-xs font-medium">
                                        <span className="text-green-600">Thành công: {batchStats.success}</span>
                                        <span className="text-red-600">Lỗi: {batchStats.failed}</span>
                                    </div>
                                    <p className="text-xs text-red-500 font-medium">⚠️ Vui lòng KHÔNG đóng tab trình duyệt lúc này!</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button 
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
                                        onClick={handleBatchIngest}
                                    >
                                        <Rocket className="w-4 h-4" /> Nạp Tự Động Toàn Bộ ({childLinks.length} links)
                                    </Button>
                                    <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                                        {childLinks.map((link, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-white rounded border border-amber-100 text-sm">
                                                <span className="truncate max-w-[70%] font-medium">{link.title}</span>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    className="h-7 text-xs text-primary hover:text-primary-foreground hover:bg-primary"
                                                    onClick={() => {
                                                        setUrl(link.url);
                                                        setTitle(link.title);
                                                        setStep('input');
                                                        setTimeout(() => handleExtract(), 100);
                                                    }}
                                                >
                                                    Nạp đơn
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => setStep('input')}
                            disabled={isProcessing}
                        >
                            Quay lại sửa thông tin
                        </Button>
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleFinalize(false)}
                            disabled={isProcessing || !previewText.trim()}
                        >
                            {isProcessing ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {statusText}</>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4 mr-2" /> Duyệt nội dung & Nạp Vector</>
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* ===== NÚT XỬ LÝ ===== */}
            {step === 'input' && (
                <Button
                    className="w-full"
                    onClick={handleExtract}
                    disabled={isProcessing || isBatchProcessing || (sourceType === 'file' ? (!file || !title) : !url)}
                >
                    {isProcessing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {statusText}</>
                    ) : (
                        <><Upload className="w-4 h-4 mr-2" /> Bóc tách dữ liệu</>
                    )}
                </Button>
            )}

            {isProcessing && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Tiến trình xử lý</span>
                        <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            )}

            {error && (
                <div className="space-y-3">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                    
                    {canOverwrite && (
                        <Button 
                            variant="destructive" 
                            className="w-full bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleFinalize(true)}
                            disabled={isProcessing}
                        >
                            <ShieldCheck className="w-4 h-4 mr-2" /> Tôi hiểu, hãy Ghi đè & Nạp lại
                        </Button>
                    )}
                </div>
            )}

            {success && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700 font-medium">{success}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
