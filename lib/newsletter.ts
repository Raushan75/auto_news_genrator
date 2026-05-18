// lib/newsletter.ts
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import type { ArticleCard } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || "news@nexusai.news";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexusai.news";

export async function sendConfirmationEmail(
  email: string,
  token: string
): Promise<void> {
  const confirmUrl = `${SITE_URL}/api/newsletter/confirm?token=${token}`;

  await resend.emails.send({
    from: `NexusAI News <${FROM_EMAIL}>`,
    to: email,
    subject: "Confirm your NexusAI News subscription",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #f0f0f8;">
        <h1 style="font-size: 28px; color: #e8c547; margin-bottom: 8px;">NexusAI News</h1>
        <p style="color: #a0a0b8; font-size: 14px; margin-bottom: 32px;">The world's most intelligent news platform</p>
        <h2 style="font-size: 22px; margin-bottom: 16px;">Confirm your subscription</h2>
        <p style="line-height: 1.6; margin-bottom: 24px; color: #c0c0d8;">
          Thanks for signing up! Click the button below to confirm your email address 
          and start receiving AI-curated news briefings.
        </p>
        <a href="${confirmUrl}" style="display: inline-block; background: #e8c547; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;">
          Confirm Subscription
        </a>
        <p style="margin-top: 32px; font-size: 13px; color: #606078;">
          If you didn't request this, you can safely ignore this email.
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
}
export async function sendWelcomeEmail(
  email: string,
  name?: string,
): Promise<void> {
  await resend.emails.send({
    from: `NexusAI News <${FROM_EMAIL}>`,
    to: email,
    subject: "Welcome to NexusAI News",
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0a0a0f; color: #f0f0f8;">
        
        <h1 style="font-size: 28px; color: #e8c547; margin-bottom: 8px;">
          Welcome${name ? `, ${name}` : ""} 
        </h1>

        <p style="color: #a0a0b8; font-size: 15px; line-height: 1.7; margin-bottom: 24px;">
          Your subscription to <strong>NexusAI News</strong> is now active.
        </p>

        <p style="color: #c0c0d8; line-height: 1.8; margin-bottom: 24px;">
          You’ll start receiving:
        </p>

        <ul style="color: #c0c0d8; line-height: 1.8; padding-left: 20px; margin-bottom: 32px;">
          <li>Breaking global headlines</li>
          <li>AI-curated news summaries</li>
          <li>Technology & business intelligence</li>
          <li>Daily personalized briefings</li>
        </ul>

        <a 
          href="${SITE_URL}"
          style="display: inline-block; background: #e8c547; color: #000; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px;"
        >
          Visit NexusAI News
        </a>

        <p style="margin-top: 40px; font-size: 12px; color: #606078;">
          NexusAI News · AI-powered journalism platform
        </p>
      </div>
    `,
  });
}

export async function sendDailyNewsletter(
  articles: ArticleCard[]
): Promise<{ sent: number; failed: number }> {
  const subscribers = await prisma.subscriber.findMany({
    where: {
      status: "ACTIVE",
      frequency: { in: ["DAILY", "REALTIME"] },
    },
    select: { email: true, name: true, token: true },
  });

  let sent = 0;
  let failed = 0;

  const topArticles = articles.slice(0, 6);
  const articleHtml = topArticles
    .map(
      (a) => `
    <div style="border-bottom: 1px solid #1a1a24; padding: 20px 0;">
      <div style="font-size: 11px; font-weight: 700; letter-spacing: 1px; color: #e8c547; text-transform: uppercase; margin-bottom: 6px;">
        ${a.category}
      </div>
      <a href="${SITE_URL}/${a.category.toLowerCase()}/${a.slug}" 
         style="font-size: 18px; font-weight: 700; color: #f0f0f8; text-decoration: none; display: block; margin-bottom: 8px; font-family: Georgia, serif; line-height: 1.3;">
        ${a.title}
      </a>
      <p style="font-size: 14px; color: #a0a0b8; line-height: 1.6; margin: 0 0 8px;">
        ${a.excerpt}
      </p>
      <div style="font-size: 12px; color: #606078;">
        ${a.author ? `By ${a.author} · ` : ""}${a.readTime} min read
      </div>
    </div>
  `
    )
    .join("");

  // Send in batches of 50
  for (let i = 0; i < subscribers.length; i += 50) {
    const batch = subscribers.slice(i, i + 50);

    await Promise.allSettled(
      batch.map(async (sub) => {
        try {
          const unsubUrl = `${SITE_URL}/api/newsletter/unsubscribe?token=${sub.token}`;
          await resend.emails.send({
            from: `NexusAI News <${FROM_EMAIL}>`,
            to: sub.email,
            subject: `Today's Top Stories — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}`,
            html: `
              <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0a0a0f; color: #f0f0f8;">
                <div style="padding: 32px 32px 0;">
                  <h1 style="font-size: 24px; color: #e8c547; margin-bottom: 4px;">NexusAI News</h1>
                  <p style="color: #606078; font-size: 13px; font-family: 'DM Mono', monospace;">
                    Daily Intelligence · ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div style="padding: 0 32px;">
                  ${articleHtml}
                </div>
                <div style="padding: 24px 32px; border-top: 1px solid #1a1a24; margin-top: 16px;">
                  <p style="font-size: 12px; color: #606078; text-align: center;">
                    You're receiving this because you subscribed to NexusAI News.<br>
                    <a href="${unsubUrl}" style="color: #4a9eff;">Unsubscribe</a> · 
                    <a href="${SITE_URL}/settings" style="color: #4a9eff;">Manage preferences</a>
                  </p>
                </div>
              </div>
            `,
          });
          sent++;
        } catch {
          failed++;
        }
      })
    );
  }

  return { sent, failed };
}
