import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/navigation';
import {
  RiShoppingBagLine, RiHeartLine, RiHeartFill, RiStarFill, RiStarLine,
  RiArrowLeftLine, RiTruckLine, RiShieldCheckLine, RiRefreshLine,
} from 'react-icons/ri';
import { supabase } from '../lib/supabase';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [adding, setAdding] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlistStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('*, categories(name,slug)')
      .eq('id', id)
      .maybeSingle();

    if (!data) { navigate('/shop'); return; }
    setProduct(data);

    const [reviewsResult, relatedResult] = await Promise.all([
      supabase.from('reviews').select('*, profiles(full_name, avatar_url)').eq('product_id', id).order('created_at', { ascending: false }),
      supabase.from('products').select('*, categories(name,slug)').eq('category_id', data.category_id).neq('id', id).limit(4),
    ]);

    setReviews(reviewsResult.data || []);
    setRelated(relatedResult.data || []);
    setLoading(false);
  };

  const handleAddToCart = async () => {
    setAdding(true);
    addItem(product, quantity);
    await new Promise((r) => setTimeout(r, 700));
    setAdding(false);
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (isWishlisted(product.id)) {
      await removeFromWishlist(user.id, product.id);
    } else {
      await addToWishlist(user.id, product.id);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user || !reviewText.trim()) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: id,
      user_id: user.id,
      rating: reviewRating,
      comment: reviewText.trim(),
    });
    if (!error) {
      setReviewText('');
      setReviewRating(5);
      fetchProduct();
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return null;

  const discount = product.original_price > 0
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;
  const wishlisted = user ? isWishlisted(product.id) : false;
  const images = product.images?.length ? product.images : ['https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg'];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Link to="/" className="hover:text-rose-500 transition-colors">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-rose-500 transition-colors">Shop</Link>
            {product.categories && (
              <>
                <span>/</span>
                <Link to={`/shop?category=${product.categories.slug}`} className="hover:text-rose-500 transition-colors">
                  {product.categories.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-neutral-600 dark:text-neutral-300 truncate max-w-[150px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image Gallery */}
          <div className="space-y-3">
            <Swiper
              modules={[Thumbs, Navigation]}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              navigation
              className="rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 aspect-square"
            >
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={img}
                    alt={`${product.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {images.length > 1 && (
              <Swiper
                modules={[Thumbs]}
                watchSlidesProgress
                onSwiper={setThumbsSwiper}
                slidesPerView={4}
                spaceBetween={8}
                className="thumbs-swiper"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i}>
                    <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 cursor-pointer border-2 border-transparent [.swiper-slide-thumb-active_&]:border-rose-500 transition-all">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            {/* Badges */}
            <div className="flex gap-2 mb-3">
              {product.is_new_arrival && <Badge variant="green">New Arrival</Badge>}
              {product.is_best_seller && <Badge variant="amber">Best Seller</Badge>}
              {discount > 0 && <Badge variant="rose">{discount}% Off</Badge>}
            </div>

            <p className="text-sm text-neutral-400 uppercase tracking-wider font-medium mb-1">{product.brand}</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={s <= Math.round(product.rating) ? 'text-amber-400' : 'text-neutral-300'}>★</span>
                ))}
              </div>
              <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">{product.rating.toFixed(1)}</span>
              <span className="text-sm text-neutral-400">({product.review_count} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-bold text-neutral-900 dark:text-white">${product.price.toFixed(2)}</span>
              {product.original_price > 0 && (
                <span className="text-xl text-neutral-400 line-through">${product.original_price.toFixed(2)}</span>
              )}
            </div>

            {/* Description */}
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 text-sm">
              {product.description}
            </p>

            {/* Stock */}
            <div className="mb-5">
              {product.stock > 10 ? (
                <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">In Stock</span>
              ) : product.stock > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">Only {product.stock} left</span>
              ) : (
                <span className="text-red-500 text-sm font-medium">Out of Stock</span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Quantity:</span>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-lg"
                >
                  −
                </button>
                <span className="px-4 py-2.5 font-medium text-neutral-800 dark:text-white min-w-[48px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-lg"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button
                size="lg"
                fullWidth
                loading={adding}
                disabled={product.stock === 0}
                onClick={handleAddToCart}
              >
                <RiShoppingBagLine size={18} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Bag'}
              </Button>
              <button
                onClick={handleWishlist}
                className={[
                  'flex-shrink-0 p-3.5 rounded-xl border transition-all duration-200',
                  wishlisted
                    ? 'bg-rose-500 border-rose-500 text-white'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-rose-400 hover:text-rose-500',
                ].join(' ')}
              >
                {wishlisted ? <RiHeartFill size={20} /> : <RiHeartLine size={20} />}
              </button>
            </div>

            {/* Perks */}
            <div className="border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 space-y-3">
              {[
                { icon: RiTruckLine, text: 'Free shipping on orders over $60' },
                { icon: RiShieldCheckLine, text: 'Secure, encrypted checkout' },
                { icon: RiRefreshLine, text: '30-day hassle-free returns' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
                  <Icon size={16} className="text-rose-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-6">
            Customer Reviews
          </h2>

          {/* Write Review */}
          {user && (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 mb-6 shadow-card">
              <h3 className="font-semibold text-neutral-800 dark:text-white mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="text-2xl transition-colors"
                      >
                        {s <= reviewRating ? (
                          <RiStarFill className="text-amber-400" />
                        ) : (
                          <RiStarLine className="text-neutral-300 dark:text-neutral-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this product..."
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-800 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-rose-400 resize-none"
                />
                <Button type="submit" loading={submittingReview} disabled={!reviewText.trim()}>
                  Submit Review
                </Button>
              </form>
            </div>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-2xl shadow-card">
              <p className="text-neutral-400 text-sm">No reviews yet. Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-card">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-rose-100 dark:bg-rose-950/40 rounded-full flex items-center justify-center text-rose-500 font-bold text-sm">
                        {review.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-neutral-800 dark:text-white">
                          {review.profiles?.full_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <RiStarFill key={s} size={14} className={s <= review.rating ? 'text-amber-400' : 'text-neutral-200 dark:text-neutral-700'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
