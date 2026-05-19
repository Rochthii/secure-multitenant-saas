import React from 'react';
import { createClient } from '@/lib/supabase/server';
import { isGlobalAdmin } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download } from 'lucide-react';
// @ts-ignore - TypeScript cache issue with newly created component
import { ExportCSVButton } from '@/components/admin/export-csv-button';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';

export default async function RegistrationsPage() {
    // SECURITY: Global admins only (registrations across all tenants)
    const globalAccess = await isGlobalAdmin();
    if (!globalAccess) {
        redirect('/admin');
    }

    const supabase = await createClient();
    const { data: registrations } = await supabase
        .from('event_registrations')
        .select(`
            *,
            events (
                title_vi,
                start_date
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-playfair font-bold">Đăng ký sự kiện</h1>
                {registrations && registrations.length > 0 && (
                    <ExportCSVButton data={registrations as any[]} />
                )}
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Họ tên
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Sự kiện
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số người
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Liên hệ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày đăng ký
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(registrations as any[]) && (registrations as any[]).length > 0 ? (
                                    (registrations as any[]).map((reg) => (
                                        <tr key={reg.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {reg.full_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {reg.events?.title_vi || 'N/A'}
                                                </div>
                                                {reg.events?.start_date && (
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(new Date(reg.events.start_date), 'dd/MM/yyyy', { locale: vi })}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {reg.num_participants} người
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{reg.phone}</div>
                                                {reg.email && (
                                                    <div className="text-xs text-gray-500">{reg.email}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    reg.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                                    }`}>
                                                    {reg.status === 'confirmed' && 'Đã xác nhận'}
                                                    {reg.status === 'pending' && 'Chờ xác nhận'}
                                                    {reg.status === 'cancelled' && 'Đã hủy'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {formatDate(new Date(reg.registration_date || reg.created_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            Chưa có đăng ký nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
