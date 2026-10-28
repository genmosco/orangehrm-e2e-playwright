// utils/constants.js
// Central config for URLs, credentials and shared test data

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

// Public demo credentials published by OrangeHRM. Not a secret.
const CREDENTIALS = {
  admin: {
    username: 'Admin',
    password: 'admin123',
  },
};

const ROUTES = {
  login:             '/web/index.php/auth/login',
  dashboard:         '/web/index.php/dashboard/index',
  pim:               '/web/index.php/pim/viewEmployeeList',
  addEmployee:       '/web/index.php/pim/addEmployee',
  leave:             '/web/index.php/leave/viewLeaveList',
  leaveAssign:       '/web/index.php/leave/assignLeave',
  recruitment:       '/web/index.php/recruitment/viewJobVacancy',
  performance:       '/web/index.php/performance/searchEvaluatePerformanceReview',
  admin:             '/web/index.php/admin/viewSystemUsers',
  adminJobTitles:    '/web/index.php/admin/viewJobTitleList',
  adminPayGrades:    '/web/index.php/admin/viewPayGrades',
  adminLocations:    '/web/index.php/admin/viewLocations',
  myInfo:            '/web/index.php/pim/viewMyDetails',
  timesheet:         '/web/index.php/time/viewMyTimesheet',
  punchIn:           '/web/index.php/attendance/punchIn',
  myAttendance:      '/web/index.php/attendance/viewMyAttendanceRecord',
  directory:         '/web/index.php/directory/viewDirectory',
  buzz:              '/web/index.php/buzz/viewBuzz',
};

const toIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/**
 * Two consecutive working days (a Tuesday and Wednesday) at least `daysAhead` days from today,
 * skipping the Christmas / New Year period when most holidays fall.
 * @returns {{ start: string, end: string }}  dates as YYYY-MM-DD
 */
function workingDayPair(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  const inHolidaySeason = () =>
    (d.getMonth() === 11 && d.getDate() >= 20) || (d.getMonth() === 0 && d.getDate() <= 6);
  while (d.getDay() !== 2 || inHolidaySeason()) d.setDate(d.getDate() + 1);
  const end = new Date(d);
  end.setDate(end.getDate() + 1);
  return { start: toIso(d), end: toIso(end) };
}

const TEST_DATA = {
  employee: {
    firstName:  'TestAuto',
    middleName: 'QA',
    lastName:   'Playwright',
    // Employee Id allows 10 characters; the timestamp keeps it unique per run
    employeeId: `AUTO${Date.now().toString().slice(-6)}`,
  },
  leave: {
    firstDaysAhead: 14,   // first date window tried, in days from today
    maxAttempts:    5,    // windows to try if the site reports no working days
    comment:        'Automated test leave request',
  },
  leaveFilter: {
    fromDate: '2024-01-01',
    toDate:   '2024-12-31',
  },
};

module.exports = { BASE_URL, CREDENTIALS, ROUTES, TEST_DATA, workingDayPair };
