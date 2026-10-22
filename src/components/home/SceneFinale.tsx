import React, { useState } from 'react';
import { Phone, Mail, Send, CheckCircle2, Info } from 'lucide-react';
import { useSiteConfig } from '../../store/ConfigContext';
import { validateInquiryForm } from '../../utils/validation';

export const SceneFinale: React.FC = () => {
  const { config, submitProjectInquiry, getButtonClasses } = useSiteConfig();
  const {
    finaleHeadline,
    finaleDescription,
    finalePrimaryCta,
    phonePlaceholderText,
  } = config.general;

  const {
    primaryPhone,
    secondaryPhone,
    email,
    showPhoneInFinale,
  } = config.contact;

  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [serviceType, setServiceType] = useState(
    config.services[0]?.title || 'طراحی سایت با وردپرس'
  );
  const [projectSummary, setProjectSummary] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedRecord, setSubmittedRecord] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const hasPhone = primaryPhone.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateInquiryForm({
      name,
      contactInfo,
      serviceType,
      projectSummary,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const record = submitProjectInquiry({
      name: name.trim(),
      contactInfo: contactInfo.trim(),
      serviceType,
      projectSummary: projectSummary.trim(),
    });
    setSubmittedRecord({ id: record.id, name: record.name });
    setName('');
    setContactInfo('');
    setProjectSummary('');
  };

  return (
    <section
      id="contact-finale"
      className="relative py-24 lg:py-32 bg-[#0E1220] border-t border-[var(--border-color)] overflow-hidden"
    >
      {/* Subtle Ambient Background Gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.14), transparent 50%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.12), transparent 50%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Right Column: Finale Statement & Configurable Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="text-xs font-medium text-[var(--accent-secondary)]">
                آغاز همکاری · مشاوره و امکان‌سنجی
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-[#F5F7FF] leading-tight text-balance">
                {finaleHeadline}
              </h2>
              <p className="text-base text-[#A5AEC5] leading-relaxed">
                {finaleDescription}
              </p>
            </div>

            {/* Direct Contact Details Box */}
            <div className="p-6 rounded-2xl bg-[#141A2B] border border-[var(--border-color)] space-y-5">
              <h3 className="text-sm font-bold text-[#F5F7FF]">
                راه‌های ارتباط مستقیم
              </h3>

              {showPhoneInFinale && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[var(--accent-secondary)] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs text-[#A5AEC5] block">شماره تماس:</span>
                    {hasPhone ? (
                      <div className="space-y-1">
                        <a
                          href={`tel:${primaryPhone.trim()}`}
                          dir="ltr"
                          className="block text-base font-mono-code font-bold text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                          data-testid="finale-configured-phone"
                        >
                          {primaryPhone}
                        </a>
                        {secondaryPhone.trim().length > 0 && (
                          <a
                            href={`tel:${secondaryPhone.trim()}`}
                            dir="ltr"
                            className="block text-sm font-mono-code text-[#A5AEC5] hover:text-[#F5F7FF] transition-colors"
                          >
                            {secondaryPhone}
                          </a>
                        )}
                      </div>
                    ) : (
                      <span
                        className="text-sm text-[#A5AEC5]"
                        data-testid="finale-phone-placeholder"
                      >
                        {phonePlaceholderText}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {email.trim().length > 0 && (
                <div className="flex items-start gap-3 pt-3 border-t border-[var(--border-color)]">
                  <Mail className="w-5 h-5 text-[var(--accent-primary)] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs text-[#A5AEC5] block">پست الکترونیک:</span>
                    <a
                      href={`mailto:${email.trim()}`}
                      dir="ltr"
                      className="text-sm font-mono-code text-[#F5F7FF] hover:text-[var(--accent-secondary)] transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Left Column: Project Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-2xl bg-[#141A2B] border border-[var(--border-color)] shadow-xl">
              <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--border-color)]">
                <div>
                  <h3 className="text-xl font-bold text-[#F5F7FF]">
                    فرم ثبت درخواست و شروع پروژه
                  </h3>
                  <p className="text-xs text-[#A5AEC5] mt-1">
                    اطلاعات اولیه پروژه خود را ثبت کنید تا ساختار فنی آن را بررسی کنیم.
                  </p>
                </div>
                <span className="text-xs text-[var(--accent-lavender)] whitespace-nowrap shrink-0">
                  نسخه نمایشی (ذخیره محلی)
                </span>
              </div>

              {submittedRecord ? (
                <div
                  className="p-6 rounded-xl bg-[#080A12] border border-[#38BDF8]/50 space-y-4"
                  data-testid="inquiry-success-box"
                >
                  <div className="flex items-center gap-3 text-[#38BDF8]">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <h4 className="text-base font-bold text-[#F5F7FF]">
                      درخواست شما در حافظه نمایشی مرورگر ثبت شد
                    </h4>
                  </div>
                  <p className="text-sm text-[#A5AEC5] leading-relaxed">
                    کاربر گرامی <strong className="text-[#F5F7FF]">{submittedRecord.name}</strong>، این وب‌سایت در حال حاضر در حالت نمایشی بدون سرور (Frontend Demo) اجرا می‌شود. پیام شما در بخش «پنل مدیریت &larr; تنظیمات و درخواست‌ها» در همین مرورگر قابل مشاهده است و به سرور خارجی ارسال نشده است.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedRecord(null)}
                    className="px-4 py-2 rounded-lg bg-[#141A2B] border border-[var(--border-color)] text-xs font-medium text-[#F5F7FF] hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
                  >
                    ثبت یک درخواست دیگر
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="inquiry-name"
                        className="block text-xs font-medium text-[#F5F7FF] mb-2"
                      >
                        نام و نام خانوادگی یا نام مجموعه
                      </label>
                      <input
                        id="inquiry-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="مثلاً: آرش کریمی"
                        className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] placeholder-[#A5AEC5]/50 focus:outline-none focus:border-[var(--accent-primary)]"
                      />
                      {errors.name && (
                        <p className="text-xs text-rose-400 mt-1.5">{errors.name}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="inquiry-contact"
                        className="block text-xs font-medium text-[#F5F7FF] mb-2"
                      >
                        شماره تماس یا آدرس ایمیل
                      </label>
                      <input
                        id="inquiry-contact"
                        type="text"
                        dir="ltr"
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder="0912... / name@company.com"
                        className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] placeholder-[#A5AEC5]/50 focus:outline-none focus:border-[var(--accent-primary)] font-mono-code"
                      />
                      {errors.contactInfo && (
                        <p className="text-xs text-rose-400 mt-1.5">{errors.contactInfo}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-service"
                      className="block text-xs font-medium text-[#F5F7FF] mb-2"
                    >
                      حوزه خدمات مورد نیاز
                    </label>
                    <select
                      id="inquiry-service"
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] focus:outline-none focus:border-[var(--accent-primary)]"
                    >
                      {config.services.map((srv) => (
                        <option key={srv.id} value={srv.title}>
                          {srv.title}
                        </option>
                      ))}
                      <option value="مشاوره جامع و ترکیبی">مشاوره جامع و ترکیبی</option>
                    </select>
                    {errors.serviceType && (
                      <p className="text-xs text-rose-400 mt-1.5">{errors.serviceType}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="inquiry-summary"
                      className="block text-xs font-medium text-[#F5F7FF] mb-2"
                    >
                      شرح مختصر ایده یا نیازمندی‌های پروژه
                    </label>
                    <textarea
                      id="inquiry-summary"
                      rows={4}
                      value={projectSummary}
                      onChange={(e) => setProjectSummary(e.target.value)}
                      placeholder="اهداف پروژه، امکانات کلیدی مورد انتظار یا سوالات فنی خود را بنویسید..."
                      className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] placeholder-[#A5AEC5]/50 focus:outline-none focus:border-[var(--accent-primary)]"
                    />
                    {errors.projectSummary && (
                      <p className="text-xs text-rose-400 mt-1.5">{errors.projectSummary}</p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-2 text-xs text-[#A5AEC5]">
                      <Info className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                      <span>
                        در حالت دمو، فرم در مرورگر ذخیره شده و در پنل ادمین قابل بررسی است.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className={`${getButtonClasses('primary')} inline-flex items-center justify-center gap-2 cursor-pointer`}
                    >
                      <span>{finalePrimaryCta}</span>
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
