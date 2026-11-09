import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Store, ShieldCheck, ArrowLeft, Camera, Check } from 'lucide-react';
import { useCart } from '../../context/cartState';
import { useProducts } from '../../context/productState';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { products } = useProducts();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id && p.isAvailable && p.stock > 0);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
        <p className="text-slate-600 mb-6">The medicine you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="px-4 py-2 bg-teal-700 text-white rounded-lg text-sm font-semibold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-teal-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Product Catalog
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 p-8">
        <div className="lg:col-span-5 bg-slate-50 rounded-xl p-8 flex items-center justify-center border border-slate-100">
          <img src={product.image} alt={product.name} className="max-h-80 object-contain rounded-lg shadow-sm" />
        </div>

        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-medium text-xs rounded-full">
                {product.category}
              </span>
              {product.requiresPrescription ? (
                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full flex items-center gap-1 border border-rose-200">
                  <Camera className="w-3.5 h-3.5" /> Rx Required
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-teal-50 text-teal-800 font-semibold text-xs rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> OTC Safe
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
            <p className="text-base text-teal-700 font-medium mt-1">{product.generic}</p>

            <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
              <Store className="w-4 h-4 text-slate-400" />
              <span>Fulfilled by: <strong className="text-slate-900">{product.sellerName}</strong></span>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-3xl font-bold text-slate-900">৳{product.price} <span className="text-xs font-normal text-slate-500">/ strip</span></p>
              <p className="text-xs text-teal-600 font-medium mt-1">In Stock: {product.stock} units available</p>
            </div>

            <p className="text-slate-600 text-sm mt-6 leading-relaxed">{product.description}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors">
                -
              </button>
              <span className="px-4 py-2.5 font-mono text-sm font-semibold text-slate-900 bg-white">{quantity}</span>
              <button disabled={quantity >= product.stock} onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2.5 text-slate-600 hover:bg-slate-200 disabled:opacity-40 font-bold transition-colors">
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || product.stock < 1}
              className={`flex-1 w-full py-3 px-6 rounded-lg font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2 ${
                added ? 'bg-teal-800 text-white' : 'bg-teal-700 hover:bg-teal-800 text-white'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" /> Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" /> Add to Cart (৳{product.price * quantity})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}