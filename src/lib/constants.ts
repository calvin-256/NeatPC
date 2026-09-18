// ===========================================
// NeatPC — App Constants
// ===========================================

import type { RetailerSlug, DeviceCategory } from '@/types';

/** Retailer display info */
export const RETAILERS: Record<RetailerSlug, { name: string; domain: string; color: string }> = {
  amazon: { name: 'Amazon', domain: 'amazon.com', color: '#FF9900' },
  bestbuy: { name: 'Best Buy', domain: 'bestbuy.com', color: '#0046BE' },
  newegg: { name: 'Newegg', domain: 'newegg.com', color: '#E16028' },
  bh: { name: 'B&H Photo', domain: 'bhphotovideo.com', color: '#003087' },
  walmart: { name: 'Walmart', domain: 'walmart.com', color: '#0071CE' },
};

/** Device category display info */
export const DEVICE_CATEGORIES: Record<DeviceCategory, { label: string; icon: string }> = {
  laptop: { label: 'Laptops', icon: '💻' },
  phone: { label: 'Phones', icon: '📱' },
  desktop: { label: 'Desktops', icon: '🖥️' },
  tablet: { label: 'Tablets', icon: '📟' },
};

/** Quiz use-case presets */
export const USE_CASE_PRESETS = [
  {
    id: 'cs',
    title: 'Computer Science',
    description: 'Coding, VMs, heavy multitasking',
    icon: '👨‍💻',
    recommendedSpecs: { ramGb: 16, storageGb: 512, storageType: 'SSD' as const },
  },
  {
    id: 'design',
    title: 'Design / Creator',
    description: 'Video editing, rendering, Adobe CC',
    icon: '🎨',
    recommendedSpecs: { ramGb: 32, storageGb: 1000, gpu: 'dedicated' },
  },
  {
    id: 'business',
    title: 'Business / Comm',
    description: 'Office apps, web browsing, battery life',
    icon: '💼',
    recommendedSpecs: { ramGb: 8, storageGb: 256, storageType: 'SSD' as const },
  },
  {
    id: 'gaming',
    title: 'Gaming',
    description: 'High FPS, AAA titles, VR ready',
    icon: '🎮',
    recommendedSpecs: { ramGb: 16, storageGb: 1000, gpu: 'dedicated' },
  },
  {
    id: 'student',
    title: 'Student (General)',
    description: 'Notes, research, streaming, budget-friendly',
    icon: '📚',
    recommendedSpecs: { ramGb: 8, storageGb: 256, storageType: 'SSD' as const },
  },
] as const;

/** Price sync interval in milliseconds (6 hours) */
export const PRICE_SYNC_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Max products per search result page */
export const PRODUCTS_PER_PAGE = 20;

/** Deal score thresholds */
export const DEAL_SCORE = {
  EXCELLENT: 85,
  GOOD: 70,
  FAIR: 50,
  POOR: 30,
} as const;
