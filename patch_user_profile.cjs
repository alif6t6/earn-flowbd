const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const profileSearch = `    res.json({
      id: user.id,`;

const profileReplace = `    const list = await dbStore.getSettings();
    const s = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    
    let activeCampaign = null;
    if (s.campaignEnabled === 'true') {
      const now = new Date();
      const start = (s.campaignStartDate && s.campaignStartDate !== '') ? new Date(s.campaignStartDate) : new Date(0);
      const end = (s.campaignEndDate && s.campaignEndDate !== '') ? new Date(s.campaignEndDate) : new Date(8640000000000000);
      const currentCampaignUsers = Number(s.campaignCurrentUsers || '0');
      const maxCampaignUsers = Number(s.campaignMaxUsers || '0');
      if (now >= start && now <= end && (maxCampaignUsers === 0 || currentCampaignUsers < maxCampaignUsers)) {
         activeCampaign = {
           name: s.campaignName || 'Welcome Bonus',
           bonusAmount: s.campaignBonusAmount || '0'
         };
      }
    }

    res.json({
      activeCampaign,
      id: user.id,`;

content = content.replace(profileSearch, profileReplace);
fs.writeFileSync('server.ts', content);
