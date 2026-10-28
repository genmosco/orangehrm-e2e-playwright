// tests/auth.setup.js
// Logs in once as Admin and saves the session, so every other test starts logged in.

const { test: setup } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const { CREDENTIALS } = require('../utils/constants');
const { login } = require('../utils/helpers');

const AUTH_FILE = path.join(__dirname, '../playwright/.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  await login(page, CREDENTIALS.admin.username, CREDENTIALS.admin.password);
  await page.context().storageState({ path: AUTH_FILE });
});
