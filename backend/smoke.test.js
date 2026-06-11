import { test } from 'node:test';
import assert from 'node:assert/strict';
import PendingRegistration from './src/models/PendingRegistration.js';

test('backend smoke test runs', () => {
  assert.ok(true);
});

test('pending registration can generate an OTP before validation', async () => {
  const pendingUser = new PendingRegistration({
    name: 'Test User',
    username: 'test_user',
    email: 'test@example.com',
    password: 'Password1!',
  });

  const otp = pendingUser.generateOtp();
  await pendingUser.validate();

  assert.match(otp, /^\d{6}$/);
  assert.equal(typeof pendingUser.otpToken, 'string');
});
