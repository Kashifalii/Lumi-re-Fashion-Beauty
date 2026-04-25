import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { RiArrowLeftLine, RiLockLine, RiCheckLine } from 'react-icons/ri';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const steps = ['Shipping', 'Payment', 'Confirmation'];

const INITIAL_SHIPPING = {
  full_name: '', email: '', phone: '',
  address: '', city: '', state: '', zip: '', country: 'United States',
};

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState(INITIAL_SHIPPING);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCost = subtotal >= 60 ? 0 : 7.99;
  const total = subtotal + shippingCost;

  const validateShipping = () => {
    const errs = {};
    if (!shipping.full_name.trim()) errs.full_name = 'Required';
    if (!shipping.email.trim() || !/\S+@\S+\.\S+/.test(shipping.email)) errs.email = 'Valid email required';
    if (!shipping.address.trim()) errs.address = 'Required';
    if (!shipping.city.trim()) errs.city = 'Required';
    if (!shipping.zip.trim()) errs.zip = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingNext = () => {
    if (validateShipping()) setStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'processing',
          subtotal,
          shipping: shippingCost,
          total,
          shipping_address: shipping,
          payment_intent_id: `demo_${Date.now()}`,
        })
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price,
        product_snapshot: { name: item.name, brand: item.brand, images: item.images },
      }));

      await supabase.from('order_items').insert(orderItems);

      setOrderId(order.id);
      clearCart();
      setStep(2);
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 2) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {step < 2 && (
            <button onClick={() => step === 0 ? navigate('/cart') : setStep(0)} className="p-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
              <RiArrowLeftLine size={20} />
            </button>
          )}
          <div>
            <Link to="/" className="font-display font-bold text-xl text-neutral-900 dark:text-white">Lumière</Link>
            <p className="text-sm text-neutral-400">Secure Checkout</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-neutral-400 text-sm">
            <RiLockLine size={14} />
            SSL Secured
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-10 max-w-sm mx-auto md:mx-0">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={[
                'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors flex-shrink-0',
                i < step ? 'bg-rose-500 text-white' : i === step ? 'bg-rose-500 text-white ring-4 ring-rose-100 dark:ring-rose-950/50' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400',
              ].join(' ')}>
                {i < step ? <RiCheckLine size={14} /> : i + 1}
              </div>
              <span className={`ml-2 text-xs font-medium ${i === step ? 'text-neutral-800 dark:text-white' : 'text-neutral-400'}`}>{s}</span>
              {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-rose-500' : 'bg-neutral-200 dark:bg-neutral-700'}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Forms */}
          <div className="lg:col-span-3">
            {/* Step 0: Shipping */}
            {step === 0 && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold text-lg text-neutral-800 dark:text-white mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Input
                      label="Full Name"
                      value={shipping.full_name}
                      onChange={(e) => setShipping((p) => ({ ...p, full_name: e.target.value }))}
                      error={errors.full_name}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={shipping.email}
                    onChange={(e) => setShipping((p) => ({ ...p, email: e.target.value }))}
                    error={errors.email}
                    placeholder="you@example.com"
                  />
                  <Input
                    label="Phone"
                    type="tel"
                    value={shipping.phone}
                    onChange={(e) => setShipping((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Address"
                      value={shipping.address}
                      onChange={(e) => setShipping((p) => ({ ...p, address: e.target.value }))}
                      error={errors.address}
                      placeholder="123 Beauty Lane, Apt 4B"
                    />
                  </div>
                  <Input
                    label="City"
                    value={shipping.city}
                    onChange={(e) => setShipping((p) => ({ ...p, city: e.target.value }))}
                    error={errors.city}
                    placeholder="New York"
                  />
                  <Input
                    label="State"
                    value={shipping.state}
                    onChange={(e) => setShipping((p) => ({ ...p, state: e.target.value }))}
                    placeholder="NY"
                  />
                  <Input
                    label="ZIP / Postal Code"
                    value={shipping.zip}
                    onChange={(e) => setShipping((p) => ({ ...p, zip: e.target.value }))}
                    error={errors.zip}
                    placeholder="10001"
                  />
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Country</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => setShipping((p) => ({ ...p, country: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                      <option>France</option>
                      <option>Germany</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <Button fullWidth size="lg" onClick={handleShippingNext}>Continue to Payment</Button>
                </div>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-card">
                <h2 className="font-semibold text-lg text-neutral-800 dark:text-white mb-6">Payment Details</h2>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    <strong>Demo Mode:</strong> This is a demo checkout. No real payment will be processed. Click &quot;Place Order&quot; to simulate a successful purchase.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      defaultValue="4242 4242 4242 4242"
                      className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400"
                      readOnly
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Expiry</label>
                      <input type="text" placeholder="MM/YY" defaultValue="12/28" readOnly className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">CVC</label>
                      <input type="text" placeholder="123" defaultValue="123" readOnly className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Name on Card</label>
                    <input type="text" placeholder="Jane Doe" defaultValue={shipping.full_name} className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400" readOnly />
                  </div>
                </div>

                <div className="mt-6">
                  <Button fullWidth size="lg" loading={loading} onClick={handlePlaceOrder}>
                    <RiLockLine size={16} />
                    Place Order — ${total.toFixed(2)}
                  </Button>
                  <p className="text-center text-xs text-neutral-400 mt-3">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Confirmation */}
            {step === 2 && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-card text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <RiCheckLine size={32} className="text-emerald-500" />
                </div>
                <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-2">Order Confirmed!</h2>
                <p className="text-neutral-400 text-sm mb-2">
                  Thank you for your purchase. We&apos;ve received your order and will begin processing it shortly.
                </p>
                {orderId && (
                  <p className="text-xs text-neutral-400 mb-6">
                    Order ID: <span className="font-mono text-neutral-600 dark:text-neutral-300">{orderId.slice(0, 8).toUpperCase()}</span>
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/dashboard/orders">
                    <Button variant="secondary">View Orders</Button>
                  </Link>
                  <Link to="/shop">
                    <Button>Continue Shopping</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {step < 2 && (
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-card sticky top-24">
                <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                        <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 line-clamp-2">{item.name}</p>
                        <p className="text-xs text-neutral-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-neutral-800 dark:text-white flex-shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-3 space-y-2">
                  <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <span>Shipping</span>
                    <span className={shippingCost === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                      {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-neutral-900 dark:text-white pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <span>Total</span><span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
