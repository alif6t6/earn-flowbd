cat << 'INNER_EOF' >> server.ts

// --- Admin Promo Codes Management ---
app.get('/api/admin/promo-codes', requireAuth, requireAdmin, async (req, res) => {
  try {
    res.json(memoryStore.promoCodes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/promo-codes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const newPromo = {
      id: memoryStore.promoCodes.length > 0 ? Math.max(...memoryStore.promoCodes.map(p => p.id)) + 1 : 1,
      code: data.code,
      description: data.description || '',
      rewardAmount: String(data.rewardAmount),
      maxUses: Number(data.maxUses || 0),
      currentUses: 0,
      status: data.status || 'active',
      startDate: data.startDate || new Date().toISOString(),
      expiresAt: data.expiresAt || null,
      createdAt: new Date().toISOString(),
    };
    memoryStore.promoCodes.push(newPromo);
    res.json(newPromo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/promo-codes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const idx = memoryStore.promoCodes.findIndex(p => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    
    memoryStore.promoCodes[idx] = { ...memoryStore.promoCodes[idx], ...data };
    res.json(memoryStore.promoCodes[idx]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/promo-codes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    memoryStore.promoCodes = memoryStore.promoCodes.filter(p => p.id !== id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
INNER_EOF
chmod +x add_promo_endpoints.sh
./add_promo_endpoints.sh
