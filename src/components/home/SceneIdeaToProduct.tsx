import React, { useEffect, useRef, useState } from 'react';
import { useSiteConfig } from '../../store/ConfigContext';
import { getScrollStageIndex } from '../../utils/validation';

export const SceneIdeaToProduct: React.FC = () => {
  const { config, prefersReducedMotion } = useSiteConfig();
  const { ideaSectionTitle, ideaSectionSubtitle, ideaStages } = config.general;
  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [manualStage, setManualStage] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalScrollable = rect.height - viewportHeight * 0.4;
      if (totalScrollable <= 0) return;
      const raw = (viewportHeight * 0.5 - rect.top) / totalScrollable;
      const clamped = Math.max(0, Math.min(1, raw));
      setScrollProgress(clamped);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const computedStageIndex = getScrollStageIndex(scrollProgress, ideaStages.length);
  const activeStageIndex = manualStage !== null ? manualStage : computedStageIndex;

  return (
    <section
      id="idea-to-product"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#080A12] border-t border-[var(--border-color)]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="text-xs font-medium text-[var(--accent-secondary)]">
            معماری محصول دیجیتال · دگردیسی گام‌به‌گام
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F5F7FF] text-balance leading-tight">
            {ideaSectionTitle}
          </h2>
          <p className="text-base text-[#A5AEC5] leading-relaxed">
            {ideaSectionSubtitle}
          </p>
        </div>

        {/* Scroll-Driven 2-Column Transformation Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Right Column (RTL): Stage Selector & Narrative Steps */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {ideaStages.map((stage, idx) => {
              const isActive = idx === activeStageIndex;
              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => setManualStage(idx === manualStage ? null : idx)}
                  className={`w-full text-right p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#141A2B] border-[var(--accent-primary)] shadow-lg'
                      : 'bg-[#0E1220]/70 border-[var(--border-color)] hover:border-[#38BDF8]/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="text-xs font-mono-code text-[var(--accent-secondary)]">
                      مرحله {stage.step}
                    </span>
                    <span className="text-xs text-[#A5AEC5]">
                      {isActive ? 'مرحله فعال در اسکرول' : 'انتخاب مرحله'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#F5F7FF] mb-1">
                    {stage.title}
                  </h3>
                  <p className="text-xs text-[var(--accent-lavender)] mb-2">
                    {stage.subtitle}
                  </p>
                  <p
                    className={`text-sm leading-relaxed transition-opacity duration-200 ${
                      isActive ? 'text-[#F5F7FF]/90 opacity-100' : 'text-[#A5AEC5] opacity-75'
                    }`}
                  >
                    {stage.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Left Column (RTL): Layered Interactive Blueprint & Product Visualizer */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative flex-1 min-h-[440px] rounded-2xl bg-[#0E1220] border border-[var(--border-color)] p-8 flex flex-col justify-between overflow-hidden">
              {/* Top Stage Progress Bar */}
              <div className="relative z-10 flex items-center justify-between gap-4 pb-6 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#F5F7FF]">
                    {ideaStages[activeStageIndex]?.title}
                  </span>
                  <span aria-hidden="true" className="text-[#A5AEC5]">·</span>
                  <span className="text-xs text-[#A5AEC5]">
                    {ideaStages[activeStageIndex]?.subtitle}
                  </span>
                </div>
                <div className="text-xs font-mono-code text-[var(--accent-secondary)] tabular-nums">
                  {Math.round(((activeStageIndex + 1) / ideaStages.length) * 100)}%
                </div>
              </div>

              {/* Central Morphing Visual Canvas */}
              <div className="relative my-auto py-8 flex items-center justify-center">
                {/* Ambient Stage Glow */}
                <div
                  className="absolute w-72 h-72 rounded-full pointer-events-none transition-all duration-300"
                  style={{
                    background:
                      activeStageIndex === 0
                        ? 'radial-gradient(circle, rgba(139,92,246,0.28) 0%, rgba(8,10,18,0) 70%)'
                        : activeStageIndex === 1
                        ? 'radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(8,10,18,0) 70%)'
                        : activeStageIndex === 2
                        ? 'radial-gradient(circle, rgba(167,139,250,0.26) 0%, rgba(8,10,18,0) 70%)'
                        : 'radial-gradient(circle, rgba(56,189,248,0.32) 0%, rgba(139,92,246,0.18) 45%, rgba(8,10,18,0) 75%)',
                    transform: prefersReducedMotion
                      ? 'scale(1)'
                      : `scale(${1 + scrollProgress * 0.25})`,
                  }}
                />

                {/* Stage 0: Abstract Glowing Idea Core */}
                {activeStageIndex === 0 && (
                  <div className="relative z-10 w-full max-w-md aspect-[16/10] flex flex-col items-center justify-center p-6 rounded-xl border border-[#8B5CF6]/40 bg-[#141A2B]/60">
                    <svg
                      viewBox="0 0 320 180"
                      className="w-full h-44"
                      aria-label="نمودار مفهومی شکل‌گیری ایده"
                    >
                      <defs>
                        <linearGradient id="ideaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#38BDF8" />
                        </linearGradient>
                      </defs>
                      <circle cx="160" cy="90" r="46" fill="none" stroke="url(#ideaGrad)" strokeWidth="2" strokeDasharray="6 4" />
                      <circle cx="160" cy="90" r="24" fill="url(#ideaGrad)" fillOpacity="0.25" stroke="#A78BFA" strokeWidth="1.5" />
                      <path d="M70 90 Q115 40 160 90 T250 90" fill="none" stroke="#38BDF8" strokeWidth="1.5" opacity="0.7" />
                      <path d="M70 90 Q115 140 160 90 T250 90" fill="none" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.7" />
                      <circle cx="70" cy="90" r="5" fill="#38BDF8" />
                      <circle cx="160" cy="90" r="7" fill="#F5F7FF" />
                      <circle cx="250" cy="90" r="5" fill="#8B5CF6" />
                    </svg>
                    <p className="text-xs text-[#A5AEC5] text-center mt-2">
                      تبدیل نیازمندی‌های پراکنده کسب‌وکار به یک هسته مفهومی متمرکز
                    </p>
                  </div>
                )}

                {/* Stage 1: Structured Architectural Wireframe */}
                {activeStageIndex === 1 && (
                  <div className="relative z-10 w-full max-w-md p-5 rounded-xl border border-[#38BDF8]/50 bg-[#141A2B]/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-dashed border-[#252D43] pb-3">
                      <div className="h-3 w-24 rounded bg-[#38BDF8]/30" />
                      <div className="flex gap-2">
                        <div className="h-2.5 w-10 rounded bg-[#252D43]" />
                        <div className="h-2.5 w-10 rounded bg-[#252D43]" />
                        <div className="h-2.5 w-10 rounded bg-[#252D43]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 h-24 rounded-lg border border-dashed border-[#38BDF8]/50 p-3 flex flex-col justify-between">
                        <div className="h-3 w-3/4 rounded bg-[#38BDF8]/25" />
                        <div className="h-2 w-1/2 rounded bg-[#252D43]" />
                        <div className="h-6 w-24 rounded border border-[#38BDF8]/60" />
                      </div>
                      <div className="col-span-1 h-24 rounded-lg border border-dashed border-[#8B5CF6]/50 flex items-center justify-center text-xs font-mono-code text-[#A5AEC5]">
                        UX Grid
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-14 rounded border border-dashed border-[#252D43]" />
                      <div className="h-14 rounded border border-dashed border-[#252D43]" />
                      <div className="h-14 rounded border border-dashed border-[#252D43]" />
                    </div>
                  </div>
                )}

                {/* Stage 2: Refined User Interface */}
                {activeStageIndex === 2 && (
                  <div className="relative z-10 w-full max-w-md p-6 rounded-xl border border-[#8B5CF6] bg-[#141A2B] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252D43]">
                      <span className="text-xs font-bold text-[#F5F7FF]">رابط کاربری اختصاصی</span>
                      <span className="text-xs font-mono-code text-[#38BDF8]">RTL Design System</span>
                    </div>
                    <div className="p-4 rounded-lg bg-[#0E1220] border border-[#252D43] space-y-2">
                      <div className="text-sm font-bold text-[#F5F7FF]">
                        تجربه بصری یکپارچه و خوانا
                      </div>
                      <p className="text-xs text-[#A5AEC5] leading-relaxed">
                        رنگ‌بندی مهندسی‌شده، سلسله‌مراتب تایپوگرافی وزیرمتن و کامپوننت‌های تعاملی استاندارد.
                      </p>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="px-3 py-1 rounded bg-[#8B5CF6] text-[#F5F7FF] text-xs font-medium">
                          ثبت درخواست
                        </span>
                        <span className="px-3 py-1 rounded border border-[#252D43] text-[#A5AEC5] text-xs">
                          مشاهده جزئیات
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 3: Connected Digital Product Ecosystem */}
                {activeStageIndex === 3 && (
                  <div className="relative z-10 w-full max-w-md p-6 rounded-xl border border-[#38BDF8] bg-[#141A2B] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#252D43]">
                      <span className="text-xs font-bold text-[#F5F7FF]">
                        اکوسیستم محصول نهایی (Web · Mobile · AI)
                      </span>
                      <span className="text-xs font-mono-code text-[#38BDF8]">Production Ready</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-lg bg-[#0E1220] border border-[#252D43]">
                        <div className="text-xs font-bold text-[#F5F7FF] mb-1">وب و React</div>
                        <div className="text-xs text-[#A5AEC5]">رندرینگ سریع و سئو کامل</div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#0E1220] border border-[#252D43]">
                        <div className="text-xs font-bold text-[#F5F7FF] mb-1">اپلیکیشن موبایل</div>
                        <div className="text-xs text-[#A5AEC5]">Android و iOS همگام</div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#0E1220] border border-[#252D43]">
                        <div className="text-xs font-bold text-[#F5F7FF] mb-1">هسته وردپرس اختصاصی</div>
                        <div className="text-xs text-[#A5AEC5]">مدیریت محتوای آسان</div>
                      </div>
                      <div className="p-3.5 rounded-lg bg-[#0E1220] border border-[#8B5CF6]/50">
                        <div className="text-xs font-bold text-[#A78BFA] mb-1">هوش مصنوعی متصل</div>
                        <div className="text-xs text-[#A5AEC5]">پردازش و اتوماسیون هوشمند</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Stage Scrubbing Controls */}
              <div className="relative z-10 pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {ideaStages.map((st, i) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setManualStage(i)}
                      aria-label={`نمایش مرحله ${st.title}`}
                      className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                        i === activeStageIndex
                          ? 'w-10 bg-[var(--accent-primary)]'
                          : 'w-3 bg-[#252D43] hover:bg-[#38BDF8]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-[#A5AEC5]">
                  با اسکرول صفحه یا کلیک روی مراحل، تکامل محصول را ببینید
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
