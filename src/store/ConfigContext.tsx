import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { InquirySubmission, SiteConfig } from '../types/config';
import { DEFAULT_SITE_CONFIG } from './defaultConfig';
import { computeThemeCssVariables } from '../utils/validation';

const STORAGE_KEY_CONFIG = 'geekroit_site_config_v1';
const STORAGE_KEY_INQUIRIES = 'geekroit_demo_inquiries_v1';

/**
 * Clean repository interface so the frontend can work standalone in demo mode
 * or connect to a real backend / Supabase repository without changing UI components.
 */
export interface ConfigRepository {
  mode: 'local-demo' | 'remote-backend';
  loadConfig(): SiteConfig;
  saveConfig(config: SiteConfig): void;
  resetConfig(): SiteConfig;
  loadInquiries(): InquirySubmission[];
  submitInquiry(
    payload: Omit<InquirySubmission, 'id' | 'createdAt' | 'deliveryMode'>
  ): InquirySubmission;
  clearInquiries(): void;
}

function deepMergeConfig(base: SiteConfig, saved: Partial<SiteConfig>): SiteConfig {
  return {
    general: {
      ...base.general,
      ...(saved.general || {}),
      ideaStages:
        Array.isArray(saved.general?.ideaStages) && saved.general.ideaStages.length > 0
          ? saved.general.ideaStages
          : base.general.ideaStages,
      whyUsItems:
        Array.isArray(saved.general?.whyUsItems) && saved.general.whyUsItems.length > 0
          ? saved.general.whyUsItems
          : base.general.whyUsItems,
    },
    services:
      Array.isArray(saved.services) && saved.services.length > 0
        ? saved.services
        : base.services,
    processStages:
      Array.isArray(saved.processStages) && saved.processStages.length > 0
        ? saved.processStages
        : base.processStages,
    portfolio: {
      ...base.portfolio,
      ...(saved.portfolio || {}),
      projects: Array.isArray(saved.portfolio?.projects)
        ? saved.portfolio.projects
        : base.portfolio.projects,
    },
    contact: {
      ...base.contact,
      ...(saved.contact || {}),
    },
    theme: {
      ...base.theme,
      ...(saved.theme || {}),
    },
  };
}

class LocalDemoRepository implements ConfigRepository {
  mode: 'local-demo' = 'local-demo';

