/**
 * Lazy-loaded components for performance optimization
 * Components are loaded only when needed
 */

import dynamic from 'next/dynamic';
import React from 'react';

// Heavy components that should be lazy-loaded
export const LightboxViewer = dynamic(
  () => import('@/components/gallery/lightbox-viewer').then(mod => ({ default: mod.LightboxViewer })),
  {
    ssr: false,
    loading: () => React.createElement('div', { className: 'fixed inset-0 bg-black/80 flex items-center justify-center' }, 'Loading...'),
  }
);

export const RichTextEditor = dynamic(
  () => import('@/components/admin/rich-text-editor').then(mod => ({ default: mod.RichTextEditor })),
  {
    ssr: false,
    loading: () =>
      React.createElement('div', { className: 'border rounded-lg p-4 min-h-[300px] bg-gray-50 animate-pulse' },
        React.createElement('div', { className: 'h-8 bg-gray-200 rounded mb-4' }),
        React.createElement('div', { className: 'space-y-3' },
          React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-3/4' }),
          React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-full' }),
          React.createElement('div', { className: 'h-4 bg-gray-200 rounded w-5/6' })
        )
      ),
  }
);

export const CalendarGrid = dynamic(
  () => import('@/components/ui/calendar-grid').then(mod => ({ default: mod.CalendarGrid })),
  {
    loading: () =>
      React.createElement('div', { className: 'h-96 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center' },
        React.createElement('div', { className: 'text-gray-400' }, 'Loading calendar...')
      ),
  }
);

export const TestimonialsSection = dynamic(
  () => import('@/components/sections/TestimonialsSection').then(mod => ({ default: mod.TestimonialsSection })),
  {
    loading: () => React.createElement('div', { className: 'h-96 bg-gray-50' }),
  }
);

export const FacebookFeedSection = dynamic(
  () => import('@/components/sections/FacebookFeedSection').then(mod => ({ default: mod.FacebookFeedSection })),
  {
    loading: () => React.createElement('div', { className: 'h-96 bg-gray-50' }),
  }
);
