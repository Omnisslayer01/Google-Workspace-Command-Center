# GWCC / Athenura - Missing Features Remediation Plan

## Mission

Fix the broken and hard-coded behaviours documented in **"Missing Features or features that arent working at all.pdf"**. Work in the existing repository; do not rebuild the product or redesign working pages. Prioritize real Google Workspace data, correct persistence, consistent navigation, and end-to-end verification.

## Instructions to the coding agent

- Treat this plan and the supplied GWCC Task Division Plan PDF as the requirements. Inspect the repository and actual API contracts before editing.
- Execute the work; do not merely explain what should be changed.
- Make small, safe changes, run the relevant tests/build after each workstream, and fix regressions before moving on.
- Do not fabricate live data. Never show seeded/demo/mock records as if they came from Google APIs or PostgreSQL.
- Use mocks/fixtures only in tests or behind an explicit development-only mode. Do not silently fall back to mock/localStorage data after a real API returns 401, 403, 404, or 5xx.
- Keep all credentials and tokens out of source code, logs, screenshots, test output, and Git. Do not print secrets.
- Preserve the existing visual style and shared layout. Avoid unnecessary framework changes.
- The required project stack is Django + Django REST Framework, React/Vite/TypeScript, PostgreSQL, Redis/Celery, and Google APIs. Do not switch frameworks or databases.
- Inspect Git status and current branch before changing files. Do not reset, force-push, or discard existing work. Do not commit `.env`.
- Where work belongs to another project vertical, inspect their existing code and reuse their contracts. Do not invent endpoints or duplicate their service/model architecture. If an item truly requires a missing teammate API or OAuth permission, implement what can be completed safely and report the exact blocker.

## Start Here: repository reconnaissance

1. Inspect the repository, Git status, project structure, `backend/config/settings.py`, `backend/config/urls.py`, all relevant Django apps, `backend/requirements.txt`, `.gitignore` files, `frontend/package.json`, and relevant `frontend/src` pages/components/API clients.
2. Inspect existing BE1 Google OAuth/token-storage code, BE2 Sheets/Automation/Tasks code, FS2 Calendar code, and FS3 Drive code before deciding on changes.
3. Confirm which pages are using live APIs, mock data, `localStorage`, static arrays, or hard-coded KPI values.
4. Verify the current Google OAuth configuration. Previous testing showed `/api/google/connect/` returned an authorization URL that did not contain `redirect_uri`; `GOOGLE_REDIRECT_URI` was `None` from Python even after a `backend/.env` file was created. Check whether this is already fixed. Do not assume.
5. Write a short internal inventory of defects and the actual files to modify, then proceed without waiting for approval unless a destructive or credential-related choice is unavoidable.

---

## P0 - Stop fake/static data from appearing as real data

### Problems reported

- The dashboard schedule and pending-task list are static or seeded on initial load.
- Pending tasks may be saved, but reloading shows the original hard-coded examples instead of the true persisted tasks.
- Automation Workflows and Recent Audit Activity show records even though no corresponding automations/audits have been configured/generated.
- Google Sheets screens show example financial data rather than the selected user's actual spreadsheet contents.
- The Tasks page is not consistently synchronized with the dashboard and Google Tasks.
- The Drive explorer seems to show recently opened files rather than the user's complete actual Drive files/folders.

### Required behaviour

1. Remove hard-coded production data arrays and initial seeded records from all affected pages and widgets.
2. Fetch real data from the appropriate backend/API on initial mount and whenever the user changes the relevant filter, spreadsheet, worksheet, or date range.
3. Use explicit UI states for:
   - loading;
   - successful data with records;
   - successful but empty data;
   - authentication/authorization failure;
   - Google not connected/consent required;
   - API/network/server failure.
4. If the API returns an error, display a human-readable state/action. Do not replace the error with example data.
5. If the API is unavailable, use a clearly labelled unavailable/placeholder state, not fake “live” records.
6. Keep test fixtures separate from production data paths.
7. Add regression tests proving that reloads show persisted database/API data rather than default demo records.

**Acceptance criteria:** With no Google events, tasks, automations, or audit events in the account, the UI shows empty states—not invented items. After creating records, refreshing the page retrieves those actual records from the backend/provider.

