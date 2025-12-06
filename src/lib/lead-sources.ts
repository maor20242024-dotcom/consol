/**
 * Lead Sources Configuration
 * Defines all possible sources for lead generation
 */

export const LEAD_SOURCES = {
  INSTAGRAM_DM: 'INSTAGRAM_DM',
  INSTAGRAM_AD: 'INSTAGRAM_AD', 
  WHATSAPP: 'WHATSAPP',
  WEBSITE_FORM: 'WEBSITE_FORM',
  WEBSITE_ADS: 'WEBSITE_ADS',
  PHONE_CALL: 'PHONE_CALL',
  REFERRAL: 'REFERRAL',
  MANUAL: 'MANUAL'
} as const;

export type LeadSource = typeof LEAD_SOURCES[keyof typeof LEAD_SOURCES];

/**
 * Lead source configuration with display names and descriptions
 */
export const LEAD_SOURCE_CONFIG = {
  [LEAD_SOURCES.INSTAGRAM_DM]: {
    name: 'Instagram DM',
    description: 'Direct message from Instagram',
    color: '#E4405F',
    icon: 'instagram'
  },
  [LEAD_SOURCES.INSTAGRAM_AD]: {
    name: 'Instagram Ad',
    description: 'Lead from Instagram advertisement',
    color: '#1877F2',
    icon: 'ad'
  },
  [LEAD_SOURCES.WHATSAPP]: {
    name: 'WhatsApp',
    description: 'Lead from WhatsApp message',
    color: '#25D366',
    icon: 'whatsapp'
  },
  [LEAD_SOURCES.WEBSITE_FORM]: {
    name: 'Website Form',
    description: 'Lead from website contact form',
    color: '#0066CC',
    icon: 'form'
  },
  [LEAD_SOURCES.WEBSITE_ADS]: {
    name: 'Website Ads',
    description: 'Lead from website advertisements',
    color: '#FF6B6B',
    icon: 'ads'
  },
  [LEAD_SOURCES.PHONE_CALL]: {
    name: 'Phone Call',
    description: 'Lead from phone call',
    color: '#28A745',
    icon: 'phone'
  },
  [LEAD_SOURCES.REFERRAL]: {
    name: 'Referral',
    description: 'Lead from customer referral',
    color: '#17A2B8',
    icon: 'users'
  },
  [LEAD_SOURCES.MANUAL]: {
    name: 'Manual',
    description: 'Manually entered lead',
    color: '#6C757D',
    icon: 'edit'
  }
} as const;

/**
 * Get lead source configuration
 */
export function getLeadSourceConfig(source: LeadSource) {
  return LEAD_SOURCE_CONFIG[source] || LEAD_SOURCE_CONFIG[LEAD_SOURCES.MANUAL];
}

/**
 * Get all lead source options for dropdown/select
 */
export function getLeadSourceOptions() {
  return Object.values(LEAD_SOURCES).map(source => ({
    value: source,
    ...LEAD_SOURCE_CONFIG[source]
  }));
}

/**
 * Validate lead source
 */
export function isValidLeadSource(source: string): source is LeadSource {
  return Object.values(LEAD_SOURCES).includes(source as LeadSource);
}

/**
 * Default lead source for new leads
 */
export const DEFAULT_LEAD_SOURCE = LEAD_SOURCES.MANUAL;
