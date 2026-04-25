import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  RiUserLine, RiShoppingBagLine, RiHeartLine, RiLogoutBoxLine,
  RiEditLine, RiCheckLine, RiArchiveLine,
} from 'react-icons/ri';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';

const statusColors = {
  pending: 'amber', processing: 'blue', shipped: 'blue',
  delivered: 'green', cancelled: 'neutral', refunded: 'neutral',
};

function ProfileTab({ user, profile, updateProfile }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: profile?.full_name || '', phone: profile?.phone || '' });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await updateProfile(form);
    setSaved(true);
    setEditing(false);
    setLoading(false);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-card">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl">
              {profile?.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-neutral-800 dark:text-white">{profile?.full_name || 'Your Name'}</h3>
              <p className="text-sm text-neutral-400">{user.email}</p>
              <Badge variant="rose" className="mt-1">{profile?.role || 'user'}</Badge>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors"
          >
            {editing ? <RiCheckLine size={18} /> : <RiEditLine size={18} />}
          </button>
        </div>

        {editing ? (
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              placeholder="Jane Doe"
            />
            <Input
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+1 (555) 000-0000"
            />
            <Input
              label="Email"
              value={user.email}
              disabled
              className="opacity-60 cursor-not-allowed"
            />
            <Button loading={loading} onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">Full Name</p>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{profile?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">Phone</p>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{profile?.phone || '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-neutral-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{user.email}</p>
            </div>
          </div>
        )}

        {saved && (
          <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm">
            <RiCheckLine size={16} />
            Profile updated successfully
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTab({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name, images, price))')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl shadow-card">
        <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <RiArchiveLine size={26} className="text-neutral-400" />
        </div>
        <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">No orders yet</h3>
        <p className="text-neutral-400 text-sm mb-5">Your order history will appear here.</p>
        <Link to="/shop"><Button variant="secondary">Start Shopping</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-5 shadow-card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-neutral-400 mb-0.5">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={statusColors[order.status] || 'neutral'}>
                {order.status}
              </Badge>
              <span className="font-bold text-neutral-900 dark:text-white">${order.total.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {order.order_items?.slice(0, 4).map((item) => (
              <div key={item.id} className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                {item.products?.images?.[0] && (
                  <img src={item.products.images[0]} alt="" className="w-full h-full object-cover" />
                )}
              </div>
            ))}
            {order.order_items?.length > 4 && (
              <div className="w-14 h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 text-xs text-neutral-400 font-medium">
                +{order.order_items.length - 4}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function WishlistTab({ userId }) {
  const { items, fetchWishlist, removeFromWishlist, loading } = useWishlistStore();

  useEffect(() => {
    fetchWishlist(userId);
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[4/5] bg-neutral-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-neutral-900 rounded-2xl shadow-card">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <RiHeartLine size={26} className="text-rose-400" />
        </div>
        <h3 className="font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Your wishlist is empty</h3>
        <p className="text-neutral-400 text-sm mb-5">Save items you love to your wishlist.</p>
        <Link to="/shop"><Button variant="secondary">Browse Products</Button></Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item) => (
        item.products && <ProductCard key={item.id} product={item.products} />
      ))}
    </div>
  );
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, updateProfile } = useAuthStore();

  const getTab = () => {
    if (location.pathname.includes('orders')) return 'orders';
    if (location.pathname.includes('wishlist')) return 'wishlist';
    return 'profile';
  };

  const activeTab = getTab();

  const navItems = [
    { key: 'profile', label: 'Profile', icon: RiUserLine, path: '/dashboard' },
    { key: 'orders', label: 'Orders', icon: RiShoppingBagLine, path: '/dashboard/orders' },
    { key: 'wishlist', label: 'Wishlist', icon: RiHeartLine, path: '/dashboard/wishlist' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-neutral-900 dark:text-white">My Account</h1>
          <p className="text-neutral-400 text-sm mt-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}!</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Nav */}
          <aside className="md:w-56 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-card">
              {navItems.map(({ key, label, icon: Icon, path }) => (
                <Link
                  key={key}
                  to={path}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    activeTab === key
                      ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800',
                  ].join(' ')}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
              <hr className="my-2 border-neutral-100 dark:border-neutral-800" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <RiLogoutBoxLine size={17} />
                Sign Out
              </button>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'profile' && <ProfileTab user={user} profile={profile} updateProfile={updateProfile} />}
            {activeTab === 'orders' && <OrdersTab userId={user.id} />}
            {activeTab === 'wishlist' && <WishlistTab userId={user.id} />}
          </div>
        </div>
      </div>
    </div>
  );
}
