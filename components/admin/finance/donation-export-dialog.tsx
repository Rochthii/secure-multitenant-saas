'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileDown, Loader2, FileSpreadsheet, FileText } from 'lucide-react';
import { getTransactionReportData } from '@/app/actions/admin/finance';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/lib/constants/transaction';

interface CategoryItem {
    id: string;
    name: string;
    type: string;
}

interface TransactionExportDialogProps {
    tenants: { id: string; name: string }[];
    purposes: CategoryItem[];
    projects: CategoryItem[];
}

export function TransactionExportDialog({ tenants, purposes, projects }: TransactionExportDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [format, setFormat] = useState<'xlsx' | 'pdf'>('xlsx');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [tenantId, setTenantId] = useState('all');
    const [recipientType, setRecipientType] = useState<'tenant_fund' | 'charity_fund' | 'all'>('all');
    const [status, setStatus] = useState<'pending' | 'confirmed' | 'cancelled' | 'all'>('confirmed');
    const [purposeId, setPurposeId] = useState('all');

    // Filtered categories based on recipientType
    const filteredCategories = React.useMemo(() => {
        if (recipientType === 'tenant_fund') return purposes;
        if (recipientType === 'charity_fund') return projects;
        if (recipientType === 'all') return []; // Or combine? User said "theo danh mục" which usually applies to specific type
        return [];
    }, [recipientType, purposes, projects]);

    // Reset purposeId when recipientType changes
    React.useEffect(() => {
        setPurposeId('all');
    }, [recipientType]);

    const handleExport = async () => {
        try {
            setIsLoading(true);
            const result = await getTransactionReportData({
                startDate,
                endDate,
                tenantId,
                recipientType,
                status,
                purposeId: purposeId === 'all' ? undefined : purposeId,
            });

            if (!result.success || !result.data) {
                toast.error(result.error || 'Không lấy được dữ liệu báo cáo');
                return;
            }

            if (result.data.length === 0) {
                toast.warning('Không có dữ liệu trong khoảng thời gian này');
                return;
            }

            if (format === 'xlsx') {
                exportExcel(result.data);
            } else {
                exportPDF(result.data);
            }

            setIsOpen(false);
            toast.success('Báo cáo đã được tạo thành công');
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tạo báo cáo');
        } finally {
            setIsLoading(false);
        }
    };

    const exportExcel = (data: any[]) => {
        const worksheetData = data.map((d, index) => ({
            'STT': index + 1,
            'Ngày': new Date(d.created_at).toLocaleDateString('vi-VN'),
            'Người đóng góp': d.is_anonymous ? 'Ẩn danh' : d.donor_name,
            'Số điện thoại': d.donor_phone || '',
            'Cơ sở tiếp nhận': d.tenants?.name || 'N/A',
            'Loại quỹ': d.recipient_type === 'tenant_fund' ? 'Thanh toán Chi nhánh' : 'Thanh toán Từ thiện',
            'Nội dung': d.transaction_projects?.title_vi || 'N/A',
            'Số tiền': d.amount,
            'Ngân hàng': d.bank_accounts?.bank_name || '',
            'Số tài khoản': d.bank_accounts?.account_number || '',
            'Trạng thái': d.status === 'confirmed' ? 'Thành công' : d.status === 'pending' ? 'Chờ duyệt' : 'Đã hủy',
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(worksheetData);
        
        // Căn chỉnh đơn giản (Optional)
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions Report');
        XLSX.writeFile(wb, `bao-cao-cung-duong-${Date.now()}.xlsx`);
    };

    const exportPDF = (data: any[]) => {
        const doc = new jsPDF();
        
        // Font setup (Quick fix: use standard Helvetica/Times but it might miss VN accents)
        // For professional PDF, we really need to embed a Unicode font.
        // Assuming the user environment supports standard fonts or we can handle without accents for now
        // OR we use a simple trick with autoTable which has some level of support
        
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(18);
        doc.text('Minh Chau Foundation - THONG KE DONG GOP', 105, 20, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont('Helvetica', 'normal');
        doc.text(`Ngay xuat: ${new Date().toLocaleString('vi-VN')}`, 105, 30, { align: 'center' });
        
        if (startDate || endDate) {
            const range = `${startDate || '...'} den ${endDate || '...'}`;
            doc.text(`Khoang thoi gian: ${range}`, 105, 36, { align: 'center' });
        }

        const tableColumn = ["STT", "Ngay", "Nguoi dong gop", "Co so", "So tien", "Trang thai"];
        const tableRows = data.map((d, i) => [
            i + 1,
            new Date(d.created_at).toLocaleDateString('vi-VN'),
            d.is_anonymous ? 'An danh' : (d.donor_name || 'N/A'),
            d.tenants?.name || 'N/A',
            formatCurrency(d.amount),
            d.status === 'confirmed' ? 'Thanh cong' : 'Cho duyet'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'striped',
            headStyles: { fillColor: [184, 134, 11] }, // Gold primary
            styles: { fontSize: 8, font: 'helvetica' },
        });

        doc.save(`bao-cao-cung-duong-${Date.now()}.pdf`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gold-primary hover:bg-gold-dark text-white font-bold shadow-gold-shadow">
                    <FileDown className="mr-2 h-4 w-4" />
                    Xuất báo cáo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-playfair font-bold">Cấu hình xuất báo cáo</DialogTitle>
                    <DialogDescription>
                        Chọn các tiêu chí để tạo file báo cáo tài chính chuyên nghiệp.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="format">Định dạng file</Label>
                            <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="xlsx">
                                        <div className="flex items-center gap-2">
                                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                            <span>Excel (.xlsx)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="pdf">
                                        <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-red-600" />
                                            <span>PDF Report</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="status">Trạng thái giao dịch</Label>
                            <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="confirmed">Thành công</SelectItem>
                                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="start">Từ ngày</Label>
                            <Input
                                id="start"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="end">Đến ngày</Label>
                            <Input
                                id="end"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="tenant">Lọc theo cơ sở (Chi nhánh)</Label>
                        <Select value={tenantId} onValueChange={setTenantId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn cơ sở..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả cơ sở</SelectItem>
                                {tenants.map(t => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="type">Loại quỹ</Label>
                        <Select value={recipientType} onValueChange={(v: any) => setRecipientType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả loại quỹ</SelectItem>
                                <SelectItem value="tenant_fund">Thanh toán Chi nhánh</SelectItem>
                                <SelectItem value="charity_fund">Thanh toán Từ thiện</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {recipientType !== 'all' && (
                        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1">
                            <Label htmlFor="category">
                                {recipientType === 'tenant_fund' ? 'Hạng mục thanh toán' : 'Dự án từ thiện'}
                            </Label>
                            <Select value={purposeId} onValueChange={setPurposeId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn hạng mục..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả hạng mục</SelectItem>
                                    {filteredCategories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleExport} 
                        disabled={isLoading}
                        className="bg-gold-primary hover:bg-gold-dark text-white"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Đang xử lý...
                            </>
                        ) : (
                            'Bắt đầu xuất file'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
