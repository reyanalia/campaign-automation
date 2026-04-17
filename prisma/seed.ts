import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const db = new PrismaClient({ adapter });

async function main() {
  // Clients
  const client1 = await db.client.create({
    data: {
      name: "Sarah Johnson",
      email: "sarah@acmecorp.com",
      company: "Acme Corp",
      industry: "E-commerce",
      status: "active",
    },
  });

  const client2 = await db.client.create({
    data: {
      name: "Mark Davis",
      email: "mark@techflow.io",
      company: "TechFlow",
      industry: "SaaS",
      status: "onboarding",
    },
  });

  // Campaign Templates
  const googleTemplate = await db.campaignTemplate.create({
    data: {
      name: "Google Search — Lead Gen",
      description: "Standard Google Search campaign for lead generation",
      platform: "google_ads",
      category: "conversion",
      variables: JSON.stringify(["client_name", "budget", "landing_url", "audience_size"]),
      content: JSON.stringify({
        type: "search",
        bidStrategy: "TARGET_CPA",
        keywords: ["{{product}} pricing", "buy {{product}}", "best {{product}}"],
        headline1: "{{client_name}} — Get Started",
        description: "Trusted by thousands. {{offer}}. Sign up today.",
      }),
      tags: JSON.stringify(["lead-gen", "search", "conversion"]),
    },
  });

  const metaTemplate = await db.campaignTemplate.create({
    data: {
      name: "Meta — Awareness Campaign",
      description: "Top-of-funnel awareness campaign for Facebook & Instagram",
      platform: "meta",
      category: "awareness",
      variables: JSON.stringify(["client_name", "budget", "audience_size", "creative_url"]),
      content: JSON.stringify({
        objective: "BRAND_AWARENESS",
        placement: ["facebook_feed", "instagram_feed", "stories"],
        format: "single_image",
        cta: "LEARN_MORE",
      }),
      tags: JSON.stringify(["awareness", "top-of-funnel", "social"]),
    },
  });

  const emailTemplate = await db.campaignTemplate.create({
    data: {
      name: "Welcome Email Sequence",
      description: "3-email welcome sequence for new subscribers",
      platform: "email",
      category: "nurture",
      variables: JSON.stringify(["client_name", "from_name", "from_email", "landing_url"]),
      content: JSON.stringify({
        sequence: [
          { day: 0, subject: "Welcome to {{client_name}}!", preview: "Thanks for joining us" },
          { day: 3, subject: "Getting started with {{client_name}}", preview: "Here's what to do next" },
          { day: 7, subject: "Your first week with {{client_name}}", preview: "Tips and resources" },
        ],
      }),
      tags: JSON.stringify(["welcome", "nurture", "email-sequence"]),
    },
  });

  // Campaigns
  const campaign1 = await db.campaign.create({
    data: {
      name: "Acme — Spring Lead Gen",
      platform: "google_ads",
      status: "active",
      budget: 1500,
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-06-30"),
      clientId: client1.id,
      templateId: googleTemplate.id,
      variables: JSON.stringify({
        client_name: "Acme Corp",
        budget: 1500,
        landing_url: "https://acmecorp.com/spring-sale?utm_source=google&utm_medium=cpc",
        audience_size: 50000,
      }),
    },
  });

  const campaign2 = await db.campaign.create({
    data: {
      name: "Acme — Meta Awareness Q2",
      platform: "meta",
      status: "draft",
      budget: 800,
      clientId: client1.id,
      templateId: metaTemplate.id,
      variables: JSON.stringify({
        client_name: "Acme Corp",
        budget: 800,
        audience_size: 120000,
      }),
    },
  });

  // QA Checklist Templates
  const googleQA = await db.qAChecklistTemplate.create({
    data: {
      name: "Google Ads Pre-Launch Checklist",
      platform: "google_ads",
      items: {
        create: [
          { title: "Landing URL is reachable", checkType: "auto", autoCheckKey: "url_reachable", order: 0 },
          { title: "UTM tracking parameters present", checkType: "auto", autoCheckKey: "utm_params", order: 1 },
          { title: "Campaign budget is set", checkType: "auto", autoCheckKey: "budget_positive", order: 2 },
          { title: "Ad copy reviewed and approved", checkType: "manual", order: 3 },
          { title: "Negative keywords added", checkType: "manual", order: 4 },
          { title: "Conversion tracking verified", checkType: "manual", order: 5 },
        ],
      },
    },
  });

  const metaQA = await db.qAChecklistTemplate.create({
    data: {
      name: "Meta Ads Pre-Launch Checklist",
      platform: "meta",
      items: {
        create: [
          { title: "Campaign budget is set", checkType: "auto", autoCheckKey: "budget_positive", order: 0 },
          { title: "Audience size adequate", checkType: "auto", autoCheckKey: "audience_size", order: 1 },
          { title: "Creative assets approved by client", checkType: "manual", order: 2 },
          { title: "Pixel installed and firing", checkType: "manual", order: 3 },
          { title: "Ad account billing verified", checkType: "manual", order: 4 },
        ],
      },
    },
  });

  // Workflows
  const onboardWorkflow = await db.workflowTemplate.create({
    data: {
      name: "New Client Setup",
      description: "Standard workflow to set up all platforms for a new client",
      trigger: "onboarding",
      steps: {
        create: [
          { title: "Create Google Ads account", stepType: "create_campaign", platform: "google_ads", order: 0, config: JSON.stringify({ name: "Initial Campaign", budget: 500 }) },
          { title: "Create Meta ad account", stepType: "create_campaign", platform: "meta", order: 1, config: JSON.stringify({ name: "Initial Campaign", budget: 300, objective: "BRAND_AWARENESS" }) },
          { title: "Send welcome email", stepType: "send_email", order: 2, config: JSON.stringify({ to: "client", subject: "Welcome aboard!" }) },
          { title: "Notify team", stepType: "notify", order: 3, config: JSON.stringify({ message: "New client onboarded successfully!" }) },
        ],
      },
    },
  });

  await db.workflowTemplate.create({
    data: {
      name: "Campaign Launch Sequence",
      description: "Activate campaigns across all platforms simultaneously",
      trigger: "manual",
      steps: {
        create: [
          { title: "Activate Google campaign", stepType: "create_campaign", platform: "google_ads", order: 0, config: JSON.stringify({ name: "Launch Campaign", budget: 1000 }) },
          { title: "Activate Meta campaign", stepType: "create_campaign", platform: "meta", order: 1, config: JSON.stringify({ name: "Launch Campaign", budget: 500, objective: "CONVERSIONS" }) },
          { title: "Send launch email blast", stepType: "send_email", order: 2, config: JSON.stringify({ to: "subscribers", subject: "We're live!" }) },
          { title: "Alert team on Telegram", stepType: "notify", order: 3, config: JSON.stringify({ message: "Campaign is now live across all platforms" }) },
        ],
      },
    },
  });

  // Alert Rules
  await db.alertRule.create({
    data: {
      clientId: client1.id,
      name: "Low CTR Alert",
      platform: "google_ads",
      metric: "ctr",
      operator: "lt",
      threshold: 1.5,
      enabled: true,
    },
  });

  await db.alertRule.create({
    data: {
      clientId: client1.id,
      name: "High CPC Alert",
      platform: "meta",
      metric: "cpc",
      operator: "gt",
      threshold: 4.0,
      enabled: true,
    },
  });

  // Onboarding Sequence
  const sequence = await db.onboardingSequence.create({
    data: {
      name: "Standard Agency Onboarding",
      description: "Complete onboarding flow for new agency clients",
      steps: {
        create: [
          { title: "Collect credentials & access", description: "Gather Google Ads, Meta, and email platform credentials from the client", stepType: "manual", order: 0 },
          { title: "Set up platform accounts", description: "Run automated setup workflow across all platforms", stepType: "automated", workflowId: onboardWorkflow.id, order: 1 },
          { title: "Create initial campaign templates", description: "Configure campaign templates based on client industry and goals", stepType: "manual", order: 2 },
          { title: "Run QA on first campaigns", description: "Ensure all pre-launch checklists pass before going live", stepType: "manual", order: 3 },
          { title: "Go live and monitor", description: "Launch campaigns and confirm monitoring alerts are configured", stepType: "manual", order: 4 },
        ],
      },
    },
  });

  // Assign onboarding to client2
  await db.clientOnboarding.create({
    data: {
      clientId: client2.id,
      sequenceId: sequence.id,
      status: "in_progress",
      currentStep: 1,
      progress: JSON.stringify({}),
    },
  });

  console.log("✅ Seed data created successfully");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