---

## P0 - Fix Google OAuth and verify real Google API access

### Required work

1. Inspect `backend/config/settings.py`, the location and loader for `backend/.env`, and `backend/google_auth/services.py` / `views.py`.
2. Ensure `GOOGLE_REDIRECT_URI` is loaded by Django and available to `get_flow()`.
3. Verify the generated authorization URL contains `redirect_uri` and matches the callback URL registered in Google Cloud Console.
4. Complete the OAuth callback and confirm a `GoogleCredential` record is stored for the authenticated application user.
5. Confirm token encryption/refresh uses the existing BE1 service. Do not add a second token-storage system.
6. Verify `get_google_client(user)` can be used by Calendar, Tasks (if syncing with Google Tasks), Sheets, and Drive.
7. Confirm error responses are structured JSON and do not expose tokens or raw tracebacks.
8. If the extra Google Tasks API scope is needed, inspect the current OAuth scope list and official API requirements; add the minimum appropriate scope and make the app handle the required renewed-consent flow. Do not silently assume existing Calendar scope grants Tasks access.

**Acceptance criteria:** A real authorized test account completes connect/callback, the credential is stored, and downstream Google API calls succeed. If this is blocked by missing local Google credentials or Google Cloud Console configuration, report the exact blocker instead of claiming success.

---

## P0 - Tasks: backend persistence and Google Tasks synchronization

### Problems reported

- Tasks created from one page may show on the dashboard but not on the Tasks page.
- Reloading can restore the initial static task list rather than real persisted records.
- Tasks do not sync with the Google Tasks API.
- The dashboard/task page relationship is inconsistent.

### Backend contract

Implement or repair the existing `/api/tasks/` app/API. The GWCC task model must include:

- `title`
- `description`
- `due_date`
- `status`
- `created_by_automation` (nullable relationship to the actual existing automation model)

Use the existing project ownership/authentication pattern so users cannot read or mutate another user's tasks. Inspect BE2's actual automation model before defining the nullable FK. Do not invent or duplicate an Automation model.

Basic endpoints:

- `GET /api/tasks/`
- `POST /api/tasks/`
- `GET /api/tasks/<id>/` if detail is used by the frontend
- `PATCH /api/tasks/<id>/`
- `DELETE /api/tasks/<id>/`

Add serializers, validation, URLs, migrations, relevant admin registration, and tests. Keep all task data in the configured PostgreSQL database through Django ORM.

### Google Tasks integration

1. Inspect current OAuth scopes, Google Tasks API enablement/configuration, and current service patterns. Reuse BE1's `get_google_client(user)`.
2. Implement a service layer for Google Tasks operations; do not call Google APIs directly from React.
3. Establish an explicit mapping between internal tasks and Google Tasks records. Add nullable external ID / sync metadata fields only as needed to make synchronization reliable; preserve all required model fields above and keep automation-created tasks supported.
4. Define and implement the intended sync direction(s). Minimum required UX based on the report: a task created/edited/completed/deleted in GWCC must not appear only in local storage. It must persist to the backend and sync to Google Tasks when Google Tasks integration is enabled. If Google-to-GWCC reads are in scope, fetch actual Google Tasks lists/tasks and merge them without duplicating records.
5. Handle duplicate prevention, API failures, authorization errors, retries where applicable, and partial sync state. Do not claim sync succeeded if Google API mutation failed.
6. When a task is scheduled on Google Calendar, represent that as a distinct Calendar event linked to the task; do not treat a Google Task as if it were automatically a Calendar event. Keep the provider IDs to support updating/deleting the linked record without duplicates.
7. If Google Tasks API scope/enablement is missing, provide a clear connection/setup state. Do not silently downgrade to localStorage.

### Frontend Tasks and dashboard synchronization

- Remove the production localStorage/mock adapter.
- Use the real API client for list/create/update/complete/delete.
- Make the Tasks page and dashboard consume the same backend/provider-backed task data contract.
- After a mutation, update or invalidate/refetch all affected views so Dashboard and Tasks show consistent results.
- On hard refresh, retrieve records from the backend/API.
- Use correct loading, empty, disconnected, permission-denied, and error states.

