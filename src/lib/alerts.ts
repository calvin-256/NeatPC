// ===========================================
// NeatPC — Price Alert Logic
// ===========================================
// Core logic for processing price alerts and triggering notifications.

import prisma from '@/lib/db';
import { sendEmail, EmailTemplates } from '@/lib/email';
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

    if (config.email.isConfigured) {
      await sendEmail({
        to: alert.user.email,
        subject: `Price Drop Alert: ${alert.product.name} is now $${currentBestPrice}!`,
        html: EmailTemplates.priceAlert(
          alert.product.name, 
          alert.targetPrice, 
          currentBestPrice, 
          `${config.appUrl}/product/${alert.product.slug}`
        )
      });
    } else {
      console.log(`[Alert] 🔔 Target met for user ${alert.userId}: ${alert.product.name} dropped to $${currentBestPrice}`);
    }
  }
}
