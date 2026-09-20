// ===========================================
// NeatPC — Health Check API
// ===========================================
// GET /api/health
// Returns service status for monitoring and debugging.

import { NextResponse } from 'next/server';
import { getServiceHealth, validateConfig } from '@/lib/config';
import prisma from '@/lib/db';

export async function GET() {
  const startTime = Date.now();

  // Check config
  const { valid, warnings } = validateConfig();
  const services = getServiceHealth();

  // Check database connectivity
  let dbStatus: 'connected' | 'error' = 'error';
  let productCount = 0;
  try {
    productCount = await prisma.product.count();
    dbStatus = 'connected';
  } catch {
    dbStatus = 'error';
  }

  const responseTime = Date.now() - startTime;

  return NextResponse.json({
    status: valid ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    responseTimeMs: responseTime,
    environment: process.env.NODE_ENV,
    database: {
      status: dbStatus,
      productCount,
    },
    services: services.map((s) => ({
      name: s.name,
      status: s.status,
      required: s.required,
    })),
    warnings,
  });
}
