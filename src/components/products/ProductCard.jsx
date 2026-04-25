import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiHeartLine, RiHeartFill, RiShoppingBagLine, RiStarFill } from 'react-icons/ri';
import { Badge } from '../ui/Badge';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';

export function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  const wishlisted = isWishlisted(product.id);
  const discount = product.original_price > 0
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    addItem(product);
    await new Promise((r) => setTimeout(r, 600));
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (wishlisted) {
      await removeFromWishlist(user.id, product.id);
    } else {
      await addToWishlist(user.id, product.id);
    }
  };

  const image = !imgError && product.images?.[0]
    ? product.images[0]
    : 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg';

  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-[4/5]">
        <img
          src={image}
          alt={product.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new_arrival && <Badge variant="green">New</Badge>}
          {product.is_best_seller && <Badge variant="amber">Best Seller</Badge>}
          {discount > 0 && <Badge variant="rose">-{discount}%</Badge>}
        </div>

        {/* Wishlist */}
        {user && (
          <button
            onClick={handleWishlist}
            className={[
              'absolute top-3 right-3 p-2 rounded-xl backdrop-blur-sm transition-all duration-200',
              wishlisted
                ? 'bg-rose-500 text-white'
                : 'bg-white/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:bg-rose-500 hover:text-white',
            ].join(' ')}
          >
            {wishlisted ? <RiHeartFill size={16} /> : <RiHeartLine size={16} />}
          </button>
        )}

        {/* Add to cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock === 0}
            className={[
              'w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors',
              product.stock === 0
                ? 'bg-neutral-400 cursor-not-allowed text-white'
                : 'bg-rose-500 hover:bg-rose-600 text-white',
            ].join(' ')}
          >
            {adding ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </>
            ) : (
              <>
                <RiShoppingBagLine size={16} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-1 uppercase tracking-wide font-medium">
          {product.brand}
        </p>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-white mb-2 line-clamp-2 leading-snug flex-1">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <RiStarFill
                  key={s}
                  size={11}
                  className={s <= Math.round(product.rating) ? 'text-amber-400' : 'text-neutral-200 dark:text-neutral-700'}
                />
              ))}
            </div>
            <span className="text-xs text-neutral-400">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-neutral-900 dark:text-white">
            ${product.price.toFixed(2)}
          </span>
          {product.original_price > 0 && (
            <span className="text-sm text-neutral-400 line-through">
              ${product.original_price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
