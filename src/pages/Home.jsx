import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import { RiArrowRightLine, RiLeafLine, RiShieldCheckLine, RiTruckLine, RiCustomerService2Line, RiStarFill, RiArrowLeftSLine, RiArrowRightSLine } from 'react-icons/ri';
import { supabase } from '../lib/supabase';
import { ProductCard } from '../components/products/ProductCard';
import { Button } from '../components/ui/Button';

const heroSlides = [
  {
    id: 1,
    headline: 'Radiance,\nRefined.',
    subline: 'Discover our curated selection of premium skincare and beauty products crafted for the modern woman.',
    cta: 'Shop Skincare',
    ctaLink: '/shop?category=skincare',
    image: 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg',
    accent: 'from-rose-950/80',
  },
  {
    id: 2,
    headline: 'Style,\nElevated.',
    subline: 'Premium fashion pieces designed for every chapter of your story. Timeless, sustainable, exceptional.',
    cta: 'Explore Fashion',
    ctaLink: '/shop?category=fashion',
    image: 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg',
    accent: 'from-neutral-950/80',
  },
  {
    id: 3,
    headline: 'Scent,\nRemembered.',
    subline: 'Signature fragrances that become part of you. Each bottle tells a story worth remembering.',
    cta: 'Explore Fragrances',
    ctaLink: '/shop?category=fragrance',
    image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
    accent: 'from-rose-950/70',
  },
];

const perks = [
  { icon: RiTruckLine, title: 'Free Shipping', desc: 'On orders over $60' },
  { icon: RiShieldCheckLine, title: 'Secure Payment', desc: '100% protected transactions' },
  { icon: RiCustomerService2Line, title: '24/7 Support', desc: 'Beauty advisors on call' },
  { icon: RiLeafLine, title: 'Clean Beauty', desc: 'Ethically sourced ingredients' },
];

const testimonials = [
  {
    id: 1,
    name: 'Amara Chen',
    role: 'Beauty Editor',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    text: 'The Radiance Glow Serum transformed my skin in just two weeks. I\'ve tried hundreds of products, and this is the one I keep coming back to.',
    rating: 5,
    product: 'Radiance Glow Serum',
  },
  {
    id: 2,
    name: 'Sofia Laurent',
    role: 'Fashion Stylist',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    text: 'Lumière has become my go-to for everything. The curation is impeccable — every product feels like it was chosen just for me.',
    rating: 5,
    product: 'Silk Satin Midi Dress',
  },
  {
    id: 3,
    name: 'Priya Mehta',
    role: 'Lifestyle Blogger',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
    text: 'From skincare to accessories, every single piece is worth every penny. The Bloom EDP is my new signature scent.',
    rating: 5,
    product: 'Bloom Eau de Parfum',
  },
  {
    id: 4,
    name: 'Isabella Moore',
    role: 'Dermatologist',
    avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg',
    text: 'As a dermatologist, I\'m very selective. Lumière\'s skincare line is scientifically backed and genuinely effective. I recommend it to all my patients.',
    rating: 5,
    product: 'Retinol Night Repair',
  },
];

