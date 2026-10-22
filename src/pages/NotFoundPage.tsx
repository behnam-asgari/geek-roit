import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import { useSiteConfig } from '../store/ConfigContext';

export const NotFoundPage: React.FC = () => {
  const { config, getButtonClasses } = useSiteConfig();

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F5F7FF] flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-6 p-8 rounded-2xl bg-[#0E1220] border border-[var(--border-color)]">
        <div className="w-12 h-12 rounded-xl bg-[#141A2B] border border-[var(--border-color)] flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6 text-[var(--accent-secondary)]" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono-code text-[var(--accent-primary)]">
            ERROR 404
          </div>
          <h1 className="text-2xl font-extrabold text-[#F5F7FF]">
            صفحه مورد نظر یافت نشد
          </h1>
          <p className="text-sm text-[#A5AEC5] leading-relaxed">
            مسیر واردشده در وب‌سایت استودیو {config.general.brandName} وجود ندارد یا جابه‌جا شده است.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className={`${getButtonClasses('primary')} inline-flex items-center gap-2`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به صفحه اصلی</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
