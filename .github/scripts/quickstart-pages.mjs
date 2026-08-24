// Copyright 2026 The Radius Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { appendFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

if (process.argv.length !== 7) {
  console.error(
    'usage: node quickstart-pages.mjs LOG TODO_SCREENSHOT ' +
      'DASHBOARD_HOME_SCREENSHOT DASHBOARD_LIST_SCREENSHOT ' +
      'DASHBOARD_RESOURCES_SCREENSHOT',
  );
  process.exit(2);
}

const [
  logPath,
  todoScreenshot,
  dashboardHomeScreenshot,
  dashboardListScreenshot,
  dashboardResourcesScreenshot,
] = process.argv.slice(2);
const deadline = Date.now() + 300_000;

await writeFile(logPath, '');

async function log(message) {
  await appendFile(logPath, `${message}\n`);
}

async function retryUntil(action, description) {
  let lastError;
  while (Date.now() < deadline) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 2_000));
    }
  }
  throw new Error(`${description} did not succeed within five minutes: ${lastError}`);
}

const browser = await chromium.launch({ headless: true });
try {
  const todo = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await retryUntil(
    async () => {
      const response = await todo.goto('http://127.0.0.1:3000', {
        waitUntil: 'domcontentloaded',
        timeout: 10_000,
      });
      if (!response?.ok()) {
        throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
      }
      await todo
        .getByText('No connections defined', { exact: false })
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 });
    },
    'Todo List page',
  );
  await todo.screenshot({ path: todoScreenshot, fullPage: true });
  await log(`TODO_URL=${todo.url()}`);
  await log(`TODO_TITLE=${await todo.title()}`);
  await log('TODO_NO_CONNECTIONS_VISIBLE=true');
  await log(await todo.locator('body').innerText());

  const dashboard = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  await retryUntil(
    async () => {
      const response = await dashboard.goto('http://127.0.0.1:7007', {
        waitUntil: 'domcontentloaded',
        timeout: 10_000,
      });
      if (!response?.ok()) {
        throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
      }
    },
    'Radius Dashboard',
  );
  await dashboard.screenshot({ path: dashboardHomeScreenshot, fullPage: true });
  await log(`DASHBOARD_HOME_URL=${dashboard.url()}`);
  await log(`DASHBOARD_TITLE=${await dashboard.title()}`);

  const applicationsLink = dashboard.locator('a[href="/applications"]').first();
  const guestEntry = dashboard
    .getByRole('button', { name: /enter/i })
    .first();
  await retryUntil(
    async () => {
      if (await applicationsLink.isVisible()) {
        return;
      }
      if (await guestEntry.isVisible()) {
        await log('DASHBOARD_GUEST_ENTRY_VISIBLE=true');
        await guestEntry.click();
        return;
      }
      throw new Error('Neither Guest entry nor Applications navigation is visible');
    },
    'Dashboard entry',
  );
  await applicationsLink.waitFor({ state: 'visible', timeout: 60_000 });
  await applicationsLink.click();
  await dashboard.waitForURL('**/applications', { timeout: 30_000 });

  const todolistLink = dashboard.getByRole('link', {
    name: 'todolist',
    exact: true,
  });
  await retryUntil(
    async () => {
      await dashboard.reload({ waitUntil: 'domcontentloaded', timeout: 10_000 });
      await todolistLink.first().waitFor({ state: 'visible', timeout: 5_000 });
    },
    'todolist entry in the Dashboard Applications view',
  );
  await dashboard.screenshot({ path: dashboardListScreenshot, fullPage: true });
  await log(`DASHBOARD_LIST_URL=${dashboard.url()}`);
  await log(await dashboard.locator('body').innerText());

  await todolistLink.first().click();
  await dashboard.waitForLoadState('domcontentloaded');
  const resourcesTab = dashboard.getByText('Resources', { exact: true }).last();
  await resourcesTab.waitFor({ state: 'visible', timeout: 30_000 });
  await resourcesTab.click();

  await retryUntil(
    async () => {
      await dashboard
        .getByText('demo', { exact: true })
        .first()
        .waitFor({ state: 'visible', timeout: 5_000 });
    },
    'demo resource in the Dashboard Resources view',
  );
  await dashboard.screenshot({
    path: dashboardResourcesScreenshot,
    fullPage: true,
  });
  await log(`DASHBOARD_RESOURCES_URL=${dashboard.url()}`);
  await log(await dashboard.locator('body').innerText());
  await log('DASHBOARD_TODOLIST_VISIBLE=true');
  await log('DASHBOARD_DEMO_VISIBLE=true');
} catch (error) {
  await log(`ERROR=${error.stack ?? error}`);
  throw error;
} finally {
  await browser.close();
}
