export interface EmailMetrics {
  campaignId: string;
  openRate: number;
  clickRate: number;
  sends: number;
  bounceRate: number;
}

export async function getMailchimpCampaignMetrics(
  campaignId: string
): Promise<EmailMetrics> {
  if (!process.env.MAILCHIMP_API_KEY) {
    return mockEmailMetrics(campaignId);
  }
  // Real implementation would use @mailchimp/mailchimp_marketing here
  return mockEmailMetrics(campaignId);
}

export async function createMailchimpCampaign(config: {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
}): Promise<{ id: string; name: string }> {
  if (!process.env.MAILCHIMP_API_KEY) {
    return { id: `mock_email_${Date.now()}`, name: config.name };
  }
  return { id: `email_${Date.now()}`, name: config.name };
}

function mockEmailMetrics(campaignId: string): EmailMetrics {
  return {
    campaignId,
    openRate: +(Math.random() * 40 + 10).toFixed(2),
    clickRate: +(Math.random() * 10 + 1).toFixed(2),
    sends: Math.floor(Math.random() * 5000 + 100),
    bounceRate: +(Math.random() * 3).toFixed(2),
  };
}
