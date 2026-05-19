import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';

// Import messages
import viMessages from '@/messages/vi.json';
import kmMessages from '@/messages/km.json';
import enMessages from '@/messages/en.json';

const messages = {
  vi: viMessages,
  km: kmMessages,
  en: enMessages,
};

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  useParams: () => ({
    locale: 'vi',
  }),
  usePathname: () => '/',
}));

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  locale?: 'vi' | 'km' | 'en';
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  { locale = 'vi', ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock Supabase response
 */
export function mockSupabaseResponse<T>(data: T, error: Error | null = null) {
  return {
    data,
    error,
    count: null,
    status: error ? 500 : 200,
    statusText: error ? 'Error' : 'OK',
  };
}

/**
 * Create mock transaction data
 */
export function createMockTransaction(overrides = {}) {
  return {
    id: '1',
    amount: 100000,
    donor_name: 'Test User',
    donor_email: 'test@example.com',
    purpose: 'general',
    payment_method: 'bank_transfer',
    status: 'pending',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock event data
 */
export function createMockEvent(overrides = {}) {
  return {
    id: '1',
    title_vi: 'Lễ Phật Đản',
    title_km: 'ពិធីបុណ្យវិសាខបូជា',
    title_en: 'Vesak Day',
    description_vi: 'Lễ kỷ niệm ngày Phật sinh',
    description_km: 'ពិធីបុណ្យវិសាខបូជា',
    description_en: 'Buddha Birthday Celebration',
    start_date: new Date('2026-05-15').toISOString(),
    start_time: '09:00',
    event_date: new Date('2026-05-15').toISOString(),
    location: 'Chi nhánh Chantarangsay',
    max_participants: 100,
    current_participants: 25,
    registration_deadline: new Date('2026-05-10').toISOString(),
    status: 'upcoming',
    thumbnail_url: null,
    registration_required: true,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create mock news data
 */
export function createMockNews(overrides = {}) {
  return {
    id: '1',
    title_vi: 'Tin tức mới',
    title_km: 'ព័ត៌មានថ្មី',
    title_en: 'Latest News',
    content_vi: 'Nội dung tin tức',
    content_km: 'មាតិកាព័ត៌មាន',
    content_en: 'News content',
    slug: 'tin-tuc-moi',
    status: 'published',
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Wait for async updates
 */
export const waitFor = (callback: () => void, timeout = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      callback();
      resolve(true);
    }, timeout);
  });
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
