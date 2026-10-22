import {
  ContactSettings,
  PortfolioSettings,
  ProjectItem,
  ThemeSettings,
  ValidationResult,
} from '../types/config';

/**
 * Validates international and Iranian phone numbers.
 * Empty string is valid because phone numbers are optional until configured by admin.
 */
export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed) return true;
  // Convert Persian/Arabic digits to English for validation
  const normalized = normalizeDigits(trimmed);
  // Allow +, digits, spaces, dashes, parentheses; must contain 7 to 15 digits
  const allowedChars = /^[+\d\s\-()]+$/;
  if (!allowedChars.test(normalized)) return false;
  const digitCount = (normalized.match(/\d/g) || []).length;
  return digitCount >= 7 && digitCount <= 15;
}

/**
 * Converts Persian/Arabic numerals to standard ASCII digits.
 */
export function normalizeDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/**
 * Validates email format if provided (empty is allowed).
 */
export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

/**
 * Validates URL format if provided (empty is allowed).
 */
export function isValidUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates hex color string (#RRGGBB).
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color.trim());
}

/**
 * Validates ContactSettings from the Admin Panel.
 */
export function validateContactSettings(contact: ContactSettings): ValidationResult {
  const errors: Record<string, string> = {};

  if (!isValidPhone(contact.primaryPhone)) {
    errors.primaryPhone = 'شماره تماس اصلی معتبر نیست (مثلاً +98 21 8877 6655 یا 09123456789).';
  }
  if (!isValidPhone(contact.secondaryPhone)) {
    errors.secondaryPhone = 'شماره تماس جایگزین معتبر نیست.';
  }
  if (!isValidEmail(contact.email)) {
    errors.email = 'ساختار ایمیل وارد شده معتبر نیست.';
  }
  if (!isValidUrl(contact.whatsappUrl)) {
    errors.whatsappUrl = 'لینک واتساپ باید با https:// یا http:// شروع شود.';
  }
  if (!isValidUrl(contact.telegramUrl)) {
    errors.telegramUrl = 'لینک تلگرام باید با https:// یا http:// شروع شود.';
  }
  if (!isValidUrl(contact.instagramUrl)) {
    errors.instagramUrl = 'لینک اینستاگرام باید با https:// یا http:// شروع شود.';
  }
  if (!contact.contactButtonText.trim()) {
    errors.contactButtonText = 'متن دکمه تماس نمی‌تواند خالی باشد.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates public project inquiry form inputs.
 */
export function validateInquiryForm(input: {
  name: string;
  contactInfo: string;
  serviceType: string;
  projectSummary: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = 'لطفاً نام خود یا نام مجموعه را وارد کنید (حداقل ۲ حرف).';
  }

  const contactTrimmed = (input.contactInfo || '').trim();
  if (!contactTrimmed) {
    errors.contactInfo = 'لطفاً شماره تماس یا ایمیل خود را برای هماهنگی وارد کنید.';
  } else {
    const isPhone = isValidPhone(contactTrimmed) && (normalizeDigits(contactTrimmed).match(/\d/g) || []).length >= 7;
    const isMail = isValidEmail(contactTrimmed);
    if (!isPhone && !isMail) {
      errors.contactInfo = 'لطفاً یک شماره تماس معتبر یا آدرس ایمیل صحیح وارد کنید.';
    }
  }

  if (!input.serviceType || !input.serviceType.trim()) {
    errors.serviceType = 'لطفاً حوزه پروژه را انتخاب کنید.';
  }

  if (!input.projectSummary || input.projectSummary.trim().length < 10) {
    errors.projectSummary = 'لطفاً توضیح کوتاهی درباره ایده یا نیاز پروژه بنویسید (حداقل ۱۰ کاراکتر).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Returns visible portfolio projects for the public site.
 * When comingSoonMode is true, always returns an empty array so unpublished or draft items are hidden.
 * When comingSoonMode is false, returns only published projects sorted by order.
 */
export function getPublicPortfolioProjects(portfolio: PortfolioSettings): ProjectItem[] {
  if (portfolio.comingSoonMode) {
    return [];
  }
  return [...portfolio.projects]
    .filter((p) => p.published && p.title.trim().length > 0)
    .sort((a, b) => a.order - b.order);
}

/**
 * Maps normalized scroll progress [0..1] to a discrete stage index [0..totalStages-1].
 */
export function getScrollStageIndex(progress: number, totalStages: number): number {
  if (totalStages <= 1) return 0;
  const clamped = Math.max(0, Math.min(0.9999, progress));
  return Math.floor(clamped * totalStages);
}

/**
 * Generates CSS custom properties object from ThemeSettings.
 */
export function computeThemeCssVariables(theme: ThemeSettings): Record<string, string> {
  const glowMap: Record<ThemeSettings['glowIntensity'], string> = {
    low: '0.12',
    medium: '0.25',
    high: '0.42',
  };

  return {
    '--bg-primary': isValidHexColor(theme.bgPrimary) ? theme.bgPrimary : '#080A12',
    '--bg-secondary': isValidHexColor(theme.bgSecondary) ? theme.bgSecondary : '#0E1220',
    '--bg-card': isValidHexColor(theme.bgCard) ? theme.bgCard : '#141A2B',
    '--border-color': isValidHexColor(theme.borderColor) ? theme.borderColor : '#252D43',
    '--accent-primary': isValidHexColor(theme.primaryAccent) ? theme.primaryAccent : '#8B5CF6',
    '--accent-secondary': isValidHexColor(theme.secondaryAccent) ? theme.secondaryAccent : '#38BDF8',
    '--accent-lavender': isValidHexColor(theme.lavenderAccent) ? theme.lavenderAccent : '#A78BFA',
    '--glow-opacity': glowMap[theme.glowIntensity] || '0.25',
  };
}