**Acceptance criteria:** Create a task on the Tasks page, confirm it appears on the Dashboard and after a browser refresh, confirm it exists in PostgreSQL, and confirm the corresponding Google Tasks operation succeeded when Google Tasks is connected. Test update, completion, and delete. Test the reverse/provider read path if implemented.

---

## P0 - Calendar page and dashboard schedule must share real, consistent data

### Problems reported

- The dashboard shows event names but omits their dates (only the time is shown).
- The dashboard shows events, but the Calendar page does not show them correctly.
- Calendar schedule data is static/not sourced consistently from Google.
- Creating a task/schedule in the app does not create/update the corresponding Google Calendar event.

### Required work

1. Make the Calendar page and Dashboard use the same real Calendar API/service data source and event mapping. Avoid separate incompatible mock datasets.
2. Verify the backend Calendar endpoints and service for list/detail/create/update/delete, date-range filters, reminder extraction, conference/meeting links, and analytics.
3. Display both date and time in the dashboard's schedule items (use the user's effective timezone and an unambiguous date format).
4. Ensure month, week, and agenda views render events on the correct day and time. Check timezone conversion, all-day events, start/end dates, and Google event dateTime vs. date payloads.
5. Ensure the selected calendar view/date range requests the correct backend range. Do not fetch one range and render it on a different month/week.
6. When app actions create or modify a Calendar schedule, call the real Calendar endpoint and persist the change to Google Calendar. Keep Google event IDs for updates/deletes.
7. Where internal tasks are linked to scheduled Calendar events, maintain the link and avoid duplicate Calendar events during retries or repeated submissions.
8. Preserve existing Google Calendar reminder data and `hangoutLink` / `conferenceData` extraction. Only implement new Meet conference creation if the UI flow actually requests it; passing `conferenceDataVersion=1` alone does not create a meeting link.
9. Fix structured Calendar error handling so unauthenticated requests, missing credentials, event-not-found errors, quota/rate-limit failures, and provider failures return helpful JSON with sensible HTTP statuses. No raw exceptions or `[object Object]` messages.
10. Check conflict detection against the actual events in the current date/time range rather than static seed data.

**Acceptance criteria:** The same real event appears on Dashboard and Calendar on the same date/time. Create/edit/delete operations propagate to Google Calendar. The dashboard always displays the event date as well as time. No static schedule items appear when the Google Calendar has no events.

---

## P1 - Google Sheets Analytics: replace static financial demo with a generic live spreadsheet viewer

### Problems reported

- The Sheets page contains static, fabricated financial/KPI data.
- The lower worksheet records table is also hard-coded.
- The page does not offer a generic way to represent the user's actual spreadsheet structures.

### Required work

1. Inspect BE2's current Sheets service, serializers, URLs, and actual API response contracts. Do not assume undocumented endpoints such as `/metadata/` exist.
2. Fetch the current user's spreadsheet list from the implemented `/api/sheets/` API.
3. Provide a spreadsheet picker and worksheet/tab picker using live metadata.
4. Read actual values for the selected spreadsheet/range/worksheet through the existing backend endpoints.
5. Render a generic table that adapts to the selected sheet's header row and column count. Do not hard-code “vendor payable”, “invoice status”, or other single-example columns.
6. Provide search/filter where feasible based on the actual returned rows.
7. Compute metrics/charts from the selected sheet's real values. Infer chart/metric types conservatively; if the data shape cannot support a chart, show a helpful empty/unsupported-data message rather than fabricated values.
8. When the spreadsheet or worksheet changes, update the data, metrics, and charts.
9. Add refresh/loading/empty/permission-denied/Google-not-connected/error states.
10. Remove localStorage/static demo fallbacks from the live flow. Ensure a fetch failure does not leave stale sample numbers presented as current.
11. Do not write to a sheet unless the product already explicitly offers a write action; this page is intended to be read-only analytics.

**Acceptance criteria:** Select two different real spreadsheets/tabs with different columns and verify the table, metrics, and charts change based on each sheet's values. With no spreadsheets, the page shows an honest empty state.

---

