import { db } from '../../db/index.js';

export function getAnalyticsOverview(sellerId?: number | null) {
  const whereSeller = sellerId ? 'WHERE seller_id = ?' : '';
  const params = sellerId ? [sellerId] : [];

  const orderTotals = db
    .prepare(
      `SELECT 
         COUNT(*) AS totalOrders,
         COALESCE(SUM(total_amt), 0) AS totalRevenuePaisa
       FROM orders ${whereSeller}`
    )
    .get(...params) as { totalOrders: number; totalRevenuePaisa: number };

  const dailySales = db
    .prepare(
      `SELECT 
         substr(placed_at, 1, 10) AS date,
         COUNT(*) AS orders,
         ROUND(COALESCE(SUM(total_amt), 0) / 100.0, 2) AS revenue
       FROM orders
       ${whereSeller}
       GROUP BY substr(placed_at, 1, 10)
       ORDER BY date ASC
       LIMIT 30`
    )
    .all(...params);

  const funnelRows = db
    .prepare(
      `SELECT event_type, COUNT(*) AS count
       FROM analytics_events
       ${whereSeller}
       GROUP BY event_type`
    )
    .all(...params) as { event_type: string; count: number }[];

  const funnelMap = Object.fromEntries(funnelRows.map((r) => [r.event_type, r.count]));
  const funnel = [
    { stage: 'Product Views', count: funnelMap['view_product'] || 0 },
    { stage: 'Added to Cart', count: funnelMap['add_to_cart'] || 0 },
    { stage: 'Checkout Started', count: funnelMap['checkout_started'] || 0 },
    { stage: 'Paid Orders', count: funnelMap['payment_success'] || 0 },
  ];

  const topProducts = db
    .prepare(
      `SELECT 
         p.id,
         p.name,
         s.pharmacy_name AS pharmacyName,
         COALESCE(SUM(oi.quantity), 0) AS unitsSold,
         ROUND(COALESCE(SUM(oi.quantity * oi.unit_price), 0) / 100.0, 2) AS revenue
       FROM products p
       JOIN sellers s ON s.id = p.seller_id
       LEFT JOIN order_items oi ON oi.product_id = p.id
       ${sellerId ? 'WHERE p.seller_id = ?' : ''}
       GROUP BY p.id
       ORDER BY unitsSold DESC, p.id ASC
       LIMIT 10`
    )
    .all(...params);

  return {
    totalOrders: orderTotals.totalOrders,
    totalRevenue: Number((orderTotals.totalRevenuePaisa / 100).toFixed(2)),
    dailySales,
    funnel,
    topProducts,
  };
}

export function generateAnalyticsCsv(sellerId?: number | null): string {
  const data = getAnalyticsOverview(sellerId);
  const header = 'Product ID,Product Name,Pharmacy,Units Sold,Revenue (BDT)\n';
  const rows = data.topProducts
    .map((p: any) => `${p.id},"${p.name.replace(/"/g, '""')}","${p.pharmacyName}",${p.unitsSold},${p.revenue}`)
    .join('\n');
  return header + rows;
}