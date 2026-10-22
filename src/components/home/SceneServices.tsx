import React, { useState } from 'react';
import { Globe, Code2, Smartphone, Cpu, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useSiteConfig } from '../../store/ConfigContext';

export const SceneServices: React.FC = () => {
  const { config } = useSiteConfig();
  const { servicesSectionTitle, servicesSectionSubtitle } = config.general;
  const services = config.services;
  const [activeServiceId, setActiveServiceId] = useState<string>(
    services[0]?.id || 'srv-wordpress'
  );

  const getServiceIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Globe className="w-6 h-6 text-[var(--accent-secondary)]" />;
      case 1:
        return <Code2 className="w-6 h-6 text-[var(--accent-primary)]" />;
      case 2:
        return <Smartphone className="w-6 h-6 text-[var(--accent-lavender)]" />;
      default:
        return <Cpu className="w-6 h-6 text-[var(--accent-secondary)]" />;
    }
  };

  return (
    <section
      id="services"
      className="relative py-24 lg:py-32 bg-[#0E1220] border-t border-[var(--border-color)]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="text-xs font-medium text-[var(--accent-lavender)]">
              توانمندی‌های فنی · مهندسی نرم‌افزار
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#F5F7FF] text-balance">
              {servicesSectionTitle}
            </h2>
            <p className="text-base text-[#A5AEC5] leading-relaxed">
              {servicesSectionSubtitle}
            </p>
          </div>

          <a
            href="#contact-finale"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent-secondary)] hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0"
          >
            <span>مشاوره انتخاب فناوری مناسب</span>
            <ArrowLeft className="w-4 h-4" />
          </a>
        </div>

        {/* Asymmetric Interactive Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {services.map((service, index) => {
            const isExpanded = service.id === activeServiceId;
            // Asymmetric column spans on large screens
            const colSpanClass =
              index === 0 || index === 3 ? 'lg:col-span-7' : 'lg:col-span-5';

            return (
              <article
                key={service.id}
                id={`service-${service.id}`}
                onClick={() => setActiveServiceId(service.id)}
                className={`${colSpanClass} rounded-2xl p-8 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                  isExpanded
                    ? 'bg-[#141A2B] border-[var(--accent-primary)] shadow-xl'
                    : 'bg-[#080A12]/80 border-[var(--border-color)] hover:border-[#38BDF8]/50'
                }`}
              >
                <div>
                  {/* Editorial Index & Unboxed Metadata */}
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 text-xs text-[#A5AEC5]">
                      <span className="font-mono-code font-bold text-sm text-[var(--accent-primary)]">
                        {service.number}.
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-latin">{service.tag}</span>
                    </div>
                    {getServiceIcon(index)}
                  </div>

                  {/* Primary Service Title */}
                  <h3 className="text-2xl font-bold text-[#F5F7FF] mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm font-medium text-[var(--accent-lavender)] mb-4">
                    {service.subtitle}
                  </p>
                  <p className="text-sm text-[#A5AEC5] leading-relaxed mb-6">
                    {service.description}
                  </p>

                  {/* Deliverables List */}
                  <ul className="space-y-2.5 mb-8 pt-4 border-t border-[var(--border-color)]">
                    {service.deliverables.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-[#F5F7FF]/90"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[var(--accent-secondary)] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Semantic Action Link */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveServiceId(service.id);
                    }}
                    className="text-xs font-medium text-[#A5AEC5] hover:text-[#F5F7FF] transition-colors cursor-pointer"
                  >
                    {isExpanded ? 'سرویس انتخاب‌شده' : 'بررسی جزئیات سرویس'}
                  </button>
                  <a
                    href={`#contact-finale?service=${encodeURIComponent(service.title)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-secondary)] hover:text-[#F5F7FF] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>سفارش در این حوزه</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
