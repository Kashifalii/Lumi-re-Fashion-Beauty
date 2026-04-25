import { Link } from 'react-router-dom';
import { RiInstagramLine, RiTwitterXLine, RiPinterestLine, RiTiktokLine } from 'react-icons/ri';

const footerLinks = {
  Shop: [
    { label: 'Skincare', to: '/shop?category=skincare' },
    { label: 'Makeup', to: '/shop?category=makeup' },
    { label: 'Haircare', to: '/shop?category=haircare' },
    { label: 'Fashion', to: '/shop?category=fashion' },
    { label: 'Accessories', to: '/shop?category=accessories' },
    { label: 'Fragrance', to: '/shop?category=fragrance' },
  ],
  Help: [
    { label: 'FAQ', to: '#' },
    { label: 'Shipping & Returns', to: '#' },
    { label: 'Order Tracking', to: '#' },
    { label: 'Contact Us', to: '#' },
    { label: 'Size Guide', to: '#' },
  ],
  Company: [
    { label: 'About Lumière', to: '#' },
    { label: 'Sustainability', to: '#' },
    { label: 'Careers', to: '#' },
    { label: 'Press', to: '#' },
  ],
};

const socials = [
  { Icon: RiInstagramLine, label: 'Instagram', href: '#' },
  { Icon: RiPinterestLine, label: 'Pinterest', href: '#' },
  { Icon: RiTiktokLine, label: 'TikTok', href: '#' },
  { Icon: RiTwitterXLine, label: 'Twitter', href: '#' },
];

export function Footer() {
  return (
    <footer className="bg-neutral-950 text-neutral-300">
      {/* Newsletter */}
      <div className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold text-white mb-1">Stay in the know</h3>
              <p className="text-neutral-400 text-sm">New arrivals, exclusive offers, and beauty inspiration.</p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 md:w-72 px-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-base leading-none">L</span>
              </div>
              <span className="font-display font-bold text-lg text-white">Lumière</span>
            </Link>
            <p className="text-neutral-400 text-sm leading-relaxed mb-5">
              Curating the finest in fashion and beauty for the modern woman who knows her worth.
            </p>
            <div className="flex items-center gap-3">
              {socials.map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-neutral-800 hover:bg-rose-500 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-neutral-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-neutral-500 text-xs">
            &copy; {new Date().getFullYear()} Lumière. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors">Terms of Service</Link>
            <Link to="#" className="text-neutral-500 hover:text-neutral-300 text-xs transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
