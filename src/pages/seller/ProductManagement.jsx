import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/authState';
import { useProducts } from '../../context/productState';

const emptyProduct = {
  id: '',
  name: '',
  generic: '',
  price: '',
  stock: '',
  category: '',
  requiresPrescription: false,
  sellerId: '',
  sellerName: '',
  isAvailable: true,
};
const sellerStores = {
  s001: 'Gulshan Central Pharmacy',
  s002: 'Lazz Pharma Dhanmondi',
  s003: 'Tamanna Pharmacy',
};

export default function ProductManagement() {
  const { user } = useAuth();
  const { products, saveProduct, removeProduct, toggleProductAvailability } = useProducts();
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyProduct);
  const [error, setError] = useState('');
  const visibleProducts = products.filter((product) =>
    user.role === 'admin' || product.sellerId === user.sellerId,
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draft.name.trim() || !draft.generic.trim() || draft.price === '' || draft.stock === '' || !draft.category.trim()) {
      setError('Complete the product name, generic, category, price, and stock fields.');
      return;
    }

    const price = Number(draft.price);
    const stock = Number(draft.stock);
    if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(stock) || stock < 0) {
      setError('Enter a price above zero and a valid non-negative stock amount.');
      return;
    }

    const product = {
      ...draft,
      name: draft.name.trim(),
      generic: draft.generic.trim(),
      category: draft.category.trim(),
      id: draft.id || `p${Date.now()}`,
      price,
      stock,
      sellerId: user.role === 'admin' ? draft.sellerId || 's002' : user.sellerId,
      sellerName: user.storeName || draft.sellerName || sellerStores[draft.sellerId || 's002'],
      image: draft.image || '/images/napa-extra-paracetamol-box-and-tablet-strip.webp',
    };

    saveProduct(product);
    setDraft(emptyProduct);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Inventory</p>
          <h1 className="text-3xl font-bold text-slate-900">Product management</h1>
        </div>
        <button
          onClick={() => {
            setDraft(emptyProduct);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Add product
        </button>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Product name" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
            <input value={draft.generic} onChange={(event) => setDraft({ ...draft, generic: event.target.value })} placeholder="Generic name" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
            <input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder="Category" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
            <input value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} placeholder="Price" type="number" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
            <input value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} placeholder="Stock" type="number" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
            <input value={draft.image || ''} onChange={(event) => setDraft({ ...draft, image: event.target.value })} placeholder="Image path (optional)" className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
            {user.role === 'admin' && (
              <select value={draft.sellerId || 's002'} onChange={(event) => setDraft({ ...draft, sellerId: event.target.value, sellerName: sellerStores[event.target.value] })} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-teal-600">
                {Object.entries(sellerStores).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
              </select>
            )}
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
              <input type="checkbox" checked={draft.requiresPrescription} onChange={(event) => setDraft({ ...draft, requiresPrescription: event.target.checked })} />
              Requires prescription
            </label>
            <div className="md:col-span-2 flex justify-end gap-3">
              {error && <p role="alert" className="mr-auto self-center text-sm text-rose-700">{error}</p>}
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
              <button type="submit" className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">Save product</button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-[10px] uppercase tracking-[0.18em] text-slate-400">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <p className="font-semibold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.generic}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{product.category}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">৳{product.price}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleProductAvailability(product.id)}
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      product.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}
                    >
                      {product.isAvailable ? 'Available' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setDraft(product);
                          setShowForm(true);
                        }}
                        className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => removeProduct(product.id)} className="rounded-lg bg-rose-50 p-2 text-rose-600 hover:bg-rose-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
