import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../context/cartState';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();

  const deliveryFee = cartItems.length > 0 ? 60 : 0;
  const grandTotal = subtotal + deliveryFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-teal-50 text-teal-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Shopping Cart is Empty</h2>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Your cart has no medicines added yet. Browse our catalog of verified prescription and OTC items to get started.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-semibold text-sm shadow-sm transition-colors"
        >
          Browse Product Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Shopping Cart</h1>
      <p className="text-sm text-slate-600 mb-8">Review your selected medicines and cold-chain dispatch items.</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">Medicine Items ({cartItems.length})</span>
              <button onClick={clearCart} className="text-xs font-semibold text-rose-600 hover:underline">
                Clear Cart
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-100 p-1 flex-shrink-0 flex items-center justify-center">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                    </div>
                    <div>
                      <Link to={`/products/${item.id}`} className="font-bold text-slate-900 hover:text-teal-700 transition-colors">
                        {item.name}
                      </Link>
                      <p className="text-xs text-teal-700 font-medium">{item.generic}</p>
                      <p className="text-xs text-slate-500 mt-1">Seller: {item.sellerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <button aria-label={`Decrease ${item.name} quantity`} onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors">
                        -
                      </button>
                      <span className="px-3 py-1.5 font-mono text-xs font-semibold text-slate-900 bg-white">{item.quantity}</span>
                      <button aria-label={`Increase ${item.name} quantity`} disabled={item.quantity >= item.stock} onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40 font-bold transition-colors">
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <p className="text-sm font-bold text-slate-900">৳{item.price * item.quantity}</p>
                      <p className="text-[10px] text-slate-400">৳{item.price} each</p>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors" title="Remove Item">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
            <Truck className="w-5 h-5 text-teal-700 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-teal-900">
              <span className="font-bold">Temperature-Controlled Express Dispatch:</span> All items are packed in insulated containers under DGDA compliance guidelines to maintain medicine efficacy.
            </div>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs sticky top-24">
            <h3 className="font-bold text-slate-900 text-base mb-4 pb-3 border-b border-slate-100">Order Summary</h3>

            <div className="flex flex-col gap-3 text-sm mb-6">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-semibold text-slate-900">৳{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Express Delivery (Dhaka)</span>
                <span className="font-semibold text-slate-900">৳{deliveryFee}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-teal-700 text-xl">৳{grandTotal}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}