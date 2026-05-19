import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Loader2, Search, Edit2, Check, X, BookOpen, 
    Trash2, AlertCircle, Calendar, ShieldCheck 
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  source_tier: string;
  publisher?: string;
  publish_year?: number;
  pali_ref?: string;
  language_original?: string;
  created_at: string;
}

export default function RagManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Document>>({});

  const [isStandardizing, setIsStandardizing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleAutoStandardize = async () => {
    setIsStandardizing(true);
    toast.info('Hệ thống đang tự động phân tích và chuẩn hóa tài liệu cũ bằng AI...');
    try {
      const res = await fetch('/api/admin/ai/documents/auto-standardize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã tự động chuẩn hóa thành công ${data.processed} tài liệu!`);
        fetchDocuments();
      } else {
        toast.info(data.message || 'Không có tài liệu nào cần chuẩn hóa thêm.');
      }
    } catch (err) {
      toast.error('Lỗi khi tự động chuẩn hóa');
    } finally {
      setIsStandardizing(false);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/ai/documents');
      const data = await res.json();
      if (!data.error) {
        setDocuments(data);
      } else {
        toast.error('Lỗi khi tải danh sách tài liệu');
      }
    } catch (err) {
      toast.error('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (doc: Document) => {
    setEditingId(doc.id);
    setEditForm(doc);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    
    try {
      const res = await fetch('/api/admin/ai/documents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editForm })
      });
      
      const data = await res.json();
      if (!data.error) {
        toast.success('Cập nhật tài liệu thành công');
        setDocuments(docs => docs.map(d => d.id === editingId ? { ...d, ...editForm } : d));
        setEditingId(null);
      } else {
        toast.error('Lỗi: ' + data.error);
      }
    } catch (err) {
      toast.error('Lỗi kết nối');
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        className="w-full h-12 rounded-2xl border-amber-200 bg-amber-50/30 text-amber-800 font-bold hover:bg-amber-100 hover:text-amber-900 border-dashed"
        onClick={handleAutoStandardize}
        disabled={isStandardizing || isLoading}
      >
        {isStandardizing ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang chuẩn hóa...</>
        ) : (
          <><ShieldCheck className="w-4 h-4 mr-2" /> ✨ Tự động chuẩn hóa toàn bộ thư viện</>
        )}
      </Button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input 
          placeholder="Tìm tên tài liệu..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400 gap-2">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm">Đang tải danh sách tài liệu...</p>
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-stone-200 rounded-2xl text-stone-400">
          <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
          <p>Không tìm thấy tài liệu nào</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              className={`p-4 border-2 rounded-2xl bg-white transition-all ${
                editingId === doc.id ? 'border-amber-400 shadow-lg' : 'border-stone-100'
              }`}
            >
              {editingId === doc.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1 block">Tên tài liệu</label>
                    <Input 
                      value={editForm.title || ''} 
                      onChange={e => setEditForm({...editForm, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1 block">Bậc tài liệu</label>
                      <Select 
                        value={editForm.source_tier} 
                        onValueChange={v => setEditForm({...editForm, source_tier: v})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIMARY">Kinh gốc</SelectItem>
                          <SelectItem value="COMMENTARY">Chú giải</SelectItem>
                          <SelectItem value="MODERN">Hiện đại</SelectItem>
                          <SelectItem value="TRANSLATION">Bản dịch</SelectItem>
                          <SelectItem value="UNKNOWN">Chưa xác định</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1 block">Mã Pali (Ref)</label>
                      <Input 
                        placeholder="Vd: MN 141"
                        value={editForm.pali_ref || ''} 
                        onChange={e => setEditForm({...editForm, pali_ref: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1 block">Nhà xuất bản</label>
                      <Input 
                        value={editForm.publisher || ''} 
                        onChange={e => setEditForm({...editForm, publisher: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-1 block">Năm XB</label>
                      <Input 
                        type="number"
                        value={editForm.publish_year || ''} 
                        onChange={e => setEditForm({...editForm, publish_year: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-amber-600 hover:bg-amber-700" onClick={handleUpdate}>
                      <Check className="w-4 h-4 mr-2" /> Lưu thay đổi
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 line-clamp-1">{doc.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-stone-200 bg-stone-50 text-stone-500">
                          {doc.source_tier}
                        </span>
                        {doc.pali_ref && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-amber-200 bg-amber-50 text-amber-700">
                            Ref: {doc.pali_ref}
                          </span>
                        )}
                        {doc.publish_year && (
                          <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700">
                            {doc.publish_year}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => startEdit(doc)} className="text-stone-400">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
