import { db } from '../../db/index.js';
import { publicProductId } from '../utils/ids.js';

const productBaseQuery = `
  SELECT p.id, p.name, p.generic_name, p.description, p.price, p.stock_qty,
         p.requires_prescription, p.is_active, c.name AS category,
         s.id AS seller_id, s.pharmacy_name AS seller_name,
         (SELECT image_url FROM product_images pi
          WHERE pi.product_id = p.id ORDER BY sort_order, id LIMIT 1) AS image
  FROM products p
  JOIN categories c ON c.id = p.category_id
  JOIN sellers s ON s.id = p.seller_id
`;

export function mapProduct(row) {
  return {
    id: publicProductId(row.id),
    name: row.name,
    generic: row.generic_name || '',
    description: row.description || '',
    price: row.price / 100,
    category: row.category,
    stock: row.stock_qty,
    sellerId: `s${String(row.seller_id).padStart(3, '0')}`,
    sellerName: row.seller_name,
    requiresPrescription: Boolean(row.requires_prescription),
    image: row.image || '/images/napa-extra-paracetamol-box-and-tablet-strip.webp',
    isAvailable: Boolean(row.is_active),
  };
}

export function listProducts({ q = '', category = '', page = 1, limit = 100 } = {}) {
  const clauses = ['p.is_active = 1'];
  const parameters = [];
  if (q) {
    clauses.push("(p.name LIKE ? ESCAPE '\\' OR p.generic_name LIKE ? ESCAPE '\\')");
    const search = `%${q.replace(/[\\%_]/g, '\\$&')}%`;
    parameters.push(search, search);
  }
  if (category) {
    clauses.push('(CAST(c.id AS TEXT) = ? OR c.name LIKE ?)');
    parameters.push(category, `%${category}%`);
  }

  const where = clauses.join(' AND ');
  const total = db.prepare(`
    SELECT COUNT(*) AS count FROM products p
    JOIN categories c ON c.id = p.category_id
    WHERE ${where}
  `).get(...parameters).count;
  const rows = db.prepare(`
    ${productBaseQuery}
    WHERE ${where}
    ORDER BY p.id
    LIMIT ? OFFSET ?
  `).all(...parameters, limit, (page - 1) * limit);
  return { products: rows.map(mapProduct), total };
}

export function getProduct(productId) {
  const row = db.prepare(`${productBaseQuery} WHERE p.id = ? AND p.is_active = 1`).get(productId);
  return row ? mapProduct(row) : null;
}

export function listCategories() {
  return db.prepare('SELECT id, name FROM categories ORDER BY name')
    .all()
    .map((category) => ({ id: `c${category.id}`, name: category.name }));
}