## P1 - Dashboard: real KPIs, honest activity widgets, configurable widgets

### Problems reported

- Automation Workflows is populated despite no automations being configured.
- Recent Audit Activity has fake records.
- Calendar and pending tasks are static/inconsistent.
- The user requests a `+` control for dashboard sections/widgets to add items to the actual dashboard.

### Required work

1. Connect each KPI/widget to its real endpoint where it exists: Calendar events/analytics, Tasks, Sheets, Gmail, Drive, Automation, Notifications, and Audit.
2. Remove seeded KPI values such as fixed unread counts, scheduled meeting counts, document counts, and action-item counts unless they are real API responses.
3. For Automation Workflows and Recent Audit Activity, fetch from the actual APIs. If no automations/audits exist, show an empty state such as “No automation workflows yet” / “No recent activity”. Do not invent histories.
4. Fix Pending Tasks so it is derived from the same data source and status contract as the Tasks page. Refresh/refetch or invalidate shared data after mutations.
5. Display event dates and times in schedule cards.
6. Add an “Add widget” (`+`) mechanism to the dashboard that allows the user to add supported widgets to their dashboard. The control must have a real behavior, not be decorative. Persist user widget preferences using the existing user/settings/backend approach if one exists; otherwise use local UI preference persistence only for widget layout, never as a substitute for workspace business data. Provide remove/hide and sensible duplicate prevention if the existing UI pattern supports it.
7. Ensure adding a widget does not create business records or fake API data; it changes only the dashboard layout/configuration.
8. Add loading/empty/error states per widget so one unavailable service does not falsely indicate successful zero data for every module.

**Acceptance criteria:** With no data, workflow/audit widgets are empty. With actual events/tasks, the dashboard matches their counts and records. Adding/removing a widget visibly changes the dashboard and the layout is restored according to the chosen persistence strategy after refresh.

---

## P1 - Shared app shell: consistent navigation, profile, and authentication controls

### Problems reported

- Automation, History, and Audit Log pages do not use the same heading/navigation shell as other pages.
- There is no proper profile menu or login/logout functionality in the visible app shell; a static “Y” avatar is shown.
- Clicking the GWCC logo/top-left returns to the home route instead of the Dashboard.

### Required work

1. Identify the canonical shared layout/header/navigation component and use it consistently on Dashboard, Calendar, Tasks, Drive, Sheets, Automation, History, and Audit Log.
2. Match page title/heading, spacing, navigation, and active-route styling across pages without redesigning the current visual language.
3. Replace the hard-coded “Y” avatar with a profile button/menu tied to the authenticated user where available.
4. Provide clear login/logout controls based on the existing JWT auth implementation. On logout, use the existing logout endpoint/refresh-token blacklist flow if implemented, clear client auth state, and route to login. Do not expose tokens in the UI.
5. Fix the brand/logo click to navigate to the canonical Dashboard route—not an unrelated home page or stale route.
6. Test deep-link refresh and navigation on all affected routes.

**Acceptance criteria:** All pages share the same shell. Logo opens Dashboard. User sees a working profile/auth menu and can log out. Refreshing a deep link does not break routing.

---

## P1 - Drive explorer: show actual Drive contents, not only recently opened files

> This issue is recorded in the supplied defect report but belongs primarily to FS3's Drive vertical. Inspect and coordinate with the existing Drive implementation; do not duplicate or replace FS3's service/API architecture.

### Problem reported

Drive returns data, but the UI appears to show only recently opened files rather than the user's actual files and folders.

### Required work

1. Inspect the existing Drive API query and determine whether it is explicitly filtering to recent/opened items.
2. Use the real Google Drive listing endpoint/service with correct `files.list` query/fields, pagination, trashed-file exclusion, and folder navigation.
3. Show actual files and folders in the current folder/My Drive view, not just recently opened items. Keep “Recent” as a distinct view if the product supports it.
4. Preserve folder IDs and use them to navigate into folders and back to the parent/root.
5. Display valid names, MIME/file types, modified times, and sizes when returned. Handle empty folders and pagination.
6. Use the existing BE1 credential helper and existing DriveService/API; do not add raw token handling in the frontend.
7. If this depends on FS3-owned APIs or implementation, make the compatible fix in the existing code and report the file/API contract changed.

