'use client';
import { useState } from 'react';
import { runScalingBenchmark, BenchmarkResult } from './scaling-engine';
import { createClient } from '@/lib/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScalingBenchmarkPage() {
    const [data, setData] = useState<BenchmarkResult[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleRun = async () => {
        setLoading(true);
        const results = await runScalingBenchmark(supabase);
        setData(results);
        setLoading(false);
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Thực nghiệm Dataset Scaling (ISO 27017 Performance Audit)</h1>
                <button 
                    onClick={handleRun}
                    disabled={loading}
                    className="bg-gold-primary text-white px-6 py-2 rounded-lg hover:bg-gold-dark transition-all disabled:opacity-50"
                >
                    {loading ? 'Đang chạy thực nghiệm...' : 'Bắt đầu Benchmark'}
                </button>
            </div>

            <div className="grid grid-cols-1 bg-white p-6 rounded-xl border shadow-sm">
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="datasetSize" label={{ value: 'Số lượng bản ghi (N)', position: 'insideBottomRight', offset: -10 }} />
                            <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="appFilterMs" stroke="#ff4d4f" name="App-side (O(N) + Network)" strokeWidth={2} />
                            <Line type="monotone" dataKey="rlsJoinMs" stroke="#1890ff" name="Standard RLS (JOIN)" strokeWidth={2} />
                            <Line type="monotone" dataKey="rlsClaimsMs" stroke="#52c41a" name="Optimized RLS (JWT Claims)" strokeWidth={3} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-sm text-gray-500 italic">
                    * Biểu đồ chứng minh: Khi N tăng, phương pháp Optimized RLS giữ được đường cong tiệm cận hằng số (O(1) Authorization), 
                    trong khi các phương pháp khác tăng trưởng theo hàm tuyến tính.
                </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-blue-700">
                    <strong>Ghi chú bảo vệ đồ án:</strong> Dữ liệu này trực tiếp trả lời câu hỏi nghiên cứu CĐ1 về tính khả thi của RLS trên quy mô lớn.
                </p>
            </div>
        </div>
    );
}