import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, ExternalLink, Settings } from 'lucide-react';
import { useSiteConfig } from '../../store/ConfigContext';

export const Footer: React.FC = () => {
  const { config } = useSiteConfig();
  const {
    brandName,
    footerCredit,
    copyrightText,
    phonePlaceholderText,
  } = config.general;

  const {
    primaryPhone,
    secondaryPhone,
    email,
    whatsappUrl,
    telegramUrl,
    instagramUrl,
    showPhoneInFooter,
  } = config.contact;

  const hasConfiguredPhone = primaryPhone.trim().length > 0;

  return (
    <footer className="bg-[#080A12] border-t border-[var(--border-color)] text-[#A5AEC5] relative z-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[var(--border-color)]">
          {/* Column 1: Brand Wordmark & Philosophy */}
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-block text-2xl font-extrabold text-[#F5F7FF] font-latin tracking-tight"
            >
              {brandName}
            </Link>
            <p className="text-sm leading-relaxed text-[#A5AEC5]">
              استودیو مهندسی و طراحی محصولات دیجیتال. تمرکز ما بر خلق وب‌سایت‌های وردپرسی اختصاصی، وب‌اپلیکیشن‌های React، اپلیکیشن‌های موبایل و راهکارهای هوش مصنوعی است.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#F5F7FF]">دسترسی سریع</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#hero" className="hover:text-[#F5F7FF] transition-colors">
                  صفحه نخست
                </a>
              </li>
              <li>
                <a href="#idea-to-product" className="hover:text-[#F5F7FF] transition-colors">
                  از ایده تا محصول
                </a>
              </li>
              <li>
                <a href="#process" className="hover:text-[#F5F7FF] transition-colors">
                  فرآیند توسعه
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-[#F5F7FF] transition-colors">
                  نمونه‌کارها
                </a>
              </li>
              <li>
                <Link
                  to="/admin/content"
                  className="inline-flex items-center gap-1.5 text-[var(--accent-lavender)] hover:text-[#F5F7FF] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>مدیریت سایت و تنظیمات</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Services Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#F5F7FF]">خدمات تخصصی</h3>
            <ul className="space-y-2.5 text-sm">
              {config.services.map((srv) => (
                <li key={srv.id}>
                  <a
                    href={`#service-${srv.id}`}
                    className="hover:text-[#F5F7FF] transition-colors"
                  >
                    {srv.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Configurable Contact & Socials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#F5F7FF]">ارتباط با ما</h3>
            <div className="space-y-3 text-sm">
              {showPhoneInFooter && (
                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-[var(--accent-secondary)] shrink-0 mt-1" />
                  {hasConfiguredPhone ? (
                    <div className="space-y-1">
                      <a
                        href={`tel:${primaryPhone.trim()}`}
                        dir="ltr"
                        className="block font-mono-code text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                      >
                        {primaryPhone}
                      </a>
                      {secondaryPhone.trim().length > 0 && (
                        <a
                          href={`tel:${secondaryPhone.trim()}`}
                          dir="ltr"
                          className="block font-mono-code text-xs text-[#A5AEC5] hover:text-[#F5F7FF] transition-colors"
                        >
                          {secondaryPhone}
                        </a>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-[#A5AEC5]" data-testid="footer-phone-placeholder">
                      {phonePlaceholderText}
                    </span>
                  )}
                </div>
              )}

              {email.trim().length > 0 && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[var(--accent-primary)] shrink-0" />
                  <a
                    href={`mailto:${email.trim()}`}
                    dir="ltr"
                    className="font-mono-code text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                  >
                    {email}
                  </a>
                </div>
              )}

              {/* Social Links (only rendered if configured in admin) */}
              {(whatsappUrl.trim() || telegramUrl.trim() || instagramUrl.trim()) && (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {whatsappUrl.trim() && (
                    <a
                      href={whatsappUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                    >
                      <span>واتساپ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {telegramUrl.trim() && (
                    <a
                      href={telegramUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                    >
                      <span>تلگرام</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {instagramUrl.trim() && (
                    <a
                      href={instagramUrl.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                    >
                      <span>اینستاگرام</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Legal & Editable Company Credit */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A5AEC5]">
          <p>{copyrightText}</p>
          <p
            className="font-medium text-[#F5F7FF]"
            data-testid="footer-company-credit"
          >
            {footerCredit}
          </p>
        </div>
      </div>
    </footer>
  );
};
