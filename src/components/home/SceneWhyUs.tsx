import React from 'react';
import { ShieldCheck, Layers, Sparkles, Smartphone, MessageSquare, Code } from 'lucide-react';
import { useSiteConfig } from '../../store/ConfigContext';

export const SceneWhyUs: React.FC = () => {
  const { config } = useSiteConfig();
  const { whyUsSectionTitle, whyUsSectionSubtitle, whyUsItems } = config.general;

  const getWhyIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return <Layers className="w-5 h-5 text-[var(--accent-primary)]" />;
      case 1:
        return <Code className="w-5 h-5 text-[var(--accent-secondary)]" />;
      case 2:
        return <Sparkles className="w-5 h-5 text-[var(--accent-lavender)]" />;
      case 3:
        return <Smartphone className="w-5 h-5 text-[var(--accent-secondary)]" />;
      case 4:
        return <MessageSquare className="w-5 h-5 text-[var(--accent-primary)]" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-[var(--accent-lavender)]" />;
    }
  };

  return (
    <section
      id="why-geekroit"
      className="relative py-24 lg:py-32 bg-[#080A12] border-t border-[var(--border-color)]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="text-xs font-medium text-[var(--accent-lavender)]">
            ارزش‌های مهندسی · تعهد حرفه‌ای
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#F5F7FF] text-balance">
            {whyUsSectionTitle}
          </h2>
          <p className="text-base text-[#A5AEC5] leading-relaxed">
            {whyUsSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyUsItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] hover:border-[#8B5CF6]/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-mono-code text-[#A5AEC5]">
                    ۰{idx + 1}
                  </span>
                  {getWhyIcon(idx)}
                </div>
                <h3 className="text-lg font-bold text-[#F5F7FF] mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-[#A5AEC5] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
