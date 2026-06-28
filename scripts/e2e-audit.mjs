/**
 * Production readiness E2E audit script.
 * Usage: node scripts/e2e-audit.mjs
 * Requires backend running with valid env + migrated database.
 */
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(
  join(dirname(fileURLToPath(import.meta.url)), '../frontend/package.json'),
);
const { io } = require('socket.io-client');

const API_URL = process.env.AUDIT_API_URL ?? 'http://127.0.0.1:10000/api';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');
const email = `audit-${Date.now()}@example.com`;
const password = 'password123';

const results = [];

function pass(name) {
  results.push({ name, ok: true });
  console.log(`PASS ${name}`);
}

function fail(name, error) {
  results.push({ name, ok: false, error: String(error) });
  console.error(`FAIL ${name}:`, error);
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
      ...(options.headers ?? {}),
    },
    method: options.method ?? 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${JSON.stringify(data)}`);
  }

  return data;
}

async function waitForSocketEvent(socket, event, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${event}`));
    }, timeoutMs);

    socket.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });
}

async function main() {
  let token;
  let userId;
  let taskId;

  try {
    const health = await request('/health');
    if (health.status !== 'ok') throw new Error('unexpected health payload');
    pass('health endpoint');
  } catch (error) {
    fail('health endpoint', error);
  }

  try {
    const auth = await request('/auth/register', {
      method: 'POST',
      body: { email, password, name: 'Audit User' },
    });
    token = auth.accessToken;
    userId = auth.user.id;
    if (!token || !userId) throw new Error('missing auth response fields');
    pass('register');
  } catch (error) {
    fail('register', error);
  }

  try {
    const auth = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    if (!auth.accessToken) throw new Error('missing token');
    pass('login');
  } catch (error) {
    fail('login', error);
  }

  if (!token || !userId) {
    console.error('\nCannot continue without auth.');
    process.exit(1);
  }

  const socket = io(SOCKET_URL, {
    auth: { userId },
    transports: ['websocket', 'polling'],
  });

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('socket connect timeout')), 5000);
    socket.on('connect', () => {
      clearTimeout(timer);
      resolve(undefined);
    });
    socket.on('connect_error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });

  try {
    const createdPromise = waitForSocketEvent(socket, 'task:created');
    const task = await request('/tasks', {
      method: 'POST',
      token,
      body: { title: 'Audit task', description: 'E2E', status: 'PENDING' },
    });
    taskId = task.id;
    const socketTask = await createdPromise;
    if (socketTask.id !== taskId) throw new Error('socket task mismatch');
    pass('create task + socket created');
  } catch (error) {
    fail('create task + socket created', error);
  }

  try {
    const updatedPromise = waitForSocketEvent(socket, 'task:updated');
    const task = await request(`/tasks/${taskId}`, {
      method: 'PATCH',
      token,
      body: { status: 'IN_PROGRESS' },
    });
    const socketTask = await updatedPromise;
    if (task.status !== 'IN_PROGRESS' || socketTask.status !== 'IN_PROGRESS') {
      throw new Error('update mismatch');
    }
    pass('update task + socket updated');
  } catch (error) {
    fail('update task + socket updated', error);
  }

  try {
    const deletedPromise = waitForSocketEvent(socket, 'task:deleted');
    await request(`/tasks/${taskId}`, { method: 'DELETE', token });
    const payload = await deletedPromise;
    if (payload.id !== taskId) throw new Error('delete payload mismatch');
    pass('delete task + socket deleted');
  } catch (error) {
    fail('delete task + socket deleted', error);
  }

  socket.disconnect();

  const failed = results.filter((item) => !item.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  process.exit(failed.length === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
