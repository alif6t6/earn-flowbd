cat << 'INNER_EOF' >> server.ts

// --- Admin Campaign Management ---
app.get('/api/admin/campaign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const list = await dbStore.getSettings();
    const settingsObj = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json({
      enabled: settingsObj.campaignEnabled === 'true',
      name: settingsObj.campaignName || '',
      bonusAmount: settingsObj.campaignBonusAmount || '0',
      maxUsers: settingsObj.campaignMaxUsers || '0',
      startDate: settingsObj.campaignStartDate || '',
      endDate: settingsObj.campaignEndDate || ''
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/campaign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    await dbStore.updateSetting('campaignEnabled', String(data.enabled));
    await dbStore.updateSetting('campaignName', data.name);
    await dbStore.updateSetting('campaignBonusAmount', String(data.bonusAmount));
    await dbStore.updateSetting('campaignMaxUsers', String(data.maxUsers));
    await dbStore.updateSetting('campaignStartDate', data.startDate || '');
    await dbStore.updateSetting('campaignEndDate', data.endDate || '');
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
INNER_EOF
chmod +x add_campaign_endpoints.sh
./add_campaign_endpoints.sh
