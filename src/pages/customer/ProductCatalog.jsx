import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/customer/ProductCard';
import { Search, ShieldCheck } from 'lucide-react';
import { useProducts } from '../../context/productState';

export default function ProductCatalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products } = useProducts();
  const searchQuery = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('featured');

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => product.isAvailable && product.stock > 0).filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.generic.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || product.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortOrder === 'price-low') return a.price - b.price;
    if (sortOrder === 'price-high') return b.price - a.price;
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-2xl p-8 text-white mb-8 shadow-md">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold mb-3 text-teal-200">
          <ShieldCheck className="w-4 h-4 text-teal-300" /> Authentic OTC & Rx Medicines
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Verified Pharmacy Catalog</h1>
        <p className="text-teal-100 text-sm max-w-xl">
          Browse medicines directly sourced from DGDA-audited retail pharmacy partners across Dhaka.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8">
        {/* Search Field */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search medicine or generic formula..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value.trim()) next.set('search', value);
                else next.delete('search');
                return next;
              }, { replace: true });
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['All', 'OTC', 'Gastric', 'Respiratory'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? 'All Medicines' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{filteredProducts.length} medicines available</p>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Sort by
          <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-800 outline-none focus:border-teal-600">
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to high</option>
            <option value="price-high">Price: High to low</option>
          </select>
        </label>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-base">No medicines match your search criteria.</p>
        </div>
      )}
    </div>
  );
}