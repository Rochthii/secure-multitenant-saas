'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { saveLayoutBlocks } from '@/app/actions/admin/layout-blocks';
import { BlockConfig } from '@/lib/types/layout-blocks';
import { SECTION_REGISTRY } from '@/lib/blocks-registry';
import { LAYOUT_PRESETS } from '@/lib/layout-presets';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { GripVertical, Save, RotateCcw, Plus, Trash2, Smartphone, Monitor, Settings, Palette, Check, LayoutGrid, AlertTriangle, User, ExternalLink, BarChart3, Clock, Search, List, Eye, EyeOff, Info, Pipette, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BUDDHIST_THEMES, ColorTheme } from '@/lib/themes-config';
import { updateTenantTheme } from '@/app/actions/admin/tenants';
import { ColorPicker } from '@/components/ui/color-picker';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// --- BLOCK SETTINGS DIALOG ---
const BlockSettingsDialog = React.memo(function BlockSettingsDialog({
    block,
    registryEntry,
    onSave,
    initialOpen = false
}: {
    block: BlockConfig,
    registryEntry: any,
    onSave: (id: string, newSettings: any) => void,
    initialOpen?: boolean
}) {
    const [open, setOpen] = useState(false);
    const [settings, setSettings] = useState<Record<string, any>>(block.settings || {});

    // Sync initialOpen to internal state
    useEffect(() => {
        if (initialOpen) setOpen(true);
    }, [initialOpen]);

    const handleChange = useCallback((key: string, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const handleSave = useCallback(() => {
        onSave(block.id, settings);
        setOpen(false);
    }, [block.id, settings, onSave]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="p-2 text-gray-400 hover:text-amber-500 hover:bg-white/5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Cài đặt khối này"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-950 border border-white/[0.08] text-slate-200">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Settings className="w-5 h-5 text-amber-500" />
                        Cài đặt: {registryEntry.name}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {registryEntry.description}
                    </DialogDescription>
                </DialogHeader>
                <Tabs
                    defaultValue={['founder_section', 'impact_dashboard', 'transparency_timeline', 'traditional_mosaic_alt1', 'traditional_mosaic_alt2', 'traditional_mosaic_alt3', 'traditional_mosaic_alt4', 'traditional_mosaic_alt5', 'traditional_mosaic_alt6', 'traditional_mosaic_alt7'].includes(block.type) ? 'content' : 'general'}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-900 border border-white/[0.08] p-1 rounded-lg">
                        <TabsTrigger value="general" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">Cơ bản</TabsTrigger>
                        <TabsTrigger value="content" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">Nội dung</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="customTitle" className="text-slate-300">Tiêu đề tuỳ chỉnh</Label>
                            <Input
                                id="customTitle"
                                placeholder="Để trống để dùng tiêu đề gốc..."
                                value={settings.customTitle || ''}
                                onChange={(e) => handleChange('customTitle', e.target.value)}
                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="customSubtitle" className="text-slate-300">Phụ đề (Subtitle)</Label>
                            <Input
                                id="customSubtitle"
                                placeholder="Mô tả phụ bên dưới tiêu đề..."
                                value={settings.customSubtitle || ''}
                                onChange={(e) => handleChange('customSubtitle', e.target.value)}
                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50"
                            />
                        </div>

                        {['news', 'events', 'dharma'].includes(registryEntry.category) && (
                            <div className="space-y-2">
                                <Label htmlFor="limit" className="text-slate-300">Số bài tối đa hiển thị (Limit)</Label>
                                <Input
                                    id="limit"
                                    type="number"
                                    min={1}
                                    max={20}
                                    placeholder="VD: 3, 6, 9..."
                                    value={settings.limit || ''}
                                    onChange={(e) => handleChange('limit', parseInt(e.target.value) || undefined)}
                                    className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50"
                                />
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="content" className="py-4 space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        {/* FOUNDER SECTION SPECIALIZED FIELDS */}
                        {block.type === 'founder_section' && (
                            <div className="space-y-6">
                                <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-900/30 flex items-center gap-2 text-amber-200 text-xs mb-4">
                                    <User className="w-4 h-4" />
                                    <span>Tùy chỉnh danh sách thành viên. Thành viên đầu tiên sẽ được hiển thị nổi bật (CEO).</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-slate-200">Danh sách Thành viên / Founders</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1 text-[10px] uppercase font-bold text-amber-400 border-amber-900/30 bg-amber-950/30 hover:bg-amber-950/50"
                                            onClick={() => {
                                                const current = settings.members || [];
                                                handleChange('members', [...current, { name: 'Thành viên mới', role: 'Vị trí', desc: 'Mô tả ngắn...', icon: 'User', link: '' }]);
                                            }}
                                        >
                                            <Plus className="w-3 h-3" /> Thêm thành viên
                                        </Button>
                                    </div>

                                    {(settings.members || []).map((member: any, idx: number) => (
                                        <div key={idx} className="space-y-3 p-4 border border-white/[0.06] rounded-xl bg-slate-900/40 relative group/member">
                                            <button
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-950/60 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover/member:opacity-100 transition-opacity shadow-sm border border-red-900/50 z-20"
                                                onClick={() => {
                                                    const current = [...(settings.members || [])];
                                                    current.splice(idx, 1);
                                                    handleChange('members', current);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>

                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="outline" className={cn("bg-slate-950 text-slate-300 border-white/10", idx === 0 ? "border-amber-500/30 text-amber-400 font-bold bg-amber-950/10" : "")}>
                                                    {idx === 0 ? 'Featured (CEO)' : `Thành viên ${idx + 1}`}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Họ tên</Label>
                                                    <Input
                                                        className="h-8 text-xs bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                        placeholder="VD: Nguyễn Ngọc Minh Châu"
                                                        value={member.name || ''}
                                                        onChange={(e) => {
                                                            const current = [...(settings.members || [])];
                                                            current[idx].name = e.target.value;
                                                            handleChange('members', current);
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Vai trò</Label>
                                                    <Input
                                                        className="h-8 text-xs bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                        placeholder="VD: Tổng Giám đốc"
                                                        value={member.role || ''}
                                                        onChange={(e) => {
                                                            const current = [...(settings.members || [])];
                                                            current[idx].role = e.target.value;
                                                            handleChange('members', current);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Icon</Label>
                                                    <select
                                                        className="w-full h-8 text-[10px] border border-white/10 rounded bg-slate-900 text-white px-2"
                                                        value={member.icon || 'User'}
                                                        onChange={(e) => {
                                                            const current = [...(settings.members || [])];
                                                            current[idx].icon = e.target.value;
                                                            handleChange('members', current);
                                                        }}
                                                    >
                                                        {['ShieldCheck', 'Code2', 'Palette', 'User', 'Users', 'Briefcase', 'Star', 'Heart'].map(icon => (
                                                            <option key={icon} value={icon}>{icon}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Link bài viết</Label>
                                                    <Input
                                                        className="h-8 text-xs font-mono bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                        placeholder="/vi/slug-bai-viet"
                                                        value={member.link || ''}
                                                        onChange={(e) => {
                                                            const current = [...(settings.members || [])];
                                                            current[idx].link = e.target.value;
                                                            handleChange('members', current);
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-bold text-slate-400">Mô tả ngắn</Label>
                                                <textarea
                                                    className="w-full min-h-[60px] p-2 text-xs border border-white/10 rounded-md bg-slate-900 text-white resize-none placeholder:text-slate-500"
                                                    placeholder="Mô tả tóm tắt kinh nghiệm..."
                                                    value={member.desc || ''}
                                                    onChange={(e) => {
                                                        const current = [...(settings.members || [])];
                                                        current[idx].desc = e.target.value;
                                                        handleChange('members', current);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {(!settings.members || settings.members.length === 0) && (
                                        <div className="text-center py-8 border border-dashed border-white/10 rounded-xl bg-slate-950/40 text-slate-400 text-xs">
                                            Chưa có thành viên nào. Hãy nhấn "Thêm thành viên" để bắt đầu.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* IMPACT DASHBOARD SPECIALIZED FIELDS */}
                        {block.type === 'impact_dashboard' && (
                            <div className="space-y-6">
                                <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30 flex items-center gap-2 text-blue-200 text-xs mb-4">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>Dữ liệu sẽ tự động lấy từ DB, nhưng bạn có thể ghi đè thủ công tại đây.</span>
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Tiêu đề Dashboard (HTML support)</Label>
                                        <Input
                                            placeholder="Tác động <span class='...'>Cộng đồng</span>"
                                            value={settings.sectionTitleHtml || ''}
                                            onChange={(e) => handleChange('sectionTitleHtml', e.target.value)}
                                            className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                        />
                                    </div>

                                    {/* Stat 1: Main Highlight */}
                                    <div className="p-4 border border-blue-500/20 rounded-xl bg-blue-950/10 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold flex items-center gap-2 text-slate-200"><div className="w-2 h-2 rounded-full bg-blue-500" /> Card Chính (Tổng Quỹ)</Label>
                                            <Badge variant="outline" className="bg-blue-950/40 border-blue-500/30 text-blue-300">Highlight</Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-400">Giá trị</Label>
                                                <Input
                                                    placeholder="VD: 15.4 Tỷ"
                                                    value={settings.stat1Value || ''}
                                                    onChange={(e) => handleChange('stat1Value', e.target.value)}
                                                    className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase text-slate-400">Tiêu đề</Label>
                                                <Input
                                                    placeholder="VD: Tổng Quỹ Cộng Đồng"
                                                    value={settings.stat1Title || ''}
                                                    onChange={(e) => handleChange('stat1Title', e.target.value)}
                                                    className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Nhãn phụ / Thời gian</Label>
                                            <Input
                                                placeholder="VD: Cập nhật 5 phút trước"
                                                value={settings.stat1Sub || ''}
                                                onChange={(e) => handleChange('stat1Sub', e.target.value)}
                                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-[10px] uppercase text-slate-400">Link hành động</Label>
                                            <Input
                                                placeholder="/vi/slug-bai-viet"
                                                value={settings.stat1Link || ''}
                                                onChange={(e) => handleChange('stat1Link', e.target.value)}
                                                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Dynamic Metrics List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-bold text-slate-200">Danh sách Chỉ số Tác động</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 gap-1 text-[10px] uppercase font-bold text-blue-400 border-blue-900/30 bg-blue-950/30 hover:bg-blue-950/50"
                                                onClick={() => {
                                                    const current = settings.metrics || [];
                                                    handleChange('metrics', [...current, { title: 'Tên chỉ số', value: '100', icon: 'Target', unit: '+' }]);
                                                }}
                                            >
                                                <Plus className="w-3 h-3" /> Thêm chỉ số
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {(settings.metrics || []).map((m: any, idx: number) => (
                                                <div key={idx} className="p-3 border border-white/[0.06] rounded-xl bg-slate-900/40 space-y-3 relative group/item">
                                                    <button
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-950/60 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm border border-red-900/50"
                                                        onClick={() => {
                                                            const current = [...(settings.metrics || [])];
                                                            current.splice(idx, 1);
                                                            handleChange('metrics', current);
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    <div className="grid grid-cols-12 gap-2">
                                                        <div className="col-span-4 space-y-1">
                                                            <Label className="text-[10px] uppercase text-slate-400">Icon (Lucide)</Label>
                                                            <select
                                                                className="w-full h-8 text-[10px] border border-white/10 rounded bg-slate-900 text-white px-2"
                                                                value={m.icon || 'Target'}
                                                                onChange={(e) => {
                                                                    const current = [...(settings.metrics || [])];
                                                                    current[idx].icon = e.target.value;
                                                                    handleChange('metrics', current);
                                                                }}
                                                            >
                                                                {['Activity', 'Users', 'HeartHandshake', 'Landmark', 'Globe', 'Award', 'TrendingUp', 'Presentation', 'Heart', 'Target', 'HelpCircle', 'ArrowRight'].map(icon => (
                                                                    <option key={icon} value={icon}>{icon}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="col-span-8 space-y-1">
                                                            <Label className="text-[10px] uppercase text-slate-400">Tiêu đề</Label>
                                                            <Input
                                                                className="h-8 text-xs bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                                value={m.title}
                                                                onChange={(e) => {
                                                                    const current = [...(settings.metrics || [])];
                                                                    current[idx].title = e.target.value;
                                                                    handleChange('metrics', current);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase text-slate-400">Giá trị</Label>
                                                            <Input
                                                                className="h-8 text-xs font-bold bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                                value={m.value}
                                                                onChange={(e) => {
                                                                    const current = [...(settings.metrics || [])];
                                                                    current[idx].value = e.target.value;
                                                                    handleChange('metrics', current);
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase text-slate-400">Đơn vị (VD: +, K)</Label>
                                                            <Input
                                                                className="h-8 text-xs bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                                value={m.unit || ''}
                                                                onChange={(e) => {
                                                                    const current = [...(settings.metrics || [])];
                                                                    current[idx].unit = e.target.value;
                                                                    handleChange('metrics', current);
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] uppercase text-slate-400">Link điều hướng</Label>
                                                        <Input
                                                            className="h-8 text-xs bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                            placeholder="/vi/..."
                                                            value={m.link || ''}
                                                            onChange={(e) => {
                                                                const current = [...(settings.metrics || [])];
                                                                current[idx].link = e.target.value;
                                                                handleChange('metrics', current);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <Label className="text-slate-300">Dữ liệu Biểu đồ (JSON Format)</Label>
                                        <textarea
                                            className="w-full h-32 p-3 text-xs font-mono border border-white/10 rounded-lg bg-slate-900 text-emerald-400 placeholder:text-slate-600"
                                            placeholder='[{"name": "T1", "transactions": 4000, "projects": 24}, ...]'
                                            value={settings.monthlyDataJson || ''}
                                            onChange={(e) => handleChange('monthlyDataJson', e.target.value)}
                                        />
                                        <p className="text-[10px] text-slate-400">Thận trọng khi sửa JSON. Sai cú pháp sẽ làm biểu đồ không hiển thị.</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TRANSPARENCY TIMELINE SPECIALIZED FIELDS */}
                        {block.type === 'transparency_timeline' && (
                            <div className="space-y-6">
                                <div className="p-3 bg-blue-950/20 rounded-lg border border-blue-900/30 flex items-center gap-2 text-blue-200 text-xs mb-4">
                                    <Clock className="w-4 h-4" />
                                    <span>Tùy chỉnh lộ trình phát triển và các cột mốc quan trọng.</span>
                                </div>

                                <div className="grid gap-4 p-4 border border-white/[0.06] rounded-xl bg-slate-900/40">
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Badge (Nhãn phụ)</Label>
                                        <Input
                                            placeholder="VD: Lộ Trình Minh Bạch"
                                            value={settings.sectionBadge || ''}
                                            onChange={(e) => handleChange('sectionBadge', e.target.value)}
                                            className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Tiêu đề chính</Label>
                                        <Input
                                            placeholder="VD: Hành Trình Kiến Tạo Giá Trị"
                                            value={settings.sectionTitle || ''}
                                            onChange={(e) => handleChange('sectionTitle', e.target.value)}
                                            className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-[10px] uppercase font-bold text-slate-400">Mô tả tóm tắt</Label>
                                        <textarea
                                            className="w-full min-h-[80px] p-2 text-xs border border-white/10 rounded-md bg-slate-900 text-white resize-none placeholder:text-slate-500"
                                            placeholder="Mô tả mục đích của lộ trình này..."
                                            value={settings.sectionDesc || ''}
                                            onChange={(e) => handleChange('sectionDesc', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-slate-200">Các Cột Mốc / Sự Kiện</Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-8 gap-1 text-[10px] uppercase font-bold text-blue-400 border-blue-900/30 bg-blue-950/30 hover:bg-blue-950/50"
                                            onClick={() => {
                                                const current = settings.items || [];
                                                handleChange('items', [...current, { date: 'Thời gian', title: 'Sự kiện mới', description: 'Mô tả...', status: 'planned' }]);
                                            }}
                                        >
                                            <Plus className="w-3 h-3" /> Thêm cột mốc
                                        </Button>
                                    </div>

                                    {(settings.items || []).map((item: any, idx: number) => (
                                        <div key={idx} className="space-y-3 p-4 border border-white/[0.06] rounded-xl bg-slate-900/40 relative group/item">
                                            <button
                                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-950/60 text-red-400 rounded-full flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity shadow-sm border border-red-900/50"
                                                onClick={() => {
                                                    const current = [...(settings.items || [])];
                                                    current.splice(idx, 1);
                                                    handleChange('items', current);
                                                }}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Thời gian (VD: Q1 2024)</Label>
                                                    <Input
                                                        className="h-8 text-xs font-bold bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                        value={item.date || ''}
                                                        onChange={(e) => {
                                                            const current = [...(settings.items || [])];
                                                            current[idx].date = e.target.value;
                                                            handleChange('items', current);
                                                        }}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Trạng thái</Label>
                                                    <select
                                                        className="w-full h-8 text-[10px] border border-white/10 rounded bg-slate-900 text-white px-2"
                                                        value={item.status || 'planned'}
                                                        onChange={(e) => {
                                                            const current = [...(settings.items || [])];
                                                            current[idx].status = e.target.value;
                                                            handleChange('items', current);
                                                        }}
                                                    >
                                                        <option value="done">Hoàn thành</option>
                                                        <option value="in-progress">Đang triển khai</option>
                                                        <option value="planned">Kế hoạch</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-bold text-slate-400">Tiêu đề cột mốc</Label>
                                                <Input
                                                    className="h-8 text-xs bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                    value={item.title || ''}
                                                    onChange={(e) => {
                                                        const current = [...(settings.items || [])];
                                                        current[idx].title = e.target.value;
                                                        handleChange('items', current);
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-bold text-slate-400">Chi tiết nội dung</Label>
                                                <textarea
                                                    className="w-full min-h-[60px] p-2 text-xs border border-white/10 rounded-md bg-slate-900 text-white resize-none placeholder:text-slate-500"
                                                    value={item.description || ''}
                                                    onChange={(e) => {
                                                        const current = [...(settings.items || [])];
                                                        current[idx].description = e.target.value;
                                                        handleChange('items', current);
                                                    }}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] uppercase font-bold text-slate-400">Link chi tiết (Tùy chọn)</Label>
                                                <Input
                                                    className="h-8 text-xs font-mono bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                                    placeholder="/vi/slug-bai-viet"
                                                    value={item.link || ''}
                                                    onChange={(e) => {
                                                        const current = [...(settings.items || [])];
                                                        current[idx].link = e.target.value;
                                                        handleChange('items', current);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ABOUT MOSAIC ALT SPECIALIZED FIELDS (Content Mapping) */}
                        {['traditional_mosaic_alt1', 'traditional_mosaic_alt2', 'traditional_mosaic_alt3', 'traditional_mosaic_alt4', 'traditional_mosaic_alt5', 'traditional_mosaic_alt6', 'traditional_mosaic_alt7'].includes(block.type) && (
                            <div className="space-y-6">
                                <div className="p-3 bg-indigo-950/20 rounded-lg border border-indigo-900/30 flex items-center gap-2 text-indigo-200 text-xs mb-4">
                                    <Info className="w-4 h-4" />
                                    <span>Hệ thống tự động ánh xạ bài viết từ trang Giới thiệu. Bạn có thể ghi đè từ khóa tìm kiếm tại đây.</span>
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="about_intro_key" className="text-xs font-bold text-slate-300">Từ khóa Lịch sử / Giới thiệu</Label>
                                        <Input
                                            id="about_intro_key"
                                            placeholder="Mặc định: lich-su, gioi-thieu"
                                            value={settings.about_intro_key || ''}
                                            onChange={(e) => handleChange('about_intro_key', e.target.value)}
                                            className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                        />
                                        <p className="text-[10px] text-slate-500">Tìm bài viết có URL hoặc tiêu đề chứa từ này.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="about_abbot_key" className="text-xs font-bold text-slate-300">Từ khóa Lãnh Đạo</Label>
                                        <Input
                                            id="about_abbot_key"
                                            placeholder="Mặc định: lanh-dao, ceo"
                                            value={settings.about_abbot_key || ''}
                                            onChange={(e) => handleChange('about_abbot_key', e.target.value)}
                                            className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="about_arch_key" className="text-xs font-bold text-slate-300">Từ khóa Kiến trúc</Label>
                                        <Input
                                            id="about_arch_key"
                                            placeholder="Mặc định: kien-truc"
                                            value={settings.about_arch_key || ''}
                                            onChange={(e) => handleChange('about_arch_key', e.target.value)}
                                            className="bg-slate-900 border-white/10 text-white placeholder:text-slate-500"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-900/30 text-[10px] text-amber-200 leading-relaxed italic">
                                    <strong>Ghi chú:</strong> Nếu không tìm thấy bài viết khớp từ khóa, hệ thống sẽ tự động lấy bài viết đầu tiên/thứ hai trong danh sách để đảm bảo không bị trống dữ liệu.
                                </div>
                            </div>
                        )}


                        {!['founder_section', 'impact_dashboard', 'transparency_timeline', 'traditional_mosaic_alt1', 'traditional_mosaic_alt2', 'traditional_mosaic_alt3', 'traditional_mosaic_alt4', 'traditional_mosaic_alt5', 'traditional_mosaic_alt6', 'traditional_mosaic_alt7'].includes(block.type) && (
                            <div className="text-center py-10 text-slate-500 italic">
                                Khối này chưa có tùy chỉnh nội dung đặc thù.
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} className="border-white/10 text-slate-300 hover:bg-white/5">Hủy</Button>
                    <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white">Lưu thay đổi</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
});

// --- MAIN CLIENT COMPONENT ---
interface LayoutDesignerClientProps {
    tenantId: string;
    tenantType?: string;
    initialBlocks: BlockConfig[];
    initialThemeColors?: Record<string, string> | null;
    isSuperAdmin?: boolean;
}

export function LayoutDesignerClient({ 
    tenantId, 
    tenantType = 'tenant', 
    initialBlocks, 
    initialThemeColors,
    isSuperAdmin = false 
}: LayoutDesignerClientProps) {
    const [blocks, setBlocks] = useState<BlockConfig[]>(initialBlocks);
    const [currentThemeColors, setCurrentThemeColors] = useState<Record<string, string>>(initialThemeColors || {});
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('traditional_news');
    const [confirmPresetId, setConfirmPresetId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGroup, setActiveGroup] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Sandbox Preview States
    const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
    const [previewKey, setPreviewKey] = useState(Date.now()); // Used to force reload iframe after save
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    useEffect(() => {
        const openType = searchParams?.get('open');
        if (openType && blocks.length > 0) {
            const blockToOpen = blocks.find(b => b.type === openType);
            if (blockToOpen) {
                // We need a way to trigger the dialog open. 
                // Since BlockSettingsDialog is a child component with its own state, 
                // we might need to expose an 'open' prop or use a global signal.
                // For simplicity, I'll add a 'targetBlockId' state.
                setTargetBlockId(blockToOpen.id);
            } else {
                toast.info(`Khối "${openType}" chưa có trên trang chủ. Hãy thêm mới bên dưới.`);
            }
        }
    }, [blocks.length]); // Run once when blocks are loaded

    const [targetBlockId, setTargetBlockId] = useState<string | null>(null);

    // Drag state
    const dragIndex = useRef<number | null>(null);
    const dragOverIndex = useRef<number | null>(null);

    // ─── Drag handlers ──────────────────────────────────────────────────────────
    const handleDragStart = (e: React.DragEvent, index: number) => {
        dragIndex.current = index;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        dragOverIndex.current = index;
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const from = dragIndex.current;
        if (from === null || from === dropIndex) return;

        const updated = [...blocks];
        const [moved] = updated.splice(from, 1);
        updated.splice(dropIndex, 0, moved);

        setBlocks(updated);
        setIsDirty(true);
        dragIndex.current = null;
        dragOverIndex.current = null;
    };

    const handleDragEnd = () => {
        dragIndex.current = null;
        dragOverIndex.current = null;
    };

    // ─── Live Sync: postMessage ──────────────────────────────────────────────
    const syncPreview = () => {
        if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'LAYOUT_UPDATE',
                blocks,
                themeColors: currentThemeColors
            }, '*');
        }
    };

    useEffect(() => {
        syncPreview();
    }, [blocks, currentThemeColors]);

    useEffect(() => {
        const handleMsg = (e: MessageEvent) => {
            if (e.data?.type === 'PREVIEW_READY') {
                syncPreview();
            }
        };
        window.addEventListener('message', handleMsg);
        return () => window.removeEventListener('message', handleMsg);
    }, [blocks, currentThemeColors]);

    // ─── Toggle visible & Xoá/Thêm khối ───────────────────────────────────────
    const toggleVisible = (id: string) => {
        setBlocks(prev => prev.map(b =>
            b.id === id ? { ...b, visible: !b.visible } : b
        ));
        setIsDirty(true);
    };

    const handleRemoveBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        setIsDirty(true);
    };

    const handleAddBlock = () => {
        const newId = `blk_${Date.now()}`;
        setBlocks([...blocks, { id: newId, type: selectedType as any, visible: true }]);
        setIsDirty(true);
        toast.success('Đã thêm một khối mới vào cuối danh sách.');
    };

    const updateBlockSettings = (id: string, newSettings: any) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, settings: newSettings } : b));
        setIsDirty(true);
        toast.success('Đã cấu hình tính năng cho khối (Nhớ LƯU GIAO DIỆN).');
    };

    // ─── Save ────────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Lưu Layout Blocks
            const layoutResult = await saveLayoutBlocks(tenantId, blocks);

            // 2. Lưu Theme Colors (nếu được thay đổi)
            let themeResult = { success: true };
            if (JSON.stringify(currentThemeColors) !== JSON.stringify(initialThemeColors)) {
                themeResult = await updateTenantTheme(tenantId, currentThemeColors);
            }

            if (layoutResult.success && themeResult.success) {
                toast.success('✅ Đã lưu cấu trúc và màu sắc trang chủ', {
                    description: 'Trang chủ sẽ cập nhật trong vòng vài phút.'
                });
                setIsDirty(false);
                setPreviewKey(Date.now());
            } else {
                toast.error('Lỗi khi lưu', {
                    description: layoutResult.error || (themeResult as any).error
                });
            }
        } catch (err) {
            toast.error('Đã xảy ra lỗi không mong muốn.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleThemeSelect = (theme: ColorTheme) => {
        setCurrentThemeColors(theme.colors);
        setIsDirty(true);
        toast.info(`Đã áp dụng bảng màu: ${theme.name}`, { icon: <Palette className="w-4 h-4" /> });
    };

    // ─── Reset ───────────────────────────────────────────────────────────────────
    const handleReset = () => {
        setBlocks(initialBlocks);
        setIsDirty(false);
    };

    // ─── Apply Layout Preset ─────────────────────────────────────────────────────
    const handleApplyPreset = (presetId: string) => {
        if (confirmPresetId === presetId) {
            // Xác nhận lần 2 → áp dụng thực sự
            const preset = LAYOUT_PRESETS.find(p => p.id === presetId);
            if (preset) {
                setBlocks(preset.blocks.map(b => ({ ...b })));
                setIsDirty(true);
                toast.success(`✅ Đã áp dụng Layout: ${preset.nameVi}`, {
                    description: 'Nhớ bấm "Lưu Giao Diện" để lưu xuống DB.'
                });
            }
            setConfirmPresetId(null);
        } else {
            // Lần 1: yêu cầu xác nhận
            setConfirmPresetId(presetId);
        }
    };

    const visibleCount = blocks.filter(b => b.visible).length;

    const isCompany = tenantType !== 'tenant';


    // ─── Block scope filter (company vs temple) ────────────────────────────────
    // Keys that are ENTERPRISE-only (not shown for temples)
    const ENTERPRISE_BLOCK_KEYS = new Set([
        // McAaron enterprise blocks
        'mcaaron_hero', 'mcaaron_intro', 'mcaaron_founder', 'mcaaron_statistics', 'mcaaron_transparency',
        'mcaaron_services', 'mcaaron_network', 'mcaaron_cta', 'mcaaron_news',
        'impact_dashboard', 'transparency_timeline', 'founder_section', 'network_section',
        // Stitch enterprise blocks
        'stitch-hero', 'stitch-stats', 'stitch-nodes', 'stitch-events', 'stitch-footer-strip', 'stitch-intro',
    ]);
    // Keys that are TEMPLE-only (not shown for companies)
    const TEMPLE_BLOCK_KEYS = new Set([
        // Artistic — temple-specific
        'scripture_scroll', 'ink_wash_aura', 'zen_breathing',
        // Triple gem variants
        'triple_gem_alt1', 'triple_gem_alt2', 'triple_gem_alt3', 'triple_gem_alt4', 'triple_gem_alt5',
        // Traditional mosaic
        'traditional_mosaic', 'traditional_mosaic_alt1', 'traditional_mosaic_alt2', 'traditional_mosaic_alt3',
        'traditional_mosaic_alt4', 'traditional_mosaic_alt5', 'traditional_mosaic_alt6', 'traditional_mosaic_alt7',
        // Traditional dharma & culture
        'traditional_dharma', 'traditional_dharma_quote', 'traditional_dharma_quote_minimal',
        'traditional_dharma_quote_card', 'traditional_dharma_quote_split',
        'traditional_culture_bento', 'traditional_culture_manuscript', 'traditional_culture_masonry',
        'traditional_events',
        // Zen, Lotus, Angkor, Sunrise, Festival, Theravada
        'zen_study', 'zen_dharma', 'zen_cta',
        'lotus_dharma', 'lotus_gallery', 'angkor_arch', 'angkor_timeline', 'angkor_dharma',
        'sunrise_morning', 'sunrise_dharma', 'festival_dharma', 'festival_gallery', 'festival_cta',
        'thera_hero', 'thera_feature', 'thera_dharma_talks', 'thera_quote_banner', 'thera_event_grid', 'thera_contact_strip',
        'ink_dharma_band', 'ink_quote_banner',
    ]);

    const isBlockAllowed = (key: string) => {
        if (isCompany) return !TEMPLE_BLOCK_KEYS.has(key);
        return !ENTERPRISE_BLOCK_KEYS.has(key);
    };

    // Presets filtered by tenant type
    const COMPANY_PRESET_IDS = new Set(['mcaaron', 'corporate', 'stitch', 'modern', 'minimal', 'ink']);
    const TEMPLE_PRESET_IDS = new Set(['traditional', 'zen', 'lotus', 'angkor', 'sunrise', 'festival', 'theravada', 'ink']);
    
    const filteredPresets = LAYOUT_PRESETS.filter(p =>
        isCompany ? COMPANY_PRESET_IDS.has(p.id) : TEMPLE_PRESET_IDS.has(p.id)
    );

    const groupedRegistry = Object.entries(SECTION_REGISTRY).reduce((acc, [key, val]) => {
        const group = (val as any).group || 'LEGACY';
        if (!isBlockAllowed(key)) return acc;
        const nameMatch = val.name.toLowerCase().includes(searchQuery.toLowerCase());
        const descMatch = val.description.toLowerCase().includes(searchQuery.toLowerCase());
        if (searchQuery && !nameMatch && !descMatch) return acc;
        if (activeGroup !== 'ALL' && group !== activeGroup) return acc;
        if (!acc[group]) acc[group] = [];
        acc[group].push({ key, ...val });
        return acc;
    }, {} as Record<string, any[]>);

    const groupOrder = ['HERO', 'INTRO', 'TRIPLE_GEM', 'NEWS', 'DHARMA', 'EVENTS', 'QUOTE_BANNER', 'SOCIAL', 'LEGACY'];

    const groupLabels: Record<string, string> = {
        HERO: '🎯 Hero & Banner',
        INTRO: '🏛️ 1. Giới Thiệu',
        TRIPLE_GEM: '💎 2. Cốt Lõi',
        QUOTE_BANNER: '💬 3. Trích Dẫn',
        NEWS: '📰 Tin Tức',
        DHARMA: '🎓 SOP & Tài Liệu',
        EVENTS: '📅 Sự Kiện',
        SOCIAL: '📱 Mạng Xã Hội',
        LEGACY: '⚠️ Legacy'
    };

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* COLUMN 1: BUILDER WORKSPACE */}
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-white">Visual Page Builder</h2>
                            <p className="text-sm text-slate-400 mt-1">
                                <span className="text-green-400 font-semibold">{visibleCount}</span> / {blocks.length} sections đang mở
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {isDirty && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleReset}
                                    className="gap-2 border-white/10 text-slate-300 hover:bg-white/5 bg-transparent"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Hoàn tác
                                </Button>
                            )}
                            <Button
                                onClick={handleSave}
                                disabled={!isDirty || isSaving}
                                className={cn(
                                    'gap-2',
                                    isDirty
                                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                                        : 'bg-white/5 border border-white/[0.05] text-slate-500 cursor-not-allowed'
                                )}
                            >
                                <Save className="h-4 w-4" />
                                {isSaving ? 'Đang lưu...' : 'Lưu Giao Diện'}
                            </Button>
                        </div>
                    </div>

                    {/* Search & View Mode Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Tìm khối đang dùng..." 
                                className="pl-9 bg-slate-900 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-10 text-sm focus:border-amber-500/50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center bg-slate-950/40 p-1 rounded-xl border border-white/[0.08]">
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn(
                                    "h-8 gap-1.5 px-3 rounded-lg text-xs font-bold transition-all", 
                                    viewMode === 'grid' 
                                        ? "bg-white/[0.08] text-white hover:bg-white/[0.08]" 
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                                onClick={() => setViewMode('grid')}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                Card
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className={cn(
                                    "h-8 gap-1.5 px-3 rounded-lg text-xs font-bold transition-all", 
                                    viewMode === 'table' 
                                        ? "bg-white/[0.08] text-white hover:bg-white/[0.08]" 
                                        : "text-slate-400 hover:text-white hover:bg-white/5"
                                )}
                                onClick={() => setViewMode('table')}
                            >
                                <List className="w-3.5 h-3.5" />
                                Table
                            </Button>
                        </div>
                    </div>
                </div>

                {/* --- LAYOUT PRESET SWITCHER --- */}
                <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-indigo-450 text-indigo-400" />
                            <h3 className="font-bold text-white">Chọn Phong Cách Trang Chủ</h3>
                        </div>
                        <Badge variant="outline" className={isCompany ? "bg-blue-950/40 text-blue-300 border-blue-500/30" : "bg-amber-950/40 text-amber-300 border-amber-500/30"}>
                            {isCompany ? '🏢 Doanh nghiệp' : '🏛️ Chi nhánh'} · {filteredPresets.length} phong cách
                        </Badge>
                    </div>
                    <p className="text-xs text-slate-400">Chọn một phong cách để tự động thay thế toàn bộ cấu trúc hiện tại.</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {filteredPresets.map(preset => {
                            const isConfirming = confirmPresetId === preset.id;
                            const currentHeroType = blocks[0]?.type || '';
                            const isActive = currentHeroType.startsWith(preset.id === 'traditional' ? 'traditional_hero' : preset.id);
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => handleApplyPreset(preset.id)}
                                    onBlur={() => setConfirmPresetId(null)}
                                    title={preset.description}
                                    className={cn(
                                        'relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all text-left',
                                        isConfirming
                                            ? 'border-orange-500/50 bg-orange-950/20 ring-2 ring-orange-500/20'
                                            : isActive
                                                ? 'border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/20'
                                                : 'border-white/[0.06] hover:border-indigo-500/30 bg-slate-950/40 hover:bg-slate-900/60'
                                    )}
                                >
                                    <span className="text-2xl">{preset.emoji}</span>
                                    <span className={cn(
                                        'text-[11px] font-bold leading-tight',
                                        isConfirming ? 'text-orange-300' : isActive ? 'text-indigo-300' : 'text-slate-300'
                                    )}>
                                        {preset.nameVi}
                                    </span>
                                    {isConfirming && (
                                        <span className="text-[9px] font-bold text-orange-400 flex items-center gap-0.5">
                                            <AlertTriangle className="w-2.5 h-2.5" /> Bấm lại để xác nhận
                                        </span>
                                    )}
                                    {isActive && !isConfirming && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                                            <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- THEME PALETTE SELECTOR --- */}
                <div className="bg-slate-900/20 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-amber-555 text-amber-500" />
                            <h3 className="font-bold text-white">
                                {isCompany ? 'Bộ màu Doanh nghiệp Premium' : 'Bộ màu Phật giáo Premium'}
                            </h3>
                        </div>
                        <Badge variant="outline" className="bg-amber-950/40 text-amber-300 border-amber-500/30">
                            12 Themes nghiên cứu
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {BUDDHIST_THEMES.map((theme) => {
                            const isSelected = JSON.stringify(currentThemeColors) === JSON.stringify(theme.colors);
                            return (
                                <button
                                    key={theme.id}
                                    onClick={() => handleThemeSelect(theme)}
                                    className={cn(
                                        "group relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all",
                                        isSelected
                                            ? "border-amber-500 bg-amber-950/20 shadow-md ring-2 ring-amber-500/20"
                                            : "border-white/[0.06] hover:border-amber-500/30 bg-slate-950/40"
                                    )}
                                    title={theme.description}
                                >
                                    {/* Palette Preview */}
                                    <div className="flex -space-x-2 overflow-hidden py-1">
                                        <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.colors.primary }} />
                                        <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.colors.secondary }} />
                                        <div className="w-6 h-6 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.colors.background }} />
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-bold truncate w-full text-center",
                                        isSelected ? "text-amber-300" : "text-slate-400"
                                    )}>
                                        {theme.name.split(' (')[0]}
                                    </span>

                                    {isSelected && (
                                        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-sm scale-110">
                                            <Check className="w-3 h-3 stroke-[4]" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* --- CUSTOM COLOR PICKER (Super Admin Only) --- */}
                    {isSuperAdmin && (
                        <div className="mt-6 pt-6 border-t border-white/[0.08]">
                            <div className="flex items-center gap-2 mb-4">
                                <Settings2 className="w-4 h-4 text-amber-500" />
                                <h4 className="text-sm font-bold text-slate-200">Tùy chỉnh màu sắc chi tiết</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                                <ColorPicker
                                    label="Màu Chủ đạo (Primary)"
                                    color={currentThemeColors.primary || '#F59E0B'}
                                    onChange={(color) => {
                                        setCurrentThemeColors(prev => ({ ...prev, primary: color }));
                                        setIsDirty(true);
                                    }}
                                />
                                <ColorPicker
                                    label="Màu Phụ (Secondary)"
                                    color={currentThemeColors.secondary || '#5C4033'}
                                    onChange={(color) => {
                                        setCurrentThemeColors(prev => ({ ...prev, secondary: color }));
                                        setIsDirty(true);
                                    }}
                                />
                                <ColorPicker
                                    label="Điểm nhấn (Accent)"
                                    color={currentThemeColors.accent || '#FF8C00'}
                                    onChange={(color) => {
                                        setCurrentThemeColors(prev => ({ ...prev, accent: color }));
                                        setIsDirty(true);
                                    }}
                                />
                                <ColorPicker
                                    label="Màu Chữ (Text)"
                                    color={currentThemeColors.text || '#2C1810'}
                                    onChange={(color) => {
                                        setCurrentThemeColors(prev => ({ ...prev, text: color }));
                                        setIsDirty(true);
                                    }}
                                />
                                <ColorPicker
                                    label="Nền Trang (Background)"
                                    color={currentThemeColors.background || '#FEF9F3'}
                                    onChange={(color) => {
                                        setCurrentThemeColors(prev => ({ ...prev, background: color }));
                                        setIsDirty(true);
                                    }}
                                />
                                <ColorPicker
                                    label="Bề mặt (Surface)"
                                    color={currentThemeColors.surface || '#FAFAF7'}
                                    onChange={(color) => {
                                        setCurrentThemeColors(prev => ({ ...prev, surface: color }));
                                        setIsDirty(true);
                                    }}
                                />
                            </div>
                            
                            <p className="text-[10px] text-slate-500 mt-4 italic">
                                * Lưu ý: Các thay đổi màu sắc sẽ được xem trước tức thì ở bảng bên phải. Bấm "Lưu Giao Diện" để áp dụng thực tế.
                            </p>
                        </div>
                    )}
                </div>

                {/* Drag & Drop list */}
                <div className={cn(
                    "p-4 bg-slate-955/20 bg-slate-950/20 backdrop-blur-xl rounded-2xl border border-white/[0.08] min-h-[400px]",
                    viewMode === 'table' ? "space-y-0 p-0 overflow-hidden" : "space-y-3"
                )}>
                    {blocks.length === 0 && (
                        <div className="text-center py-12 text-slate-500">Chưa có linh kiện nào. Hãy thêm ở bên dưới!</div>
                    )}

                    {viewMode === 'table' && blocks.length > 0 && (
                        <div className="w-full">
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-900 border-b border-white/[0.08] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                <div className="col-span-1">STT</div>
                                <div className="col-span-5">Tên Khối / Chức năng</div>
                                <div className="col-span-3">Loại</div>
                                <div className="col-span-3 text-right">Hành động</div>
                            </div>
                        </div>
                    )}

                    {blocks.map((block, index) => {
                        const type = block.type || `traditional_${block.id}`;
                        const customId = block.id;
                        const registryEntry = SECTION_REGISTRY[type as keyof typeof SECTION_REGISTRY];

                        if (!registryEntry) return null;

                        // Filter by search query if in use
                        if (searchQuery) {
                            const nameMatch = registryEntry.name.toLowerCase().includes(searchQuery.toLowerCase());
                            const customMatch = block.settings?.customTitle?.toLowerCase().includes(searchQuery.toLowerCase());
                            if (!nameMatch && !customMatch) return null;
                        }

                        const group = (registryEntry as any).group || 'LEGACY';
                        const icon = (registryEntry as any).icon || '🧩';

                        // Check if block has custom title set in settings
                        const customTitle = block.settings?.customTitle;

                        if (viewMode === 'table') {
                            return (
                                <div
                                    key={customId}
                                    draggable
                                    onDragStart={e => handleDragStart(e, index)}
                                    onDragOver={e => handleDragOver(e, index)}
                                    onDrop={e => handleDrop(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={cn(
                                        'grid grid-cols-12 gap-4 items-center px-6 py-3 border-b border-white/[0.05] bg-slate-950/30 hover:bg-white/5 transition-all select-none group border-l-4',
                                        block.visible ? 'border-l-amber-500 text-slate-200' : 'border-l-slate-700 opacity-50 grayscale bg-slate-900/10 text-slate-400'
                                    )}
                                >
                                    <div className="col-span-1 flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-slate-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <span className="text-xs font-mono text-slate-500">{index + 1}</span>
                                    </div>
                                    <div className="col-span-5 flex items-center gap-3">
                                        <span className="text-lg">{icon}</span>
                                        <div className="truncate">
                                            <p className={cn("text-xs font-bold truncate", block.visible ? "text-slate-200" : "text-slate-500")}>
                                                {customTitle || registryEntry.name}
                                            </p>
                                            {customTitle && <p className="text-[10px] text-slate-500 italic">({registryEntry.name})</p>}
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <Badge variant="outline" className={cn(
                                            "text-[9px] uppercase font-bold px-1.5 h-5",
                                            group === 'LEGACY' ? "bg-slate-950 text-slate-500 border-white/10" : "bg-blue-950/40 text-blue-300 border-blue-500/30"
                                        )}>
                                            {group}
                                        </Badge>
                                    </div>
                                    <div className="col-span-3 flex items-center justify-end gap-1">
                                        <BlockSettingsDialog
                                            block={block}
                                            registryEntry={registryEntry}
                                            onSave={updateBlockSettings}
                                            initialOpen={targetBlockId === block.id}
                                        />
                                        <button 
                                            onClick={() => toggleVisible(customId)} 
                                            className={cn("p-1.5 rounded-md transition-colors", block.visible ? "text-amber-500 hover:bg-white/5" : "text-slate-500 hover:bg-white/5")}
                                        >
                                            {block.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleRemoveBlock(customId)}
                                            className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-950/30 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        }

                        // CARD MODE (Grid)
                        return (
                            <div
                                key={customId}
                                draggable
                                onDragStart={e => handleDragStart(e, index)}
                                onDragOver={e => handleDragOver(e, index)}
                                onDrop={e => handleDrop(e, index)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                    'flex items-center gap-3 p-4 rounded-xl border-2 bg-slate-900/40 border-white/[0.08] hover:border-amber-500/30 transition-all select-none group relative overflow-hidden',
                                    block.visible
                                        ? 'text-slate-200'
                                        : 'border-dashed border-white/10 bg-slate-950/20 opacity-60 grayscale text-slate-400'
                                )}
                            >
                                {/* Grab Handle */}
                                <div className="text-slate-500 hover:text-slate-350 shrink-0 cursor-grab active:cursor-grabbing px-1">
                                    <GripVertical className="h-5 w-5" />
                                </div>

                                {/* Index badge */}
                                <div className={cn(
                                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                                    block.visible ? 'bg-amber-950/40 border border-amber-500/20 text-amber-300' : 'bg-slate-900/50 text-slate-500'
                                )}>
                                    {index + 1}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 flex items-center gap-4">
                                    <div className="p-2 bg-slate-950/50 rounded-lg text-lg border border-white/10 shrink-0 hidden sm:block">
                                        {icon}
                                    </div>
                                    <div className="w-full">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                'font-bold text-[14px] sm:text-[15px] truncate',
                                                block.visible ? 'text-slate-200' : 'text-slate-400 line-through'
                                            )}>
                                                {customTitle ? <span className="text-amber-400">{customTitle}</span> : registryEntry.name}
                                            </p>
                                            {/* Badge to show if there are customized settings */}
                                            {Object.keys(block.settings || {}).filter(k => block.settings?.[k]).length > 0 && (
                                                <Badge variant="outline" className="text-[10px] h-5 bg-amber-950/40 text-amber-300 border-amber-500/30">
                                                    Đã tùy chỉnh
                                                </Badge>
                                            )}
                                            {group === 'LEGACY' && (
                                                <Badge variant="secondary" className="text-[9px] h-4 bg-slate-950 text-slate-500 border-white/10">LEGACY</Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 truncate mt-0.5 hidden sm:block">
                                            {customTitle ? `(${registryEntry.name}) - ${registryEntry.description}` : registryEntry.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions: Settings, Toggle, Delete */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <BlockSettingsDialog
                                        block={block}
                                        registryEntry={registryEntry}
                                        onSave={updateBlockSettings}
                                        initialOpen={targetBlockId === block.id}
                                    />

                                    <Switch
                                        checked={block.visible}
                                        onCheckedChange={() => toggleVisible(customId)}
                                        title="Tắt/Bật Component này"
                                    />
                                    <button
                                        onClick={() => handleRemoveBlock(customId)}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Xóa Component này"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- CATEGORIZED BLOCK SELECTOR (Tabs Mode) --- */}
                <div className="mt-8 pt-6 border-t border-white/[0.08] space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-400" />
                            Thêm linh kiện mới
                        </h3>
                    </div>

                    <Tabs value={activeGroup} onValueChange={setActiveGroup} className="w-full">
                        <TabsList className="w-full h-auto flex flex-wrap bg-slate-955/40 bg-slate-950/40 border border-white/[0.08] p-1 gap-1 rounded-xl">
                            <TabsTrigger value="ALL" className="flex-1 min-w-[60px] text-[10px] font-bold py-1.5 rounded-lg data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">TẤT CẢ</TabsTrigger>
                            {groupOrder.map(group => (
                                <TabsTrigger 
                                    key={group} 
                                    value={group} 
                                    className="flex-1 min-w-[100px] text-[10px] font-bold py-1.5 rounded-lg whitespace-nowrap data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400"
                                >
                                    {groupLabels[group] || group}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <div className="mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.keys(groupedRegistry).sort((a, b) => groupOrder.indexOf(a) - groupOrder.indexOf(b)).map(group => (
                                    groupedRegistry[group].map((item: any) => (
                                        <Button
                                            key={item.key}
                                            variant="outline"
                                            className={cn(
                                                "justify-start h-auto py-3 px-4 border-white/[0.06] hover:border-blue-500/50 hover:bg-blue-955/20 hover:bg-blue-950/20 bg-slate-900/30 group/btn transition-all text-left text-slate-350 text-slate-300 hover:text-white",
                                                selectedType === item.key ? "border-blue-500 bg-blue-950/30 ring-1 ring-blue-500/20 shadow-sm text-blue-400" : ""
                                            )}
                                            onClick={() => {
                                                setSelectedType(item.key);
                                            }}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <span className="text-xl shrink-0 opacity-80 group-hover/btn:scale-110 transition-transform">{item.icon || '🧩'}</span>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="font-bold text-xs mb-0.5 group-hover/btn:text-blue-400 truncate">{item.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-normal leading-tight line-clamp-1">{item.description}</span>
                                                </div>
                                                {selectedType === item.key && <Check className="w-4 h-4 text-blue-450 text-blue-450 text-blue-400 shrink-0" />}
                                            </div>
                                        </Button>
                                    ))
                                ))}
                            </div>
                        </div>
                    </Tabs>

                    <Button
                        onClick={handleAddBlock}
                        disabled={!selectedType}
                        className="w-full h-12 rounded-xl gap-2 text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all font-bold group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Xác nhận Thêm: {SECTION_REGISTRY[selectedType as keyof typeof SECTION_REGISTRY]?.name || selectedType}
                    </Button>
                </div>

                <div className="p-4 bg-blue-950/20 rounded-xl border border-blue-900/30 text-sm text-blue-200 shadow-inner">
                    <strong>💡 Lưu ý:</strong> Vui lòng bấm "Lưu Giao Diện" để thay đổi có hiệu lực. Bảng xem trước bên phải sẽ tự cập nhật sau khi Lưu thành công.
                </div>
            </div>

            {/* COLUMN 2: LIVE SIMULATOR */}
            <div className="relative sticky top-6 lg:h-[calc(100vh-120px)] flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                    <div>
                        <h3 className="font-bold flex items-center gap-2 text-white">
                            <Monitor className="w-5 h-5 text-indigo-400" />
                            XEM TRƯỚC TRỰC TIẾP
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                            {isDirty ? (
                                <span className="text-orange-400 flex items-center gap-1 font-bold">
                                    <AlertTriangle className="w-3 h-3" /> Chế độ xem thử (Chưa lưu)
                                </span>
                            ) : (
                                <span className="text-green-400">Đã đồng bộ với thực tế</span>
                            )}
                        </p>
                    </div>

                    {/* Device Toggle */}
                    <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as 'mobile' | 'desktop')} className="w-auto">
                        <TabsList className="grid w-full grid-cols-2 h-9 p-1 bg-slate-950/40 border border-white/[0.08] rounded-lg">
                            <TabsTrigger value="mobile" className="gap-2 text-[10px] font-bold text-slate-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">
                                <Smartphone className="w-3.5 h-3.5" />
                                Mobile
                            </TabsTrigger>
                            <TabsTrigger value="desktop" className="gap-2 text-[10px] font-bold text-slate-400 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white">
                                <Monitor className="w-3.5 h-3.5" />
                                Desktop
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Iframe Container */}
                <div className="flex-1 w-full bg-slate-955/20 bg-slate-950/20 rounded-2xl flex justify-center border-2 border-white/[0.08] border-dashed overflow-hidden relative group">
                    <div
                        className={cn(
                            "relative bg-white overflow-hidden shadow-2xl transition-all duration-500 ease-in-out border border-white/[0.08]",
                            previewMode === 'mobile'
                                ? "w-[375px] h-[90%] my-auto rounded-[2.5rem] border-[10px] border-slate-900 shadow-xl"
                                : "w-full h-full rounded-xl"
                        )}
                    >
                        {/* Mobile Notch UI (Only on Mobile Mode) */}
                        {previewMode === 'mobile' && (
                            <div className="absolute top-0 inset-x-0 h-6 z-50 flex justify-center pointer-events-none">
                                <div className="w-32 h-6 bg-slate-900 rounded-b-2xl"></div>
                            </div>
                        )}

                        {/* Loading Overlay when saving */}
                        {isSaving && (
                            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] z-50 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm font-bold text-amber-400 animate-pulse">Đang lưu thay đổi...</p>
                                </div>
                            </div>
                        )}

                        {/* The Actual Sandbox View */}
                        {(() => {
                            const colors = currentThemeColors || {};
                            const params = new URLSearchParams();
                            if (colors.primary) params.set('primary', colors.primary.replace('#', ''));
                            if (colors.secondary) params.set('secondary', colors.secondary.replace('#', ''));
                            if (colors.background) params.set('background', colors.background.replace('#', ''));
                            if (colors.accent) params.set('accent', colors.accent.replace('#', ''));
                            if (colors.text) params.set('text', colors.text.replace('#', ''));
                            if (colors.bgEnd) params.set('bgEnd', colors.bgEnd.replace('#', ''));
                            if (colors.hero) params.set('hero', colors.hero.replace('#', ''));
                            if (colors.surface) params.set('surface', colors.surface.replace('#', ''));
                            if (colors.opacity) params.set('opacity', colors.opacity);

                            const src = `/admin/t/${tenantId}/homepage/preview?${params.toString()}`;
                            return (
                                <iframe
                                    ref={iframeRef}
                                    key={`${previewKey}`} // Only refresh on save
                                    src={src}
                                    className={cn(
                                        "w-full h-full border-none outline-none bg-white",
                                        previewMode === 'mobile' ? "pt-2" : ""
                                    )}
                                    loading="lazy"
                                    title="Interactive Sandbox Simulator"
                                />
                            );
                        })()}
                    </div>

                    {/* Quick Hint */}
                    {isDirty && !isSaving && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-4 py-2 rounded-full text-[13px] font-bold shadow-lg animate-bounce pointer-events-none z-50">
                            ✨ Đang xem bản nháp (Draft)
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
