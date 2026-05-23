# Admin Setup Guide

## 1. Create Settings Table

### Via Supabase Dashboard

1. Go to **Supabase Dashboard** → Your Project
2. Click **SQL Editor** in left sidebar
3. Click **New Query**
4. Copy and paste the contents of [`supabase/migrations/20260129_create_settings_table.sql`](file:///e:/WEB_CHANTARANGSAY/chantarangsay-website/supabase/migrations/20260129_create_settings_table.sql)
5. Click **Run** (or press Ctrl+Enter)
6. Verify: Go to **Table Editor** → You should see `settings` table with 8 rows

### Verify Settings Table

```sql
SELECT * FROM settings ORDER BY key;
```

Expected output: 8 rows with keys like `site_name_vi`, `contact_email`, etc.

---

## 2. Setup Admin User

### Option A: Create New Admin User

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email:** `admin@chantarangsay.org` (or your preferred email)
   - **Password:** (choose a strong password)
   - **Auto Confirm User:** ✅ Check this
4. Click **Create user**
5. Find the newly created user in the list
6. Click on the user to open details
7. Scroll to **User Metadata** section
8. Click **Edit**
9. Add this JSON:
   ```json
   {
     "role": "admin"
   }
   ```
10. Click **Save**

### Option B: Upgrade Existing User to Admin

1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Find your existing user (e.g., `monk@test.vn`)
3. Click on the user
4. Scroll to **User Metadata** section
5. Click **Edit**
6. Add `"role": "admin"` to the JSON:
   ```json
   {
     "role": "admin"
   }
   ```
7. Click **Save**

### Verify Admin User

Run this SQL to check:

```sql
SELECT 
    id,
    email,
    raw_user_meta_data->'role' as role,
    created_at
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
```

You should see your admin user listed.

---

## 3. Test Admin Panel Checklist

### Authentication ✅

- [ ] Navigate to `/admin/dashboard`
- [ ] Should redirect to `/login` (not logged in)
- [ ] Login with admin credentials
- [ ] Should redirect back to `/admin/dashboard`
- [ ] Non-admin users should be rejected

### Dashboard ✅

- [ ] See 4 stat cards: News, Events, Transactions, Registrations
- [ ] Numbers should match database counts

### News Management ✅

**List:**
- [ ] Navigate to `/admin/news`
- [ ] See table of existing news
- [ ] Click **Create New**

**Create:**
- [ ] Fill in Vietnamese title (required)
- [ ] Fill in English title
- [ ] Use **Tiptap toolbar** to format Vietnamese content:
  - [ ] Bold, Italic, Headings
  - [ ] Lists (ordered/unordered)
  - [ ] Blockquote
  - [ ] Insert link
- [ ] Upload thumbnail image (test 5MB limit)
- [ ] Fill SEO fields (check character counter)
- [ ] Click **Tạo mới**
- [ ] Should redirect to news list
- [ ] New article appears in table

**Edit:**
- [ ] Click **Edit** on an article
- [ ] Tiptap loads with existing content
- [ ] Make changes
- [ ] Click **Cập nhật**
- [ ] Changes saved correctly

**Delete:**
- [ ] Click **Delete** on an article
- [ ] Confirmation dialog appears
- [ ] Article removed from database

### Transactions ✅

- [ ] Navigate to `/admin/transactions`
- [ ] See table of all transactions
- [ ] Find a transaction with status "pending"
- [ ] Click **Xác nhận** button
- [ ] Status changes to "confirmed"
- [ ] Dashboard stats update

### Registrations ✅

- [ ] Navigate to `/admin/registrations`
- [ ] See table with event registrations
- [ ] Click **Export CSV**
- [ ] CSV file downloads
- [ ] Open CSV in Excel/Google Sheets
- [ ] Verify Vietnamese characters display correctly

### Analytics ✅

- [ ] Navigate to `/admin/analytics`
- [ ] See 4 monthly stat cards with correct numbers
- [ ] "Top Content" section shows most recent news/event
- [ ] Recent activity lists show last 5 items

### Settings ✅

- [ ] Navigate to `/admin/settings`
- [ ] See 3 cards: Tenant Info, Contact, Social Media
- [ ] Form pre-filled with seeded data
- [ ] Update **Site Name (VI)** to test value
- [ ] Click **Lưu cài đặt**
- [ ] Page reloads with new value
- [ ] Verify database updated:
   ```sql
   SELECT * FROM settings WHERE key = 'site_name_vi';
   ```

### Backup ✅

- [ ] Navigate to `/admin/backup`
- [ ] Read instructions and warnings
- [ ] Click **Download Backup (JSON)**
- [ ] JSON file downloads
- [ ] Open file in text editor
- [ ] Verify structure:
   ```json
   {
     "version": "1.0",
     "timestamp": "...",
     "data": {
       "news": [...],
       "events": [...],
       "media": [...],
       "transactions": [...],
       "registrations": [...],
       "settings": [...]
     }
   }
   ```

### Sidebar Navigation ✅

- [ ] All 9 menu items visible
- [ ] Active route highlighted in gold
- [ ] Logout button at bottom
- [ ] Click **Đăng xuất**
- [ ] Logged out and redirected to `/login`

---

## Common Issues & Solutions

### Issue: "Cannot find module" TypeScript errors

**Solution:** Restart VS Code or TypeScript server
- Press `Ctrl+Shift+P`
- Type "Restart TS Server"
- Select "TypeScript: Restart TS Server"

### Issue: Settings table not found

**Solution:** Run migration SQL again in Supabase SQL Editor

### Issue: User can't access admin routes

**Solution:** Check `user_metadata.role`:
```sql
SELECT email, raw_user_meta_data FROM auth.users WHERE email = 'your-email@example.com';
```

Must have `"role": "admin"` in `raw_user_meta_data`.

### Issue: Tiptap not loading

**Solution:** Check browser console for errors. Run:
```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link
```

### Issue: Image upload fails

**Solution:** 
1. Verify Supabase Storage bucket `media` exists
2. Check bucket is public (for public URLs)
3. Go to Storage → `media` bucket → Settings → Make public

---

## Next Steps After Testing

1. **Deploy to production** (if all tests pass)
2. **Setup real admin email** (not test accounts)
3. **Configure SMTP** for email notifications (future)
4. **Backup schedule** (future enhancement)
5. **Implement Events CRUD** (currently read-only)
6. **Implement Media upload** (currently read-only)

---

**Status:** ✅ Ready for testing!
