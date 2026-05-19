# Event Reminder Email Setup

## Overview
Automated system to send reminder emails to event registrants 1 day before the event.

## Files Created
- `/app/api/cron/send-event-reminders/route.ts` - API endpoint for cron job

## Setup Instructions

### Option 1: Vercel Cron (Recommended for Vercel deployment)

1. Create `vercel.json` in project root:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-event-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}
```

2. Add environment variable in Vercel dashboard:
```
CRON_SECRET=your-random-secret-string-here
```

3. Deploy to Vercel - cron will run automatically daily at 9 AM UTC.

### Option 2: External Cron Service (cron-job.org, EasyCron, etc.)

1. Add environment variable to `.env.local`:
```
CRON_SECRET=your-random-secret-string-here
```

2. Configure external cron service:
   - **URL:** `https://your-domain.com/api/cron/send-event-reminders`
   - **Method:** POST
   - **Schedule:** `0 9 * * *` (Daily at 9 AM)
   - **Headers:**
     ```
     Authorization: Bearer your-random-secret-string-here
     ```

### Option 3: GitHub Actions (Free tier available)

Create `.github/workflows/event-reminders.yml`:
```yaml
name: Send Event Reminders

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send Event Reminders
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/send-event-reminders
```

Add `CRON_SECRET` to GitHub repository secrets.

## Environment Variables Required

```env
# Resend API Key (already configured)
RESEND_API_KEY=re_xxxxxxxxx

# Cron Secret for security
CRON_SECRET=generate-random-string-min-32-chars

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## How It Works

1. **Cron job triggers** the API endpoint daily at 9 AM
2. **API fetches** events happening tomorrow
3. **For each event**, get confirmed registrations
4. **Send email** to each registrant with:
   - Event title
   - Date and time
   - Location
   - Reminder message
5. **Returns** summary of emails sent

## Testing

### Manual Test (Local)
```bash
curl -X POST http://localhost:3000/api/cron/send-event-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

### Manual Test (Production)
```bash
curl -X POST https://your-domain.com/api/cron/send-event-reminders \
  -H "Authorization: Bearer your-cron-secret"
```

### Expected Response
```json
{
  "success": true,
  "message": "Event reminders sent",
  "eventsCount": 2,
  "emailsSent": 15,
  "errors": 0
}
```

## Security

- ✅ Protected by `CRON_SECRET` header
- ✅ Uses Supabase RLS policies
- ✅ Only sends to confirmed registrations
- ✅ Validates event status (upcoming/ongoing only)

## Email Template Features

- Beautiful HTML design with gradient header
- Event details card with icons
- Responsive layout
- Buddhist tenant aesthetic (gold colors)
- Professional footer
- Auto-generated, no manual editing needed

## Monitoring

Check logs after cron runs:
- Vercel: Dashboard → Functions → Logs
- GitHub Actions: Actions tab → Workflow runs
- External service: Service dashboard

## Troubleshooting

### No emails sent
- Check if events exist for tomorrow
- Verify registrations status is 'confirmed'
- Check Resend API key is valid
- Review error logs

### Unauthorized error (401)
- Verify `CRON_SECRET` matches in both cron service and environment variables

### Database error (500)
- Check Supabase connection
- Verify table names and column names match schema

## Production Checklist

- [ ] Set `CRON_SECRET` environment variable
- [ ] Configure cron service (Vercel/GitHub Actions/External)
- [ ] Test cron endpoint manually
- [ ] Verify emails are delivered
- [ ] Monitor first few cron runs
- [ ] Set up error alerting (optional)

## Notes

- Runs at 9 AM UTC daily (adjust timezone as needed)
- Only sends to events happening exactly tomorrow
- Skips events with no confirmed registrations
- Idempotent - safe to run multiple times
