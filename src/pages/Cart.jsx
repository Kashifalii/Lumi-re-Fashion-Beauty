import { Link, useNavigate } from 'react-router-dom';
import { RiDeleteBinLine, RiArrowLeftLine, RiShoppingBagLine, RiTruckLine } from 'react-icons/ri';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';

export default function Cart() {
  const items = useCartStore((s) => s.items);
  const { removeItem, updateQuantity, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= 60 ? 0 : 7.99;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col items-center justify-center px-4 py-20">
        <div className="w-20 h-20 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center mb-6">
          <RiShoppingBagLine size={36} className="text-rose-400" />
        </div>
        <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-2">Your bag is empty</h2>
        <p className="text-neutral-400 text-sm mb-8 text-center max-w-sm">
          Looks like you haven&apos;t added anything yet. Start exploring our collection.
        </p>
        <Link to="/shop">
          <Button size="lg">Explore Collection</Button>
        </Link>
      </div>
    );
  }

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/shop" className="p-2 rounded-xl hover:bg-white dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
            <RiArrowLeftLine size={20} />
          </Link>
          <h1 className="font-display text-3xl font-bold text-neutral-900 dark:text-white">
            Shopping Bag <span className="text-neutral-400 font-normal text-xl">({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-4 md:p-5 shadow-card flex gap-4">
                <Link to={`/products/${item.id}`} className="flex-shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                    <img
                      src={item.images?.[0] || 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-xs text-neutral-400 uppercase tracking-wide mb-0.5">{item.brand}</p>
                      <Link to={`/products/${item.id}`} className="font-semibold text-sm text-neutral-800 dark:text-white hover:text-rose-500 transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <RiDeleteBinLine size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 font-medium text-sm text-neutral-800 dark:text-white min-w-[36px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button onClick={clearCart} className="text-sm text-neutral-400 hover:text-red-500 transition-colors flex items-center gap-1.5">
                <RiDeleteBinLine size={14} />
                Clear cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-card sticky top-24">
              <h2 className="font-semibold text-neutral-800 dark:text-white mb-5 text-lg">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                  <span className="text-neutral-800 dark:text-white font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Shipping</span>
                  <span className={shipping === 0 ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-neutral-800 dark:text-white font-medium'}>
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
              </div>

              {shipping > 0 && (
                <div className="bg-rose-50 dark:bg-rose-950/20 rounded-xl p-3 mb-4 flex items-start gap-2">
                  <RiTruckLine size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Add <strong>${(60 - subtotal).toFixed(2)}</strong> more for free shipping!
                  </p>
                </div>
              )}

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 mb-5">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-800 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-neutral-900 dark:text-white">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="flex gap-2 mb-5">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400"
                />
                <button className="px-4 py-2 bg-neutral-800 dark:bg-white text-white dark:text-neutral-800 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity">
                  Apply
                </button>
              </div>

              <Button fullWidth size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <Link to="/shop" className="text-sm text-neutral-400 hover:text-rose-500 transition-colors flex items-center justify-center gap-1.5">
                  <RiArrowLeftLine size={14} />
                  Continue Shopping
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-center gap-3 flex-wrap">
                {['Visa', 'Mastercard', 'Amex', 'PayPal'].map((brand) => (
                  <span key={brand} className="text-[10px] font-semibold text-neutral-400 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
