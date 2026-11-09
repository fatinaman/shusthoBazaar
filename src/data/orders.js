const ORDERS_KEY = 'shusthobazaar_orders';

function readOrders() {
  try {
    const orders = JSON.parse(window.localStorage.getItem(ORDERS_KEY) || '[]');
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error('Unable to read saved orders.', error);
    throw new Error('Your saved orders could not be read. Clear site data and try again.', { cause: error });
  }
}

export function createDemoOrder(checkout, payment = {}) {
  const id = `SB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const createdAt = new Date().toISOString();
  const order = {
    id,
    customer: checkout.customer.name,
    customerEmail: checkout.customer.email,
    address: checkout.address,
    items: checkout.items,
    subtotal: checkout.subtotal,
    shippingFee: checkout.shippingFee,
    total: checkout.total,
    paymentMethod: payment.method || checkout.paymentMethod,
    paymentStatus: payment.status || 'Pending',
    paymentReference: payment.reference || null,
    status: 'Placed',
    orderStatus: 'Placed',
    createdAt,
    prescriptionUploaded: Boolean(checkout.prescriptionName),
    prescriptionName: checkout.prescriptionName || null,
  };

  const updatedOrders = [order, ...readOrders()];
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
  return order;
}

export function getDemoOrders() {
  return readOrders();
}

export function updateDemoOrderStatus(id, status) {
  const orders = readOrders();
  const order = orders.find((entry) => entry.id === id);
  if (!order) return null;

  const updatedOrder = { ...order, status, orderStatus: status };
  window.localStorage.setItem(
    ORDERS_KEY,
    JSON.stringify(orders.map((entry) => entry.id === id ? updatedOrder : entry)),
  );
  return updatedOrder;
}
