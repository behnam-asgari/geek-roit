import React, { useState } from 'react';
import { Link, NavLink, useParams, Navigate } from 'react-router-dom';
import {
  FileText,
  Briefcase,
  FolderGit2,
  Palette,
  PhoneCall,
  ShieldAlert,
  Save,
  RotateCcw,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useSiteConfig } from '../store/ConfigContext';
import { validateContactSettings } from '../utils/validation';
import { ProjectItem, ButtonStyleMode, IntensityLevel } from '../types/config';

const ADMIN_TABS = [
  { id: 'content', label: 'محتوای عمومی', path: '/admin/content', icon: FileText },
  { id: 'services', label: 'خدمات استودیو', path: '/admin/services', icon: Briefcase },
  { id: 'projects', label: 'نمونه‌کارها', path: '/admin/projects', icon: FolderGit2 },
  { id: 'theme', label: 'ظاهر و تم', path: '/admin/theme', icon: Palette },
  { id: 'contact', label: 'اطلاعات تماس', path: '/admin/contact', icon: PhoneCall },
  { id: 'settings', label: 'تنظیمات و امنیت', path: '/admin/settings', icon: ShieldAlert },
];

export const AdminDashboard: React.FC = () => {
  const { section } = useParams<{ section?: string }>();
  const {
    config,
    isDirty,
    inquiries,
    updateDraftConfig,
    saveCurrentConfig,
    discardDraftChanges,
    resetToDefaults,
    clearAllInquiries,
  } = useSiteConfig();

  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  // New project form state in /admin/projects
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('توسعه وب با React');
  const [newProjectSummary, setNewProjectSummary] = useState('');
  const [newProjectTechs, setNewProjectTechs] = useState('React, TypeScript');
  const [newProjectLink, setNewProjectLink] = useState('');
  const [newProjectPublished, setNewProjectPublished] = useState(true);

  if (!section) {
    return <Navigate to="/admin/content" replace />;
  }

  const validTab = ADMIN_TABS.find((t) => t.id === section);
  if (!validTab) {
    return <Navigate to="/admin/content" replace />;
  }

  const triggerSave = () => {
    const validation = validateContactSettings(config.contact);
    if (!validation.valid) {
      setContactErrors(validation.errors);
      setSaveBanner('لطفاً خطاهای اعتبارسنجی در بخش اطلاعات تماس را برطرف کنید.');
      return;
    }
    setContactErrors({});
    saveCurrentConfig();
    setSaveBanner('تغییرات با موفقیت ذخیره شد و در وب‌سایت عمومی اعمال گردید.');
    window.setTimeout(() => setSaveBanner(null), 4000);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    const item: ProjectItem = {
      id: `prj-${Date.now()}`,
      title: newProjectTitle.trim(),
      category: newProjectCategory.trim() || 'وب و نرم‌افزار',
      summary: newProjectSummary.trim() || 'پروژه طراحی و پیاده‌سازی شده در استودیو گیک رویت.',
      technologies: newProjectTechs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      linkUrl: newProjectLink.trim() || undefined,
      published: newProjectPublished,
      order: config.portfolio.projects.length + 1,
    };

    updateDraftConfig((prev) => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        projects: [...prev.portfolio.projects, item],
      },
    }));

    setNewProjectTitle('');
    setNewProjectSummary('');
    setNewProjectLink('');
  };

  const handleMoveProject = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    const list = [...config.portfolio.projects];
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    const reordered = list.map((p, idx) => ({ ...p, order: idx + 1 }));
    updateDraftConfig((prev) => ({
      ...prev,
      portfolio: {
        ...prev.portfolio,
        projects: reordered,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#080A12] text-[#F5F7FF] flex flex-col">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-40 bg-[#0E1220] border-b border-[var(--border-color)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-lg font-extrabold text-[#F5F7FF] font-latin tracking-tight"
            >
              {config.general.brandName}
            </Link>
            <span aria-hidden="true" className="text-[#A5AEC5]">·</span>
            <span className="text-sm font-bold text-[var(--accent-lavender)]">
              پنل مدیریت و پیکربندی سایت
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-[#141A2B] text-xs font-medium text-[#F5F7FF] hover:border-[var(--accent-secondary)] transition-colors whitespace-nowrap shrink-0"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
              <span>مشاهده وب‌سایت عمومی</span>
            </Link>

            {isDirty && (
              <button
                type="button"
                onClick={discardDraftChanges}
                className="px-3.5 py-2 rounded-lg border border-[var(--border-color)] bg-[#080A12] text-xs text-[#A5AEC5] hover:text-[#F5F7FF] transition-colors cursor-pointer"
              >
                لغو تغییرات ذخیره‌نشده
              </button>
            )}

            <button
              type="button"
              onClick={triggerSave}
              data-testid="admin-save-button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--accent-primary)] text-xs font-bold text-[#F5F7FF] hover:opacity-95 transition-opacity whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>ذخیره تغییرات</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3 space-y-6">
          <nav
            aria-label="بخش‌های پنل مدیریت"
            className="p-3 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-1"
          >
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-[#141A2B] text-[#F5F7FF] border border-[var(--accent-primary)]/50'
                        : 'text-[#A5AEC5] hover:text-[#F5F7FF] hover:bg-[#141A2B]/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
                  <span>{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Honest Demo Security Notice */}
          <div className="p-5 rounded-2xl bg-[#141A2B]/70 border border-[var(--border-color)] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5F7FF]">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>وضعیت ذخیره‌سازی: نسخه نمایشی</span>
            </div>
            <p className="text-xs text-[#A5AEC5] leading-relaxed">
              تغییرات شما به‌صورت آنی در لایه داده مشترک و حافظه محلی مرورگر (localStorage) ذخیره می‌شود. برای محیط عملیاتی چندکاربره، اتصال به پایگاه داده سرور یا Supabase الزامی است.
            </p>
          </div>
        </aside>

        {/* Active Section Editor */}
        <main className="lg:col-span-9 space-y-6">
          {saveBanner && (
            <div
              role="status"
              data-testid="admin-save-status"
              className="p-4 rounded-xl bg-[#141A2B] border border-[var(--accent-secondary)] flex items-center justify-between gap-4 text-sm text-[#F5F7FF]"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[var(--accent-secondary)] shrink-0" />
                <span>{saveBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setSaveBanner(null)}
                className="text-xs text-[#A5AEC5] hover:text-[#F5F7FF]"
              >
                بستن
              </button>
            </div>
          )}

          {/* 1. GENERAL CONTENT (/admin/content) */}
          {section === 'content' && (
            <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-6">
              <div className="pb-4 border-b border-[var(--border-color)]">
                <h1 className="text-xl font-bold text-[#F5F7FF]">
                  تنظیمات محتوای عمومی و اعتبار فوتر
                </h1>
                <p className="text-xs text-[#A5AEC5] mt-1">
                  ویرایش نام برند، تیترهای صفحه نخست، دکمه‌های فراخوان و متن «درست شده توسط شرکت گیک رویت» در فوتر.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="brand-name-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    نام نمایشی برند (Brand Name)
                  </label>
                  <input
                    id="brand-name-input"
                    type="text"
                    value={config.general.brandName}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        general: { ...prev.general, brandName: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  />
                </div>

                <div>
                  <label htmlFor="hero-kicker-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    زیرتیتر بالای بخش اول (Hero Kicker)
                  </label>
                  <input
                    id="hero-kicker-input"
                    type="text"
                    value={config.general.heroKicker}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        general: { ...prev.general, heroKicker: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="hero-title-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                  تیتر اصلی بخش نخست (Hero Headline)
                </label>
                <input
                  id="hero-title-input"
                  type="text"
                  value={config.general.heroTitle}
                  onChange={(e) =>
                    updateDraftConfig((prev) => ({
                      ...prev,
                      general: { ...prev.general, heroTitle: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                />
              </div>

              <div>
                <label htmlFor="hero-desc-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                  توضیحات پشتیبان بخش نخست
                </label>
                <textarea
                  id="hero-desc-input"
                  rows={3}
                  value={config.general.heroDescription}
                  onChange={(e) =>
                    updateDraftConfig((prev) => ({
                      ...prev,
                      general: { ...prev.general, heroDescription: e.target.value },
                    }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="hero-cta1-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    متن دکمه اصلی (CTA اول)
                  </label>
                  <input
                    id="hero-cta1-input"
                    type="text"
                    value={config.general.heroPrimaryCta}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        general: { ...prev.general, heroPrimaryCta: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  />
                </div>

                <div>
                  <label htmlFor="hero-cta2-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    متن دکمه فرعی (CTA دوم)
                  </label>
                  <input
                    id="hero-cta2-input"
                    type="text"
                    value={config.general.heroSecondaryCta}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        general: { ...prev.general, heroSecondaryCta: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  />
                </div>
              </div>

              {/* Editable Footer Credit & Copyright */}
              <div className="pt-6 border-t border-[var(--border-color)] space-y-5">
                <h2 className="text-base font-bold text-[#F5F7FF]">
                  اعتبار سازنده و کپی‌رایت فوتر
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="footer-credit-input"
                      className="block text-xs font-medium text-[#F5F7FF] mb-2"
                    >
                      امضای سازنده در فوتر (Company Credit)
                    </label>
                    <input
                      id="footer-credit-input"
                      type="text"
                      value={config.general.footerCredit}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          general: { ...prev.general, footerCredit: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="copyright-input"
                      className="block text-xs font-medium text-[#F5F7FF] mb-2"
                    >
                      متن کپی‌رایت فوتر
                    </label>
                    <input
                      id="copyright-input"
                      type="text"
                      value={config.general.copyrightText}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          general: { ...prev.general, copyrightText: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. SERVICES (/admin/services) */}
          {section === 'services' && (
            <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-6">
              <div className="pb-4 border-b border-[var(--border-color)]">
                <h1 className="text-xl font-bold text-[#F5F7FF]">
                  مدیریت خدمات و فرآیند توسعه
                </h1>
                <p className="text-xs text-[#A5AEC5] mt-1">
                  ویرایش عناوین و توضیحات چهار سرویس تخصصی و مراحل فرآیند توسعه.
                </p>
              </div>

              <div className="space-y-6">
                {config.services.map((srv, idx) => (
                  <div
                    key={srv.id}
                    className="p-5 rounded-xl bg-[#141A2B] border border-[var(--border-color)] space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono-code text-[var(--accent-secondary)]">
                        سرویس {srv.number}
                      </span>
                      <span className="text-xs font-latin text-[#A5AEC5]">{srv.tag}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-[#A5AEC5] mb-1">عنوان سرویس</label>
                        <input
                          type="text"
                          value={srv.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraftConfig((prev) => {
                              const next = [...prev.services];
                              next[idx] = { ...next[idx], title: val };
                              return { ...prev, services: next };
                            });
                          }}
                          className="w-full px-3.5 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#A5AEC5] mb-1">زیرعنوان تخصصی</label>
                        <input
                          type="text"
                          value={srv.subtitle}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateDraftConfig((prev) => {
                              const next = [...prev.services];
                              next[idx] = { ...next[idx], subtitle: val };
                              return { ...prev, services: next };
                            });
                          }}
                          className="w-full px-3.5 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-[#A5AEC5] mb-1">شرح کامل</label>
                      <textarea
                        rows={2}
                        value={srv.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateDraftConfig((prev) => {
                            const next = [...prev.services];
                            next[idx] = { ...next[idx], description: val };
                            return { ...prev, services: next };
                          });
                        }}
                        className="w-full px-3.5 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PORTFOLIO & COMING-SOON TOGGLE (/admin/projects) */}
          {section === 'projects' && (
            <div className="space-y-6">
              <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-6">
                <div className="pb-4 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#F5F7FF]">
                      تنظیمات بخش نمونه‌کارها
                    </h1>
                    <p className="text-xs text-[#A5AEC5] mt-1">
                      کنترل وضعیت «در حال آماده‌سازی» یا نمایش پروژه‌های واقعی منتشرشده.
                    </p>
                  </div>

                  {/* Coming-Soon Toggle */}
                  <label className="inline-flex items-center gap-3 p-3 rounded-xl bg-[#141A2B] border border-[var(--border-color)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.portfolio.comingSoonMode}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          portfolio: {
                            ...prev.portfolio,
                            comingSoonMode: e.target.checked,
                          },
                        }))
                      }
                      className="w-4 h-4 accent-[var(--accent-primary)]"
                    />
                    <span className="text-xs font-bold text-[#F5F7FF]">
                      نمایش حالت در حال آماده‌سازی
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="portfolio-heading-input"
                      className="block text-xs font-medium text-[#F5F7FF] mb-2"
                    >
                      تیتر بخش نمونه‌کارها
                    </label>
                    <input
                      id="portfolio-heading-input"
                      type="text"
                      value={config.portfolio.heading}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, heading: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="portfolio-status-input"
                      className="block text-xs font-medium text-[#F5F7FF] mb-2"
                    >
                      متن وضعیت بارگذاری
                    </label>
                    <input
                      id="portfolio-status-input"
                      type="text"
                      value={config.portfolio.statusText}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          portfolio: { ...prev.portfolio, statusText: e.target.value },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="portfolio-desc-input"
                    className="block text-xs font-medium text-[#F5F7FF] mb-2"
                  >
                    توضیح تکمیلی وضعیت آماده‌سازی
                  </label>
                  <textarea
                    id="portfolio-desc-input"
                    rows={2}
                    value={config.portfolio.description}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        portfolio: { ...prev.portfolio, description: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  />
                </div>
              </div>

              {/* Add Real Project Form */}
              <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-6">
                <h2 className="text-lg font-bold text-[#F5F7FF]">
                  افزودن پروژه واقعی جدید
                </h2>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-prj-title" className="block text-xs text-[#A5AEC5] mb-1.5">
                        عنوان پروژه
                      </label>
                      <input
                        id="new-prj-title"
                        type="text"
                        value={newProjectTitle}
                        onChange={(e) => setNewProjectTitle(e.target.value)}
                        placeholder="مثلاً: سامانه مدیریت هوشمند ناوگان"
                        className="w-full px-4 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-prj-cat" className="block text-xs text-[#A5AEC5] mb-1.5">
                        دسته‌بندی سرویس
                      </label>
                      <input
                        id="new-prj-cat"
                        type="text"
                        value={newProjectCategory}
                        onChange={(e) => setNewProjectCategory(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="new-prj-tech" className="block text-xs text-[#A5AEC5] mb-1.5">
                        فناوری‌های استفاده‌شده (با کاما جدا کنید)
                      </label>
                      <input
                        id="new-prj-tech"
                        type="text"
                        dir="ltr"
                        value={newProjectTechs}
                        onChange={(e) => setNewProjectTechs(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] font-latin"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-prj-link" className="block text-xs text-[#A5AEC5] mb-1.5">
                        لینک مشاهده پروژه (اختیاری)
                      </label>
                      <input
                        id="new-prj-link"
                        type="url"
                        dir="ltr"
                        value={newProjectLink}
                        onChange={(e) => setNewProjectLink(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-4 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] font-mono-code"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="new-prj-summary" className="block text-xs text-[#A5AEC5] mb-1.5">
                      خلاصه پروژه و دستاورد فنی
                    </label>
                    <textarea
                      id="new-prj-summary"
                      rows={2}
                      value={newProjectSummary}
                      onChange={(e) => setNewProjectSummary(e.target.value)}
                      placeholder="توضیح مختصر درباره معماری و کاربرد پروژه..."
                      className="w-full px-4 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <label className="inline-flex items-center gap-2 text-xs text-[#F5F7FF] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProjectPublished}
                        onChange={(e) => setNewProjectPublished(e.target.checked)}
                        className="accent-[var(--accent-primary)]"
                      />
                      <span>انتشار عمومی پروژه (در صورت غیرفعال بودن حالت آماده‌سازی)</span>
                    </label>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#141A2B] border border-[var(--accent-primary)] text-xs font-bold text-[#F5F7FF] hover:bg-[var(--accent-primary)] transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>افزودن به فهرست پروژه‌ها</span>
                    </button>
                  </div>
                </form>

                {/* Existing Projects List */}
                <div className="pt-6 border-t border-[var(--border-color)] space-y-3">
                  <h3 className="text-sm font-bold text-[#F5F7FF]">
                    فهرست پروژه‌های ثبت‌شده ({config.portfolio.projects.length})
                  </h3>

                  {config.portfolio.projects.length === 0 ? (
                    <p className="text-xs text-[#A5AEC5]">
                      هنوز پروژه‌ای ثبت نشده است. به‌صورت پیش‌فرض هیچ پروژه ساختگی وجود ندارد.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {config.portfolio.projects.map((prj, idx) => (
                        <div
                          key={prj.id}
                          className="p-4 rounded-xl bg-[#141A2B] border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-[#F5F7FF]">
                                {prj.title}
                              </span>
                              <span aria-hidden="true" className="text-[#A5AEC5]">·</span>
                              <span className="text-xs text-[var(--accent-secondary)]">
                                {prj.category}
                              </span>
                            </div>
                            <p className="text-xs text-[#A5AEC5]">{prj.summary}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <label className="inline-flex items-center gap-1.5 text-xs text-[#A5AEC5] cursor-pointer">
                              <input
                                type="checkbox"
                                checked={prj.published}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  updateDraftConfig((prev) => ({
                                    ...prev,
                                    portfolio: {
                                      ...prev.portfolio,
                                      projects: prev.portfolio.projects.map((p) =>
                                        p.id === prj.id ? { ...p, published: checked } : p
                                      ),
                                    },
                                  }));
                                }}
                                className="accent-[var(--accent-primary)]"
                              />
                              <span>منتشرشده</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleMoveProject(idx, -1)}
                              aria-label="انتقال پروژه به بالا"
                              className="p-1.5 rounded bg-[#080A12] border border-[var(--border-color)] text-[#A5AEC5] hover:text-[#F5F7FF]"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveProject(idx, 1)}
                              aria-label="انتقال پروژه به پایین"
                              className="p-1.5 rounded bg-[#080A12] border border-[var(--border-color)] text-[#A5AEC5] hover:text-[#F5F7FF]"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                updateDraftConfig((prev) => ({
                                  ...prev,
                                  portfolio: {
                                    ...prev.portfolio,
                                    projects: prev.portfolio.projects.filter(
                                      (p) => p.id !== prj.id
                                    ),
                                  },
                                }))
                              }
                              aria-label={`حذف پروژه ${prj.title}`}
                              className="p-1.5 rounded bg-[#080A12] border border-rose-500/40 text-rose-400 hover:bg-rose-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. THEME SETTINGS (/admin/theme) */}
          {section === 'theme' && (
            <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-6">
              <div className="pb-4 border-b border-[var(--border-color)]">
                <h1 className="text-xl font-bold text-[#F5F7FF]">
                  تنظیمات رنگ، ظاهر و شدت انیمیشن
                </h1>
                <p className="text-xs text-[#A5AEC5] mt-1">
                  شخصی‌سازی پالت رنگی، سبک دکمه‌ها و سطح حرکت در سراسر وب‌سایت.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="primary-accent-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    رنگ تاکیدی اصلی (Primary Accent)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="primary-accent-input"
                      type="color"
                      value={config.theme.primaryAccent}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryAccent: e.target.value },
                        }))
                      }
                      className="w-10 h-10 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={config.theme.primaryAccent}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, primaryAccent: e.target.value },
                        }))
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-xs font-mono-code text-[#F5F7FF]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="secondary-accent-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    رنگ تاکیدی دوم (Secondary Accent)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="secondary-accent-input"
                      type="color"
                      value={config.theme.secondaryAccent}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryAccent: e.target.value },
                        }))
                      }
                      className="w-10 h-10 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={config.theme.secondaryAccent}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryAccent: e.target.value },
                        }))
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-xs font-mono-code text-[#F5F7FF]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="border-color-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    رنگ خطوط و کادرها (Border Color)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="border-color-input"
                      type="color"
                      value={config.theme.borderColor}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, borderColor: e.target.value },
                        }))
                      }
                      className="w-10 h-10 rounded cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={config.theme.borderColor}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          theme: { ...prev.theme, borderColor: e.target.value },
                        }))
                      }
                      className="flex-1 px-3 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-xs font-mono-code text-[#F5F7FF]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 border-t border-[var(--border-color)]">
                <div>
                  <label htmlFor="btn-style-select" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    سبک دکمه‌های اصلی
                  </label>
                  <select
                    id="btn-style-select"
                    value={config.theme.buttonStyle}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        theme: {
                          ...prev.theme,
                          buttonStyle: e.target.value as ButtonStyleMode,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  >
                    <option value="solid">توپر کلاسیک (Solid)</option>
                    <option value="gradient">طیف نوری (Gradient)</option>
                    <option value="outline">کادر خطی (Outline)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="glow-intensity-select" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    شدت درخشش محیطی (Glow)
                  </label>
                  <select
                    id="glow-intensity-select"
                    value={config.theme.glowIntensity}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        theme: {
                          ...prev.theme,
                          glowIntensity: e.target.value as IntensityLevel,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  >
                    <option value="low">ملایم (Low)</option>
                    <option value="medium">استاندارد (Medium)</option>
                    <option value="high">پررنگ (High)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="anim-intensity-select" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    شدت انیمیشن‌ها
                  </label>
                  <select
                    id="anim-intensity-select"
                    value={config.theme.animationIntensity}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        theme: {
                          ...prev.theme,
                          animationIntensity: e.target.value as IntensityLevel,
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  >
                    <option value="low">کاهش‌یافته (Reduced Motion)</option>
                    <option value="medium">متعادل و استاندارد</option>
                    <option value="high">حداکثر پویایی</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 5. CONTACT SETTINGS (/admin/contact) */}
          {section === 'contact' && (
            <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-6">
              <div className="pb-4 border-b border-[var(--border-color)]">
                <h1 className="text-xl font-bold text-[#F5F7FF]">
                  تنظیمات اطلاعات تماس و نمایش شماره‌ها
                </h1>
                <p className="text-xs text-[#A5AEC5] mt-1">
                  مدیریت متمرکز شماره تماس، شبکه‌های اجتماعی و محل‌های نمایش آن‌ها در هدر، فوتر و بخش پایانی.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="primary-phone-input"
                    className="block text-xs font-medium text-[#F5F7FF] mb-2"
                  >
                    شماره تماس اصلی
                  </label>
                  <input
                    id="primary-phone-input"
                    type="text"
                    dir="ltr"
                    value={config.contact.primaryPhone}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, primaryPhone: e.target.value },
                      }))
                    }
                    placeholder="+98 21 8877 6655"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] font-mono-code"
                  />
                  {contactErrors.primaryPhone && (
                    <p className="text-xs text-rose-400 mt-1.5">{contactErrors.primaryPhone}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="secondary-phone-input"
                    className="block text-xs font-medium text-[#F5F7FF] mb-2"
                  >
                    شماره تماس جایگزین (اختیاری)
                  </label>
                  <input
                    id="secondary-phone-input"
                    type="text"
                    dir="ltr"
                    value={config.contact.secondaryPhone}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, secondaryPhone: e.target.value },
                      }))
                    }
                    placeholder="+98 912 000 0000"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] font-mono-code"
                  />
                  {contactErrors.secondaryPhone && (
                    <p className="text-xs text-rose-400 mt-1.5">{contactErrors.secondaryPhone}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-email-input"
                    className="block text-xs font-medium text-[#F5F7FF] mb-2"
                  >
                    ایمیل رسمی
                  </label>
                  <input
                    id="contact-email-input"
                    type="email"
                    dir="ltr"
                    value={config.contact.email}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, email: e.target.value },
                      }))
                    }
                    placeholder="contact@geekroit.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF] font-mono-code"
                  />
                  {contactErrors.email && (
                    <p className="text-xs text-rose-400 mt-1.5">{contactErrors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-btn-text-input"
                    className="block text-xs font-medium text-[#F5F7FF] mb-2"
                  >
                    متن دلخواه دکمه تماس در هدر
                  </label>
                  <input
                    id="contact-btn-text-input"
                    type="text"
                    value={config.contact.contactButtonText}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, contactButtonText: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-sm text-[#F5F7FF]"
                  />
                  {contactErrors.contactButtonText && (
                    <p className="text-xs text-rose-400 mt-1.5">
                      {contactErrors.contactButtonText}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Links */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="whatsapp-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    لینک واتساپ (اختیاری)
                  </label>
                  <input
                    id="whatsapp-input"
                    type="url"
                    dir="ltr"
                    value={config.contact.whatsappUrl}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, whatsappUrl: e.target.value },
                      }))
                    }
                    placeholder="https://wa.me/..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-xs font-mono-code text-[#F5F7FF]"
                  />
                  {contactErrors.whatsappUrl && (
                    <p className="text-xs text-rose-400 mt-1">{contactErrors.whatsappUrl}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="telegram-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    لینک تلگرام (اختیاری)
                  </label>
                  <input
                    id="telegram-input"
                    type="url"
                    dir="ltr"
                    value={config.contact.telegramUrl}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, telegramUrl: e.target.value },
                      }))
                    }
                    placeholder="https://t.me/..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-xs font-mono-code text-[#F5F7FF]"
                  />
                  {contactErrors.telegramUrl && (
                    <p className="text-xs text-rose-400 mt-1">{contactErrors.telegramUrl}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="instagram-input" className="block text-xs font-medium text-[#F5F7FF] mb-2">
                    لینک اینستاگرام (اختیاری)
                  </label>
                  <input
                    id="instagram-input"
                    type="url"
                    dir="ltr"
                    value={config.contact.instagramUrl}
                    onChange={(e) =>
                      updateDraftConfig((prev) => ({
                        ...prev,
                        contact: { ...prev.contact, instagramUrl: e.target.value },
                      }))
                    }
                    placeholder="https://instagram.com/..."
                    className="w-full px-3.5 py-2 rounded-lg bg-[#080A12] border border-[var(--border-color)] text-xs font-mono-code text-[#F5F7FF]"
                  />
                  {contactErrors.instagramUrl && (
                    <p className="text-xs text-rose-400 mt-1">{contactErrors.instagramUrl}</p>
                  )}
                </div>
              </div>

              {/* Visibility Toggles */}
              <div className="pt-5 border-t border-[var(--border-color)] space-y-3">
                <h2 className="text-sm font-bold text-[#F5F7FF]">
                  محل‌های نمایش شماره تماس در سایت
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#141A2B] border border-[var(--border-color)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.contact.showPhoneInHeader}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, showPhoneInHeader: e.target.checked },
                        }))
                      }
                      className="accent-[var(--accent-primary)]"
                    />
                    <span className="text-xs text-[#F5F7FF]">نمایش شماره در هدر</span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#141A2B] border border-[var(--border-color)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.contact.showPhoneInFinale}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, showPhoneInFinale: e.target.checked },
                        }))
                      }
                      className="accent-[var(--accent-primary)]"
                    />
                    <span className="text-xs text-[#F5F7FF]">نمایش در بخش پایانی صفحه</span>
                  </label>

                  <label className="flex items-center gap-3 p-3.5 rounded-xl bg-[#141A2B] border border-[var(--border-color)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.contact.showPhoneInFooter}
                      onChange={(e) =>
                        updateDraftConfig((prev) => ({
                          ...prev,
                          contact: { ...prev.contact, showPhoneInFooter: e.target.checked },
                        }))
                      }
                      className="accent-[var(--accent-primary)]"
                    />
                    <span className="text-xs text-[#F5F7FF]">نمایش شماره در فوتر</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 6. SETTINGS, INQUIRIES & SECURITY TRANSPARENCY (/admin/settings) */}
          {section === 'settings' && (
            <div className="space-y-6">
              {/* Security & Backend Documentation Card */}
              <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center gap-2.5 text-amber-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h1 className="text-lg font-bold text-[#F5F7FF]">
                    معماری امنیتی و شفافیت نسخه نمایشی (Frontend Demo)
                  </h1>
                </div>
                <p className="text-sm text-[#A5AEC5] leading-relaxed">
                  این پنل مدیریت برای نمایش کامل قابلیت‌های سفارشی‌سازی بدون نیاز به پیش‌نیاز سرور طراحی شده است. هیچ رمز عبور، توکن امنیتی یا کلید خصوصی در حافظه مرورگر ذخیره نمی‌شود.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-[#141A2B] border border-[var(--border-color)] space-y-2">
                    <h2 className="text-xs font-bold text-[#38BDF8]">
                      قابلیت‌های فعال در حالت محلی (Local Demo)
                    </h2>
                    <ul className="text-xs text-[#A5AEC5] space-y-1.5 list-disc list-inside">
                      <li>ویرایش زنده شماره تماس، ایمیل و لینک‌های اجتماعی</li>
                      <li>تغییر وضعیت «در حال آماده‌سازی» نمونه‌کارها و افزودن پروژه</li>
                      <li>ویرایش متن «درست شده توسط شرکت گیک رویت» در فوتر</li>
                      <li>تغییر رنگ‌های تم، سبک دکمه‌ها و پیش‌نمایش فوری</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#141A2B] border border-[var(--border-color)] space-y-2">
                    <h2 className="text-xs font-bold text-[#A78BFA]">
                      نیازمند بک‌اند واقعی (در استقرار سازمانی)
                    </h2>
                    <ul className="text-xs text-[#A5AEC5] space-y-1.5 list-disc list-inside">
                      <li>احراز هویت امن مدیران (Supabase Auth / JWT سمت سرور)</li>
                      <li>اعمال تغییرات برای تمام بازدیدکنندگان در پایگاه داده مشترک</li>
                      <li>ارسال ایمیل/پیامک خودکار هنگام ثبت فرم درخواست پروژه</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submitted Demo Inquiries */}
              <div className="p-7 rounded-2xl bg-[#0E1220] border border-[var(--border-color)] space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#F5F7FF]">
                    درخواست‌های ثبت‌شده در فرم تماس ({inquiries.length})
                  </h2>
                  {inquiries.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllInquiries}
                      className="text-xs text-rose-400 hover:underline cursor-pointer"
                    >
                      پاک کردن فهرست درخواست‌های آزمایشی
                    </button>
                  )}
                </div>

                {inquiries.length === 0 ? (
                  <p className="text-xs text-[#A5AEC5]">
                    هنوز درخواستی از طریق فرم صفحه اصلی در این مرورگر ثبت نشده است.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {inquiries.map((inq) => (
                      <div
                        key={inq.id}
                        className="p-4 rounded-xl bg-[#141A2B] border border-[var(--border-color)] space-y-1.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-bold text-[#F5F7FF]">{inq.name}</span>
                          <span className="font-mono-code text-[var(--accent-secondary)]" dir="ltr">
                            {inq.contactInfo}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--accent-lavender)]">
                          سرویس: {inq.serviceType}
                        </div>
                        <p className="text-xs text-[#A5AEC5] leading-relaxed">
                          {inq.projectSummary}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Factory Reset Section */}
              <div className="p-7 rounded-2xl bg-[#0E1220] border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-[#F5F7FF]">
                    بازنشانی به تنظیمات اولیه استودیو گیک رویت
                  </h2>
                  <p className="text-xs text-[#A5AEC5] mt-1">
                    تمامی تغییرات سفارشی شما پاک شده و مقادیر پیش‌فرض استاندارد جایگزین می‌شوند.
                  </p>
                </div>

                {confirmReset ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        resetToDefaults();
                        setConfirmReset(false);
                        setSaveBanner('تمامی تنظیمات به حالت پیش‌فرض بازنشانی شد.');
                      }}
                      className="px-4 py-2 rounded-lg bg-rose-600 text-xs font-bold text-white cursor-pointer"
                    >
                      تایید بازنشانی کامل
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="px-3 py-2 rounded-lg bg-[#141A2B] text-xs text-[#A5AEC5] cursor-pointer"
                    >
                      انصراف
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmReset(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-500/40 bg-[#141A2B] text-xs font-medium text-rose-300 hover:bg-rose-500/10 transition-colors shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>بازنشانی تنظیمات</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
