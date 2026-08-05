const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `app.get('/api/settings', async (req, res) => {
  try {
    const list = await dbStore.getSettings();
    const map = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json({
      siteName: map.siteName || 'Earn Flow',`;

const replacement = `app.get('/api/settings', async (req, res) => {
  try {
    const list = await dbStore.getSettings();
    const map = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    
    let activeCampaign = null;
    if (map.campaignEnabled === 'true') {
      const now = new Date();
      const start = (map.campaignStartDate && map.campaignStartDate !== '') ? new Date(map.campaignStartDate) : new Date(0);
      const end = (map.campaignEndDate && map.campaignEndDate !== '') ? new Date(map.campaignEndDate) : new Date(8640000000000000);
      const currentCampaignUsers = Number(map.campaignCurrentUsers || '0');
      const maxCampaignUsers = Number(map.campaignMaxUsers || '0');
      if (now >= start && now <= end && (maxCampaignUsers === 0 || currentCampaignUsers < maxCampaignUsers)) {
         activeCampaign = {
           name: map.campaignName || 'Welcome Bonus',
           bonusAmount: map.campaignBonusAmount || '0'
         };
      }
    }

    res.json({
      activeCampaign,
      siteName: map.siteName || 'Earn Flow',`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
