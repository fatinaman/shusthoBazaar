import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, MapPin, Plus, ShoppingBag, Truck, X } from 'lucide-react';
import { useAddresses } from '../../context/addressState';
import { useAuth } from '../../context/authState';
import { useCart } from '../../context/cartState';
import { api } from '../../services/api';

const steps = ['Delivery', 'Review', 'Payment'];
const CHECKOUT_KEY = 'shusthobazaar_checkout_draft';

function getCheckoutDraft() {
  try {
    return JSON.parse(window.sessionStorage.getItem(CHECKOUT_KEY) || '{}');
  } catch (error) {
    console.error('Unable to restore the checkout draft.', error);
    window.sessionStorage.removeItem(CHECKOUT_KEY);
    return {};
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addresses, addAddress, error: addressError } = useAddresses();
  const { cartItems, subtotal, discount, shippingFee, total, clearCart } = useCart();
  const [draft] = useState(getCheckoutDraft);
  const [currentStep, setCurrentStep] = useState(Math.min(draft.currentStep || 0, steps.length - 1));
  const [selectedAddressId, setSelectedAddressId] = useState(draft.selectedAddressId || addresses[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState(draft.paymentMethod === 'mock' || draft.paymentMethod === 'sandbox' ? 'mock' : 'cod');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addressDraft, setAddressDraft] = useState({
    label: 'Home',
    recipient: user?.name || '',
    phone: '',
    street: '',
    city: 'Dhaka',
    postalCode: '',
  });
  const [error, setError] = useState('');

  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) || addresses[0];

  useEffect(() => {
    window.sessionStorage.setItem(CHECKOUT_KEY, JSON.stringify({
      currentStep,
      selectedAddressId,
      paymentMethod,
    }));
  }, [currentStep, selectedAddressId, paymentMethod]);

  const submitCheckout = async () => {
    if (!selectedAddress) {
      setError('Add and select a delivery address to continue.');
      setCurrentStep(0);
      return;
    }

    setSubmitting(true);
    try {
      const result = await api.checkout.place({
        addressId: selectedAddress.id,
        paymentMethod,
      });
      window.sessionStorage.removeItem(CHECKOUT_KEY);
      await clearCart();
      if (paymentMethod === 'mock') {
        navigate(`/payment?checkoutReference=${encodeURIComponent(result.checkoutReference)}`);
        return;
      }
      navigate(`/orders/${result.orders[0].id}`);
    } catch (orderError) {
      setError(orderError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const addNewAddress = async (event) => {
    event.preventDefault();
    try {
      const savedAddress = await addAddress(addressDraft);
      setSelectedAddressId(savedAddress.id);
      setAddressDraft({ label: 'Home', recipient: user?.name || '', phone: '', street: '', city: 'Dhaka', postalCode: '' });
      setShowAddressForm(false);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const continueStep = () => {
    setError('');
    if (currentStep === 0 && !selectedAddress) {
      setError('Select a delivery address or add a new one.');
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <ShoppingBag className="mx-auto mb-5 h-12 w-12 text-teal-700" />
        <h1 className="text-3xl font-bold text-slate-900">Your cart is empty</h1>
        <p className="mt-3 text-slate-600">Add medicines to your cart before placing an order.</p>
        <Link to="/products" className="mt-6 inline-flex rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Secure checkout</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Review and place your order</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-700">
          <Truck className="h-4 w-4" /> Dhaka delivery in 90 mins
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step} aria-current={index === currentStep ? 'step' : undefined} className="flex items-center gap-2">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index <= currentStep ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span className={`text-xs font-semibold sm:text-sm ${index === currentStep ? 'text-teal-800' : 'text-slate-500'}`}>{step}</span>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            {currentStep === 0 && (
              <div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Delivery address</h2>
                    <p className="mt-1 text-sm text-slate-500">Choose a saved address or add another one.</p>
                  </div>
                  <button type="button" onClick={() => setShowAddressForm(true)} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-teal-200 px-3 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-50">
                    <Plus className="h-4 w-4" /> Add address
                  </button>
                </div>
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className={`block cursor-pointer rounded-2xl border p-4 transition ${selectedAddress?.id === address.id ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex items-start gap-3">
                        <input type="radio" name="address" checked={selectedAddress?.id === address.id} onChange={() => setSelectedAddressId(address.id)} className="mt-1 accent-teal-700" />
                        <span className="flex-1">
                          <span className="flex items-center justify-between gap-3">
                            <span className="font-bold text-slate-900">{address.label} <span className="font-normal text-slate-600">· {address.recipient}</span></span>
                            <MapPin className="h-4 w-4 shrink-0 text-teal-700" />
                          </span>
                          <span className="mt-2 block text-sm text-slate-600">{address.street}, {address.city} {address.postalCode}</span>
                          <span className="mt-1 block text-sm text-slate-500">{address.phone}</span>
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {showAddressForm && (
                  <form onSubmit={addNewAddress} className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold text-slate-900">Add delivery address</h3>
                      <button type="button" onClick={() => setShowAddressForm(false)} aria-label="Close address form" className="rounded-lg p-1 text-slate-500 hover:bg-white"><X className="h-4 w-4" /></button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['label', 'Label', 'Home'],
                        ['recipient', 'Recipient name', 'Full name'],
                        ['phone', 'Phone', '01XXXXXXXXX'],
                        ['street', 'Street address', 'House / road / area'],
                        ['city', 'City', 'Dhaka'],
                        ['postalCode', 'Postal code', '1213'],
                      ].map(([field, label, placeholder]) => (
                        <label key={field} className={field === 'street' ? 'sm:col-span-2' : ''}>
                          <span className="mb-1 block text-xs font-semibold text-slate-600">{label}</span>
                          <input required value={addressDraft[field]} onChange={(event) => setAddressDraft((current) => ({ ...current, [field]: event.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-600" />
                        </label>
                      ))}
                    </div>
                    <button type="submit" className="mt-4 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white">Save address</button>
                  </form>
                )}
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">Review your order</h2>
                <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="h-12 w-12 rounded-lg bg-slate-50 object-contain" />
                        <div>
                          <p className="font-semibold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500">Qty {item.quantity} · ৳{item.price} each</p>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900">৳{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm">
                  <p className="font-semibold text-slate-900">{selectedAddress?.label} · {selectedAddress?.recipient}</p>
                  <p className="mt-1 text-slate-600">{selectedAddress?.street}, {selectedAddress?.city} {selectedAddress?.postalCode}</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900">Payment</h2>
                <p className="mt-1 text-sm text-slate-500">Choose Cash on Delivery or a local mock payment scenario.</p>
                <div className="mt-4 space-y-3">
                  {[
                    { id: 'cod', title: 'Cash on Delivery', description: 'Place the order and pay when it arrives.' },
                    { id: 'mock', title: 'Mock payment', description: 'Simulate success or decline locally; no gateway or payment details are used.' },
                  ].map((method) => (
                    <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left ${paymentMethod === method.id ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 hover:border-slate-300'}`}>
                      <CreditCard className="h-5 w-5 shrink-0 text-teal-700" />
                      <span className="flex-1">
                        <span className="block font-semibold text-slate-900">{method.title}</span>
                        <span className="mt-1 block text-sm text-slate-500">{method.description}</span>
                      </span>
                      <span className={`h-4 w-4 rounded-full border ${paymentMethod === method.id ? 'border-[5px] border-teal-700' : 'border-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(error || addressError) && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">{error || addressError}</p>}
          <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => currentStep ? setCurrentStep((step) => step - 1) : navigate('/cart')} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              {currentStep ? 'Back' : 'Return to cart'}
            </button>
            {currentStep < steps.length - 1 ? (
              <button type="button" onClick={continueStep} className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800">Continue</button>
            ) : (
              <button type="button" disabled={submitting} onClick={submitCheckout} className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-60">
                {submitting ? 'Placing order…' : paymentMethod === 'cod' ? 'Place order' : `Continue to mock payment · ৳${total}`}
              </button>
            )}
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-slate-900">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-600">
            <div className="flex justify-between"><span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span><span className="font-semibold text-slate-900">৳{subtotal}</span></div>
            <div className="flex justify-between"><span>Express delivery</span><span className="font-semibold text-slate-900">৳{shippingFee}</span></div>
            {discount > 0 && <div className="flex justify-between text-emerald-700"><span>Coupon discount</span><span className="font-semibold">−৳{discount}</span></div>}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-900"><span>Total</span><span className="text-teal-700">৳{total}</span></div>
          </div>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">Delivering to</p>
            <p className="mt-2 font-semibold text-slate-900">{selectedAddress?.label || 'Select an address'}</p>
            <p className="mt-1 text-sm text-slate-600">{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : 'Choose or add an address in the Delivery step.'}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
