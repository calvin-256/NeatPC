import config from './config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
}

/**
 * Sends an email using the Resend API via a lightweight fetch wrapper.
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  if (!config.email.isConfigured) {
    console.warn('⚠️ [Email] Resend API key not configured. Skipping email send.');
    console.log(`[Email Debug] To: ${to} | Subject: ${subject}`);
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.email.resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'NeatPC Alerts <alerts@neatpc.dev>', // Replace with verified domain in production
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[Email] Failed to send email via Resend:', errorText);
      return false;
    }

    console.log(`[Email] Successfully sent email to ${to}`);
    return true;
  } catch (error) {
    console.error('[Email] Network error while sending email:', error);
    return false;
  }
}

/**
 * Email Templates
 */
export const EmailTemplates = {
  priceAlert: (productName: string, targetPrice: number, currentPrice: number, productUrl: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
      <h2 style="color: #18181b;">Good news! A price dropped! 📉</h2>
      <p style="color: #52525b; font-size: 16px;">
        The <strong>${productName}</strong> you were watching has dropped below your target price of <strong>$${targetPrice.toFixed(2)}</strong>.
      </p>
      <div style="background-color: #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #52525b;">Current Best Price</p>
        <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">
          $${currentPrice.toFixed(2)}
        </p>
      </div>
      <a href="${productUrl}" style="display: block; width: 100%; text-align: center; background-color: #3b82f6; color: white; padding: 12px 0; text-decoration: none; border-radius: 6px; font-weight: bold;">
        View Deal on NeatPC
      </a>
      <p style="color: #a1a1aa; font-size: 12px; margin-top: 20px; text-align: center;">
        You are receiving this because you set a price alert on NeatPC.
      </p>
    </div>
  `,

  welcome: (userName: string) => `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px;">
      <h2 style="color: #18181b;">Welcome to NeatPC, ${userName}! 🎉</h2>
      <p style="color: #52525b; font-size: 16px;">
        Thanks for joining. We're excited to help you find the best tech deals using our AI engine.
      </p>
      <p style="color: #52525b; font-size: 16px;">
        You can now take the Quiz to get personalized recommendations, and set Price Alerts on products you're watching!
      </p>
      <a href="${config.appUrl}/dashboard" style="display: block; width: 100%; text-align: center; background-color: #3b82f6; color: white; padding: 12px 0; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px;">
        Go to Dashboard
      </a>
    </div>
  `
};
