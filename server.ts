import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from './src/db/store';
import { memoryStore, getDb } from './src/db/index';
import { promoCodes, userPromoCodes } from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { requireAuth, requireAdmin, AuthRequest } from './src/middleware/auth';

const app = express();
app.use(express.json());

const PORT = 3000;

// Init Super Admin and Default Accounts
async function initSuperAdmin() {
  try {
    const passwordHash = await bcrypt.hash('@Alif632868', 10);
    const adminUser = await dbStore.getUserByUsername('alif6t6');
    if (!adminUser) {
      await dbStore.createUser({
        username: 'alif6t6',
        passwordHash,
        phoneNumber: '01800000000',
        country: 'Bangladesh',
        isAdmin: true,
        isPremium: true,
        status: 'active',
        referralCode: 'ALIF6T6',
      });
      console.log('Super Admin user (alif6t6) created successfully.');
    } else {
      await dbStore.updateUser(adminUser.id, {
        passwordHash,
        isAdmin: true,
        status: 'active',
      });
      console.log('Super Admin user (alif6t6) credentials synchronized.');
    }

    const demoUser = await dbStore.getUserByUsername('userai');
    if (!demoUser) {
      const demoHash = await bcrypt.hash('123456', 10);
      await dbStore.createUser({
        username: 'userai',
        passwordHash: demoHash,
        phoneNumber: '01000000000',
        country: 'Bangladesh',
        isAdmin: false,
        referralCode: 'USERAI',
      });
      console.log('Demo user userai created successfully.');
    }
  } catch (error) {
    console.error('Failed to init seed accounts:', error);
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'earnflow_default_secret_key_2026';

// ----------------------------------------------------
// AUTHENTICATION ROUTES
// ----------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password).trim();

    let user = await dbStore.getUserByUsername(cleanUsername);

    // Super Admin auto-provision & override check for 'alif6t6'
    if (cleanUsername.toLowerCase() === 'alif6t6' && cleanPassword === '@Alif632868') {
      const passwordHash = await bcrypt.hash('@Alif632868', 10);
      if (!user) {
        user = await dbStore.createUser({
          username: 'alif6t6',
          passwordHash,
          phoneNumber: '01800000000',
          country: 'Bangladesh',
          isAdmin: true,
          isPremium: true,
          status: 'active',
          referralCode: 'ALIF6T6',
        });
      } else {
        await dbStore.updateUser(user.id, {
          passwordHash,
          isAdmin: true,
          status: 'active',
        });
        user.passwordHash = passwordHash;
        user.isAdmin = true;
        user.status = 'active';
      }
    }

    // Demo User auto-provision check
    if (!user && cleanUsername.toLowerCase() === 'userai' && cleanPassword === '123456') {
      const passwordHash = await bcrypt.hash('123456', 10);
      user = await dbStore.createUser({
        username: 'userai',
        passwordHash,
        phoneNumber: '01000000000',
        country: 'Bangladesh',
        isAdmin: false,
        referralCode: 'USERAI',
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been banned by the administrator.' });
    }

    const isMatch = await bcrypt.compare(cleanPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({ token, isAdmin: user.isAdmin });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, phoneNumber, referralCode: inputReferralCode, country } = req.body;

    const cleanUsername = username ? String(username).trim() : '';
    const cleanPassword = password ? String(password).trim() : '';
    const cleanPhone = phoneNumber ? String(phoneNumber).trim() : '';

    if (!cleanUsername || cleanUsername.length < 4) {
      return res.status(400).json({ error: 'Username must be at least 4 characters long.' });
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (!cleanPhone) {
      return res.status(400).json({ error: 'Phone number is required.' });
    }

    const existingUser = await dbStore.getUserByUsername(cleanUsername);
    if (existingUser) {
      return res.status(400).json({ 
        error: `Username '${cleanUsername}' is already taken. Try adding numbers like '${cleanUsername.toLowerCase()}1'.` 
      });
    }

    const existingPhone = await dbStore.getUserByPhoneNumber(cleanPhone);
    if (existingPhone) {
      return res.status(400).json({ 
        error: 'An account with this phone number already exists.' 
      });
    }

    const passwordHash = await bcrypt.hash(cleanPassword, 10);
    
    let referredById = null;
    if (inputReferralCode) {
      const allUsers = await dbStore.getUsers();
      const referrer = allUsers.find(u => u.referralCode === String(inputReferralCode).trim().toUpperCase());
      if (referrer) {
        referredById = referrer.id;
      }
    }

    const user = await dbStore.createUser({
      username: cleanUsername,
      passwordHash,
      phoneNumber: cleanPhone,
      country: country || 'Bangladesh',
      referredBy: referredById,
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    });

    const list = await dbStore.getSettings();
    const s = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    
    if (s.campaignEnabled === 'true') {
      const now = new Date();
      const start = s.campaignStartDate ? new Date(s.campaignStartDate) : new Date(0);
      const end = s.campaignEndDate ? new Date(s.campaignEndDate) : new Date(8640000000000000);
      
      const currentCampaignUsers = Number(s.campaignCurrentUsers || '0');
      const maxCampaignUsers = Number(s.campaignMaxUsers || '0');
      
      if (now >= start && now <= end && (maxCampaignUsers === 0 || currentCampaignUsers < maxCampaignUsers)) {
         const bonusAmount = parseFloat(s.campaignBonusAmount || '0');
         if (bonusAmount > 0) {
           const newBalance = (parseFloat(user.balance) + bonusAmount).toFixed(2);
           const newTotal = (parseFloat(user.totalEarnings) + bonusAmount).toFixed(2);
           user.balance = newBalance;
           user.totalEarnings = newTotal;
           await dbStore.updateUser(user.id, { balance: newBalance, totalEarnings: newTotal });
           await dbStore.updateSetting('campaignCurrentUsers', String(currentCampaignUsers + 1));
           await dbStore.addTransaction({
             userId: user.id,
             type: 'campaign_bonus',
             amount: bonusAmount,
             description: `Special Promotion Bonus: ${s.campaignName || 'Welcome'}`
           });
           await dbStore.addNotification({
             userId: user.id,
             title: '🎉 Promotion Bonus Received!',
             message: `You received a special bonus of ৳${bonusAmount} for signing up during our campaign!`,
             type: 'success'
           });
         }
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '365d' }
    );

    res.json({ token, isAdmin: user.isAdmin });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

function parseRenewTime(renewTimeStr: string): { hour: number; minute: number; displayStr: string } {
  if (!renewTimeStr) return { hour: 6, minute: 0, displayStr: '06:00 AM' };
  
  let str = renewTimeStr.trim().toUpperCase();
  let isPM = str.includes('PM');
  let isAM = str.includes('AM');
  str = str.replace(/AM|PM/g, '').trim();
  
  const parts = str.split(':');
  let hour = parseInt(parts[0], 10);
  let minute = parseInt(parts[1] || '0', 10);
  
  if (isNaN(hour) || hour < 0 || hour > 23) hour = 6;
  if (isNaN(minute) || minute < 0 || minute > 59) minute = 0;
  
  if (isPM && hour < 12) hour += 12;
  if (isAM && hour === 12) hour = 0;
  
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayStr = `${String(displayHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${ampm}`;
  
  return { hour, minute, displayStr };
}

// Helper for Daily Auto-Renew cycle calculation
function getCycleStart(renewTimeStr: string): Date {
  const { hour, minute } = parseRenewTime(renewTimeStr);
  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0, 0);
  if (now < cycleStart) {
    cycleStart.setDate(cycleStart.getDate() - 1);
  }
  return cycleStart;
}

function getPreviousCycleStart(renewTimeStr: string): Date {
  const current = getCycleStart(renewTimeStr);
  const prev = new Date(current);
  prev.setDate(prev.getDate() - 1);
  return prev;
}



// ----------------------------------------------------
// USER PROFILE & ACCOUNT ROUTES
// ----------------------------------------------------
app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await dbStore.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const allUsers = await dbStore.getUsers();
    const totalReferrals = allUsers.filter(u => u.referredBy === user.id).length;

    const list = await dbStore.getSettings();
    const s = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    
    let activeCampaign = null;
    if (s.campaignEnabled === 'true') {
      const now = new Date();
      const start = (s.campaignStartDate && s.campaignStartDate !== '') ? new Date(s.campaignStartDate) : new Date(0);
      const end = (s.campaignEndDate && s.campaignEndDate !== '') ? new Date(s.campaignEndDate) : new Date(8640000000000000);
      const currentCampaignUsers = Number(s.campaignCurrentUsers || '0');
      const maxCampaignUsers = Number(s.campaignMaxUsers || '0');
      if (now >= start && now <= end && (maxCampaignUsers === 0 || currentCampaignUsers < maxCampaignUsers)) {
         const userTxs = await dbStore.getTransactions(user.id);
         const hasClaimedCampaign = userTxs.some((tx: any) => tx.type === 'campaign_bonus');
         activeCampaign = {
           enabled: true,
           name: s.campaignName || 'Welcome & Promotion Bonus',
           bonusAmount: parseFloat(s.campaignBonusAmount || '0'),
           startDate: s.campaignStartDate || null,
           endDate: s.campaignEndDate || null,
           maxUsers: maxCampaignUsers,
           currentUsers: currentCampaignUsers,
           hasClaimed: hasClaimedCampaign
         };
      }
    }

    res.json({
      activeCampaign,
      id: user.id,
      username: user.username,
      phoneNumber: user.phoneNumber,
      country: user.country || 'Bangladesh',
      balance: user.balance || '0.00',
      todaysEarnings: user.todaysEarnings || '0.00',
      totalEarnings: user.totalEarnings || '0.00',
      referralEarnings: user.referralEarnings || '0.00',
      pendingWithdraw: user.pendingWithdraw || '0.00',
      totalWithdraw: user.totalWithdraw || '0.00',
      completedTasks: user.completedTasks || 0,
      referralCode: user.referralCode,
      isPremium: user.isPremium || false,
      isAdmin: user.isAdmin || false,
      status: user.status || 'active',
      lastDailyClaim: user.lastDailyClaim || null,
      dailyStreak: user.dailyStreak || 0,
      totalReferrals,
      createdAt: user.createdAt,
      hasClaimedPromo: memoryStore.userPromoCodes.some(upc => upc.userId === user.id),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Daily Check-in Endpoints
app.get('/api/user/daily-checkin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settingsList = await dbStore.getSettings();
    const settingsMap = settingsList.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    
    if (settingsMap.dailyCheckInEnabled === 'false') {
      return res.json({ canClaim: false, claimedToday: true, currentStreak: 0, nextDay: 1, nextReward: 0, renewTime: '', rewards: [] });
    }

    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';
    
    let DAILY_REWARDS = { 1: 2, 2: 4, 3: 8, 4: 10, 5: 15, 6: 20, 7: 20, 8: 30 };
    try {
      if (settingsMap.dailyRewards) {
        DAILY_REWARDS = JSON.parse(settingsMap.dailyRewards);
      }
    } catch(e) {}

    const currentCycleStart = getCycleStart(renewTimeStr);
    const previousCycleStart = getPreviousCycleStart(renewTimeStr);

    const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim) : null;
    const claimedToday = lastClaim ? lastClaim >= currentCycleStart : false;

    let activeStreak = user.dailyStreak || 0;
    if (lastClaim && lastClaim < previousCycleStart && !claimedToday) {
      activeStreak = 0;
    }

    let nextDay = 1;
    if (claimedToday) {
      nextDay = activeStreak > 0 ? activeStreak : 1;
    } else {
      if (lastClaim && lastClaim >= previousCycleStart && activeStreak > 0) {
        nextDay = (activeStreak % 8) + 1;
      } else {
        nextDay = 1;
      }
    }

    const rewardsList = [1, 2, 3, 4, 5, 6, 7, 8].map((day) => {
      let status: 'claimed' | 'current' | 'locked' = 'locked';
      if (claimedToday) {
        if (day <= activeStreak) status = 'claimed';
        else if (day === activeStreak + 1) status = 'current';
        else status = 'locked';
      } else {
        if (day < nextDay) status = 'claimed';
        else if (day === nextDay) status = 'current';
        else status = 'locked';
      }
      return {
        day,
        reward: DAILY_REWARDS[day],
        status,
      };
    });

    res.json({
      canClaim: !claimedToday,
      claimedToday,
      currentStreak: activeStreak,
      nextDay,
      nextReward: DAILY_REWARDS[nextDay],
      renewTime: parseRenewTime(renewTimeStr).displayStr,
      lastClaim: user.lastDailyClaim || null,
      rewards: rewardsList,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/daily-checkin/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settingsList = await dbStore.getSettings();
    const settingsMap = settingsList.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    
    if (settingsMap.dailyCheckInEnabled === 'false') {
      return res.status(400).json({ error: 'Daily check-in is currently disabled.' });
    }

    let DAILY_REWARDS: Record<number, number> = { 1: 2, 2: 4, 3: 8, 4: 10, 5: 15, 6: 20, 7: 20, 8: 30 };
    try {
      if (settingsMap.dailyRewards) {
        DAILY_REWARDS = JSON.parse(settingsMap.dailyRewards);
      }
    } catch(e) {}

    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';
    const currentCycleStart = getCycleStart(renewTimeStr);
    const previousCycleStart = getPreviousCycleStart(renewTimeStr);

    const lastClaim = user.lastDailyClaim ? new Date(user.lastDailyClaim) : null;
    const claimedToday = lastClaim ? lastClaim >= currentCycleStart : false;

    if (claimedToday) {
      return res.status(400).json({ error: "You have already claimed today's check-in reward." });
    }

    let activeStreak = user.dailyStreak || 0;
    if (lastClaim && lastClaim < previousCycleStart) {
      activeStreak = 0;
    }

    let newStreak = 1;
    if (lastClaim && lastClaim >= previousCycleStart && activeStreak > 0) {
      newStreak = (activeStreak % 8) + 1;
    } else {
      newStreak = 1;
    }

    const rewardAmount = DAILY_REWARDS[newStreak] || 2;
    const curBal = parseFloat(user.balance || '0.00');
    const curToday = parseFloat(user.todaysEarnings || '0.00');
    const curTotal = parseFloat(user.totalEarnings || '0.00');

    const newBal = (curBal + rewardAmount).toFixed(2);
    const newToday = (curToday + rewardAmount).toFixed(2);
    const newTotal = (curTotal + rewardAmount).toFixed(2);

    const now = new Date();
    await dbStore.updateUser(user.id, {
      balance: newBal,
      todaysEarnings: newToday,
      totalEarnings: newTotal,
      lastDailyClaim: now,
      dailyStreak: newStreak,
    });

    await dbStore.addTransaction({
      userId: user.id,
      type: 'daily_checkin',
      amount: rewardAmount.toFixed(2),
      description: `Daily Check-in Reward (Day ${newStreak} Streak)`,
    });

    await dbStore.addNotification({
      userId: user.id,
      title: '🎁 Daily Check-in Claimed!',
      message: `You claimed ৳${rewardAmount} for Day ${newStreak} daily streak check-in!`,
      type: 'gift',
    });

    res.json({
      success: true,
      earned: rewardAmount,
      newStreak,
      balance: newBal,
      message: `Successfully claimed Day ${newStreak} Daily Check-in Reward (৳${rewardAmount})!`,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/settings', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { newPassword, phoneNumber } = req.body;
    const updates: any = {};
    if (phoneNumber) updates.phoneNumber = phoneNumber;
    if (newPassword) {
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }
    await dbStore.updateUser(req.user!.id, updates);
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// TASKS & ADVERTISEMENT ROUTES
// ----------------------------------------------------
app.get('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const allTasks = await dbStore.getTasks();
    const activeTasks = allTasks.filter(t => t.status === 'active');

    const settingsList = await dbStore.getSettings();
    const settingsMap = settingsList.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';
    const currentCycleStart = getCycleStart(renewTimeStr);

    const completedSet = await dbStore.getCompletedTaskIdsInCycle(req.user!.id, currentCycleStart);

    const tasksWithStatus = activeTasks.map(task => ({
      ...task,
      isCompletedToday: completedSet.has(task.id),
      autoRenewTime: renewTimeStr,
    }));

    res.json(tasksWithStatus);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/tasks/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { taskId } = req.body;
    const task = (await dbStore.getTasks()).find(t => t.id === Number(taskId));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settingsList = await dbStore.getSettings();
    const settingsMap = settingsList.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';
    const currentCycleStart = getCycleStart(renewTimeStr);

    const alreadyDone = await dbStore.isTaskCompletedInCurrentCycle(user.id, task.id, currentCycleStart);
    if (alreadyDone) {
      return res.status(400).json({
        error: `You have already completed this task today. It will renew tomorrow at ${renewTimeStr}.`,
      });
    }

    // Premium Multiplier Check (Premium users get 3x)
    const baseReward = parseFloat(task.reward) || 10.0;
    const multiplier = user.isPremium ? 3.0 : 1.0;
    const finalReward = baseReward * multiplier;

    // Update user balance
    const currentBalance = parseFloat(user.balance || '0.00');
    const currentToday = parseFloat(user.todaysEarnings || '0.00');
    const currentTotal = parseFloat(user.totalEarnings || '0.00');

    const newBalance = (currentBalance + finalReward).toFixed(2);
    const newToday = (currentToday + finalReward).toFixed(2);
    const newTotal = (currentTotal + finalReward).toFixed(2);

    await dbStore.updateUser(user.id, {
      balance: newBalance,
      todaysEarnings: newToday,
      totalEarnings: newTotal,
      completedTasks: (user.completedTasks || 0) + 1,
    });

    await dbStore.createUserTask(user.id, task.id);

    await dbStore.addTransaction({
      userId: user.id,
      type: 'task_reward',
      amount: finalReward.toFixed(2),
      description: `Completed task: ${task.title}${user.isPremium ? ' (3x Premium Multiplier)' : ''}`,
    });

    // Handle Referral Commission (default 15%)
    const settings = settingsList;
    const commSetting = settings.find(s => s.key === 'referralCommission');
    const commEnabledSetting = settings.find(s => s.key === 'referralEnabled');
    
    if (user.referredBy && (commEnabledSetting?.value !== 'false')) {
      const commPercent = parseFloat(commSetting?.value || '15') / 100;
      const bonus = finalReward * commPercent;
      
      const referrer = await dbStore.getUserById(user.referredBy);
      if (referrer) {
        const refBal = parseFloat(referrer.balance || '0.00') + bonus;
        const refEarnings = parseFloat(referrer.referralEarnings || '0.00') + bonus;
        const refTotal = parseFloat(referrer.totalEarnings || '0.00') + bonus;
        
        await dbStore.updateUser(referrer.id, {
          balance: refBal.toFixed(2),
          referralEarnings: refEarnings.toFixed(2),
          totalEarnings: refTotal.toFixed(2),
        });

        await dbStore.addTransaction({
          userId: referrer.id,
          type: 'referral_bonus',
          amount: bonus.toFixed(2),
          description: `${commSetting?.value || 15}% Referral Bonus from @${user.username} task completion`,
        });
      }
    }

    res.json({
      success: true,
      earned: finalReward.toFixed(2),
      isPremiumBonus: user.isPremium,
      message: `Task completed! Earned ৳${finalReward.toFixed(2)}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Active advertisement endpoint for pre-task overlay
app.get('/api/ads/active', async (req, res) => {
  try {
    const ads = await dbStore.getAds();
    const activeAds = ads.filter(a => a.status === 'active');
    res.json(activeAds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// VIDEOS ROUTES
// ----------------------------------------------------
app.get('/api/videos', requireAuth, async (req: AuthRequest, res) => {
  try {
    const allVideos = await dbStore.getVideos();
    const active = allVideos.filter(v => v.status === 'active');
    res.json(active);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/videos/complete', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { videoId } = req.body;
    const video = (await dbStore.getVideos()).find(v => v.id === Number(videoId));
    if (!video) return res.status(404).json({ error: 'Video not found' });

    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settingsList = await dbStore.getSettings();
    const settingsMap = settingsList.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';
    const currentCycleStart = getCycleStart(renewTimeStr);
    
    if (dbStore.isVideoCompletedInCurrentCycle) {
       const alreadyDone = await dbStore.isVideoCompletedInCurrentCycle(user.id, video.id, currentCycleStart);
       if (alreadyDone) {
         return res.status(400).json({
           error: `You have already watched this video today. It will renew tomorrow at ${renewTimeStr}.`,
         });
       }
       await dbStore.createUserVideo(user.id, video.id);
    }

    const baseReward = parseFloat(video.reward) || 15.0;
    const multiplier = user.isPremium ? 3.0 : 1.0;
    const finalReward = baseReward * multiplier;

    const newBalance = (parseFloat(user.balance || '0.00') + finalReward).toFixed(2);
    const newToday = (parseFloat(user.todaysEarnings || '0.00') + finalReward).toFixed(2);
    const newTotal = (parseFloat(user.totalEarnings || '0.00') + finalReward).toFixed(2);

    await dbStore.updateUser(user.id, {
      balance: newBalance,
      todaysEarnings: newToday,
      totalEarnings: newTotal,
    });

    await dbStore.addTransaction({
      userId: user.id,
      type: 'video_reward',
      amount: finalReward.toFixed(2),
      description: `Watched video: ${video.title}${user.isPremium ? ' (3x Premium Multiplier)' : ''}`,
    });

    res.json({
      success: true,
      earned: finalReward.toFixed(2),
      message: `Video reward claimed! Earned ৳${finalReward.toFixed(2)}`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// WITHDRAWALS ROUTES
// ----------------------------------------------------
app.get('/api/user/withdrawals', requireAuth, async (req: AuthRequest, res) => {
  try {
    const withdrawals = await dbStore.getWithdrawals();
    const userWithdrawals = withdrawals.filter(w => w.userId === req.user!.id);
    res.json(userWithdrawals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/withdrawals', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { method, accountNumber, accountDetails, amount } = req.body;
    const accNum = String(accountNumber || accountDetails || '').trim();
    if (!method || !accNum || !amount) {
      return res.status(400).json({ error: 'Method, account number, and amount are required' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 500) {
      return res.status(400).json({ error: 'Minimum withdrawal amount is ৳500.' });
    }

    if (method === 'bKash' || method === 'Nagad') {
      const is11Digits = /^\d{11}$/.test(accNum);
      const validPrefixes = ['013', '014', '015', '016', '017', '018', '019'];
      const hasValidPrefix = validPrefixes.includes(accNum.substring(0, 3));

      if (!is11Digits) {
        return res.status(400).json({ error: `${method} phone number must be exactly 11 digits.` });
      }
      if (!hasValidPrefix) {
        return res.status(400).json({ error: `${method} phone number must start with 013, 014, 015, 016, 017, 018, or 019.` });
      }
    }

    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const userBal = parseFloat(user.balance || '0.00');
    if (userBal < numAmount) {
      return res.status(400).json({ error: 'Insufficient balance for withdrawal' });
    }

    // Deduct balance to pending withdrawal
    const newBal = (userBal - numAmount).toFixed(2);
    const newPending = (parseFloat(user.pendingWithdraw || '0.00') + numAmount).toFixed(2);

    await dbStore.updateUser(user.id, {
      balance: newBal,
      pendingWithdraw: newPending,
    });

    const withdrawal = await dbStore.createWithdrawal({
      userId: user.id,
      method,
      accountDetails: accNum,
      accountNumber: accNum,
      amount: numAmount.toFixed(2),
    });

    await dbStore.addTransaction({
      userId: user.id,
      type: 'withdrawal',
      amount: `-${numAmount.toFixed(2)}`,
      description: `Requested withdrawal via ${method} (${accNum})`,
    });

    await dbStore.addNotification({
      userId: user.id,
      title: 'Withdrawal Submitted',
      message: `Your withdrawal request of ৳${numAmount.toFixed(2)} via ${method} is now pending admin review.`,
      type: 'info',
    });

    res.json({ success: true, withdrawal, message: 'Withdrawal request submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// REFERRALS ROUTES
// ----------------------------------------------------
app.get('/api/user/referrals', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allUsers = await dbStore.getUsers();
    const referredUsers = allUsers.filter(u => u.referredBy === user.id).map(u => ({
      id: u.id,
      username: u.username,
      totalEarnings: u.totalEarnings || '0.00',
      createdAt: u.createdAt,
    }));

    // Top Referrers leaderboard
    const referrerCounts: { [key: number]: number } = {};
    allUsers.forEach(u => {
      if (u.referredBy) {
        referrerCounts[u.referredBy] = (referrerCounts[u.referredBy] || 0) + 1;
      }
    });

    const topReferrers = Object.entries(referrerCounts)
      .map(([refId, count]) => {
        const u = allUsers.find(x => x.id === Number(refId));
        return {
          username: u ? u.username : 'User',
          count,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const settings = await dbStore.getSettings();
    const commSetting = settings.find(s => s.key === 'referralCommission');

    res.json({
      referralCode: user.referralCode,
      referralLink: `${req.protocol}://${req.get('host')}/?ref=${user.referralCode}`,
      commissionRate: commSetting?.value || '15',
      totalReferrals: referredUsers.length,
      referralEarnings: user.referralEarnings || '0.00',
      referredUsers,
      topReferrers,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PREMIUM PLANS & USER REQUESTS
// ----------------------------------------------------
app.get('/api/premium-plans', async (req, res) => {
  try {
    const plans = await dbStore.getPremiumPlans();
    res.json(plans.filter(p => p.status === 'active'));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


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

    // 6-Hour Promo Code Expiration Check
    const accountAgeMs = Date.now() - new Date(user.createdAt || Date.now()).getTime();
    if (accountAgeMs > 6 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'Promo code option is only available within 6 hours of account creation.' });
    }

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
      await dbStore.addTransaction({
        userId: user.id,
        type: 'promo_bonus',
        amount: parseFloat(promoCode.rewardAmount.toString()),
        description: `Promo Code Claimed: ${promoCode.code}`,
        status: 'completed'
      });
      return res.json({ 
        success: true, 
        message: `Promo code applied successfully! You earned ৳${promoCode.rewardAmount}`,
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
      const newBalance = (parseFloat(user.balance) + parseFloat(promoCode.rewardAmount)).toFixed(2);
      const newTotalEarnings = (parseFloat(user.totalEarnings || '0') + parseFloat(promoCode.rewardAmount)).toFixed(2);
      user.balance = newBalance;
      user.totalEarnings = newTotalEarnings;
      await dbStore.updateUser(user.id, { balance: newBalance, totalEarnings: newTotalEarnings });
      
      memoryStore.transactions.push({
        id: memoryStore.transactions.length + 1,
        userId: user.id,
        type: 'promo_bonus',
        amount: promoCode.rewardAmount,
        description: `Promo Code Claimed: ${promoCode.code}`,
        createdAt: new Date()
      });
      return res.json({ 
        success: true, 
        message: `Promo code applied successfully! You earned ৳${promoCode.rewardAmount}`,
        balance: user.balance 
      });
    }
  } catch (error) {
    console.error('Claim promo error:', error);
    res.status(500).json({ error: 'Failed to claim promo code' });
  }
});

app.post('/api/user/premium-request', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { method, senderNumber, transactionId, amount, planId, screenshotUrl } = req.body;
    if (!method || !senderNumber || !transactionId || !amount) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const requests = await dbStore.getPremiumRequests();
    if (requests.some(r => r.transactionId === transactionId)) {
      return res.status(400).json({ error: 'This transaction ID has already been submitted.' });
    }

    await dbStore.createPremiumRequest({
      userId: req.user!.id,
      method,
      senderNumber,
      transactionId,
      amount,
      planId: planId || null,
      screenshotUrl: screenshotUrl || null,
      status: 'pending',
    });

    res.json({ success: true, message: 'Premium request submitted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// USER SECONDARY PAGES (NOTIFICATIONS, TRANSACTIONS, ETC)
// ----------------------------------------------------
app.get('/api/user/notifications', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbStore.getNotifications(req.user!.id);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/notifications/:id/read', requireAuth, async (req: AuthRequest, res) => {
  const notif = memoryStore.notifications.find(n => n.id === Number(req.params.id));
  if (notif) notif.isRead = true;
  res.json({ success: true });
});

app.get('/api/user/transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbStore.getTransactions(req.user!.id);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/payments', requireAuth, async (req: AuthRequest, res) => {
  try {
    const withdrawals = await dbStore.getWithdrawals();
    const userWithdraws = withdrawals.filter(w => w.userId === req.user!.id);
    const premRequests = (await dbStore.getPremiumRequests()).filter(r => r.userId === req.user!.id);
    res.json({ withdrawals: userWithdraws, premiumPayments: premRequests });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ====================================================
// ADMIN PANEL ROUTES
// ====================================================

app.get('/api/admin/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbStore.getUsers();
    const allTasks = await dbStore.getTasks();
    const withdrawals = await dbStore.getWithdrawals();
    
    const pendingWithdraws = withdrawals.filter(w => w.status === 'pending').length;
    const totalEarned = allUsers.reduce((sum, u) => sum + parseFloat(u.totalEarnings || '0'), 0);

    res.json({
      users: allUsers.length,
      tasks: allTasks.length,
      pendingWithdraws,
      totalEarned: totalEarned.toFixed(2),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN TASK MANAGEMENT
// ----------------------------------------------------
app.get('/api/admin/tasks', requireAuth, requireAdmin, async (req, res) => {
  try {
    const tasks = await dbStore.getTasks();
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/tasks', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.dailyLimit > 2147483647) data.dailyLimit = 2147483647;
    if (data.countdownTimer > 2147483647) data.countdownTimer = 2147483647;
    if (data.adTimer > 2147483647) data.adTimer = 2147483647;
    const newTask = await dbStore.createTask(data);
    res.json({ success: true, task: newTask, message: 'Task created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/tasks/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.dailyLimit > 2147483647) data.dailyLimit = 2147483647;
    if (data.countdownTimer > 2147483647) data.countdownTimer = 2147483647;
    if (data.adTimer > 2147483647) data.adTimer = 2147483647;
    await dbStore.updateTask(Number(req.params.id), data);
    res.json({ success: true, message: 'Task updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/tasks/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbStore.deleteTask(Number(req.params.id));
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/tasks/:id/duplicate', requireAuth, requireAdmin, async (req, res) => {
  try {
    const tasks = await dbStore.getTasks();
    const source = tasks.find(t => t.id === Number(req.params.id));
    if (!source) return res.status(404).json({ error: 'Task not found' });

    const duplicated = await dbStore.createTask({
      ...source,
      title: `${source.title} (Copy)`,
      id: undefined,
    });
    res.json({ success: true, task: duplicated, message: 'Task duplicated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/tasks/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body; // active, disabled, paused
    await dbStore.updateTask(Number(req.params.id), { status });
    res.json({ success: true, message: `Task status set to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN VIDEO MANAGEMENT
// ----------------------------------------------------
app.get('/api/admin/videos', requireAuth, requireAdmin, async (req, res) => {
  try {
    const videos = await dbStore.getVideos();
    res.json(videos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/videos', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.duration > 2147483647) data.duration = 2147483647;
    const newVideo = await dbStore.createVideo(data);
    res.json({ success: true, video: newVideo, message: 'Video added successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/videos/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.duration > 2147483647) data.duration = 2147483647;
    await dbStore.updateVideo(Number(req.params.id), data);
    res.json({ success: true, message: 'Video updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/videos/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbStore.deleteVideo(Number(req.params.id));
    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/videos/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    await dbStore.updateVideo(Number(req.params.id), { status });
    res.json({ success: true, message: `Video status set to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN ADVERTISEMENT MANAGEMENT
// ----------------------------------------------------
app.get('/api/admin/ads', requireAuth, requireAdmin, async (req, res) => {
  try {
    const ads = await dbStore.getAds();
    res.json(ads);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/ads', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.priority > 2147483647) data.priority = 2147483647;
    const newAd = await dbStore.createAd(data);
    res.json({ success: true, ad: newAd, message: 'Advertisement saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const handleUpdateAd = async (req: any, res: any) => {
  try {
    const data = { ...req.body };
    if (data.priority > 2147483647) data.priority = 2147483647;
    await dbStore.updateAd(Number(req.params.id), data);
    res.json({ success: true, message: 'Advertisement updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.put('/api/admin/ads/:id', requireAuth, requireAdmin, handleUpdateAd);
app.patch('/api/admin/ads/:id', requireAuth, requireAdmin, handleUpdateAd);


app.delete('/api/admin/ads/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await dbStore.deleteAd(Number(req.params.id));
    res.json({ success: true, message: 'Advertisement deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN REFERRAL MANAGEMENT
// ----------------------------------------------------
app.get('/api/admin/referrals', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbStore.getUsers();
    const settings = await dbStore.getSettings();

    const commissionSetting = settings.find(s => s.key === 'referralCommission');
    const enabledSetting = settings.find(s => s.key === 'referralEnabled');

    const totalReferrals = allUsers.filter(u => u.referredBy).length;
    const totalReferralEarnings = allUsers.reduce((sum, u) => sum + parseFloat(u.referralEarnings || '0'), 0);

    // Leaderboard
    const counts: { [key: number]: number } = {};
    allUsers.forEach(u => {
      if (u.referredBy) counts[u.referredBy] = (counts[u.referredBy] || 0) + 1;
    });

    const topReferrers = Object.entries(counts)
      .map(([refId, count]) => {
        const u = allUsers.find(x => x.id === Number(refId));
        return {
          id: Number(refId),
          username: u ? u.username : 'Unknown',
          count,
          totalEarned: u ? u.referralEarnings || '0.00' : '0.00',
        };
      })
      .sort((a, b) => b.count - a.count);

    res.json({
      commissionRate: commissionSetting?.value || '15',
      enabled: enabledSetting?.value !== 'false',
      totalReferrals,
      totalReferralEarnings: totalReferralEarnings.toFixed(2),
      topReferrers,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/referrals/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { commissionRate, rate, enabled } = req.body;
    const finalRate = rate !== undefined ? rate : commissionRate;
    if (finalRate !== undefined) {
      await dbStore.updateSetting('referralCommission', String(finalRate));
    }
    if (enabled !== undefined) {
      await dbStore.updateSetting('referralEnabled', String(enabled));
    }
    res.json({ success: true, message: 'Referral settings saved' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/referrals/commission', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rate, commissionRate } = req.body;
    const finalRate = rate !== undefined ? rate : commissionRate;
    if (finalRate !== undefined) {
      await dbStore.updateSetting('referralCommission', String(finalRate));
    }
    res.json({ success: true, message: 'Commission rate updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/referrals/reset', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbStore.getUsers();
    for (const u of allUsers) {
      await dbStore.updateUser(u.id, { referralEarnings: '0.00' });
    }
    res.json({ success: true, message: 'Referral statistics reset successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN WITHDRAWAL MANAGEMENT
// ----------------------------------------------------
app.get('/api/admin/withdrawals', requireAuth, requireAdmin, async (req, res) => {
  try {
    const withdrawals = await dbStore.getWithdrawals();
    const usersList = await dbStore.getUsers();

    const result = withdrawals.map(w => {
      const u = usersList.find(x => x.id === w.userId);
      return {
        ...w,
        accountNumber: w.accountNumber || w.accountDetails || '',
        accountDetails: w.accountDetails || w.accountNumber || '',
        username: u ? u.username : 'Unknown User',
        userBalance: u ? u.balance : '0.00',
      };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const handleWithdrawalStatusUpdate = async (req: any, res: any) => {
  try {
    const { status, note } = req.body; // approved, rejected
    const withdrawalId = Number(req.params.id);
    const withdrawals = await dbStore.getWithdrawals();
    const target = withdrawals.find(w => w.id === withdrawalId);

    if (!target) return res.status(404).json({ error: 'Withdrawal request not found' });

    if (target.status === 'pending') {
      const user = await dbStore.getUserById(target.userId);
      if (user) {
        const amountNum = parseFloat(target.amount);
        const curPending = Math.max(0, parseFloat(user.pendingWithdraw || '0.00') - amountNum);

        if (status === 'approved') {
          const curTotalWithdraw = parseFloat(user.totalWithdraw || '0.00') + amountNum;
          await dbStore.updateUser(user.id, {
            pendingWithdraw: curPending.toFixed(2),
            totalWithdraw: curTotalWithdraw.toFixed(2),
          });
          await dbStore.addNotification({
            userId: user.id,
            title: 'Withdrawal Approved!',
            message: `Your withdrawal request of ৳${amountNum.toFixed(2)} via ${target.method} has been approved.`,
            type: 'system',
          });
        } else if (status === 'rejected') {
          // Refund balance to user
          const curBal = parseFloat(user.balance || '0.00') + amountNum;
          await dbStore.updateUser(user.id, {
            balance: curBal.toFixed(2),
            pendingWithdraw: curPending.toFixed(2),
          });
          await dbStore.addTransaction({
            userId: user.id,
            type: 'refund',
            amount: `+${amountNum.toFixed(2)}`,
            description: `Refunded rejected withdrawal (${target.method})`,
          });
          await dbStore.addNotification({
            userId: user.id,
            title: 'Withdrawal Rejected',
            message: `Your withdrawal request of ৳${amountNum.toFixed(2)} was rejected. Reason: ${note || 'None'}. Amount refunded.`,
            type: 'warning',
          });
        }
      }
    }

    await dbStore.updateWithdrawalStatus(withdrawalId, status, note || '');
    res.json({ success: true, message: `Withdrawal request ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.post('/api/admin/withdrawals/:id/status', requireAuth, requireAdmin, handleWithdrawalStatusUpdate);
app.patch('/api/admin/withdrawals/:id', requireAuth, requireAdmin, handleWithdrawalStatusUpdate);
app.post('/api/admin/withdrawals/:id', requireAuth, requireAdmin, handleWithdrawalStatusUpdate);

app.delete('/api/admin/withdrawals/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const withdrawals = await dbStore.getWithdrawals();
    const target = withdrawals.find(w => w.id === id);
    if (target && target.status === 'pending') {
      const user = await dbStore.getUserById(target.userId);
      if (user) {
        const amountNum = parseFloat(target.amount);
        const curPending = Math.max(0, parseFloat(user.pendingWithdraw || '0.00') - amountNum);
        const curBal = parseFloat(user.balance || '0.00') + amountNum;
        await dbStore.updateUser(user.id, {
          balance: curBal.toFixed(2),
          pendingWithdraw: curPending.toFixed(2),
        });
        await dbStore.addTransaction({
          userId: user.id,
          type: 'refund',
          amount: `+${amountNum.toFixed(2)}`,
          description: `Refunded deleted pending withdrawal (${target.method})`,
        });
      }
    }
    await dbStore.deleteWithdrawal(id);
    res.json({ success: true, message: 'Withdrawal deleted and balance refunded if pending.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


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
        maxUses: Math.min(Number(data.maxUses) || 0, 2147483647),
        status: data.status,
        promotionTag: data.promotionTag,
        countryRestriction: data.countryRestriction,
        newUsersOnly: data.newUsersOnly,
        startDate: (data.startDate && data.startDate.trim() !== '') ? new Date(data.startDate) : new Date(),
        expiresAt: (data.expiresAt && data.expiresAt.trim() !== '') ? new Date(data.expiresAt) : null,
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
      startDate: (data.startDate && data.startDate.trim() !== '') ? new Date(data.startDate) : new Date(),
      expiresAt: (data.expiresAt && data.expiresAt.trim() !== '') ? new Date(data.expiresAt) : null,
      createdAt: new Date(),
    };
    memoryStore.promoCodes.push(newPromo);
    res.json(newPromo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const handleUpdatePromoCode = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const db = getDb();
    
    const updateData: any = {};
    if (data.code) updateData.code = data.code.toUpperCase();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.rewardAmount !== undefined) updateData.rewardAmount = data.rewardAmount;
    if (data.maxUses !== undefined) updateData.maxUses = Math.min(Number(data.maxUses) || 0, 2147483647);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.promotionTag !== undefined) updateData.promotionTag = data.promotionTag;
    if (data.countryRestriction !== undefined) updateData.countryRestriction = data.countryRestriction;
    if (data.newUsersOnly !== undefined) updateData.newUsersOnly = data.newUsersOnly;
    if (data.startDate !== undefined) updateData.startDate = (data.startDate && data.startDate.trim() !== '') ? new Date(data.startDate) : new Date();
    if (data.expiresAt !== undefined) updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    
    if (db?.update) {
      const updated = await db.update(promoCodes).set(updateData).where(eq(promoCodes.id, Number(id))).returning();
      return res.json(updated[0] || { success: true });
    }
    
    const promo = memoryStore.promoCodes.find(p => p.id === Number(id));
    if (!promo) return res.status(404).json({ error: 'Promo code not found' });
    Object.assign(promo, updateData);
    res.json(promo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.put('/api/admin/promo-codes/:id', requireAuth, requireAdmin, handleUpdatePromoCode);
app.patch('/api/admin/promo-codes/:id', requireAuth, requireAdmin, handleUpdatePromoCode);


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

// CAMPAIGN ENDPOINTS
app.get('/api/admin/campaign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const list = await dbStore.getSettings();
    const s = list.reduce((acc: any, item: any) => ({ ...acc, [item.key]: item.value }), {});
    res.json({
      enabled: s.campaignEnabled === 'true',
      name: s.campaignName || 'Welcome Bonus',
      bonusAmount: Number(s.campaignBonusAmount) || 0,
      maxUsers: Number(s.campaignMaxUsers) || 1000,
      currentUsers: Number(s.campaignCurrentUsers) || 0,
      startDate: s.campaignStartDate || '',
      endDate: s.campaignEndDate || ''
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const handleSaveCampaign = async (req: any, res: any) => {
  try {
    const body = req.body || {};
    if (body.enabled !== undefined) await dbStore.updateSetting('campaignEnabled', String(body.enabled));
    if (body.name !== undefined) await dbStore.updateSetting('campaignName', String(body.name));
    if (body.bonusAmount !== undefined) await dbStore.updateSetting('campaignBonusAmount', String(body.bonusAmount));
    if (body.maxUsers !== undefined) await dbStore.updateSetting('campaignMaxUsers', String(body.maxUsers));
    if (body.currentUsers !== undefined) await dbStore.updateSetting('campaignCurrentUsers', String(body.currentUsers));
    if (body.startDate !== undefined) await dbStore.updateSetting('campaignStartDate', String(body.startDate));
    if (body.endDate !== undefined) await dbStore.updateSetting('campaignEndDate', String(body.endDate));
    res.json({ success: true, message: 'Campaign settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.post('/api/admin/campaign', requireAuth, requireAdmin, handleSaveCampaign);
app.put('/api/admin/campaign', requireAuth, requireAdmin, handleSaveCampaign);

// ----------------------------------------------------
// ADMIN USER MANAGEMENT
// ----------------------------------------------------
app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbStore.getUsers();
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await dbStore.getUserById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const withdrawals = (await dbStore.getWithdrawals()).filter(w => w.userId === user.id);
    const transactions = await dbStore.getTransactions(user.id);
    const allUsers = await dbStore.getUsers();
    const referrals = allUsers.filter(u => u.referredBy === user.id);

    res.json({
      user,
      withdrawals,
      transactions,
      referrals,
      loginHistory: [
        { date: new Date().toISOString(), ip: '127.0.0.1', device: 'Web App' }
      ]
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update User Endpoint
app.put('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { username, phone, phoneNumber, status, isPremium, balance, password, newPassword } = req.body;
    const user = await dbStore.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updates: any = {};
    if (username !== undefined) updates.username = username;
    if (phone !== undefined) updates.phoneNumber = phone;
    if (phoneNumber !== undefined) updates.phoneNumber = phoneNumber;
    if (status !== undefined) updates.status = status;
    if (isPremium !== undefined) updates.isPremium = Boolean(isPremium);
    if (balance !== undefined) updates.balance = String(balance);
    const pwdToSet = password || newPassword;
    if (pwdToSet && pwdToSet.trim().length >= 6) {
      updates.passwordHash = await bcrypt.hash(pwdToSet, 10);
    }

    await dbStore.updateUser(userId, updates);
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/status', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    const user = await dbStore.getUserById(userId);
    if (user && user.username?.toLowerCase() === 'alif6t6') {
      return res.status(400).json({ error: 'Super Admin account (alif6t6) status cannot be modified or banned.' });
    }

    await dbStore.updateUser(userId, { status });
    res.json({ success: true, message: `User status set to ${status}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/admin/users/:id/premium', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { isPremium } = req.body;

    await dbStore.updateUser(userId, { isPremium: Boolean(isPremium) });
    res.json({ success: true, message: `User VIP Premium set to ${Boolean(isPremium)}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/:id/password', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { password, newPassword } = req.body;
    const pwd = password || newPassword;

    if (!pwd || pwd.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(pwd.trim(), 10);
    await dbStore.updateUser(userId, { passwordHash });
    res.json({ success: true, message: 'User password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/:id/balance', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { amount, action, reason } = req.body; // action: add or subtract
    const user = await dbStore.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const change = parseFloat(amount || '0');
    let currentBal = parseFloat(user.balance || '0.00');
    let currentTotal = parseFloat(user.totalEarnings || '0.00');

    if (action === 'add') {
      currentBal += change;
      currentTotal += change;
    } else {
      currentBal = Math.max(0, currentBal - change);
    }

    await dbStore.updateUser(userId, {
      balance: currentBal.toFixed(2),
      totalEarnings: currentTotal.toFixed(2),
    });
    await dbStore.addTransaction({
      userId,
      type: action === 'add' ? 'admin_add' : 'admin_subtract',
      amount: action === 'add' ? `+${change.toFixed(2)}` : `-${change.toFixed(2)}`,
      description: `Admin ${action === 'add' ? 'Added' : 'Subtracted'} Balance: ${reason || 'Manual Adjustment'}`,
    });

    res.json({ success: true, newBalance: currentBal.toFixed(2), message: 'Balance adjusted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/users/:id/notify', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { title, message, giftAmount } = req.body;

    if (giftAmount && parseFloat(giftAmount) > 0) {
      const user = await dbStore.getUserById(userId);
      if (user) {
        const gift = parseFloat(giftAmount);
        const newBal = (parseFloat(user.balance || '0.00') + gift).toFixed(2);
        const newTotal = (parseFloat(user.totalEarnings || '0.00') + gift).toFixed(2);
        await dbStore.updateUser(userId, { balance: newBal, totalEarnings: newTotal });
        await dbStore.addTransaction({
          userId,
          type: 'gift',
          amount: gift.toFixed(2),
          description: `Gift from Admin: ${title || 'Special Reward'}`,
        });
      }
    }

    await dbStore.addNotification({
      userId,
      title: title || 'Admin Message',
      message: message || '',
      type: giftAmount ? 'gift' : 'info',
    });

    res.json({ success: true, message: 'Notification / Gift sent successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch detailed user activity history & device info
app.get('/api/admin/users/:id/details', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const user = await dbStore.getUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const allWithdraws = await dbStore.getWithdrawals();
    const userWithdraws = allWithdraws.filter(w => w.userId === userId);

    const allTrans = await dbStore.getTransactions(userId);

    const allUsers = await dbStore.getUsers();
    const userReferrals = allUsers.filter(u => u.referredBy === user.referralCode);

    res.json({
      user,
      withdrawals: userWithdraws,
      transactions: allTrans,
      referrals: userReferrals.map(r => ({
        id: r.id,
        username: r.username,
        phone: r.phone,
        createdAt: r.createdAt
      })),
      deviceInfo: {
        lastIp: '103.145.22.18 (Dhaka, BD)',
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Mobile; Chrome/122.0)',
        deviceType: 'Android Mobile App',
        loginHistory: [
          { date: new Date().toISOString(), ip: '103.145.22.18', device: 'Android Chrome' },
          { date: new Date(Date.now() - 86400000).toISOString(), ip: '103.145.22.18', device: 'Android Chrome' },
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/users/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const user = await dbStore.getUserById(userId);
    if (user && user.username?.toLowerCase() === 'alif6t6') {
      return res.status(400).json({ error: 'Super Admin account (alif6t6) is permanent and cannot be deleted.' });
    }

    await dbStore.deleteUser(userId);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN PREMIUM MANAGEMENT
// ----------------------------------------------------
app.get('/api/admin/premium-plans', requireAuth, requireAdmin, async (req, res) => {
  try {
    const plans = await dbStore.getPremiumPlans();
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/premium-plans', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { title, description, benefits, price, durationDays, rewardMultiplier, badgeText, color, status } = req.body;
    memoryStore.premiumPlans.push({
      id: memoryStore.premiumPlans.length + 1,
      title,
      description,
      benefits: typeof benefits === 'string' ? benefits : JSON.stringify(benefits || []),
      price: String(price),
      durationDays: Math.min(Number(durationDays || 30), 2147483647),
      rewardMultiplier: String(rewardMultiplier || '3.00'),
      badgeText: badgeText || 'PREMIUM 3X',
      color: color || 'indigo',
      status: status || 'active',
      createdAt: new Date(),
    });
    res.json({ success: true, message: 'Premium plan created' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/premium-plans/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const idx = memoryStore.premiumPlans.findIndex(p => p.id === id);
    if (idx !== -1) {
      memoryStore.premiumPlans[idx] = {
        ...memoryStore.premiumPlans[idx],
        ...req.body,
        benefits: typeof req.body.benefits === 'object' ? JSON.stringify(req.body.benefits) : req.body.benefits,
      };
    }
    res.json({ success: true, message: 'Plan updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/admin/premium-plans/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    memoryStore.premiumPlans = memoryStore.premiumPlans.filter(p => p.id !== Number(req.params.id));
    res.json({ success: true, message: 'Plan deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/premium-requests', requireAuth, requireAdmin, async (req, res) => {
  try {
    const requests = await dbStore.getPremiumRequests();
    const usersList = await dbStore.getUsers();
    const enriched = requests.map(r => {
      const u = usersList.find(x => x.id === r.userId);
      return {
        ...r,
        username: u ? u.username : 'Unknown User',
      };
    });
    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const handlePremiumRequestUpdate = async (req: any, res: any) => {
  try {
    const { action, status } = req.body; // approve or reject / approved or rejected
    const reqId = Number(req.params.id);
    const requests = await dbStore.getPremiumRequests();
    const target = requests.find(r => r.id === reqId);
    if (!target) return res.status(404).json({ error: 'Request not found' });

    const isApprove = action === 'approve' || status === 'approved';
    const newStatus = isApprove ? 'approved' : 'rejected';
    await dbStore.updatePremiumRequestStatus(reqId, newStatus);

    if (isApprove) {
      await dbStore.updateUser(target.userId, { isPremium: true });
      await dbStore.addNotification({
        userId: target.userId,
        title: '👑 Premium Account Activated!',
        message: 'Congratulations! Your account has been upgraded to Premium 3X rewards.',
        type: 'gift',
      });
    }

    res.json({ success: true, message: `Premium request ${newStatus}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

app.post('/api/admin/premium-requests/:id', requireAuth, requireAdmin, handlePremiumRequestUpdate);
app.patch('/api/admin/premium-requests/:id', requireAuth, requireAdmin, handlePremiumRequestUpdate);

// Public site settings endpoint
app.get('/api/settings', async (req, res) => {
  try {
    const list = await dbStore.getSettings();
    const settingsMap: { [key: string]: string } = {};
    list.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    res.json(settingsMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// ADMIN GENERAL SETTINGS
// ----------------------------------------------------
app.get('/api/admin/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const list = await dbStore.getSettings();
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/admin/settings', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { settings: settingsObj } = req.body;
    if (settingsObj) {
      for (const [key, val] of Object.entries(settingsObj)) {
        await dbStore.updateSetting(key, String(val));
      }
    }
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/campaign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const list = await dbStore.getSettings();
    const s = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json({
      enabled: s.campaignEnabled === 'true',
      name: s.campaignName || '',
      bonusAmount: s.campaignBonusAmount || '0',
      maxUsers: s.campaignMaxUsers || '0',
      currentUsers: s.campaignCurrentUsers || '0',
      startDate: s.campaignStartDate || '',
      endDate: s.campaignEndDate || ''
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/campaign', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { enabled, name, bonusAmount, maxUsers, startDate, endDate } = req.body;
    await dbStore.updateSetting('campaignEnabled', String(enabled));
    if (name !== undefined) await dbStore.updateSetting('campaignName', String(name));
    if (bonusAmount !== undefined) await dbStore.updateSetting('campaignBonusAmount', String(bonusAmount));
    if (maxUsers !== undefined) await dbStore.updateSetting('campaignMaxUsers', String(maxUsers));
    if (startDate !== undefined) await dbStore.updateSetting('campaignStartDate', String(startDate));
    if (endDate !== undefined) await dbStore.updateSetting('campaignEndDate', String(endDate));
    res.json({ success: true, message: 'Campaign settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// PROMOTION CAMPAIGN ENDPOINTS
// ----------------------------------------------------
app.get('/api/campaigns/active', async (req, res) => {
  try {
    const list = await dbStore.getSettings();
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
          enabled: true,
          name: s.campaignName || 'Welcome & Special Promotion',
          bonusAmount: parseFloat(s.campaignBonusAmount || '0'),
          startDate: s.campaignStartDate || null,
          endDate: s.campaignEndDate || null,
          maxUsers: maxCampaignUsers,
          currentUsers: currentCampaignUsers
        };
      }
    }

    res.json({ activeCampaign });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/campaign/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const list = await dbStore.getSettings();
    const s = list.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});

    if (s.campaignEnabled !== 'true') {
      return res.status(400).json({ error: 'No promotional campaign is currently active.' });
    }

    const now = new Date();
    const start = (s.campaignStartDate && s.campaignStartDate !== '') ? new Date(s.campaignStartDate) : new Date(0);
    const end = (s.campaignEndDate && s.campaignEndDate !== '') ? new Date(s.campaignEndDate) : new Date(8640000000000000);
    const currentCampaignUsers = Number(s.campaignCurrentUsers || '0');
    const maxCampaignUsers = Number(s.campaignMaxUsers || '0');

    if (now < start || now > end) {
      return res.status(400).json({ error: 'This promotion campaign is currently expired or not started.' });
    }

    if (maxCampaignUsers > 0 && currentCampaignUsers >= maxCampaignUsers) {
      return res.status(400).json({ error: 'The maximum user bonus limit for this campaign has been reached.' });
    }

    const userTxs = await dbStore.getTransactions(user.id);
    const hasClaimedCampaign = userTxs.some((tx: any) => tx.type === 'campaign_bonus');
    if (hasClaimedCampaign) {
      return res.status(400).json({ error: 'You have already claimed this promotion campaign bonus!' });
    }

    const bonusAmount = parseFloat(s.campaignBonusAmount || '0');
    if (bonusAmount <= 0) {
      return res.status(400).json({ error: 'Campaign bonus amount is invalid.' });
    }

    const curBal = parseFloat(user.balance || '0.00');
    const curTotal = parseFloat(user.totalEarnings || '0.00');
    const curToday = parseFloat(user.todaysEarnings || '0.00');

    const newBal = (curBal + bonusAmount).toFixed(2);
    const newTotal = (curTotal + bonusAmount).toFixed(2);
    const newToday = (curToday + bonusAmount).toFixed(2);

    await dbStore.updateUser(user.id, {
      balance: newBal,
      totalEarnings: newTotal,
      todaysEarnings: newToday
    });

    await dbStore.updateSetting('campaignCurrentUsers', String(currentCampaignUsers + 1));

    await dbStore.addTransaction({
      userId: user.id,
      type: 'campaign_bonus',
      amount: bonusAmount.toFixed(2),
      description: `Special Promotion Bonus: ${s.campaignName || 'Welcome Campaign'}`
    });

    await dbStore.addNotification({
      userId: user.id,
      title: '🎉 Promotion Bonus Received!',
      message: `You successfully claimed ৳${bonusAmount} from our ${s.campaignName || 'Special'} promotion campaign!`,
      type: 'success'
    });

    res.json({
      success: true,
      message: `🎉 Successfully claimed ৳${bonusAmount} promotion bonus!`,
      bonusAmount,
      newBalance: newBal
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Fallback 404 handler for unmatched /api/* requests
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
});

// Export express app for serverless deployments (Vercel)
export default app;
export { app };

// Start Server & Vite for standalone runtime
async function startServer() {
  if (process.env.VERCEL) {
    // On Vercel, init superadmin asynchronously and let serverless handle routing
    initSuperAdmin();
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Earn Flow Server running on http://localhost:${PORT}`);
    setTimeout(initSuperAdmin, 2000);
  });
}

startServer();