  loadConfig(): SiteConfig {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_CONFIG);
      if (!raw) return structuredClone(DEFAULT_SITE_CONFIG);
      const parsed = JSON.parse(raw) as Partial<SiteConfig>;
      return deepMergeConfig(structuredClone(DEFAULT_SITE_CONFIG), parsed);
    } catch {
      return structuredClone(DEFAULT_SITE_CONFIG);
    }
  }

  saveConfig(config: SiteConfig): void {
    try {
      window.localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch (err) {
      console.error('Failed to save config to localStorage:', err);
    }
  }

  resetConfig(): SiteConfig {
    try {
      window.localStorage.removeItem(STORAGE_KEY_CONFIG);
    } catch {
      // ignore
    }
    return structuredClone(DEFAULT_SITE_CONFIG);
  }

  loadInquiries(): InquirySubmission[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_INQUIRIES);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  submitInquiry(
    payload: Omit<InquirySubmission, 'id' | 'createdAt' | 'deliveryMode'>
  ): InquirySubmission {
    const newEntry: InquirySubmission = {
      ...payload,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      deliveryMode: 'local-demo',
    };
    try {
      const current = this.loadInquiries();
      const updated = [newEntry, ...current];
      window.localStorage.setItem(STORAGE_KEY_INQUIRIES, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newEntry;
  }

  clearInquiries(): void {
    try {
      window.localStorage.removeItem(STORAGE_KEY_INQUIRIES);
    } catch {
      // ignore
    }
  }
}

const repository = new LocalDemoRepository();

interface ConfigContextValue {
  config: SiteConfig;
  savedConfig: SiteConfig;
  isDirty: boolean;
  repositoryMode: 'local-demo' | 'remote-backend';
  inquiries: InquirySubmission[];
  prefersReducedMotion: boolean;
  updateDraftConfig: (updater: (prev: SiteConfig) => SiteConfig) => void;
  saveCurrentConfig: (nextConfig?: SiteConfig) => void;
  discardDraftChanges: () => void;
  resetToDefaults: () => void;
  submitProjectInquiry: (
    payload: Omit<InquirySubmission, 'id' | 'createdAt' | 'deliveryMode'>
  ) => InquirySubmission;
  clearAllInquiries: () => void;
  getButtonClasses: (variant?: 'primary' | 'secondary') => string;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedConfig, setSavedConfig] = useState<SiteConfig>(() => repository.loadConfig());
  const [draftConfig, setDraftConfig] = useState<SiteConfig>(() => repository.loadConfig());
  const [inquiries, setInquiries] = useState<InquirySubmission[]>(() => repository.loadInquiries());
  const [osReducedMotion, setOsReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setOsReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setOsReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Apply CSS custom properties whenever draftConfig.theme changes (enables instant live preview)
  useEffect(() => {
    const vars = computeThemeCssVariables(draftConfig.theme);
    const root = document.documentElement;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
    });
  }, [draftConfig.theme]);

  const isDirty = useMemo(() => {
    return JSON.stringify(draftConfig) !== JSON.stringify(savedConfig);
  }, [draftConfig, savedConfig]);

  const prefersReducedMotion =
    osReducedMotion ||
    draftConfig.theme.reducedMotionOverride ||
    draftConfig.theme.animationIntensity === 'low';

  const updateDraftConfig = (updater: (prev: SiteConfig) => SiteConfig) => {
    setDraftConfig((prev) => updater(prev));
  };

  const saveCurrentConfig = (nextConfig?: SiteConfig) => {
    const toSave = nextConfig || draftConfig;
    repository.saveConfig(toSave);
    setSavedConfig(structuredClone(toSave));
    setDraftConfig(structuredClone(toSave));
  };

  const discardDraftChanges = () => {
    setDraftConfig(structuredClone(savedConfig));
  };

  const resetToDefaults = () => {
    const fresh = repository.resetConfig();
    setSavedConfig(structuredClone(fresh));
    setDraftConfig(structuredClone(fresh));
  };

  const submitProjectInquiry = (
    payload: Omit<InquirySubmission, 'id' | 'createdAt' | 'deliveryMode'>
  ) => {
    const created = repository.submitInquiry(payload);
    setInquiries(repository.loadInquiries());
    return created;
  };

  const clearAllInquiries = () => {
    repository.clearInquiries();
    setInquiries([]);
  };

  const getButtonClasses = (variant: 'primary' | 'secondary' = 'primary') => {
    const style = draftConfig.theme.buttonStyle;
    if (variant === 'secondary') {
      return 'px-5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[#141A2B]/80 text-[#F5F7FF] hover:border-[var(--accent-secondary)] hover:text-white transition-all duration-150 whitespace-nowrap shrink-0 font-medium text-sm';
    }
    if (style === 'outline') {
      return 'px-5 py-2.5 rounded-lg border-2 border-[var(--accent-primary)] bg-transparent text-[#F5F7FF] hover:bg-[var(--accent-primary)]/15 transition-all duration-150 whitespace-nowrap shrink-0 font-semibold text-sm';
    }
    if (style === 'gradient') {
      return 'px-5 py-2.5 rounded-lg bg-gradient-to-l from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[#F5F7FF] hover:opacity-95 transition-all duration-150 whitespace-nowrap shrink-0 font-semibold text-sm shadow-lg shadow-[var(--accent-primary)]/20';
    }
    return 'px-5 py-2.5 rounded-lg bg-[var(--accent-primary)] text-[#F5F7FF] hover:opacity-90 transition-all duration-150 whitespace-nowrap shrink-0 font-semibold text-sm shadow-md shadow-[var(--accent-primary)]/20';
  };

  return (
    <ConfigContext.Provider
      value={{
        config: draftConfig,
        savedConfig,
        isDirty,
        repositoryMode: repository.mode,
        inquiries,
        prefersReducedMotion,
        updateDraftConfig,
        saveCurrentConfig,
        discardDraftChanges,
        resetToDefaults,
        submitProjectInquiry,
        clearAllInquiries,
        getButtonClasses,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export function useSiteConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error('useSiteConfig must be used inside ConfigProvider');
  }
  return ctx;
}
