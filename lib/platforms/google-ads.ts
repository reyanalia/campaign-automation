export interface CampaignMetrics {
  campaignId: string;
  ctr: number;
  cpc: number;
  spend: number;
  impressions: number;
  clicks: number;
}

export async function getGoogleAdsCampaignMetrics(
  campaignId: string
): Promise<CampaignMetrics> {
  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    return mockGoogleMetrics(campaignId);
  }
  // Real implementation would use google-ads-api here
  return mockGoogleMetrics(campaignId);
}

export async function createGoogleAdsCampaign(config: {
  name: string;
  budget: number;
  startDate: string;
}): Promise<{ id: string; name: string }> {
  if (!process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    return { id: `mock_google_${Date.now()}`, name: config.name };
  }
  return { id: `google_${Date.now()}`, name: config.name };
}

function mockGoogleMetrics(campaignId: string): CampaignMetrics {
  return {
    campaignId,
    ctr: +(Math.random() * 5).toFixed(2),
    cpc: +(Math.random() * 3 + 0.5).toFixed(2),
    spend: +(Math.random() * 500).toFixed(2),
    impressions: Math.floor(Math.random() * 10000),
    clicks: Math.floor(Math.random() * 500),
  };
}
