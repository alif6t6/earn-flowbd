const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const claimRoute = `
app.post('/api/user/promo-code/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    const db = getDb();
    let promoCode;
    let alreadyClaimed = false;
    let user;

    if (db?.select) {
      const p = await db.select().from(promoCodes).where(eq(promoCodes.code, code.toUpperCase()));
      if (p.length > 0) promoCode = p[0];
      
      if (promoCode) {
        const u = await dbStore.getUserById(req.user!.id);
        user = u;
        const uc = await db.select().from(userPromoCodes).where(eq(userPromoCodes.userId, req.user!.id));
        alreadyClaimed = uc.some(c => c.promoCodeId === promoCode.id);
      }
    } else {
      promoCode = memoryStore.promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase());
      alreadyClaimed = memoryStore.userPromoCodes.some(upc => upc.userId === req.user!.id && upc.promoCodeId === promoCode?.id);
      user = memoryStore.users.find(u => u.id === req.user!.id);
    }

    if (!promoCode || promoCode.status !== 'active') {
      return res.status(404).json({ error: 'Invalid or inactive promo code' });
    }

    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Promo code has expired' });
    }

    if (promoCode.startDate && new Date(promoCode.startDate) > new Date()) {
      return res.status(400).json({ error: 'Promo code is not active yet' });
    }

    if (promoCode.maxUses > 0 && promoCode.currentUses >= promoCode.maxUses) {
      return res.status(400).json({ error: 'Promo code usage limit reached' });
    }

    if (alreadyClaimed) {
      return res.status(400).json({ error: 'You have already claimed this promo code' });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Country Restriction check
    if (promoCode.countryRestriction && promoCode.countryRestriction.toLowerCase() !== 'both') {
      const userCountry = user.country?.toLowerCase() || 'bangladesh';
      if (userCountry !== promoCode.countryRestriction.toLowerCase()) {
         return res.status(400).json({ error: 'This promo code is not available in your country.' });
      }
    }

    // New Users Only check
    if (promoCode.newUsersOnly) {
       if (user.completedTasks && user.completedTasks > 0) {
          return res.status(400).json({ error: 'This promo code is for new users only.' });
       }
    }

    // Claim it
    if (db?.insert) {
      await db.insert(userPromoCodes).values({
        userId: user.id,
        promoCodeId: promoCode.id,
        claimedAt: new Date()
      });
      await db.update(promoCodes).set({ currentUses: promoCode.currentUses + 1 }).where(eq(promoCodes.id, promoCode.id));
      
      const newBalance = (parseFloat(user.balance) + parseFloat(promoCode.rewardAmount.toString())).toFixed(2);
      const newTotalEarned = (parseFloat(user.totalEarnings) + parseFloat(promoCode.rewardAmount.toString())).toFixed(2);
      
      await dbStore.updateUser(user.id, {
        balance: newBalance,
        totalEarnings: newTotalEarned
      });
      await dbStore.createTransaction({
        userId: user.id,
        type: 'promo_bonus',
        amount: parseFloat(promoCode.rewardAmount.toString()),
        description: \`Promo Code Claimed: \${promoCode.code}\`,
        status: 'completed'
      });
      return res.json({ 
        success: true, 
        message: \`Promo code applied successfully! You earned ৳\${promoCode.rewardAmount}\`,
        balance: newBalance 
      });
    } else {
      memoryStore.userPromoCodes.push({
        id: memoryStore.userPromoCodes.length + 1,
        userId: user.id,
        promoCodeId: promoCode.id,
        claimedAt: new Date()
      });
      promoCode.currentUses += 1;
      user.balance = (parseFloat(user.balance) + parseFloat(promoCode.rewardAmount)).toFixed(2);
      user.totalEarned = (parseFloat(user.totalEarnings || '0') + parseFloat(promoCode.rewardAmount)).toFixed(2);
      
      memoryStore.transactions.push({
        id: memoryStore.transactions.length + 1,
        userId: user.id,
        type: 'promo_bonus',
        amount: promoCode.rewardAmount,
        description: \`Promo Code Claimed: \${promoCode.code}\`,
        createdAt: new Date()
      });
      return res.json({ 
        success: true, 
        message: \`Promo code applied successfully! You earned ৳\${promoCode.rewardAmount}\`,
        balance: user.balance 
      });
    }
  } catch (error) {
    console.error('Claim promo error:', error);
    res.status(500).json({ error: 'Failed to claim promo code' });
  }
});
`;

const startIndex = code.indexOf("app.post('/api/user/promo-code/claim'");
const endIndex = code.indexOf("});", startIndex) + 3;

if (startIndex !== -1) {
  code = code.substring(0, startIndex) + claimRoute + code.substring(endIndex);
  fs.writeFileSync('server.ts', code);
}
