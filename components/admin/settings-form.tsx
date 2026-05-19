'use client';

import React, { useTransition } from 'react';
import { updateSettings } from '@/app/actions/admin/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChangePasswordForm } from '@/components/admin/change-password-form';
import { LogoSettingField } from '@/components/admin/logo-setting-field';
import { toast } from 'sonner';
import { DEFAULT_SITE_NAME, BRAND_NAME_VI } from '@/lib/constants';

export function SettingsForm({ initialSettings, contextTenantId, isCompany }: { initialSettings: Record<string, string>, contextTenantId: string, isCompany?: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.append('tenant_id', contextTenantId);

        startTransition(async () => {
            try {
                const result = await updateSettings(formData);
                if (result?.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Lưu cài đặt thành công!');
                }
            } catch (error: any) {
                toast.error(error.message || 'Đã xảy ra lỗi không xác định.');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {/* Site Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>{isCompany ? 'Thông tin doanh nghiệp' : 'Thông tin chi nhánh'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <LogoSettingField defaultValue={initialSettings['site_logo'] || ''} />

                        <div className="pt-4 border-t">
                            <Label htmlFor="site_name_vi">{isCompany ? 'Tên doanh nghiệp / Tổ chức (VI)' : 'Tên chi nhánh (VI)'}</Label>
                            <Input
                                id="site_name_vi"
                                name="site_name_vi"
                                defaultValue={initialSettings['site_name_vi'] || DEFAULT_SITE_NAME}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_name_en">{isCompany ? 'Organization Name (EN)' : 'Tên chi nhánh (EN)'}</Label>
                            <Input
                                id="site_name_en"
                                name="site_name_en"
                                defaultValue={initialSettings['site_name_en'] || DEFAULT_SITE_NAME}
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_name_km">{isCompany ? 'Tên tổ chức (KM)' : 'Tên chi nhánh (KM)'}</Label>
                            <Input
                                id="site_name_km"
                                name="site_name_km"
                                defaultValue={initialSettings['site_name_km'] || ''}
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_subtitle_vi">{isCompany ? 'Dòng chữ phụ (Ví dụ: Doanh nghiệp Xã hội)' : 'Dòng chữ phụ (Ví dụ: Chi nhánh Khmer)'}</Label>
                            <Input
                                id="site_subtitle_vi"
                                name="site_subtitle_vi"
                                defaultValue={initialSettings['site_subtitle_vi'] || (isCompany ? 'Doanh nghiệp Xã hội' : 'Chi nhánh Khmer')}
                            />
                        </div>

                        <div>
                            <Label htmlFor="site_description">Giới thiệu ngắn</Label>
                            <Textarea
                                id="site_description"
                                name="site_description"
                                defaultValue={initialSettings['site_description'] || ''}
                                rows={3}
                                placeholder={isCompany ? "Mô tả ngắn về doanh nghiệp..." : "Mô tả ngắn về chi nhánh..."}
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <Label htmlFor="site_og_image">Ảnh đại diện khi chia sẻ (Social OG Image URL)</Label>
                            <Input
                                id="site_og_image"
                                name="site_og_image"
                                defaultValue={initialSettings['site_og_image'] || ''}
                                placeholder="https://.../og-image.jpg"
                            />
                            <p className="text-xs text-gray-500 mt-1">Ảnh này sẽ hiện ra khi bạn gửi link qua Facebook, Zalo, Telegram... (Kích thước khuyên dùng: 1200x630px)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Information (New) - Only for Global Company */}
                {isCompany && (
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin Ngân hàng (VietQR)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="bank_name">Tên Ngân hàng</Label>
                                <Input
                                    id="bank_name"
                                    name="bank.name"
                                    defaultValue={initialSettings['bank.name'] || ''}
                                    placeholder="Ngân hàng ACB"
                                />
                            </div>
                            <div>
                                <Label htmlFor="bank_id">Mã hệ thống (Bin ID)</Label>
                                <Input
                                    id="bank_id"
                                    name="bank.id"
                                    defaultValue={initialSettings['bank.id'] || ''}
                                    placeholder="VD: 970416 (ACB)"
                                />
                                <p className="text-xs text-gray-500 mt-1">Tra cứu tại vietqr.io (VD: VCB=970436, ACB=970416)</p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="bank_account_no">Số tài khoản</Label>
                            <Input
                                id="bank_account_no"
                                name="bank.account_no"
                                defaultValue={initialSettings['bank.account_no'] || ''}
                                placeholder="0123456789"
                            />
                        </div>

                        <div>
                            <Label htmlFor="bank_account_name">Tên chủ tài khoản (Viết tắt ko dấu)</Label>
                            <Input
                                id="bank_account_name"
                                name="bank.account_name"
                                defaultValue={initialSettings['bank.account_name'] || ''}
                                placeholder={isCompany ? "TÊN TỔ CHỨC / CÔNG TY" : "MULTI-TENANT ECOSYSTEM"}
                            />
                        </div>

                        <div>
                            <Label htmlFor="bank_qr_template">Mẫu QR</Label>
                            <select
                                id="bank_qr_template"
                                name="bank.qr_template"
                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                defaultValue={initialSettings['bank.qr_template'] || 'compact2'}
                            >
                                <option value="compact">Compact (Đơn giản)</option>
                                <option value="compact2">Compact 2 (Đẹp)</option>
                                <option value="qr_only">QR Only (Chỉ mã QR)</option>
                                <option value="print">Print (In ấn)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>
                )}

                {/* Contact Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Thông tin liên hệ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="contact_email">Email</Label>
                            <Input
                                id="contact_email"
                                name="contact_email"
                                type="email"
                                defaultValue={initialSettings['contact_email'] || ''}
                                placeholder="contact@system.com"
                            />
                        </div>

                        <div>
                            <Label htmlFor="contact_phone">Số điện thoại</Label>
                            <Input
                                id="contact_phone"
                                name="contact_phone"
                                defaultValue={initialSettings['contact_phone'] || ''}
                                placeholder="+84 xxx xxx xxx"
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Địa chỉ</Label>
                            <Textarea
                                id="address"
                                name="address"
                                defaultValue={initialSettings['address'] || ''}
                                rows={3}
                                placeholder="Địa chỉ đầy đủ..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="map_embed_url">Google Map Embed URL (Mã nhúng iframe src)</Label>
                            <Input
                                id="map_embed_url"
                                name="map_embed_url"
                                defaultValue={initialSettings['map_embed_url'] || ''}
                                placeholder="https://www.google.com/maps/embed?pb=..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Lấy link src trong mã nhúng iframe của Google Maps (chia sẻ &gt; nhúng bản đồ)</p>
                        </div>

                        <div>
                            <Label htmlFor="map_direction_url">Link chỉ đường Google Map</Label>
                            <Input
                                id="map_direction_url"
                                name="map_direction_url"
                                defaultValue={initialSettings['map_direction_url'] || ''}
                                placeholder="https://maps.app.goo.gl/..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Social Media */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mạng xã hội</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="facebook_url">Facebook</Label>
                            <Input
                                id="facebook_url"
                                name="facebook_url"
                                type="url"
                                defaultValue={initialSettings['facebook_url'] || ''}
                                placeholder="https://facebook.com/..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="youtube_url">YouTube</Label>
                            <Input
                                id="youtube_url"
                                name="youtube_url"
                                type="url"
                                defaultValue={initialSettings['youtube_url'] || ''}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <ChangePasswordForm />

                {/* Save Button */}
                <div className="flex gap-4">
                    <Button type="submit" disabled={isPending} className="bg-gold-primary hover:bg-gold-dark">
                        {isPending ? 'Đang lưu...' : 'Lưu cài đặt'}
                    </Button>
                </div>
            </div>
        </form>
    );
}

