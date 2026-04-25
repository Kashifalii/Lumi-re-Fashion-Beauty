import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  RiSearchLine,
  RiHeartLine,
  RiShoppingBagLine,
  RiUserLine,
  RiSunLine,
  RiMoonLine,
  RiMenuLine,
  RiCloseLine,
} from "react-icons/ri";
import { useThemeStore } from "../../store/themeStore";
import { useCartStore } from "../../store/cartStore";
import { useAuthStore } from "../../store/authStore";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Skincare", path: "/shop?category=skincare" },
  { label: "Makeup", path: "/shop?category=makeup" },
  { label: "Fashion", path: "/shop?category=fashion" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useThemeStore();
  const items = useCartStore((s) => s.items);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header
        className={[
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-soft"
            : "bg-white dark:bg-neutral-950",
        ].join(" ")}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img
                src="/public/logo.svg"
                alt="Lumière Logo"
                className="rounded-md size-8 object-cover"
              />
              <span className="font-display font-bold text-xl text-neutral-900 dark:text-white tracking-tight">
                Lumière
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={[
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                    location.pathname === link.path && !link.path.includes("?")
                      ? "text-rose-500 bg-rose-50 dark:bg-rose-950/30"
                      : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/50",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                aria-label="Search"
              >
                <RiSearchLine size={20} />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <RiSunLine size={20} />
                ) : (
                  <RiMoonLine size={20} />
                )}
              </button>

              {/* Wishlist */}
              {user && (
                <Link
                  to="/dashboard/wishlist"
                  className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                  aria-label="Wishlist"
                >
                  <RiHeartLine size={20} />
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
                aria-label="Cart"
              >
                <RiShoppingBagLine size={20} />
                {itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {itemCount > 9 ? "9+" : itemCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="relative group hidden lg:block">
                  <button className="p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors">
                    <RiUserLine size={20} />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900 rounded-2xl shadow-hover border border-neutral-100 dark:border-neutral-800 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                    <div className="p-2">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        My Dashboard
                      </Link>
                      <Link
                        to="/dashboard/orders"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        My Orders
                      </Link>
                      <Link
                        to="/dashboard/wishlist"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      >
                        Wishlist
                      </Link>
                      <hr className="my-1 border-neutral-100 dark:border-neutral-800" />
                      <button
                        onClick={signOut}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800 transition-colors"
              >
                {menuOpen ? (
                  <RiCloseLine size={22} />
                ) : (
                  <RiMenuLine size={22} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 animate-slide-up">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-2 border-neutral-100 dark:border-neutral-800" />
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-3 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={signOut}
                    className="px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-3 rounded-xl text-sm font-medium bg-rose-500 text-white text-center"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl animate-scale-in">
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-3 p-4"
            >
              <RiSearchLine
                className="text-neutral-400 flex-shrink-0"
                size={22}
              />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="flex-1 bg-transparent text-neutral-800 dark:text-white placeholder-neutral-400 text-lg outline-none"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
              >
                <RiCloseLine size={20} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Spacer */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
