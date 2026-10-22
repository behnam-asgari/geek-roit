import React, { useEffect, useRef, useState } from 'react';
import { useSiteConfig } from '../../store/ConfigContext';
import { getScrollStageIndex } from '../../utils/validation';

export const SceneProcess: React.FC = () => {
  const { config } = useSiteConfig();
  const { processSectionTitle, processSectionSubtitle } = config.general;
  const stages = config.processStages;

  const sectionRef = useRef<HTMLElement | null>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const raw = (vh * 0.65 - rect.top) / Math.max(rect.height, 1);
      setScrollProgress(Math.max(0, Math.min(1, raw)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const scrollStageIdx = getScrollStageIndex(scrollProgress, stages.length);
  const activeIdx = selectedStage !== null ? selectedStage : scrollStageIdx;

  return (
    <section
      id="process"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-[#080A12] border-t border-[var(--border-color)]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="text-xs font-medium text-[var(--accent-secondary)]">
            چرخه حیات پروژه · استاندارد اجرایی
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F5F7FF] text-balance">
            {processSectionTitle}
          </h2>
          <p className="text-base text-[#A5AEC5] leading-relaxed">
            {processSectionSubtitle}
          </p>
        </div>

        {/* Desktop Scroll-Linked Horizontal Progression Bar */}
        <div className="hidden lg:block mb-12">
          <div className="relative h-1.5 w-full bg-[#141A2B] rounded-full overflow-hidden mb-8">
            <div
              className="position-right top-0 bottom-0 h-full bg-gradient-to-l from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-all duration-200"
              style={{
                width: `${Math.max(12, ((activeIdx + 1) / stages.length) * 100)}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-5 gap-5">
            {stages.map((stage, idx) => {
              const isCurrent = idx === activeIdx;
              const isPassed = idx <= activeIdx;

              return (
                <div
                  key={stage.id}
                  onClick={() => setSelectedStage(idx)}
                  className={`p-6 rounded-xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-[#141A2B] border-[var(--accent-primary)] shadow-lg -translate-y-1'
                      : isPassed
                      ? 'bg-[#0E1220] border-[#38BDF8]/40'
                      : 'bg-[#0E1220]/50 border-[var(--border-color)] opacity-75 hover:opacity-100'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-mono-code font-bold text-[var(--accent-secondary)]">
                        گام {stage.stepNumber}
                      </span>
                      <span className="text-xs text-[#A5AEC5]">
                        {isCurrent ? 'فعال' : isPassed ? 'تکمیل‌شده' : 'گام بعدی'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#F5F7FF] mb-1.5">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-[var(--accent-lavender)] mb-3">
                      {stage.subtitle}
                    </p>
                    <p className="text-xs text-[#A5AEC5] leading-relaxed mb-6">
                      {stage.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-color)] text-xs text-[#F5F7FF]/90">
                    <span className="text-[#A5AEC5] block mb-0.5">خروجی مرحله:</span>
                    <span className="font-medium">{stage.deliverable}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile & Tablet Vertical Connected Timeline */}
        <div className="lg:hidden space-y-4">
          {stages.map((stage, idx) => {
            const isCurrent = idx === activeIdx;
            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(idx)}
                className={`p-6 rounded-xl border transition-colors ${
                  isCurrent
                    ? 'bg-[#141A2B] border-[var(--accent-primary)]'
                    : 'bg-[#0E1220] border-[var(--border-color)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono-code text-[var(--accent-secondary)]">
                    گام {stage.stepNumber}
                  </span>
                  <span className="text-xs text-[#A5AEC5]">{stage.deliverable}</span>
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FF] mb-1">
                  {stage.title}
                </h3>
                <p className="text-xs text-[var(--accent-lavender)] mb-2">
                  {stage.subtitle}
                </p>
                <p className="text-sm text-[#A5AEC5] leading-relaxed">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
