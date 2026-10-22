import React from 'react';
import { Layers, ExternalLink } from 'lucide-react';
import { useSiteConfig } from '../../store/ConfigContext';
import { getPublicPortfolioProjects } from '../../utils/validation';

const PLACEHOLDER_BLUEPRINTS = [
  {
    id: 'slot-1',
    slotLabel: 'محصول وب و پلتفرم React',
    architectureLabel: 'معماری فرانت‌اند ماژولار',
  },
  {
    id: 'slot-2',
    slotLabel: 'سامانه اختصاصی وردپرس',
    architectureLabel: 'پوسته و هسته سفارشی',
  },
  {
    id: 'slot-3',
    slotLabel: 'اپلیکیشن موبایل کراس‌پلتفرم',
    architectureLabel: 'نسخه Android و iOS',
  },
  {
    id: 'slot-4',
    slotLabel: 'اتوماسیون و هوش مصنوعی',
    architectureLabel: 'یکپارچه‌سازی مدل‌های هوشمند',
  },
];

export const ScenePortfolio: React.FC = () => {
  const { config } = useSiteConfig();
  const { portfolio } = config;
  const visibleProjects = getPublicPortfolioProjects(portfolio);
  const showComingSoon = portfolio.comingSoonMode || visibleProjects.length === 0;

  return (
    <section
      id="portfolio"
      className="relative py-24 lg:py-32 bg-[#0E1220] border-t border-[var(--border-color)]"
      data-testid="portfolio-section"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading & Deliberate Status Notice */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-2xl space-y-4">
            <div className="text-xs font-medium text-[var(--accent-secondary)]">
              ویترین پروژه‌ها · شفافیت و اصالت
            </div>
            <h2
              className="text-3xl md:text-4xl font-extrabold text-[#F5F7FF]"
              data-testid="portfolio-heading"
            >
              {portfolio.heading}
            </h2>
            <p className="text-base text-[#A5AEC5] leading-relaxed">
              {portfolio.description}
            </p>
          </div>
        </div>

        {showComingSoon ? (
          <div className="space-y-10" data-testid="portfolio-coming-soon-view">
            {/* Intentional Loading / Preparation Banner */}
            <div className="p-6 md:p-8 rounded-2xl bg-[#141A2B] border border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-[var(--accent-primary)] shrink-0" />
                  <h3
                    className="text-lg font-bold text-[#F5F7FF]"
                    data-testid="portfolio-status-text"
                  >
                    {portfolio.statusText}
                  </h3>
                </div>
                <p className="text-sm text-[#A5AEC5] leading-relaxed">
                  {portfolio.description}
                </p>
              </div>

              <div className="text-xs font-mono-code text-[var(--accent-secondary)] shrink-0">
                وضعیت: در حال مستندسازی پروژه‌های واقعی
              </div>
            </div>

            {/* 4 Intentional Coming-Soon Architectural Cards (Not fake projects) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {PLACEHOLDER_BLUEPRINTS.map((slot, index) => (
                <div
                  key={slot.id}
                  className="rounded-2xl bg-[#141A2B]/75 border border-[var(--border-color)] p-6 flex flex-col justify-between min-h-[290px] relative overflow-hidden"
                  data-testid="portfolio-placeholder-card"
                >
                  {/* Abstract Animated Architectural Preview Frame */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-[#A5AEC5]">
                      <span className="font-mono-code">۰{index + 1}</span>
                      <span className="font-semibold text-[var(--accent-lavender)]">
                        به‌زودی
                      </span>
                    </div>

                    {/* Deliberate Skeleton / Blueprint Wireframe Visual */}
                    <div className="h-32 rounded-xl bg-[#080A12] border border-[#252D43] p-4 flex flex-col justify-between relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="h-2.5 w-16 rounded bg-[#252D43]" />
                        <div className="h-2 w-8 rounded bg-[#8B5CF6]/30" />
                      </div>
                      <div className="space-y-2">
                        <div className="h-2.5 w-3/4 rounded bg-[#141A2B]" />
                        <div className="h-2 w-1/2 rounded bg-[#252D43]/80" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        <div className="h-5 rounded bg-[#141A2B] border border-[#252D43]/60" />
                        <div className="h-5 rounded bg-[#141A2B] border border-[#252D43]/60" />
                        <div className="h-5 rounded bg-[#8B5CF6]/15 border border-[#8B5CF6]/30" />
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-5 mt-4 border-t border-[var(--border-color)]/70 space-y-1">
                    <div className="text-sm font-bold text-[#F5F7FF]">
                      {slot.slotLabel}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#A5AEC5]">
                      <span>{slot.architectureLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-[var(--accent-secondary)]">به‌زودی</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Published Real Projects View (when Coming-Soon mode is disabled in Admin) */
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-testid="portfolio-published-grid"
          >
            {visibleProjects.map((project) => (
              <article
                key={project.id}
                className="rounded-2xl bg-[#141A2B] border border-[var(--border-color)] hover:border-[var(--accent-primary)] transition-colors p-7 flex flex-col justify-between"
                data-testid="published-project-card"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-[var(--accent-secondary)] mb-3">
                    <span>{project.category}</span>
                    {project.technologies.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#A5AEC5] font-latin">
                          {project.technologies.join(' / ')}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-[#F5F7FF] mb-3">
                    {project.title}
                  </h3>
                  <p className="text-sm text-[#A5AEC5] leading-relaxed mb-6">
                    {project.summary}
                  </p>
                </div>

                {project.linkUrl && (
                  <div className="pt-4 border-t border-[var(--border-color)]">
                    <a
                      href={project.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-secondary)] hover:text-[#F5F7FF] transition-colors"
                    >
                      <span>مشاهده پروژه</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