const categories = [
  { name: 'Skincare', slug: 'skincare', image: 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg', count: '6+' },
  { name: 'Makeup', slug: 'makeup', image: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg', count: '6+' },
  { name: 'Fashion', slug: 'fashion', image: 'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg', count: '4+' },
  { name: 'Fragrance', slug: 'fragrance', image: 'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg', count: '3+' },
  { name: 'Accessories', slug: 'accessories', image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg', count: '3+' },
  { name: 'Haircare', slug: 'haircare', image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg', count: '3+' },
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const [featured, sellers, arrivals] = await Promise.all([
      supabase.from('products').select('*, categories(name,slug)').eq('is_featured', true).limit(8),
      supabase.from('products').select('*, categories(name,slug)').eq('is_best_seller', true).limit(8),
      supabase.from('products').select('*, categories(name,slug)').eq('is_new_arrival', true).limit(8),
    ]);
    setFeaturedProducts(featured.data || []);
    setBestSellers(sellers.data || []);
    setNewArrivals(arrivals.data || []);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero Slider */}
      <section className="relative">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-[70vh] md:h-[85vh]"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-full">
                <img
                  src={slide.image}
                  alt={slide.headline}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.accent} to-transparent`} />
                <div className="relative z-10 h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-xl animate-slide-up">
                      <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-4 leading-tight whitespace-pre-line">
                        {slide.headline}
                      </h1>
                      <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-md">
                        {slide.subline}
                      </p>
                      <div className="flex items-center gap-4">
                        <Link
                          to={slide.ctaLink}
                          className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-neutral-900 rounded-xl font-semibold text-sm hover:bg-rose-50 transition-colors"
                        >
                          {slide.cta}
                          <RiArrowRightLine />
                        </Link>
                        <Link
                          to="/shop"
                          className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-semibold text-sm backdrop-blur-sm transition-colors"
                        >
                          Browse All
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Perks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-soft grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-neutral-100 dark:divide-neutral-800 overflow-hidden">
          {perks.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-4 p-5 md:p-6">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-rose-500" />
              </div>
              <div>
                <p className="font-semibold text-sm text-neutral-800 dark:text-white">{title}</p>
                <p className="text-xs text-neutral-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-rose-500 text-sm font-semibold uppercase tracking-wider mb-1">Explore</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
              Shop by Category
            </h2>
          </div>
          <Link to="/shop" className="hidden md:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-rose-500 transition-colors font-medium">
            View all <RiArrowRightLine />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/shop?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-neutral-100 dark:bg-neutral-800"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm">{cat.name}</p>
                <p className="text-white/60 text-xs">{cat.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-white dark:bg-neutral-900/50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-500 text-sm font-semibold uppercase tracking-wider mb-1">Handpicked</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                Featured Collection
              </h2>
            </div>
            <Link to="/shop?featured=true" className="hidden md:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-rose-500 transition-colors font-medium">
              View all <RiArrowRightLine />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl aspect-[4/5] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-3xl h-72 md:h-80 group">
            <img
              src="https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg"
              alt="Makeup Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-950/70 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              <p className="text-rose-200 text-xs font-semibold uppercase tracking-wider mb-2">New Season</p>
              <h3 className="font-display text-3xl font-bold text-white mb-3">Makeup Essentials</h3>
              <p className="text-white/70 text-sm mb-5">Define your look with precision and pigment.</p>
              <Link
                to="/shop?category=makeup"
                className="inline-flex items-center gap-2 bg-white text-neutral-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors self-start"
              >
                Shop Now <RiArrowRightLine />
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-3xl h-72 md:h-80 group">
            <img
              src="https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg"
              alt="Accessories"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/60 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              <div className="inline-flex items-center gap-2 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold mb-3 self-start">
                UP TO 40% OFF
              </div>
              <h3 className="font-display text-3xl font-bold text-white mb-3">Gold Accessories</h3>
              <p className="text-white/70 text-sm mb-5">Complete every look with the perfect piece.</p>
              <Link
                to="/shop?category=accessories"
                className="inline-flex items-center gap-2 bg-white text-neutral-900 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-neutral-50 transition-colors self-start"
              >
                Shop Now <RiArrowRightLine />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-neutral-50 dark:bg-neutral-950 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-500 text-sm font-semibold uppercase tracking-wider mb-1">Community Favorites</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                Best Sellers
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button ref={prevRef} className="p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:border-rose-400 hover:text-rose-500 transition-colors">
                <RiArrowLeftSLine size={20} />
              </button>
              <button ref={nextRef} className="p-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:border-rose-400 hover:text-rose-500 transition-colors">
                <RiArrowRightSLine size={20} />
              </button>
            </div>
          </div>
          {!loading && (
            <Swiper
              modules={[Navigation, Autoplay]}
              slidesPerView={1.2}
              spaceBetween={16}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              onBeforeInit={(swiper) => {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              breakpoints={{
                480: { slidesPerView: 2.2 },
                768: { slidesPerView: 3.2 },
                1024: { slidesPerView: 4.2 },
              }}
            >
              {bestSellers.map((p) => (
                <SwiperSlide key={p.id}>
                  <ProductCard product={p} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="bg-white dark:bg-neutral-900/30 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-rose-500 text-sm font-semibold uppercase tracking-wider mb-1">Just Landed</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white">
                New Arrivals
              </h2>
            </div>
            <Link to="/shop?new=true" className="hidden md:flex items-center gap-1.5 text-sm text-neutral-500 hover:text-rose-500 transition-colors font-medium">
              View all <RiArrowRightLine />
            </Link>
          </div>
          {!loading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {newArrivals.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20 bg-neutral-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-rose-400 text-sm font-semibold uppercase tracking-wider mb-2">Reviews</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
              Our Clients&apos; Beautiful Words
            </h2>
          </div>
          <Swiper
            modules={[Autoplay, Pagination]}
            slidesPerView={1}
            spaceBetween={24}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              1024: { slidesPerView: 2.5 },
            }}
            className="pb-12"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id}>
                <div className="bg-neutral-900 rounded-2xl p-6 md:p-8 border border-neutral-800">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <RiStarFill key={i} size={16} className="text-amber-400" />
                    ))}
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-neutral-500 text-xs">{t.role}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Instagram-style Lookbook */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-rose-500 text-sm font-semibold uppercase tracking-wider mb-2">Inspiration</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-3">
            The Lumière Look
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto text-sm">
            Real women, real style. Share your look with #LumiereStyle for a chance to be featured.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
            'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg',
            'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
            'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg',
            'https://images.pexels.com/photos/965989/pexels-photo-965989.jpeg',
            'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg',
            'https://images.pexels.com/photos/934063/pexels-photo-934063.jpeg',
            'https://images.pexels.com/photos/1749452/pexels-photo-1749452.jpeg',
          ].map((src, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl aspect-square bg-neutral-100 dark:bg-neutral-800">
              <img
                src={src}
                alt={`Look ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold">Shop Look</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
