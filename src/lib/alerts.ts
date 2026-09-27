// ===========================================
// NeatPC — Price Alert Logic
// ===========================================
// Core logic for processing price alerts and triggering notifications.

import prisma from '@/lib/db';
import { sendEmail } from '@/lib/email'; // Assume this will be built in Phase 5
import config from '@/lib/config';

/**
 * Checks all active price alerts for a given product and triggers notifications
 * if the current best price is at or below the target price.
 */
export async function checkPriceAlerts(productId: string, currentBestPrice: number): Promise<void> {
  if (currentBestPrice <= 0) return;

  // Find all active, untriggered alerts for this product where target price is met
  const triggeredAlerts = await prisma.priceAlert.findMany({
    where: {
      productId,
      isActive: true,
      triggered: false,
      targetPrice: { gte: currentBestPrice },
    },
    include: {
      user: true,
      product: true,
    },
  });

  if (triggeredAlerts.length === 0) return;

  // Process triggers
  for (const alert of triggeredAlerts) {
    if (!alert.user.email) continue;

    // Mark as triggered
    await prisma.priceAlert.update({
      where: { id: alert.id },
      data: {
        triggered: true,
        triggeredAt: new Date(),
        isActive: false, // Turn off after triggering
      },
    });

    // We will send real emails in Phase 5. For now, log it.
    if (config.email.isConfigured) {
      // Stub for email sending
      console.log(`[Alert] 📧 Sending email to ${alert.user.email} - ${alert.product.name} is now $${currentBestPrice}!`);
    } else {
      console.log(`[Alert] 🔔 Target met for user ${alert.userId}: ${alert.product.name} dropped to $${currentBestPrice}`);
    }
  }
}
