'use client';

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/constants/transaction';

interface TransactionAnalyticsProps {
    transactions: any[];
}

export function TransactionAnalytics({ transactions }: TransactionAnalyticsProps) {
    // Process data: Group by month (last 12 months)
    const processData = () => {
        const today = new Date();
        const data = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

            const monthTotal = transactions
                .filter(d => {
                    const dDate = new Date(d.created_at);
                    return dDate.getMonth() === date.getMonth() &&
                        dDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, d) => sum + Number(d.amount), 0);

            data.push({
                name: monthKey,
                total: monthTotal
            });
        }
        return data;
    };

    const data = processData();
    const totalTransaction = data.reduce((sum, item) => sum + item.total, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Summary Card */}
            <Card className="md:col-span-1 bg-gradient-to-br from-gold-primary/10 to-white border-gold-primary/20">
                <CardHeader>
                    <CardTitle className="text-gray-600 font-medium text-sm uppercase">Tổng thanh toán (12 tháng)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gold-primary">
                        {formatCurrency(totalTransaction)}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        Đã xác nhận thành công
                    </p>
                </CardContent>
            </Card>

            {/* Chart */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Biểu đồ đóng góp theo tháng</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value / 1000000}M`}
                            />
                            <Tooltip
                                formatter={(value: any) => [formatCurrency(value), 'Tổng']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#D4AF37" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
