import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Camera, Store, Check } from 'lucide-react';
import { useCart } from '../../context/cartState';

export default function ProductCard({ product }) {
  const { addToCart, cartItems } = useCart();
  const [added, setAdded] = useState(false);
  const cartItem = cartItems.find((item) => item.id === product.id);
  const atStockLimit = cartItem?.quantity >= product.stock;

  const handleAddToCart = () => {
    if (addToCart(product)) {
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow relative group">
      <div>
        {/* Top Indicators / Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            {product.requiresPrescription ? (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 font-bold text-xs rounded flex items-center gap-1 border border-rose-200">
                <Camera className="w-3.5 h-3.5" /> Rx Required
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-xs rounded">
                OTC • Medicine
              </span>
            )}
            {product.isAvailable && product.stock > 0 ? (
              <span className="px-2 py-0.5 bg-teal-50 text-teal-800 font-semibold text-xs rounded flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-600"></span> In Stock
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-semibold text-xs rounded">Out of stock</span>
            )}
          </div>
        </div>

        {/* Product Details & Image Preview */}
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden border border-slate-100">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover rounded" 
            />
          </div>
          <div>
            <Link to={`/products/${product.id}`} className="hover:text-teal-700 transition-colors">
              <h4 className="font-bold text-slate-900 text-base leading-tight">{product.name}</h4>
            </Link>
            <p className="text-xs text-teal-700 font-medium mt-1">{product.generic}</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Store className="w-3 h-3 text-slate-400" />
              <span>{product.sellerName}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Price & Add to Cart */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-medium">Price per Strip</p>
          <p className="text-lg font-bold text-slate-900">৳{product.price}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Link
            to={`/products/${product.id}`}
            className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-lg transition-colors"
          >
            Details
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.isAvailable || product.stock < 1 || atStockLimit}
            className="px-3 py-2 bg-teal-700 hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300 text-white font-medium text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {added ? 'Added' : atStockLimit ? 'Max in cart' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}