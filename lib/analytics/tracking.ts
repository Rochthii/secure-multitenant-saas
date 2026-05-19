/**
 * Analytics tracking utilities
 */

import { posthog } from './posthog';

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture(eventName, properties);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.capture('$pageview', { $current_url: url });
  }
};

// Transaction events
export const trackTransaction = {
  started: (amount: number, method: string) => {
    trackEvent('transaction_started', { amount, method });
  },
  completed: (amount: number, method: string, donorName?: string) => {
    trackEvent('transaction_completed', { amount, method, donorName });
  },
  failed: (amount: number, method: string, error: string) => {
    trackEvent('transaction_failed', { amount, method, error });
  },
};

// Event registration events
export const trackEventRegistration = {
  started: (eventId: string, eventTitle: string) => {
    trackEvent('event_registration_started', { eventId, eventTitle });
  },
  completed: (eventId: string, eventTitle: string, attendees: number) => {
    trackEvent('event_registration_completed', { eventId, eventTitle, attendees });
  },
};

// Content events
export const trackContent = {
  viewed: (type: 'news' | 'event' | 'page', id: string, title: string) => {
    trackEvent('content_viewed', { type, id, title });
  },
  shared: (type: 'news' | 'event', id: string, platform: string) => {
    trackEvent('content_shared', { type, id, platform });
  },
};

// Search events
export const trackSearch = {
  query: (query: string, resultsCount: number) => {
    trackEvent('search_performed', { query, resultsCount });
  },
  resultClicked: (query: string, resultType: string, resultId: string) => {
    trackEvent('search_result_clicked', { query, resultType, resultId });
  },
};

// User identification
export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined' && posthog) {
    posthog.identify(userId, properties);
  }
};
