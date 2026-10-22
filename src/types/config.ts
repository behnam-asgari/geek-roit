export interface ContactSettings {
  primaryPhone: string;
  secondaryPhone: string;
  email: string;
  whatsappUrl: string;
  telegramUrl: string;
  instagramUrl: string;
  contactButtonText: string;
  showPhoneInHeader: boolean;
  showPhoneInFooter: boolean;
  showPhoneInFinale: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  technologies: string[];
  linkUrl?: string;
  published: boolean;
  order: number;
}

export interface PortfolioSettings {
  comingSoonMode: boolean;
  heading: string;
  statusText: string;
  description: string;
  projects: ProjectItem[];
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  deliverables: string[];
  tag: string;
}

export interface ProcessStage {
  id: string;
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  deliverable: string;
}

export interface IdeaStage {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  description: string;
}

export interface WhyUsItem {
  id: string;
  title: string;
  description: string;
}

export interface GeneralContent {
  brandName: string;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  ideaSectionTitle: string;
  ideaSectionSubtitle: string;
  ideaStages: IdeaStage[];
  servicesSectionTitle: string;
  servicesSectionSubtitle: string;
  processSectionTitle: string;
  processSectionSubtitle: string;
  whyUsSectionTitle: string;
  whyUsSectionSubtitle: string;
  whyUsItems: WhyUsItem[];
  finaleHeadline: string;
  finaleDescription: string;
  finalePrimaryCta: string;
  phonePlaceholderText: string;
  footerCredit: string;
  copyrightText: string;
}

export type ButtonStyleMode = 'solid' | 'outline' | 'gradient';
export type IntensityLevel = 'low' | 'medium' | 'high';

export interface ThemeSettings {
  primaryAccent: string;
  secondaryAccent: string;
  lavenderAccent: string;
  bgPrimary: string;
  bgSecondary: string;
  bgCard: string;
  borderColor: string;
  buttonStyle: ButtonStyleMode;
  glowIntensity: IntensityLevel;
  animationIntensity: IntensityLevel;
  reducedMotionOverride: boolean;
}

export interface SiteConfig {
  general: GeneralContent;
  services: ServiceItem[];
  processStages: ProcessStage[];
  portfolio: PortfolioSettings;
  contact: ContactSettings;
  theme: ThemeSettings;
}

export interface InquirySubmission {
  id: string;
  name: string;
  contactInfo: string;
  serviceType: string;
  projectSummary: string;
  createdAt: string;
  deliveryMode: 'local-demo' | 'backend-api';
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
