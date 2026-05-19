'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SEOFieldsProps {
    metaTitle?: string;
    metaDescription?: string;
    slug?: string;
}

export function SEOFields({ metaTitle, metaDescription, slug }: SEOFieldsProps) {
    const [titleLength, setTitleLength] = React.useState(metaTitle?.length || 0);
    const [descLength, setDescLength] = React.useState(metaDescription?.length || 0);

    return (
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-lg">SEO Settings</h3>

            {/* Meta Title */}
            <div>
                <Label htmlFor="meta_title">
                    Meta Title
                    <span className="text-sm text-gray-500 ml-2">
                        ({titleLength}/60 characters)
                    </span>
                </Label>
                <Input
                    id="meta_title"
                    name="meta_title"
                    defaultValue={metaTitle || ''}
                    maxLength={60}
                    placeholder="Optimized title for search engines"
                    onChange={(e) => setTitleLength(e.target.value.length)}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Recommended: 50-60 characters
                </p>
            </div>

            {/* Meta Description */}
            <div>
                <Label htmlFor="meta_description">
                    Meta Description
                    <span className="text-sm text-gray-500 ml-2">
                        ({descLength}/160 characters)
                    </span>
                </Label>
                <Textarea
                    id="meta_description"
                    name="meta_description"
                    defaultValue={metaDescription || ''}
                    maxLength={160}
                    rows={3}
                    placeholder="Brief description for search results"
                    onChange={(e) => setDescLength(e.target.value.length)}
                />
                <p className="text-xs text-gray-500 mt-1">
                    Recommended: 150-160 characters
                </p>
            </div>

            {/* Slug */}
            <div>
                <Label htmlFor="slug">
                    URL Slug
                    <span className="text-sm text-gray-500 ml-2">(optional)</span>
                </Label>
                <Input
                    id="slug"
                    name="slug"
                    defaultValue={slug || ''}
                    placeholder="url-friendly-slug"
                    pattern="[a-z0-9-]+"
                />
                <p className="text-xs text-gray-500 mt-1">
                    Lowercase letters, numbers, and hyphens only
                </p>
            </div>
        </div>
    );
}
