import { cookies } from 'next/headers';

const ADDRESSES_COOKIE = 'apex_user_addresses';
const ORDERS_COOKIE = 'apex_recent_orders';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export interface UserAddress {
  id: string;
  userId: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  instructions?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Reads user addresses stored in HTTP-only cookie.
 */
export async function getCookieAddresses(userId: string): Promise<UserAddress[]> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ADDRESSES_COOKIE);
    if (!cookie?.value) return [];

    const raw = decodeURIComponent(cookie.value);
    const list = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')) as UserAddress[];
    if (!Array.isArray(list)) return [];
    return list.filter((a) => a.userId === userId);
  } catch {
    return [];
  }
}

/**
 * Saves or updates an address in the cookie storage.
 */
export async function saveCookieAddress(userId: string, address: UserAddress): Promise<void> {
  try {
    const cookieStore = await cookies();
    const existing = await getCookieAddresses(userId);

    let updated: UserAddress[];
    if (address.isDefault) {
      // Unset other defaults
      updated = existing.map((a) => ({ ...a, isDefault: false }));
    } else {
      updated = [...existing];
    }

    const idx = updated.findIndex((a) => a.id === address.id);
    if (idx >= 0) {
      updated[idx] = address;
    } else {
      updated.unshift(address);
    }

    // Keep max 10 addresses
    const trimmed = updated.slice(0, 10);
    const encoded = Buffer.from(JSON.stringify(trimmed)).toString('base64');

    cookieStore.set({
      name: ADDRESSES_COOKIE,
      value: encoded,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  } catch (err) {
    console.warn('[user-storage] Failed to save cookie address:', err);
  }
}

/**
 * Deletes an address from cookie storage.
 */
export async function deleteCookieAddress(userId: string, addressId: string): Promise<void> {
  try {
    const cookieStore = await cookies();
    const existing = await getCookieAddresses(userId);
    const filtered = existing.filter((a) => a.id !== addressId);
    const encoded = Buffer.from(JSON.stringify(filtered)).toString('base64');

    cookieStore.set({
      name: ADDRESSES_COOKIE,
      value: encoded,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  } catch {}
}

/**
 * Retrieves addresses, merging live DB results with cookie fallback.
 */
export async function getUserAddresses(userId: string): Promise<UserAddress[]> {
  const cookieAddrs = await getCookieAddresses(userId);

  try {
    const { prisma } = await import('@/lib/prisma');
    const dbAddrs = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });

    if (dbAddrs && dbAddrs.length > 0) {
      // Merge unique by ID
      const seen = new Set(dbAddrs.map((a) => a.id));
      const combined = [
        ...dbAddrs,
        ...cookieAddrs.filter((a) => !seen.has(a.id)),
      ];
      return combined as unknown as UserAddress[];
    }
  } catch {
    // DB unreachable — fall through to cookie addresses
  }

  return cookieAddrs;
}

/**
 * Saves a new address, attempting DB first and gracefully falling back to cookie.
 */
export async function createUserAddress(
  userId: string,
  data: Omit<UserAddress, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
  userMeta?: { name?: string; email?: string }
): Promise<UserAddress> {
  // 1. Try DB creation
  try {
    const { prisma } = await import('@/lib/prisma');

    // Ensure user record exists in DB to prevent foreign key constraint violations
    await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        name: userMeta?.name || 'Apex Customer',
        email: userMeta?.email || `${userId}@apex.local`,
      },
      update: {},
    }).catch(() => {});

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      }).catch(() => {});
    }

    const created = await prisma.address.create({
      data: {
        userId,
        fullName: data.fullName,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country || 'India',
        phone: data.phone || '',
        isDefault: Boolean(data.isDefault),
        instructions: data.instructions || '',
      },
    });

    const result: UserAddress = {
      id: created.id,
      userId: created.userId,
      fullName: created.fullName,
      street: created.street,
      city: created.city,
      state: created.state,
      zipCode: created.zipCode,
      country: created.country,
      phone: created.phone,
      isDefault: created.isDefault,
      instructions: created.instructions,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };

    // Keep cookie in sync
    await saveCookieAddress(userId, result);
    return result;
  } catch (err: any) {
    console.warn('[createUserAddress] DB write failed, storing in cookie fallback:', err?.message);
  }

  // 2. Fallback: create in cookie
  const fallbackAddress: UserAddress = {
    id: `addr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    fullName: data.fullName,
    street: data.street,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    country: data.country || 'India',
    phone: data.phone || '',
    isDefault: Boolean(data.isDefault),
    instructions: data.instructions || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveCookieAddress(userId, fallbackAddress);
  return fallbackAddress;
}

/**
 * Cookie-based order storage for resilience when DB is down
 */
export async function getCookieOrders(userId: string): Promise<any[]> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(ORDERS_COOKIE);
    if (!cookie?.value) return [];

    const raw = decodeURIComponent(cookie.value);
    const list = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
    if (!Array.isArray(list)) return [];
    return list.filter((o) => o.userId === userId);
  } catch {
    return [];
  }
}

export async function saveCookieOrder(userId: string, order: any): Promise<void> {
  try {
    const cookieStore = await cookies();
    const existing = await getCookieOrders(userId);

    const updated = [order, ...existing.filter((o) => o.id !== order.id && o.orderNumber !== order.orderNumber)];
    const trimmed = updated.slice(0, 10);
    const encoded = Buffer.from(JSON.stringify(trimmed)).toString('base64');

    cookieStore.set({
      name: ORDERS_COOKIE,
      value: encoded,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });
  } catch (err) {
    console.warn('[user-storage] Failed to save cookie order:', err);
  }
}
