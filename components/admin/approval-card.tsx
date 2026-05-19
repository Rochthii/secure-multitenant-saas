'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
// FIXED: approvals.ts đã được hợp nhất vào news.ts — dùng approveNews/rejectNews từ news actions
import { approveNews, rejectNews } from '@/app/actions/admin/news';

import { useRouter } from 'next/navigation';
import { Check, X, Eye } from 'lucide-react';
import { formatDate } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ApprovalData {
    id: string;
    title: string;
    excerpt?: string;
    submitted_by: string;
    submitted_at: string;
    content?: string;
}

interface ApprovalCardProps {
    item: ApprovalData;
}

export function ApprovalCard({ item }: ApprovalCardProps) {
    const router = useRouter();
    const [showReview, setShowReview] = useState(false);
    const [comments, setComments] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleApprove = async () => {
        setLoading(true);
        setMessage(null);

        const result = await approveNews(item.id);

        if (result.success) {
            setMessage({ type: 'success', text: 'Content approved and published!' });
            setTimeout(() => router.refresh(), 1000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to approve' });
        }

        setLoading(false);
    };

    const handleReject = async () => {
        if (!comments.trim()) {
            setMessage({ type: 'error', text: 'Please provide rejection comments' });
            return;
        }

        setLoading(true);
        setMessage(null);

        const result = await rejectNews(item.id, comments);

        if (result.success) {
            setMessage({ type: 'success', text: 'Content rejected. Editor will be notified.' });
            setTimeout(() => router.refresh(), 1000);
        } else {
            setMessage({ type: 'error', text: result.error || 'Failed to reject' });
        }

        setLoading(false);
    };

    return (
        <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                            <span>Submitted by: <strong>{item.submitted_by}</strong></span>
                            <span>•</span>
                            <span>{formatDate(new Date(item.submitted_at), 'dd/MM/yyyy HH:mm', { locale: vi })}</span>
                        </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                        PENDING
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Excerpt */}
                {item.excerpt && (
                    <p className="text-gray-700 line-clamp-2">{item.excerpt}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowReview(!showReview)}
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        {showReview ? 'Hide Review' : 'Review'}
                    </Button>
                </div>

                {/* Review Section */}
                {showReview && (
                    <div className="mt-4 space-y-4 border-t pt-4">
                        {/* Comments */}
                        <div>
                            <label className="text-sm font-medium">Review Comments (Optional)</label>
                            <Textarea
                                placeholder="Add your feedback for the editor..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                rows={3}
                                className="mt-1"
                                disabled={loading}
                            />
                        </div>

                        {/* Message */}
                        {message && (
                            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                                <AlertDescription>{message.text}</AlertDescription>
                            </Alert>
                        )}

                        {/* Approve/Reject Buttons */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleApprove}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Check className="h-4 w-4 mr-1" />
                                Approve & Publish
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={loading}
                            >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
