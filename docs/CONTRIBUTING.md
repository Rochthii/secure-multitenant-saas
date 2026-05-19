# 🤝 Contributing Guide - Chi nhánh Chantarangsay Website

> **Guidelines for Contributing to the Project**  
> **Version**: 1.0  
> **Last Updated**: February 4, 2026

---

## 📋 Table of Contents

1. [Getting Started](#1-getting-started)
2. [Development Workflow](#2-development-workflow)
3. [Code Standards](#3-code-standards)
4. [Commit Guidelines](#4-commit-guidelines)
5. [Pull Request Process](#5-pull-request-process)
6. [Testing Requirements](#6-testing-requirements)
7. [Documentation](#7-documentation)
8. [Code Review](#8-code-review)

---

## 1. Getting Started

### 1.1 Prerequisites

Before you begin, ensure you have:

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **Git**: Latest version
- **VS Code** (recommended): With extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript

### 1.2 Fork & Clone

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/chantarangsay-website.git
cd chantarangsay-website

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/chantarangsay-website.git

# 4. Install dependencies
npm install

# 5. Copy environment file
cp .env.example .env.local
# Fill in your Supabase credentials

# 6. Start development server
npm run dev
```

### 1.3 Project Structure Familiarization

Read the following docs before contributing:
- [README.md](../README.md) - Project overview
- [docs/ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [docs/API_DOCS.md](./API_DOCS.md) - API & database schema

---

## 2. Development Workflow

### 2.1 Branch Naming Convention

Use descriptive branch names following this pattern:

```
<type>/<short-description>
```

**Types**:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding/updating tests
- `chore/` - Maintenance tasks

**Examples**:
```bash
feature/add-transaction-receipt-email
fix/event-registration-validation
docs/update-api-documentation
refactor/optimize-news-query
test/add-transaction-form-tests
chore/update-dependencies
```

### 2.2 Development Flow

```bash
# 1. Sync with upstream
git checkout main
git pull upstream main

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes
# ... code, commit, code, commit ...

# 4. Run tests
npm test
npm run test:e2e

# 5. Run linter
npm run lint

# 6. Push to your fork
git push origin feature/your-feature-name

# 7. Create Pull Request on GitHub
```

### 2.3 Keeping Your Fork Updated

```bash
# Fetch upstream changes
git fetch upstream

# Merge into your main
git checkout main
git merge upstream/main

# Push to your fork
git push origin main

# Rebase your feature branch (if needed)
git checkout feature/your-feature-name
git rebase main
```

---

## 3. Code Standards

### 3.1 TypeScript Guidelines

#### Use Explicit Types

```typescript
// ❌ Bad
const getData = (id) => { ... }

// ✅ Good
const getData = (id: string): Promise<News> => { ... }
```

#### Prefer Interfaces for Objects

```typescript
// ✅ Good
interface NewsCardProps {
  news: News;
  locale: Locale;
  onRead?: (id: string) => void;
}

// ❌ Avoid type alias for objects (use for unions)
type NewsCardProps = { ... }
```

#### Use Enums for Constants

```typescript
// ✅ Good
enum NewsStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// ❌ Bad
const STATUS_DRAFT = 'draft';
const STATUS_PUBLISHED = 'published';
```

### 3.2 React Guidelines

#### Component Organization

```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
}

// 3. Component
export function Component({ title }: ComponentProps) {
  // 3.1 Hooks
  const [count, setCount] = useState(0);
  
  // 3.2 Derived state
  const doubleCount = count * 2;
  
  // 3.3 Event handlers
  const handleClick = () => {
    setCount(prev => prev + 1);
  };
  
  // 3.4 Effects
  useEffect(() => { ... }, []);
  
  // 3.5 Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Count: {count}</Button>
    </div>
  );
}
```

#### Server vs Client Components

```typescript
// Default: Server Component (no 'use client')
async function NewsPage() {
  const news = await getNews(); // Direct DB access
  return <NewsList news={news} />;
}

// Client Component (only when needed)
'use client'

import { useState } from 'react';

function NewsFilter() {
  const [filter, setFilter] = useState('all');
  // Interactive logic
  return <select value={filter} onChange={...} />;
}
```

**When to use Client Components**:
- ✅ Interactive (useState, useEffect, event handlers)
- ✅ Browser APIs (localStorage, window)
- ✅ Third-party libraries requiring 'window'

**Default to Server Components**:
- ✅ Data fetching
- ✅ Static content
- ✅ SEO-critical content

### 3.3 Styling Guidelines

#### Use Tailwind Classes

```tsx
// ✅ Good - Tailwind utility classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>

// ❌ Bad - Inline styles
<div style={{ display: 'flex', padding: '24px' }}>
  <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Title</h1>
</div>
```

#### Use cn() Utility for Conditional Classes

```typescript
import { cn } from '@/lib/utils';

<button
  className={cn(
    "px-4 py-2 rounded",
    isActive && "bg-blue-500 text-white",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>
```

#### Component Variants with CVA

```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "rounded font-medium transition-colors", // base
  {
    variants: {
      variant: {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        md: "px-4 py-2 text-base",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);
```

### 3.4 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase | `NewsCard.tsx`, `TransactionForm.tsx` |
| **Utilities** | camelCase | `formatDate.ts`, `supabase.ts` |
| **Constants** | camelCase | `constants.ts` |
| **Types** | PascalCase | `types.ts` (with `News`, `Event` interfaces) |
| **API Routes** | kebab-case | `route.ts` in `app/api/send-email/` |
| **Server Actions** | camelCase.actions | `news.actions.ts` |

### 3.5 Import Order

```typescript
// 1. External packages
import { useState } from 'react';
import { useTranslations } from 'next-intl';

// 2. Internal aliases
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

// 3. Relative imports
import { NewsCard } from './news-card';
import type { News } from './types';

// 4. Styles
import './styles.css';
```

---

## 4. Commit Guidelines

### 4.1 Conventional Commits

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Examples**:

```bash
feat(transactions): add receipt email after transaction

- Integrate with Resend API
- Create email template with logo
- Add success notification

Closes #123

---

fix(events): correct date format in registration form

The date picker was showing US format instead of Vietnamese format.
Changed to DD/MM/YYYY.

Fixes #456

---

docs(api): update API documentation for news endpoints

- Add examples for filtering
- Document new query parameters
- Fix typos in response examples

---

refactor(news): optimize database query performance

- Add index on published_at column
- Use select projection to reduce payload
- Implement cursor-based pagination

Improves response time from 800ms to 150ms.

---

test(transactions): add E2E tests for transaction flow

- Test successful transaction
- Test validation errors
- Test anonymous transactions
- Test different payment methods

Coverage: +15%
```

### 4.2 Commit Best Practices

- ✅ **Atomic commits**: One logical change per commit
- ✅ **Descriptive**: Explain what and why, not how
- ✅ **Present tense**: "Add feature" not "Added feature"
- ✅ **Imperative mood**: "Fix bug" not "Fixes bug"
- ❌ **Avoid**: "WIP", "temp", "misc changes"

---

## 5. Pull Request Process

### 5.1 Before Creating PR

**Checklist**:
- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Self-reviewed code changes
- [ ] Added/updated tests for new code
- [ ] Updated documentation if needed

### 5.2 PR Title & Description

**Title**: Use conventional commit format

```
feat(transactions): add transaction receipt email functionality
```

**Description Template**:

```markdown
## What does this PR do?
Brief description of the changes.

## Why?
Explain the motivation behind these changes.

## How to test?
1. Go to transactions page
2. Fill in the form
3. Submit
4. Check email for receipt

## Screenshots (if UI changes)
[Add screenshots here]

## Related Issues
Closes #123
Related to #456

## Checklist
- [x] Tests added/updated
- [x] Documentation updated
- [x] No breaking changes
- [ ] Breaking changes (list them below)
```

### 5.3 PR Size Guidelines

- ✅ **Small PRs** (< 400 lines): Preferred, faster reviews
- ⚠️ **Medium PRs** (400-1000 lines): Acceptable
- ❌ **Large PRs** (> 1000 lines): Split into smaller PRs

**Exception**: Large PRs acceptable for:
- Initial scaffolding
- Auto-generated code
- Migrations
- Documentation overhauls

### 5.4 Review Process

1. **Automated Checks**: CI/CD runs tests, linting, build
2. **Code Review**: At least 1 approval required
3. **Address Feedback**: Make requested changes
4. **Merge**: Squash and merge (keeps history clean)

---

## 6. Testing Requirements

### 6.1 Test Coverage Goals

| Area | Target Coverage | Priority |
|------|----------------|----------|
| **Utilities** | 90%+ | High |
| **Components** | 70%+ | High |
| **API Routes** | 80%+ | High |
| **E2E Flows** | Key journeys | High |

### 6.2 Writing Unit Tests

**Location**: `tests/unit/`

```typescript
// tests/unit/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formats VND correctly', () => {
    expect(formatCurrency(1000000, 'VND')).toBe('1.000.000 ₫');
  });
  
  it('formats USD correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00');
  });
  
  it('handles zero', () => {
    expect(formatCurrency(0, 'VND')).toBe('0 ₫');
  });
});
```

### 6.3 Writing Component Tests

```typescript
// tests/unit/components/news-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsCard } from '@/components/news/news-card';

describe('NewsCard', () => {
  const mockNews = {
    id: '1',
    title_vi: 'Test News',
    excerpt_vi: 'Test excerpt',
    thumbnail_url: '/test.jpg',
  };
  
  it('renders news title', () => {
    render(<NewsCard news={mockNews} locale="vi" />);
    expect(screen.getByText('Test News')).toBeInTheDocument();
  });
  
  it('renders thumbnail image', () => {
    render(<NewsCard news={mockNews} locale="vi" />);
    const img = screen.getByAltText('Test News');
    expect(img).toHaveAttribute('src', expect.stringContaining('test.jpg'));
  });
});
```

### 6.4 Writing E2E Tests

**Location**: `tests/e2e/`

```typescript
// tests/e2e/transaction.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Transaction Flow', () => {
  test('successful transaction', async ({ page }) => {
    // Navigate to transactions page
    await page.goto('/vi/cung-duong');
    
    // Fill form
    await page.fill('input[name="donor_name"]', 'Nguyễn Văn A');
    await page.fill('input[name="donor_email"]', 'test@example.com');
    await page.click('button:has-text("500.000 ₫")');
    await page.click('button:has-text("Chuyển khoản ngân hàng")');
    
    // Submit
    await page.click('button:has-text("Thanh toán")');
    
    // Verify success
    await expect(page.locator('text=Cảm ơn bạn')).toBeVisible();
  });
});
```

### 6.5 Running Tests

```bash
# Unit tests - watch mode
npm test

# Unit tests - run once
npm run test:unit

# Unit tests - with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests - UI mode
npm run test:e2e:ui

# E2E tests - debug
npm run test:e2e:debug
```

---

## 7. Documentation

### 7.1 Code Comments

**When to comment**:
- ✅ Complex algorithms
- ✅ Non-obvious business logic
- ✅ Workarounds for known issues
- ✅ Public API functions

**When NOT to comment**:
- ❌ Obvious code (`// Increment counter`)
- ❌ Redundant (`// Loop through array` above `array.map()`)

**Good Examples**:

```typescript
// ✅ Good - Explains WHY
// Use server-side rendering for this page to ensure fresh data
// on every request, as transaction stats change frequently
export const dynamic = 'force-dynamic';

// ✅ Good - Complex logic explanation
// Calculate Khmer lunar date using @thyrith/momentkh library.
// The conversion requires solar date + timezone offset for accuracy.
const khmerDate = moment(date).tz('Asia/Phnom_Penh').toKhDate();

// ❌ Bad - States the obvious
// Get the news data
const news = await getNews();
```

### 7.2 JSDoc for Functions

```typescript
/**
 * Formats a currency amount according to locale.
 *
 * @param amount - The numeric amount to format
 * @param currency - ISO 4217 currency code (VND, USD, etc.)
 * @param locale - Locale for formatting (vi, km, en)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1000000, 'VND', 'vi') // "1.000.000 ₫"
 * formatCurrency(100, 'USD', 'en') // "$100.00"
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale: Locale = 'vi'
): string {
  // Implementation
}
```

### 7.3 README for New Features

When adding a major feature, create a README:

```
features/
├── transactions/
│   ├── README.md          # Feature documentation
│   ├── components/
│   └── actions/
```

**Template**:

```markdown
# Transaction Feature

## Overview
Brief description of the feature.

## Architecture
- Components used
- Data flow
- External integrations

## Usage
Code examples

## Configuration
Environment variables, settings

## Testing
How to test this feature

## Future Improvements
Ideas for enhancement
```

---

## 8. Code Review

### 8.1 As a Reviewer

**What to look for**:
- ✅ **Correctness**: Does it work? No bugs?
- ✅ **Performance**: Any inefficiencies?
- ✅ **Security**: Input validation? SQL injection risks?
- ✅ **Readability**: Can others understand it?
- ✅ **Tests**: Are there tests? Do they pass?
- ✅ **Documentation**: Is it documented?

**Review Etiquette**:
- ✅ Be respectful and constructive
- ✅ Explain the "why" behind suggestions
- ✅ Distinguish between "must fix" and "nice to have"
- ✅ Praise good code
- ❌ Don't be dismissive or condescending

**Example Comments**:

```
// ✅ Good
"Consider using useMemo here to avoid recalculating on every render.
This function is called frequently and the calculation is expensive."

// ❌ Bad
"This is wrong. Use useMemo."
```

### 8.2 As an Author

**Responding to feedback**:
- ✅ Thank reviewers for their time
- ✅ Ask questions if unclear
- ✅ Explain your reasoning if you disagree
- ✅ Make requested changes promptly
- ❌ Don't take feedback personally
- ❌ Don't argue defensively

**Resolving Discussions**:
- Make the change → Mark as "Resolved"
- Explain why you didn't make the change → Wait for reviewer response

---

## 🎉 Thank You for Contributing!

Your contributions help preserve and promote Khmer Buddhist culture. Together, we're building a digital tenant for the community.

**Questions?**
- Open a GitHub Discussion
- Email: dev@chantarangsay.org

---

<div align="center">
  <p>🛕 Namo Buddhaya 🙏</p>
  <p>Made with ❤️ by the Chantarangsay Development Team</p>
</div>
