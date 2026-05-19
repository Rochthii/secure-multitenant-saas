'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Building2, Smartphone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface PaymentMethodSelectorProps {
    selected: 'bank_transfer' | 'momo';
    onSelect: (method: 'bank_transfer' | 'momo') => void;
}

export function PaymentMethodSelector({ selected, onSelect }: PaymentMethodSelectorProps) {
    return (
        <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-800">
                Phương thức thanh toán <span className="text-red-500">*</span>
            </Label>

            <div className="grid md:grid-cols-2 gap-4" role="radiogroup" aria-label="Payment method selection">
                <button
                    type="button"
                    onClick={() => onSelect('bank_transfer')}
                    className={cn(
                        "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group",
                        selected === 'bank_transfer'
                            ? "border-gold-primary bg-gold-primary/5 shadow-sm"
                            : "border-gray-100 bg-white hover:border-gold-primary/30 hover:bg-gray-50"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                        selected === 'bank_transfer' ? "bg-gold-primary text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gold-primary/20 group-hover:text-gold-primary"
                    )}>
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className={cn("font-semibold", selected === 'bank_transfer' ? "text-gold-darker" : "text-gray-700")}>
                            Chuyển khoản Ngân hàng
                        </p>
                        <p className="text-xs text-gray-500">Quét mã QR VietQR (Tự động)</p>
                    </div>
                    {selected === 'bank_transfer' && (
                        <div className="absolute top-1/2 -translate-y-1/2 right-4">
                            <CheckCircle2 className="w-5 h-5 text-gold-primary" />
                        </div>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => onSelect('momo')}
                    className={cn(
                        "relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group grayscale opacity-60 cursor-not-allowed",
                        // selected === 'momo'
                        //     ? "border-[#A50064] bg-[#A50064]/5 shadow-sm"
                        //     : "border-gray-100 bg-white hover:border-[#A50064]/30 hover:bg-gray-50"
                    )}
                    // onClick={() => onSelect('momo')} // Disable temporarily if not ready
                    disabled
                >
                    <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-gray-100 text-gray-400",
                        // selected === 'momo' ? "bg-[#A50064] text-white" : "bg-gray-100 text-gray-500 group-hover:bg-[#A50064]/20 group-hover:text-[#A50064]"
                    )}>
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-400">
                            Ví MoMo
                        </p>
                        <p className="text-xs text-gray-400">Đang bảo trì</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
