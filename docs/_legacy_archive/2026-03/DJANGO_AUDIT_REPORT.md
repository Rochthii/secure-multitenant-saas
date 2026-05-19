# 📋 Django Backend Audit Report

**Ngày audit**: 03/02/2026  
**Sprint 5**: Django Audit & Migration

---

## 🔍 Python Scripts Inventory

### Core Scripts (cms_backend/)

| File | Purpose | Lines | Complexity | Migration Priority |
|------|---------|-------|------------|-------------------|
| **seed_news.py** | Seed demo news articles | 155 | Medium | 🔴 High |
| **seed_events.py** | Seed demo events | 132 | Medium | 🔴 High |
| **create_admin.py** | Create superuser | 18 | Low | 🟢 Low (manual only) |
| **create_real_admin.py** | Create production admin | ~20 | Low | 🟢 Low |
| **add_column_events.py** | DB migration script | Unknown | Low | ⚪ Skip (one-time) |
| **add_field_translations.py** | DB migration script | Unknown | Low | ⚪ Skip (one-time) |
| **add_model_translations.py** | DB migration script | Unknown | Low | ⚪ Skip (one-time) |
| **add_str_methods.py** | DB migration script | Unknown | Low | ⚪ Skip (one-time) |
| **check_api.py** | API testing script | Unknown | Low | 🟡 Medium |
| **debug_news.py** | Debug utility | Unknown | Low | ⚪ Skip |
| **fix_rls.py** | RLS policy fix | Unknown | Low | ⚪ Skip (one-time) |
| **split_admin.py** | Admin split utility | Unknown | Low | ⚪ Skip |
| **translate_models.py** | Translation utility | Unknown | Low | ⚪ Skip |
| **create_rpc.py** | RPC creation | Unknown | Medium | 🟡 Medium |

---

## 🎯 Migration Strategy

### Phase 1: High Priority (Must Convert)
✅ **seed_news.py** → TypeScript
- Creates demo news articles with i18n
- Uses Django ORM → Convert to Supabase client

✅ **seed_events.py** → TypeScript
- Creates demo events
- Uses Django ORM → Convert to Supabase client

### Phase 2: Skip (One-time migrations)
❌ All `add_*.py`, `fix_*.py`, `split_*.py` scripts
- These were one-time database migrations
- Already applied to production DB
- No need to convert

### Phase 3: Manual Operations
🟢 **create_admin.py** 
- Simple superuser creation
- Can be done via Supabase Dashboard or SQL
- No conversion needed

---

## 📦 Dependencies Analysis

### Python Dependencies (requirements.txt)
```python
Django==4.2.x
psycopg2-binary  # PostgreSQL adapter
python-dotenv     # Environment variables
django-cors-headers
```

### TypeScript Equivalents
```typescript
@supabase/supabase-js  // PostgreSQL client
dotenv                 // Environment variables
```

---

## 🔄 Conversion Plan

### Script 1: seed_news.py → seed-news.ts

**Input**: Python with Django ORM
```python
from core.models import News, Categories
News.objects.create(title_vi="...", content_vi="...")
```

**Output**: TypeScript with Supabase
```typescript
import { createClient } from '@supabase/supabase-js';
await supabase.from('news').insert({ title_vi: "...", content_vi: "..." });
```

**Complexity**: Medium (155 lines, multiple i18n fields)

### Script 2: seed_events.py → seed-events.ts

**Input**: Python with Django ORM
```python
from core.models import Events
Events.objects.create(title_vi="...", start_date="...")
```

**Output**: TypeScript with Supabase
```typescript
await supabase.from('events').insert({ title_vi: "...", start_date: "..." });
```

**Complexity**: Medium (132 lines, date handling)

---

## 🎬 Migration Steps

1. ✅ **Audit complete** - Identified 2 scripts to convert
2. 🔄 **Convert seed_news.py** → TypeScript
3. 🔄 **Convert seed_events.py** → TypeScript
4. 🔄 **Generate tests** for converted scripts
5. 🔄 **Create npm scripts** for easy execution
6. ✅ **Retire Django backend**

---

## 📊 Effort Estimate

| Task | Traditional | AI-Assisted | Time Saved |
|------|------------|-------------|------------|
| Audit scripts | 2 hours | 15 mins | 87% |
| Convert 2 scripts | 4 hours | 30 mins | 87% |
| Write tests | 2 hours | 15 mins | 87% |
| **Total** | **8 hours** | **1 hour** | **87%** |

---

## ✅ Recommendation

**Convert only 2 scripts**:
1. `seed_news.py` → `scripts/seed-news.ts`
2. `seed_events.py` → `scripts/seed-events.ts`

**Retire Django**:
- Remove `cms_backend/` folder after conversion
- Update documentation
- All future seeding via TypeScript scripts

---

**Next**: Convert scripts to TypeScript with AI 🤖
