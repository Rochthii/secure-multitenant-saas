# PROMPT 09: DONATION SYSTEM

**Task:** Tạo tính năng thanh toán online với payment integration

**Thời gian ước tính:** 4-6 giờ

---

## 📋 CONTEXT

Tính năng thanh toán là CORE FEATURE quan trọng nhất. Cần integrate VietQR, MoMo, có thể PayPal sau.

**Reference:**
- `docs/_legacy_archive/2026-03/05_CAU_TRUC_NOI_DUNG.md` (wireframe section 4.3 - legacy)
- `docs/04_PUBLIC_FEATURES.md` + `docs/05_ADMIN_FEATURES.md` (flow hiện tại)

---

## 🎯 YÊU CẦU

### 1. Transaction Page UI

`src/app/[locale]/cung-duong/page.tsx`:

```tsx
'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { TransactionPurposeSelector } from '@/components/features/TransactionPurposeSelector';
import { TransactionForm } from '@/components/features/TransactionForm';
import { RecentTransactions } from '@/components/features/RecentTransactions';
import { KhmerHeading } from '@/components/ui/khmer-heading';

export default function DonatePage() {
  const t = useTranslations('donate');
  const [selectedPurpose, setSelectedPurpose] = React.useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <KhmerHeading level={1} withDivider>
          {t('title')}
        </KhmerHeading>
        <p className="text-xl text-gray-600 italic mt-4">
          "{t('quote')}"
        </p>
      </div>

      <TransactionPurposeSelector
        selectedPurpose={selectedPurpose}
        onSelectPurpose={setSelectedPurpose}
      />

      {selectedPurpose && (
        <TransactionForm purpose={selectedPurpose} />
      )}

      <RecentTransactions />
    </div>
  );
}
```

### 2. Transaction Purpose Selector

`src/components/features/TransactionPurposeSelector.tsx`:

```tsx
'use client';

import React from 'react';
import { Building2, GraduationCap, Heart, Landmark } from 'lucide-react';
import { IconCard } from '@/components/ui/icon-card';
import { Progress } from '@/components/ui/progress';

interface Purpose {
  id: string;
  title: string;
  description: string;
  icon: any;
  goal: number;
  current: number;
  color: string;
}

const purposes: Purpose[] = [
  {
    id: 'construction',
    title: 'Quỹ Tu sửa Chánh điện',
    description: 'Bảo trì và tu sửa kiến trúc chi nhánh',
    icon: Building2,
    goal: 500000000,
    current: 350000000,
    color: 'text-gold-primary',
  },
  {
    id: 'education',
    title: 'Quỹ Học bổng Tiếng Khmer',
    description: 'Hỗ trợ giảng dạy tiếng Khmer cho trẻ em',
    icon: GraduationCap,
    goal: 100000000,
    current: 40000000,
    color: 'text-blue-600',
  },
  {
    id: 'charity',
    title: 'Quỹ Từ thiện',
    description: 'Giúp đỡ người nghèo, hoàn cảnh khó khăn',
    icon: Heart,
    goal: 200000000,
    current: 170000000,
    color: 'text-red-500',
  },
  {
    id: 'general',
    title: 'Quỹ Tổng',
    description: 'Quỹ chung cho hoạt động chi nhánh',
    icon: Landmark,
    goal: 0,
    current: 0,
    color: 'text-gray-600',
  },
];

export function TransactionPurposeSelector({
  selectedPurpose,
  onSelectPurpose,
}: {
  selectedPurpose: string | null;
  onSelectPurpose: (id: string) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
      {purposes.map((purpose) => {
        const percentage = purpose.goal > 0 
          ? Math.round((purpose.current / purpose.goal) * 100)
          : 0;

        return (
          <div
            key={purpose.id}
            onClick={() => onSelectPurpose(purpose.id)}
            className={`cursor-pointer transition-all ${
              selectedPurpose === purpose.id ? 'ring-2 ring-gold-primary' : ''
            }`}
          >
            <IconCard
              icon={purpose.icon}
              title={purpose.title}
              description={purpose.description}
              iconColor={purpose.color}
            >
              {purpose.goal > 0 && (
                <div className="mt-4">
                  <Progress value={percentage} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    {percentage}% đạt được
                  </p>
                  <p className="text-xs text-gray-500">
                    {(purpose.current / 1000000).toFixed(0)}M / {(purpose.goal / 1000000).toFixed(0)}M VNĐ
                  </p>
                </div>
              )}
            </IconCard>
          </div>
        );
      })}
    </div>
  );
}
```

### 3. Transaction Form

