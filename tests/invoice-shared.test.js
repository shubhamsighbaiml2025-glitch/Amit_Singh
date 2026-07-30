import test from 'node:test';
import assert from 'node:assert/strict';
import { appOrigin, buildVerifyUrl, serializeInvoiceForResponse } from '../api/_invoice-shared.js';

test('buildVerifyUrl encodes token and keeps origin clean', () => {
  assert.equal(buildVerifyUrl('https://example.com/', 'abc 123'), 'https://example.com/verify?token=abc%20123');
});

test('serializeInvoiceForResponse converts Firestore-style values', () => {
  const invoice = {
    id: 'inv-1',
    createdAt: { toDate: () => new Date('2026-07-30T00:00:00.000Z') },
    services: [{ name: 'Repair' }],
  };

  const serialized = serializeInvoiceForResponse(invoice);
  assert.equal(serialized.createdAt, '2026-07-30T00:00:00.000Z');
  assert.deepEqual(serialized.services, [{ name: 'Repair' }]);
});

test('appOrigin uses forwarded headers when present', () => {
  const req = {
    headers: {
      host: 'example.com',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'invoice.example.com',
    },
  };

  assert.equal(appOrigin(req), 'https://invoice.example.com');
});
