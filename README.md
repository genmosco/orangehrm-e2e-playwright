# OrangeHRM E2E Playwright Test Suite

End-to-end UI tests for the [OrangeHRM open-source demo](https://opensource-demo.orangehrmlive.com), written in JavaScript with [Playwright](https://playwright.dev/).

![Playwright E2E tests](../../actions/workflows/playwright.yml/badge.svg)

## Test coverage

| Module            | File                        | Test cases                   | Count |
|-------------------|-----------------------------|------------------------------|------:|
| Authentication    | `tests/auth.spec.js`        | TC-AUTH-01 to TC-AUTH-05     | 5 |
| Dashboard         | `tests/dashboard.spec.js`   | TC-DASH-01 to TC-DASH-03     | 3 |
| PIM / Employees   | `tests/pim.spec.js`         | TC-PIM-01 to TC-PIM-08       | 8 |
| Leave             | `tests/leave.spec.js`       | TC-LEAVE-01 to TC-LEAVE-05   | 5 |
| Recruitment       | `tests/recruitment.spec.js` | TC-REC-01 to TC-REC-07       | 7 |
| Performance       | `tests/performance.spec.js` | TC-PERF-01 to TC-PERF-06     | 6 |
| Admin             | `tests/admin.spec.js`       | TC-ADM-01 to TC-ADM-08       | 8 |
| My Info           | `tests/myinfo.spec.js`      | TC-INFO-01 to TC-INFO-05     | 5 |
| Directory & Buzz  | `tests/directory.spec.js`   | TC-DIR-01 to TC-DIR-04, TC-BUZZ-01 to TC-BUZZ-03 | 7 |
| Time & Attendance | `tests/time.spec.js`        | TC-TIME-01 to TC-TIME-05     | 5 |

**Total: 59 test cases**, plus a one-time login setup step.

Highlights include adding an employee end to end, assigning leave (handling both the success and the insufficient-balance confirmation paths), form validation on several modules, search and reset filters, and navigating OrangeHRM's click-to-open dropdown menus.

## Getting started

### Prerequisites
- [Node.js](https://nodejs.org/) 18 or later

### Install

```bash
npm install
npx playwright install chromium
```

### Run

```bash
npm test                 # all tests, headless
npm run test:headed      # watch the browser
npm run test:ui          # Playwright's interactive UI mode
npm run test:report      # open the last HTML report
```

### Run one module

```bash
npm run test:auth
npm run test:dashboard
npm run test:pim
npm run test:leave
npm run test:recruitment
npm run test:performance
npm run test:admin
npm run test:myinfo
npm run test:directory
npm run test:time
```

## Project structure

```
orangehrm-e2e/
├── .github/workflows/playwright.yml   # CI: runs the suite and uploads the report
├── tests/
│   ├── auth.setup.js        # Logs in once and saves the session
│   ├── auth.spec.js         # Login, invalid login, validation, forgot password, logout
│   ├── dashboard.spec.js    # Sidebar, header, user menu
│   ├── pim.spec.js          # Employee list, add employee, search, profile tabs
│   ├── leave.spec.js        # Assign leave, validation, entitlements, date filter
│   ├── recruitment.spec.js  # Vacancies and candidates
│   ├── performance.spec.js  # Reviews, KPIs, My Reviews
│   ├── admin.spec.js        # System users, job titles, pay grades, locations
│   ├── myinfo.spec.js       # Personal details, contact/emergency tabs, change password
│   ├── directory.spec.js    # Employee directory and Buzz feed
│   └── time.spec.js         # Timesheets, punch in/out, attendance records
├── utils/
│   ├── constants.js         # Routes, demo credentials, test data
│   └── helpers.js           # Shared page-ready waits and UI helpers
├── playwright.config.js
└── package.json
```

## Configuration

Set in `playwright.config.js`:

| Setting     | Value |
|-------------|-------|
| Base URL    | `https://opensource-demo.orangehrmlive.com` |
| Browser     | Chromium (Desktop Chrome) |
| Workers     | 1 (tests run one at a time on the shared demo) |
| Timeouts    | 150s per test, 15s per assertion and action, 60s per navigation (retried once if the site stalls) |
| Retries     | 1 locally, 2 in CI |
| Reports     | List and HTML (plus GitHub annotations in CI) |
| On failure  | Screenshot and video kept; trace recorded on the first retry |

## Continuous integration

`.github/workflows/playwright.yml` runs the suite on every push to `main`, on pull requests, on demand, and weekly on Mondays. The weekly run catches changes to the public demo site even when the code hasn't changed. The HTML report, with screenshots, video and traces for any failures, is uploaded as a build artifact.

## Credentials

The tests use the public demo credentials that OrangeHRM publishes on its login page:

| Role  | Username | Password |
|-------|----------|----------|
| Admin | Admin    | admin123 |

## Design decisions

- **Log in once.** `auth.setup.js` logs in and saves the browser session; every other test reuses it. The authentication tests start from a clean session instead.
- **Wait for the page, not the network.** Tests never wait for `networkidle`, which is slow and unreliable on the shared demo. `openPage()` and `waitForPageReady()` wait for the page header to render and for OrangeHRM's loading spinner to disappear, and assertions wait for the specific element they check.
- **Selectors that match one element.** Playwright fails a check when a selector matches several elements (strict mode), so each assertion targets a single, specific element.
- **Dropdown menus are clicked, not hovered.** Top-bar items such as *Performance › Configure* and *Leave › Entitlements* open on click, and their items only exist once open. `openTopNavItem()` handles this.
- **Locale-aware dates.** The demo currently shows dates as `yyyy-dd-mm`. `fillDateInput()` reads the format from the field's placeholder, so tests keep working if the site's date format changes.
- **Shared, changing data.** The demo resets and is used by many people at once, so searches accept either results or "No Records Found", new records use unique IDs, and the leave test looks for an employee and leave type that currently have at least one day of balance (leave can only be assigned against an entitlement). It also books leave on working days a month ahead, skipping the Christmas period, and moves a week later if the site reports "No Working Days Selected" (holidays on the shared demo can change).
- **Sequential runs.** `workers: 1` avoids tests interfering with each other on the shared site.
