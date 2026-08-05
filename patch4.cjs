const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const adminPromoRoutes = `
// ----------------------------------------------------
// ADMIN PROMO CODES
// ----------------------------------------------------
app.get('/api/admin/promo-codes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const db = getDb();
    if (db?.select) {
      const allPromos = await db.select().from(promoCodes).orderBy(desc(promoCodes.createdAt));
      return res.json(allPromos);
    }
    res.json(memoryStore.promoCodes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/promo-codes', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = req.body;
    const db = getDb();
    if (db?.insert) {
      const newPromo = await db.insert(promoCodes).values({
        code: data.code.toUpperCase(),
        description: data.description,
        rewardAmount: data.rewardAmount,
        maxUses: Number(data.maxUses) || 0,
        status: data.status,
        promotionTag: data.promotionTag,
        countryRestriction: data.countryRestriction,
        newUsersOnly: data.newUsersOnly,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      }).returning();
      return res.json(newPromo[0]);
    }
    
    const newPromo = {
      id: memoryStore.promoCodes.length + 1,
      code: data.code.toUpperCase(),
      description: data.description,
      rewardAmount: data.rewardAmount,
      maxUses: Number(data.maxUses) || 0,
      currentUses: 0,
      status: data.status,
      promotionTag: data.promotionTag,
      countryRestriction: data.countryRestriction,
      newUsersOnly: data.newUsersOnly,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      createdAt: new Date(),
    };
    memoryStore.promoCodes.push(newPromo);
    res.json(newPromo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/promo-codes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const db = getDb();
    
    const updateData = {
      code: data.code.toUpperCase(),
      description: data.description,
      rewardAmount: data.rewardAmount,
      maxUses: Number(data.maxUses) || 0,
      status: data.status,
      promotionTag: data.promotionTag,
      countryRestriction: data.countryRestriction,
      newUsersOnly: data.newUsersOnly,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    };
    
    if (db?.update) {
      const updated = await db.update(promoCodes).set(updateData).where(eq(promoCodes.id, Number(id))).returning();
      return res.json(updated[0]);
    }
    
    const promo = memoryStore.promoCodes.find(p => p.id === Number(id));
    if (!promo) return res.status(404).json({ error: 'Promo code not found' });
    Object.assign(promo, updateData);
    res.json(promo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/promo-codes/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDb();
    if (db?.delete) {
      await db.delete(userPromoCodes).where(eq(userPromoCodes.promoCodeId, Number(id)));
      await db.delete(promoCodes).where(eq(promoCodes.id, Number(id)));
      return res.json({ success: true });
    }
    
    memoryStore.promoCodes = memoryStore.promoCodes.filter(p => p.id !== Number(id));
    memoryStore.userPromoCodes = memoryStore.userPromoCodes.filter(p => p.promoCodeId !== Number(id));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
`;

code = code.replace(
  "// ----------------------------------------------------\n// ADMIN USER MANAGEMENT",
  adminPromoRoutes + "\n// ----------------------------------------------------\n// ADMIN USER MANAGEMENT"
);

fs.writeFileSync('server.ts', code);
