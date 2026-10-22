import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft } from 'lucide-react';
import { useSiteConfig } from '../store/ConfigContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { DigitalCoreCanvas } from '../components/three/DigitalCoreCanvas';
import { SceneIdeaToProduct } from '../components/home/SceneIdeaToProduct';
import { SceneServices } from '../components/home/SceneServices';
import { SceneProcess } from '../components/home/SceneProcess';
import { ScenePortfolio } from '../components/home/ScenePortfolio';
import { SceneWhyUs } from '../components/home/SceneWhyUs';
import { SceneFinale } from '../components/home/SceneFinale';

export const HomePage: React.FC = () => {
  const { config, prefersReducedMotion, getButtonClasses } = useSiteConfig();
  const [heroScrollProgress, setHeroScrollProgress] = useState<number>(0);
  const [pageScrollProgress, setPageScrollProgress] = useState<number>(0);

  const {
    heroKicker,
    heroTitle,
    heroDescription,
    heroPrimaryCta,
    heroSecondaryCta,
  } = config.general;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = Math.max(window.innerHeight, 1);
      const maxDocScroll = Math.max(
        document.documentElement.scrollHeight - vh,
        1
      );

      setHeroScrollProgress(Math.max(0, Math.min(1, scrollY / vh)));
      setPageScrollProgress(Math.max(0, Math.min(1, scrollY / maxDocScroll)));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Scroll-driven opacity and transform for Hero headline
  const heroTextOpacity = prefersReducedMotion
    ? 1
    : Math.max(0, 1 - heroScrollProgress * 1.35);
  const heroTextTranslateY = prefersReducedMotion
    ? 0
    : -heroScrollProgress * 48;

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F5F7FF] flex flex-col">
      {/* Top Scroll Progress Indicator Line */}
      <div className="fixed top-0 inset-x-0 h-0.5 z-50 bg-transparent pointer-events-none">
        <div
          className="h-full bg-gradient-to-l from-[var(--accent-primary)] to-[var(--accent-secondary)] transition-transform duration-75 origin-right"
          style={{ transform: `scaleX(${pageScrollProgress})` }}
        />
      </div>

      <Navbar />

      <main className="flex-1">
        {/* Scene 1: Hero — The Digital Universe (Full-bleed 100vw x 100vh 3D viewport + Semantic RTL Overlay) */}
        <section
          id="hero"
          className="relative w-full h-screen min-h-[680px] overflow-hidden flex items-center"
        >
          {/* Full-Bleed Three.js 3D Digital Core Scene */}
          <div className="absolute inset-0 z-0">
            <DigitalCoreCanvas
              scrollProgress={heroScrollProgress}
              primaryColor={config.theme.primaryAccent}
              secondaryColor={config.theme.secondaryAccent}
              reducedMotion={prefersReducedMotion}
            />
          </div>

          {/* Measured Gradient Scrim for Guaranteed WCAG AA Text Contrast on Right RTL Side */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background:
                'linear-gradient(270deg, rgba(8,10,18,0.92) 0%, rgba(8,10,18,0.72) 45%, rgba(8,10,18,0.22) 100%)',
            }}
          />

          {/* Semantic DOM Hero Copy Overlay */}
          <div className="relative z-20 max-w-7xl mx-auto w-full px-6 pt-16 pointer-events-none">
            <div
              className="max-w-2xl space-y-6 pointer-events-auto"
              style={{
                opacity: heroTextOpacity,
                transform: `translateY(${heroTextTranslateY}px)`,
              }}
            >
              <div className="text-xs md:text-sm font-medium text-[var(--accent-secondary)]">
                {heroKicker}
              </div>

              <h1
                className="font-extrabold text-[#F5F7FF] leading-[1.22] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4.2vw, 3.75rem)' }}
              >
                {heroTitle}
              </h1>

              <p className="text-base md:text-lg text-[#A5AEC5] leading-relaxed max-w-xl">
                {heroDescription}
              </p>

              {/* Hero CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <a
                  href="#contact-finale"
                  className={`${getButtonClasses('primary')} inline-flex items-center gap-2`}
                >
                  <span>{heroPrimaryCta}</span>
                  <ArrowLeft className="w-4 h-4" />
                </a>

                <a
                  href="#services"
                  className={getButtonClasses('secondary')}
                >
                  {heroSecondaryCta}
                </a>
              </div>

              {/* Clean Unboxed Capabilities Summary */}
              <div className="pt-6 flex flex-wrap items-center gap-3 text-xs text-[#A5AEC5]">
                <span>طراحی سایت با وردپرس</span>
                <span aria-hidden="true">·</span>
                <span>توسعه وب با React</span>
                <span aria-hidden="true">·</span>
                <span>اپلیکیشن Android و iOS</span>
                <span aria-hidden="true">·</span>
                <span>راهکارهای هوش مصنوعی</span>
              </div>
            </div>
          </div>

          {/* Subtle Scroll Indicator */}
          <a
            href="#idea-to-product"
            aria-label="اسکرول به بخش بعدی"
            className="absolute bottom-20 right-6 md:right-12 z-20 inline-flex items-center gap-2 text-xs text-[#A5AEC5] hover:text-[#F5F7FF] transition-colors"
          >
            <span>اسکرول برای روایت داستان</span>
            <ArrowDown className="w-4 h-4 text-[var(--accent-secondary)]" />
          </a>
        </section>

        {/* Scene 2 — From Idea to Product */}
        <SceneIdeaToProduct />

        {/* Scene 3 — Services */}
        <SceneServices />

        {/* Scene 4 — The Development Process */}
        <SceneProcess />

        {/* Scene 5 — Portfolio Loading State (or Published Projects) */}
        <ScenePortfolio />

        {/* Scene 6 — Why Geek roit */}
        <SceneWhyUs />

        {/* Scene 7 — Contact Finale */}
        <SceneFinale />
      </main>

      <Footer />
    </div>
  );
};