**Acceptance criteria:** Open Drive and see actual files/folders. Navigate into a folder and back. Results are not limited to recently opened documents.

---

## P2 - Cross-page data consistency and UX

1. Use shared API clients and shared types for Calendar, Tasks, and Sheets rather than duplicating incompatible field mappings in each page.
2. Ensure mutation success updates all affected views or triggers a reliable refetch:
   - task changes update Tasks and Dashboard;
   - event changes update Calendar and Dashboard;
   - spreadsheet/tab changes update the Sheets table, metrics, and charts.
3. Give each data widget/page a refresh option only if supported by the existing design, and ensure it refetches the backend rather than reloading sample data.
4. Avoid flashing static records before live data loads.
5. Keep the UI responsive and preserve the current visual system.
6. Add user-readable error messages and retry actions where safe.

---

## Verification and acceptance test plan

### Backend

From `backend/`, using the project's configured environment:

- `python manage.py check`
- `python manage.py showmigrations`
- `python manage.py makemigrations --check --dry-run` (after migrations have been created and committed as appropriate)
- `python manage.py migrate`
- Run the existing backend test suite and add tests for changed paths.

Test authenticated APIs with a valid JWT and negative cases with no JWT/insufficient authorization. Do not print tokens.

### Frontend

From `frontend/`:

- `npm run build`
- Run available lint/tests if defined in `package.json`.
- Inspect browser console/network requests for errors.

### Manual end-to-end flows

1. Log in.
2. Connect Google Workspace and complete OAuth.
3. Confirm Calendar events load from Google.
4. Create an event; confirm it appears in Google Calendar, the Calendar page, and Dashboard.
5. Edit and delete an event; confirm changes propagate.
6. Confirm dates and times render correctly in every Calendar/Dashboard view.
7. Create a task; confirm it persists in PostgreSQL and appears on Tasks + Dashboard after refresh.
8. If Google Tasks is enabled, confirm the task sync operation in Google Tasks and verify update/completion/delete behaviour.
9. Change a spreadsheet and worksheet; confirm table, metrics, and charts reflect live values.
10. Confirm empty automation and audit states contain no invented records.
11. Add and remove a dashboard widget; confirm the setting persists according to implementation.
12. Use logo navigation, profile menu, login/logout, and deep links.
13. Browse Drive files and folders, not just recent files.
14. Verify auth/provider errors appear as honest human-readable errors, not static fallback data.

### Test data safety

- Use a clearly identified test event/task and delete it after successful verification where appropriate.
- Do not delete existing user data during QA.
- Never log credentials, OAuth codes, access/refresh tokens, JWTs, or secrets.

---

## Definition of done

Do not declare this complete just because the build passes. Mark each item **PASS / FAIL / BLOCKED**, with evidence:

- OAuth connect/callback and credential access
- Calendar backend + frontend use the same live events
- Calendar create/edit/delete propagate to Google
- Dates/times, attendees, reminders, meeting links, analytics work where provider data exists
- Dashboard widgets display actual data and honest empty states
- Dashboard widget add/remove behaviour works
- Sheets Analytics renders arbitrary real spreadsheet tabs/data, without hard-coded business data
- Tasks persist in PostgreSQL and appear consistently on Tasks and Dashboard
- Google Tasks synchronization works if configured; otherwise the exact external blocker is documented
- Shared navigation, logo destination, profile, login/logout are consistent
- Drive lists real files/folders and supports folder navigation
- Backend checks/tests pass
- Frontend production build passes
- No `.env` or secret/token is committed
- No regression or untracked accidental files remain

## Final report expected from the coding agent

Return a concise table with columns:

`Issue | Root cause | Files changed | Verification | Status`

Then list:

1. Anything fixed.
2. The exact tests/commands run and results.
3. Anything still failing or blocked by external Google configuration / teammate APIs.
4. Any required one-time manual steps, including Google consent/re-consent if new scopes were added.
5. Git status and commit hash(es), if commits were created.

Do not claim external Google sync succeeded unless a real request with an authorized test account verified it.
