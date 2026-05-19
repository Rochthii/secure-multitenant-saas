'use client';

import React, { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PRESET_AMOUNTS, formatCurrency } from '@/lib/constants/transaction';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AmountSelectorProps {
    selectedAmount: number | null;
    customAmount: string;
    onPresetSelect: (amount: number) => void;
    onCustomInput: (value: string) => void;
    error?: string;
    isCompany?: boolean;
}

// Format số thành chuỗi có dấu chấm: 1000000 -> "1.000.000"
function formatWithDots(value: string): string {
    const raw = value.replace(/\./g, '').replace(/[^0-9]/g, '');
    if (!raw) return '';
    return parseInt(raw, 10).toLocaleString('de-DE'); // de-DE dùng dấu chấm làm phân cách nghìn
}

// Chuyển chuỗi có dấu chấm về số thuần: "1.000.000" -> "1000000"
function stripDots(value: string): string {
    return value.replace(/\./g, '');
}

export function AmountSelector({
    selectedAmount,
    customAmount,
    onPresetSelect,
    onCustomInput,
    error,
    isCompany,
}: AmountSelectorProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = stripDots(e.target.value);
        // Báo lên cha với giá trị thuần số
        onCustomInput(raw);
    };

    // Giá trị hiển thị trong ô input (có dấu chấm)
    const displayValue = customAmount ? formatWithDots(customAmount) : '';

    return (
        <div className="space-y-4">
            <Label className="text-base font-semibold text-gray-800">
                {isCompany ? 'Số tiền đóng góp' : 'Số tiền gieo duyên'} <span className="text-red-500">*</span>
            </Label>

            {/* Preset Amounts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="radiogroup" aria-label="Transaction amount selection">
                {PRESET_AMOUNTS.map((amount) => {
                    const isSelected = selectedAmount === amount;
                    const displayAmount = amount >= 1000000
                        ? `${amount / 1000000} triệu`
                        : `${amount / 1000}k`;

                    return (
                        <button
                            key={amount}
                            type="button"
                            onClick={() => onPresetSelect(amount)}
                            className={cn(
                                "relative flex flex-col items-center justify-center h-16 rounded-xl border-2 transition-all duration-200",
                                isSelected
                                    ? "border-gold-primary bg-gold-primary/10 text-gold-darker font-bold shadow-sm"
                                    : "border-gray-100 bg-white text-gray-600 hover:border-gold-primary/50 hover:bg-gold-primary/5 hover:scale-[1.02]"
                            )}
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`Chọn ${formatCurrency(amount)} VNĐ`}
                        >
                            <span className="text-base font-semibold">{displayAmount}</span>
                            <span className="text-xs text-gray-400">{parseInt(String(amount)).toLocaleString('de-DE')}đ</span>
                            {isSelected && (
                                <div className="absolute top-1 right-1">
                                    <Check className="w-3 h-3 text-gold-primary" />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Custom Amount Input - dùng text để kiểm soát dấu chấm */}
            <div className="relative mt-2">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 font-semibold">₫</span>
                </div>
                <Input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập số tiền tùy ý (VD: 1.000)"
                    value={displayValue}
                    onChange={handleCustomChange}
                    className={cn(
                        "pl-8 py-6 text-lg transition-colors tracking-wide",
                        displayValue && !selectedAmount ? "border-gold-primary ring-1 ring-gold-primary/20" : ""
                    )}
                />
                {displayValue && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <span className="text-xs text-gray-400">VNĐ</span>
                    </div>
                )}
            </div>

            {error && <p className="text-sm text-red-500 font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
            </p>}
        </div>
    );
}
