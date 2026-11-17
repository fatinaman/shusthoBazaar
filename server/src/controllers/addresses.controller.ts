import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { z } from 'zod';
import { db } from '../../db/index.js';
import { publicAddressId } from '../utils/ids.js';
import { AuthenticatedRequest, Roles } from '../security/auth.guards.js';
import { parseInput } from '../common/validation.js';

const addressSchema = z.object({
  label: z.string().trim().max(40).optional().default('Home'),
  recipient: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20),
  street: z.string().trim().min(3).max(1000),
  area: z.string().trim().max(80).optional().default(''),
  city: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().max(20).optional().default(''),
  latitude: z.coerce.number().min(-90).max(90).optional().default(23.8103),
  longitude: z.coerce.number().min(-180).max(180).optional().default(90.4125),
});

type AddressRow = {
  id: number;
  label: string | null;
  recipient: string;
  phone: string;
  postal_code: string | null;
  address_line: string;
  area: string | null;
  city: string;
  latitude: number;
  longitude: number;
  is_default: number;
};

function listAddresses(userId: number) {
  return db.prepare(`
    SELECT id, label, recipient, phone, postal_code, address_line, area,
           city, latitude, longitude, is_default
    FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC
  `).all(userId).map((row: AddressRow) => ({
    id: publicAddressId(row.id),
    label: row.label || 'Address',
    recipient: row.recipient,
    phone: row.phone,
    street: row.address_line,
    area: row.area || '',
    city: row.city,
    postalCode: row.postal_code || '',
    latitude: row.latitude,
    longitude: row.longitude,
    isDefault: Boolean(row.is_default),
  }));
}

@Roles('customer')
@Controller('addresses')
export class AddressesController {
  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return { addresses: listAddresses(request.auth!.id) };
  }

  @Post()
  create(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const address = parseInput(addressSchema, body);
    const userId = request.auth!.id;
    const count = db.prepare('SELECT COUNT(*) AS count FROM addresses WHERE user_id = ?').get(userId) as { count: number };
    const isDefault = count.count === 0;
    const insert = db.transaction(() => {
      if (isDefault) db.prepare('UPDATE addresses SET is_default = 0 WHERE user_id = ?').run(userId);
      db.prepare(`
        INSERT INTO addresses
          (user_id, label, recipient, phone, postal_code, address_line, area, city, latitude, longitude, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        address.label,
        address.recipient,
        address.phone,
        address.postalCode,
        address.street,
        address.area,
        address.city,
        address.latitude,
        address.longitude,
        isDefault ? 1 : 0,
      );
    });
    insert();
    return { addresses: listAddresses(userId) };
  }
}
