import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidPhone,
  isValidEmail,
  isValidUrl,
  validateContactSettings,
  validateInquiryForm,
  getPublicPortfolioProjects,
  getScrollStageIndex,
  computeThemeCssVariables,
} from './validation';
import { PortfolioSettings, ThemeSettings } from '../types/config';

test('isValidPhone accepts empty string, international formats, and Persian digits', () => {
  assert.equal(isValidPhone(''), true);
  assert.equal(isValidPhone('+98 21 8877 6655'), true);
  assert.equal(isValidPhone('09123456789'), true);
  assert.equal(isValidPhone('۰۹۱۲۳۴۵۶۷۸۹'), true);
  assert.equal(isValidPhone('+1 (415) 555-0199'), true);
  assert.equal(isValidPhone('123'), false);
  assert.equal(isValidPhone('abc-phone'), false);
});

test('isValidEmail and isValidUrl validate properly', () => {
  assert.equal(isValidEmail(''), true);
  assert.equal(isValidEmail('hello@geekroit.ir'), true);
  assert.equal(isValidEmail('invalid-email'), false);

  assert.equal(isValidUrl(''), true);
  assert.equal(isValidUrl('https://t.me/geekroit'), true);
  assert.equal(isValidUrl('ftp://files.example.com'), false);
  assert.equal(isValidUrl('not-a-url'), false);
});

test('validateContactSettings enforces valid phone, urls, and button text', () => {
  const validResult = validateContactSettings({
    primaryPhone: '+98 21 9100 0000',
    secondaryPhone: '',
    email: 'info@geekroit.com',
    whatsappUrl: 'https://wa.me/989120000000',
    telegramUrl: '',
    instagramUrl: '',
    contactButtonText: 'تماس با استودیو',
    showPhoneInHeader: true,
    showPhoneInFooter: true,
    showPhoneInFinale: true,
  });
  assert.equal(validResult.valid, true);

  const invalidResult = validateContactSettings({
    primaryPhone: '12',
    secondaryPhone: '',
    email: 'bad-email',
    whatsappUrl: 'wa.me/without-protocol',
    telegramUrl: '',
    instagramUrl: '',
    contactButtonText: '   ',
    showPhoneInHeader: true,
    showPhoneInFooter: true,
    showPhoneInFinale: true,
  });
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.primaryPhone);
  assert.ok(invalidResult.errors.email);
  assert.ok(invalidResult.errors.whatsappUrl);
  assert.ok(invalidResult.errors.contactButtonText);
});

test('getPublicPortfolioProjects hides all projects in comingSoonMode and filters unpublished otherwise', () => {
  const samplePortfolio: PortfolioSettings = {
    comingSoonMode: true,
    heading: 'نمونه‌کارها',
    statusText: 'در حال بارگذاری نمونه‌کارها...',
    description: 'در حال آماده‌سازی پروژه‌هایی که به‌زودی با شما به اشتراک می‌گذاریم.',
    projects: [
      {
        id: 'p1',
        title: 'پلتفرم تحلیلی داده',
        category: 'React',
        summary: 'داشبورد سازمانی',
        technologies: ['React', 'TypeScript'],
        published: true,
        order: 2,
      },
      {
        id: 'p2',
        title: 'اپلیکیشن موبایل سلامت',
        category: 'Mobile',
        summary: 'نسخه iOS و Android',
        technologies: ['React Native'],
        published: false,
        order: 1,
      },
    ],
  };

  assert.equal(getPublicPortfolioProjects(samplePortfolio).length, 0);

  const livePortfolio: PortfolioSettings = {
    ...samplePortfolio,
    comingSoonMode: false,
  };
  const visible = getPublicPortfolioProjects(livePortfolio);
  assert.equal(visible.length, 1);
  assert.equal(visible[0].id, 'p1');
});

test('getScrollStageIndex maps scroll progress accurately across stages', () => {
  assert.equal(getScrollStageIndex(0, 4), 0);
  assert.equal(getScrollStageIndex(0.24, 4), 0);
  assert.equal(getScrollStageIndex(0.26, 4), 1);
  assert.equal(getScrollStageIndex(0.55, 4), 2);
  assert.equal(getScrollStageIndex(0.95, 4), 3);
  assert.equal(getScrollStageIndex(1, 4), 3);
});

test('validateInquiryForm rejects empty inputs and accepts valid Persian inquiry', () => {
  const bad = validateInquiryForm({
    name: 'الف',
    contactInfo: '123',
    serviceType: '',
    projectSummary: 'کوتاه',
  });
  assert.equal(bad.valid, false);

  const good = validateInquiryForm({
    name: 'سارا محمدی',
    contactInfo: '09121112233',
    serviceType: 'توسعه وب با React',
    projectSummary: 'نیاز به طراحی و پیاده‌سازی سامانه تحت وب اختصاصی داریم.',
  });
  assert.equal(good.valid, true);
});

test('computeThemeCssVariables maps theme colors and glow intensity', () => {
  const theme: ThemeSettings = {
    primaryAccent: '#8B5CF6',
    secondaryAccent: '#38BDF8',
    lavenderAccent: '#A78BFA',
    bgPrimary: '#080A12',
    bgSecondary: '#0E1220',
    bgCard: '#141A2B',
    borderColor: '#252D43',
    buttonStyle: 'solid',
    glowIntensity: 'high',
    animationIntensity: 'medium',
    reducedMotionOverride: false,
  };
  const vars = computeThemeCssVariables(theme);
  assert.equal(vars['--accent-primary'], '#8B5CF6');
  assert.equal(vars['--glow-opacity'], '0.42');
});
