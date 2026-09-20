// ===========================================
// NeatPC — Product Normalizer
// ===========================================
// Converts raw retailer data into our unified Product format
// and handles cross-retailer product matching by model number/UPC.

import type { ProductSpecs, DeviceCategory, OperatingSystem } from '@/types';
import type { RawRetailerProduct } from './types';
import { slugify } from '@/utils';

/**
 * Normalize raw specs from any retailer into our unified ProductSpecs format.
 * Handles inconsistent key names across retailers.
 */
export function normalizeSpecs(raw: Record<string, string | number>): ProductSpecs {
  const specs: ProductSpecs = {};

  // CPU
  const cpuKeys = ['cpu', 'processor', 'chip', 'processor_type', 'processorType'];
  for (const key of cpuKeys) {
    if (raw[key]) { specs.cpu = String(raw[key]); break; }
  }

  // GPU
  const gpuKeys = ['gpu', 'graphics', 'graphics_card', 'graphicsCard', 'video_card'];
  for (const key of gpuKeys) {
    if (raw[key]) { specs.gpu = String(raw[key]); break; }
  }

  // RAM
  const ramKeys = ['ramGb', 'ram', 'memory', 'ram_size', 'systemMemory'];
  for (const key of ramKeys) {
    if (raw[key]) {
      const val = String(raw[key]).replace(/[^\d.]/g, '');
      specs.ramGb = parseFloat(val) || undefined;
      break;
    }
  }

  // Storage
  const storageKeys = ['storageGb', 'storage', 'ssd', 'hard_drive', 'internalStorage'];
  for (const key of storageKeys) {
    if (raw[key]) {
      const val = String(raw[key]);
      const num = parseFloat(val.replace(/[^\d.]/g, ''));
      // Convert TB to GB
      specs.storageGb = val.toLowerCase().includes('tb') ? num * 1000 : num;
      break;
    }
  }

  // Storage type
  const storageTypeKeys = ['storageType', 'storage_type', 'driveType'];
  for (const key of storageTypeKeys) {
    if (raw[key]) {
      const val = String(raw[key]).toUpperCase();
      if (val.includes('SSD')) specs.storageType = 'SSD';
      else if (val.includes('HDD')) specs.storageType = 'HDD';
      else if (val.includes('EMMC')) specs.storageType = 'eMMC';
      break;
    }
  }

  // Display
  const displayKeys = ['displaySize', 'screen_size', 'screenSize', 'display'];
  for (const key of displayKeys) {
    if (raw[key]) {
      specs.displaySize = parseFloat(String(raw[key]).replace(/[^\d.]/g, '')) || undefined;
      break;
    }
  }

  // Resolution
  const resKeys = ['displayResolution', 'resolution', 'screen_resolution'];
  for (const key of resKeys) {
    if (raw[key]) { specs.displayResolution = String(raw[key]); break; }
  }

  // Battery
  const batteryKeys = ['batteryWh', 'batteryHours', 'battery_life', 'batteryLife'];
  for (const key of batteryKeys) {
    if (raw[key]) {
      specs.batteryWh = parseFloat(String(raw[key]).replace(/[^\d.]/g, '')) || undefined;
      break;
    }
  }

  // Weight
  const weightKeys = ['weightKg', 'weight', 'product_weight'];
  for (const key of weightKeys) {
    if (raw[key]) {
      const val = String(raw[key]);
      let kg = parseFloat(val.replace(/[^\d.]/g, ''));
      // Convert lbs to kg
      if (val.toLowerCase().includes('lb') || val.toLowerCase().includes('pound')) {
        kg = kg * 0.4536;
      }
      specs.weightKg = Math.round(kg * 100) / 100;
      break;
    }
  }

  // OS
  const osKeys = ['os', 'operating_system', 'operatingSystem'];
  for (const key of osKeys) {
    if (raw[key]) {
      const val = String(raw[key]).toLowerCase();
      if (val.includes('macos') || val.includes('mac os')) specs.os = 'macos';
      else if (val.includes('windows')) specs.os = 'windows';
      else if (val.includes('chrome')) specs.os = 'chromeos';
      else if (val.includes('linux')) specs.os = 'linux';
      else if (val.includes('ios')) specs.os = 'ios';
      else if (val.includes('android')) specs.os = 'android';
      break;
    }
  }

  // Camera (phones)
  const cameraKeys = ['cameraMp', 'camera', 'rear_camera', 'mainCamera'];
  for (const key of cameraKeys) {
    if (raw[key]) {
      specs.cameraMp = parseFloat(String(raw[key]).replace(/[^\d.]/g, '')) || undefined;
      break;
    }
  }

  // Refresh rate
  const refreshKeys = ['refreshRate', 'refresh_rate', 'screenRefreshRate'];
  for (const key of refreshKeys) {
    if (raw[key]) {
      specs.refreshRate = parseInt(String(raw[key]).replace(/[^\d]/g, ''), 10) || undefined;
      break;
    }
  }

  return specs;
}

/**
 * Generate a matching key for cross-retailer product deduplication.
 * Uses model number, UPC, or normalized name.
 */
export function getMatchingKey(product: RawRetailerProduct): string {
  // Prefer model number or UPC
  if (product.modelNumber) return `model:${product.modelNumber.toLowerCase().trim()}`;
  if (product.upc) return `upc:${product.upc.trim()}`;

  // Fall back to normalized brand + name
  const normalized = `${product.brand} ${product.name}`
    .toLowerCase()
    .replace(/\s*\(.*?\)\s*/g, '')  // Remove parenthetical info
    .replace(/[^\w\s]/g, '')         // Remove special chars
    .replace(/\s+/g, ' ')
    .trim();

  return `name:${normalized}`;
}

/**
 * Detect device category from product name/category.
 */
export function detectCategory(product: RawRetailerProduct): DeviceCategory {
  const text = `${product.name} ${product.category || ''} ${product.description}`.toLowerCase();

  if (text.includes('phone') || text.includes('iphone') || text.includes('galaxy s') || text.includes('pixel')) {
    return 'phone';
  }
  if (text.includes('tablet') || text.includes('ipad')) {
    return 'tablet';
  }
  if (text.includes('desktop') || text.includes('tower') || text.includes('all-in-one')) {
    return 'desktop';
  }
  return 'laptop'; // Default
}

/**
 * Generate a URL-safe slug for a product.
 */
export function generateProductSlug(product: RawRetailerProduct): string {
  return slugify(`${product.brand} ${product.name}`);
}
