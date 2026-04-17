export interface MetaMetrics {
  campaignId: string;
  ctr: number;
  cpc: number;
  spend: number;
  impressions: number;
  clicks: number;
  reach: number;
}

export async function getMetaCampaignMetrics(
  campaignId: string
): Promise<MetaMetrics> {
  if (!process.env.META_ACCESS_TOKEN) {
    return mockMetaMetrics(campaignId);
  }
  // Real implementation would use facebook-nodejs-business-sdk here
  return mockMetaMetrics(campaignId);
}

export async function createMetaCampaign(config: {
  name: string;
  budget: number;
  objective: string;
}): Promise<{ id: string; name: string }> {
  if (!process.env.META_ACCESS_TOKEN) {
    return { id: `mock_meta_${Date.now()}`, name: config.name };
  }
  return { id: `meta_${Date.now()}`, name: config.name };
}

function mockMetaMetrics(campaignId: string): MetaMetrics {
  return {
    campaignId,
    ctr: +(Math.random() * 4).toFixed(2),
    cpc: +(Math.random() * 2 + 0.3).toFixed(2),
    spend: +(Math.random() * 400).toFixed(2),
    impressions: Math.floor(Math.random() * 20000),
    clicks: Math.floor(Math.random() * 800),
    reach: Math.floor(Math.random() * 15000),
  };
}
