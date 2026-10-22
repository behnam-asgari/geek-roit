import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from 'lucide-react';
import { useSiteConfig } from '../../store/ConfigContext';

export const Navbar: React.FC = () => {
  const { config, getButtonClasses } = useSiteConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const { brandName } = config.general;
  const { primaryPhone, showPhoneInHeader, contactButtonText } = config.contact;
  const hasVisibleHeaderPhone = showPhoneInHeader && primaryPhone.trim().length > 0;

  const isHome = location.pathname === '/';

  const navLinks = [
    { href: isHome ? '#idea-to-product' : '/#idea-to-product', label: 'مسیر خلق محصول' },
    { href: isHome ? '#services' : '/#services', label: 'خدمات' },
    { href: isHome ? '#process' : '/#process', label: 'فرآیند توسعه' },
    { href: isHome ? '#portfolio' : '/#portfolio', label: 'نمونه‌کارها' },
    { href: '/admin/content', label: 'پنل مدیریت', isRoute: true },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-40 bg-[#080A12]/90 border-b border-[var(--border-color)]">
      {/* Strict 3-Zone Top Bar Contract separated by gap-8 */}
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight text-[#F5F7FF] font-latin whitespace-nowrap shrink-0"
        >
          {brandName}
        </Link>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="ناوبری اصلی"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A5AEC5]"
        >
          {navLinks.map((item) =>
            item.isRoute ? (
              <Link
                key={item.href}
                to={item.href}
                className="hover:text-[#F5F7FF] hover:underline underline-offset-8 decoration-[var(--accent-primary)] transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="hover:text-[#F5F7FF] hover:underline underline-offset-8 decoration-[var(--accent-primary)] transition-colors whitespace-nowrap shrink-0"
              >
                {item.label}
              </a>
            )
          )}
        </nav>

        {/* Zone 3: Primary action + mobile toggle */}
        <div className="flex items-center gap-4 shrink-0">
          {hasVisibleHeaderPhone && (
            <a
              href={`tel:${primaryPhone.trim()}`}
              className="hidden lg:inline-flex items-center gap-2 text-xs font-mono-code text-[#A5AEC5] hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0"
              dir="ltr"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              <span>{primaryPhone}</span>
            </a>
          )}

          <a
            href={isHome ? '#contact-finale' : '/#contact-finale'}
            className={getButtonClasses('primary')}
          >
            {contactButtonText || 'شروع پروژه'}
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'بستن منوی موبایل' : 'باز کردن منوی موبایل'}
            className="md:hidden p-2.5 rounded-lg border border-[var(--border-color)] bg-[#141A2B] text-[#F5F7FF] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[#0E1220] px-6 py-5 space-y-4">
          <nav aria-label="ناوبری موبایل" className="flex flex-col space-y-3">
            {navLinks.map((item) =>
              item.isRoute ? (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-base font-medium text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-base font-medium text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          {hasVisibleHeaderPhone && (
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
              <span className="text-xs text-[#A5AEC5]">شماره تماس مستقیم:</span>
              <a
                href={`tel:${primaryPhone.trim()}`}
                dir="ltr"
                className="text-sm font-mono-code text-[var(--accent-secondary)] font-semibold"
              >
                {primaryPhone}
              </a>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