`src/components/features/TransactionForm.tsx`:

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { CreditCard, Building, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const transactionSchema = z.object({
  amount: z.number().min(10000, 'Số tiền tối thiểu 10.000 VNĐ'),
  donor_name: z.string().min(2, 'Vui lòng nhập tên'),
  donor_phone: z.string().optional(),
  donor_email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  note: z.string().optional(),
  is_anonymous: z.boolean().default(false),
  payment_method: z.enum(['bank_transfer', 'momo', 'zalopay', 'paypal']),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

const presetAmounts = [100000, 500000, 1000000, 5000000];

export function TransactionForm({ purpose }: { purpose: string }) {
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(null);
  const [customAmount, setCustomAmount] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState<string>('bank_transfer');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      payment_method: 'bank_transfer',
      is_anonymous: false,
    }
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
    setValue('amount', amount);
  };

  const onSubmit = async (data: TransactionFormData) => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      // Create transaction record
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert({
          ...data,
          purpose,
          status: 'pending',
          currency: 'VND',
        })
        .select()
        .single();

      if (error) throw error;

      // Redirect to payment
      if (data.payment_method === 'bank_transfer') {
        router.push(`/cung-duong/thanh-toan/bank?id=${transaction.id}`);
      } else if (data.payment_method === 'momo') {
        router.push(`/cung-duong/thanh-toan/momo?id=${transaction.id}`);
      }
      // Add more payment methods
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h3 className="text-2xl font-semibold mb-6">Thông tin thanh toán</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Amount Selection */}
        <div>
          <Label>Số tiền *</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                type="button"
                variant={selectedAmount === amount ? 'default' : 'outline'}
                onClick={() => handleAmountSelect(amount)}
                className="h-16"
              >
                {(amount / 1000).toLocaleString()}K
              </Button>
            ))}
          </div>
          <div className="mt-3">
            <Input
              type="number"
              placeholder="Số tiền khác (VNĐ)"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
                setValue('amount', Number(e.target.value));
              }}
            />
          </div>
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Donor Info */}
        <div>
          <Label htmlFor="donor_name">Họ tên *</Label>
          <Input id="donor_name" {...register('donor_name')} />
          {errors.donor_name && (
            <p className="text-red-500 text-sm mt-1">{errors.donor_name.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="donor_phone">Số điện thoại</Label>
            <Input id="donor_phone" {...register('donor_phone')} />
          </div>
          <div>
            <Label htmlFor="donor_email">Email</Label>
            <Input id="donor_email" type="email" {...register('donor_email')} />
            {errors.donor_email && (
              <p className="text-red-500 text-sm mt-1">{errors.donor_email.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="note">Lời nhắn</Label>
          <Textarea id="note" {...register('note')} rows={3} />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_anonymous"
            {...register('is_anonymous')}
            className="mr-2"
          />
          <Label htmlFor="is_anonymous" className="cursor-pointer">
            Ẩn danh (không hiển thị tên trong danh sách)
          </Label>
        </div>

        {/* Payment Method */}
        <div>
          <Label>Phương thức thanh toán *</Label>
          <div className="grid md:grid-cols-2 gap-4 mt-2">
            <Button
              type="button"
              variant={paymentMethod === 'bank_transfer' ? 'default' : 'outline'}
              onClick={() => {
                setPaymentMethod('bank_transfer');
                setValue('payment_method', 'bank_transfer');
              }}
              className="h-20"
            >
              <Building className="mr-2" />
              Chuyển khoản (QR)
            </Button>
            <Button
              type="button"
              variant={paymentMethod === 'momo' ? 'default' : 'outline'}
              onClick={() => {
                setPaymentMethod('momo');
                setValue('payment_method', 'momo');
              }}
              className="h-20"
            >
              <Smartphone className="mr-2" />
              MoMo
            </Button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full bg-gold-primary hover:bg-gold-dark"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
        </Button>
      </form>
    </Card>
  );
}
```

### 4. VietQR Payment Page

`src/app/[locale]/cung-duong/thanh-toan/bank/page.tsx`:

```tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { QRCodeDisplay } from '@/components/features/QRCodeDisplay';

export default async function BankPaymentPage({
  searchParams,
}: {
  searchParams: { id: string };
}) {
  const supabase = await createClient();
  
  const { data: transaction } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', searchParams.id)
    .single();

  if (!transaction) {
    notFound();
  }

  // Generate VietQR URL
  const bankInfo = {
    bankId: '970416', // ACB bank ID
    accountNo: 'YOUR_ACCOUNT_NUMBER',
    accountName: 'CHUA CHANTARANGSAY',
    amount: transaction.amount,
    content: `CUNGDUONG ${transaction.id.substring(0, 8)}`,
  };

  const qrUrl = `https://img.vietqr.io/image/${bankInfo.bankId}-${bankInfo.accountNo}-compact2.png?amount=${bankInfo.amount}&addInfo=${encodeURIComponent(bankInfo.content)}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <QRCodeDisplay
        qrUrl={qrUrl}
        bankInfo={bankInfo}
        transaction={transaction}
      />
    </div>
  );
}
```

### 5. translations

Update `messages/vi.json`:
```json
{
  "donate": {
    "title": "Thanh toán - Giao dịch",
    "quote": "Của cho không bằng cách cho"
  }
}
```

---

## ✅ ACCEPTANCE CRITERIA

- [ ] Purpose selection UI working
- [ ] Amount selection (preset + custom)
- [ ] Form validation working
- [ ] Transaction saved to database
- [ ] VietQR generated correctly
- [ ] Email confirmation sent
- [ ] Anonymous option works

---

--- START PROMPT ---

Tạo hệ thống thanh toán online cho website Chi nhánh Chantarangsay:

1. Transaction page với purpose selector (4 quỹ)
2. Progress bars cho từng quỹ
3. Form với amount selection, donor info, payment method
4. VietQR integration (generate QR code)
5. Save transaction to Supabase
6. Payment confirmation page
7. Recent transactions display (anonymous support)

Payment methods: Bank Transfer (VietQR), MoMo (tạm thời skip integration phức tạp, để placeholder)

Test toàn bộ flow từ chọn quỹ → điền form → tạo QR code!
