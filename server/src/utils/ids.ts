import { AppError } from '../middleware/errors.js';

function parsePrefixedId(value, prefix, field) {
  const match = new RegExp(`^${prefix}(\\d+)$`, 'i').exec(String(value));
  if (!match) throw new AppError(400, `Invalid ${field}.`);
  const id = Number(match[1]);
  if (!Number.isSafeInteger(id) || id < 1) throw new AppError(400, `Invalid ${field}.`);
  return id;
}

export const parseProductId = (value) => parsePrefixedId(value, 'p', 'product ID');
export const parseAddressId = (value) => parsePrefixedId(value, 'addr-', 'address ID');

export function orderPublicId(id) {
  return `SB-${String(id).padStart(6, '0')}`;
}

export function parseOrderId(value) {
  const match = /^SB-(\d+)$/i.exec(String(value));
  if (!match) throw new AppError(400, 'Invalid order ID.');
  const id = Number(match[1]);
  if (!Number.isSafeInteger(id) || id < 1) throw new AppError(400, 'Invalid order ID.');
  return id;
}

export function publicProductId(id) {
  return `p${String(id).padStart(3, '0')}`;
}

export function publicAddressId(id) {
  return `addr-${id}`;
}
