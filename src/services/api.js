export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error || `Request failed with status ${response.status}.`,
      payload?.details,
    );
  }
  return payload;
}

const json = (method, body) => ({ method, body });

export const api = {
  auth: {
    me: () => request('/auth/me'),
    login: (body) => request('/auth/login', json('POST', body)),
    logout: () => request('/auth/logout', json('POST', {})),
    register: (body) => request('/auth/register', json('POST', body)),
  },
  products: {
    list: (params = {}) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
      }
      return request(`/products${query.size ? `?${query}` : ''}`);
    },
    get: (id) => request(`/products/${encodeURIComponent(id)}`),
    categories: () => request('/categories'),
  },
  cart: {
    get: () => request('/cart'),
    clear: () => request('/cart', { method: 'DELETE' }),
    add: (body) => request('/cart/items', json('POST', body)),
    update: (productId, body) => request(`/cart/items/${encodeURIComponent(productId)}`, json('PATCH', body)),
    remove: (productId) => request(`/cart/items/${encodeURIComponent(productId)}`, { method: 'DELETE' }),
    applyCoupon: (body) => request('/cart/coupon', json('POST', body)),
    removeCoupon: () => request('/cart/coupon', { method: 'DELETE' }),
  },
  addresses: {
    list: () => request('/addresses'),
    add: (body) => request('/addresses', json('POST', body)),
  },
  checkout: {
    place: (body) => request('/checkout', json('POST', body)),
  },
  orders: {
    list: () => request('/orders'),
    get: (id) => request(`/orders/${encodeURIComponent(id)}`),
    updateStatus: (id, status) => request(`/orders/${encodeURIComponent(id)}/status`, json('PATCH', { status })),
    invoice: (id) => request(`/orders/${encodeURIComponent(id)}/invoice`),
  },
  payments: {
    completeMock: (body) => request('/payments/mock/complete', json('POST', body)),
  },
};
