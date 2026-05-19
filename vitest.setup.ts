import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/vi',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next-intl with importActual to preserve NextIntlClientProvider
vi.mock('next-intl', async () => {
  const actual = await vi.importActual<typeof import('next-intl')>('next-intl');
  return {
    ...actual,
    useTranslations: () => (key: string) => key,
    useLocale: () => 'vi',
  };
});

// Mock i18n routing
vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: any) => {
    const hrefString = typeof href === 'string' ? href : href?.pathname || '#';
    return React.createElement('a', { href: hrefString, ...props }, children);
  },
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/vi',
}));

// Mock Resend email client
vi.mock('resend', () => {
  const MockResend = vi.fn(function(this: any) {
    this.emails = {
      send: vi.fn().mockResolvedValue({ id: 'test-email-id' }),
    };
  });
  return {
    Resend: MockResend,
  };
});

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    },
  }),
}));
