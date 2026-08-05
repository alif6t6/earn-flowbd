import { getDb, memoryStore } from './index';
import { eq, isNotNull, desc, sql, ilike } from 'drizzle-orm';
import { 
  users, tasks, userTasks, videos, withdrawals, advertisements, 
  settings, premiumPlans, premiumRequests, notifications, transactions, userPromoCodes
} from './schema';

export const dbStore = {
  // Users
  async getUsers() {
    try {
      const db = getDb();
      if (db?.select) {
        return await db.select().from(users).orderBy(desc(users.id));
      }
    } catch (e) {
      console.warn('DB select failed, falling back to memoryStore', e);
    }
    return memoryStore.users;
  },

  async getUserById(id: number) {
    try {
      const db = getDb();
      if (db?.select) {
        const res = await db.select().from(users).where(eq(users.id, id));
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('DB getUserById failed, falling back to memoryStore', e);
    }
    return memoryStore.users.find(u => u.id === id);
  },

  async getUserByUsername(username: string) {
    if (!username) return null;
    const cleanName = username.trim();
    try {
      const db = getDb();
      if (db?.select) {
        const res = await db.select().from(users).where(sql`LOWER(${users.username}) = LOWER(${cleanName})`);
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('DB getUserByUsername failed, falling back to memoryStore', e);
    }
    return memoryStore.users.find(u => u.username && u.username.toLowerCase() === cleanName.toLowerCase());
  },

  async getUserByPhoneNumber(phoneNumber: string) {
    if (!phoneNumber) return null;
    const cleanPhone = phoneNumber.trim();
    try {
      const db = getDb();
      if (db?.select) {
        const res = await db.select().from(users).where(eq(users.phoneNumber, cleanPhone));
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('DB getUserByPhoneNumber failed, falling back to memoryStore', e);
    }
    return memoryStore.users.find(u => u.phoneNumber && u.phoneNumber.trim() === cleanPhone);
  },

  async createUser(data: any) {
    try {
      const db = getDb();
      if (db?.insert) {
        const res = await db.insert(users).values(data).returning();
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('DB insert user failed, memoryStore fallback', e);
    }
    const newUser = {
      id: memoryStore.users.length + 1,
      username: data.username,
      passwordHash: data.passwordHash,
      phoneNumber: data.phoneNumber || null,
      country: data.country || 'Bangladesh',
      balance: '0.00',
      todaysEarnings: '0.00',
      totalEarnings: '0.00',
      referralEarnings: '0.00',
      pendingWithdraw: '0.00',
      totalWithdraw: '0.00',
      completedTasks: 0,
      referralCode: data.referralCode || Math.random().toString(36).substring(2, 8).toUpperCase(),
      referredBy: data.referredBy || null,
      isPremium: data.isPremium || false,
      isAdmin: data.isAdmin || false,
      status: 'active',
      lastDailyClaim: null,
      dailyStreak: 0,
      createdAt: new Date(),
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  async updateUser(id: number, data: Partial<any>) {
    try {
      const db = getDb();
      if (db?.update) {
        await db.update(users).set(data).where(eq(users.id, id));
      }
    } catch (e) {
      console.warn('DB updateUser failed, memoryStore fallback', e);
    }
    const idx = memoryStore.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx], ...data };
    }
  },

  async deleteUser(id: number) {
    const userToDelete = await this.getUserById(id);
    if (userToDelete && userToDelete.username?.toLowerCase() === 'alif6t6') {
      throw new Error('Super Admin account (alif6t6) is permanent and cannot be deleted.');
    }
    try {
      const db = getDb();
      if (db?.delete) {
        await db.delete(userTasks).where(eq(userTasks.userId, id));
        await db.delete(userPromoCodes).where(eq(userPromoCodes.userId, id));
        await db.delete(withdrawals).where(eq(withdrawals.userId, id));
        await db.delete(premiumRequests).where(eq(premiumRequests.userId, id));
        await db.delete(transactions).where(eq(transactions.userId, id));
        await db.delete(notifications).where(eq(notifications.userId, id));
        await db.update(users).set({ referredBy: null }).where(eq(users.referredBy, id));
        await db.delete(users).where(eq(users.id, id));
      }
    } catch (e) {
      console.warn('DB deleteUser failed, memoryStore fallback', e);
    }
    memoryStore.users = memoryStore.users.filter(u => u.id !== id);
    memoryStore.userTasks = memoryStore.userTasks.filter(ut => ut.userId !== id);
    memoryStore.withdrawals = memoryStore.withdrawals.filter(w => w.userId !== id);
    memoryStore.premiumRequests = memoryStore.premiumRequests.filter(p => p.userId !== id);
    memoryStore.notifications = memoryStore.notifications.filter(n => n.userId !== id);
    memoryStore.transactions = memoryStore.transactions.filter(t => t.userId !== id);
    memoryStore.userPromoCodes = memoryStore.userPromoCodes.filter(up => up.userId !== id);
  },

  // Tasks
  async getTasks() {
    try {
      const db = getDb();
      if (db?.select) {
        return await db.select().from(tasks).orderBy(desc(tasks.id));
      }
    } catch (e) {
      console.warn('DB getTasks failed, falling back to memoryStore', e);
    }
    return memoryStore.tasks;
  },

  async createTask(data: any) {
    try {
      const db = getDb();
      if (db?.insert) {
        const res = await db.insert(tasks).values(data).returning();
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('DB createTask failed, falling back to memoryStore', e);
    }
    const maxId = memoryStore.tasks.length > 0 
      ? Math.max(...memoryStore.tasks.map(t => Number(t.id) || 0)) 
      : 0;
    const newTask = {
      id: maxId + 1,
      title: data.title,
      description: data.description || '',
      taskUrl: data.taskUrl || data.link || '',
      image: data.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300',
      icon: data.icon || 'CheckSquare',
      buttonText: data.buttonText || '',
      reward: String(data.reward || '10.00'),
      countdownTimer: Number(data.countdownTimer || 10),
      adTimer: Number(data.adTimer || 10),
      instructions: data.instructions || '',
      verificationType: data.verificationType || 'Instant',
      dailyLimit: Number(data.dailyLimit || 5),
      type: data.type || 'Standard',
      expiryDate: data.expiryDate || null,
      status: data.status || 'active',
      createdAt: new Date(),
    };
    memoryStore.tasks.push(newTask);
    return newTask;
  },

  async updateTask(id: number | string, data: any) {
    const targetId = Number(id);
    try {
      const db = getDb();
      if (db?.update) {
        await db.update(tasks).set(data).where(eq(tasks.id, targetId));
      }
    } catch (e) {
      console.warn('DB updateTask failed, falling back to memoryStore', e);
    }
    const idx = memoryStore.tasks.findIndex(t => Number(t.id) === targetId);
    if (idx !== -1) {
      memoryStore.tasks[idx] = { ...memoryStore.tasks[idx], ...data };
    }
  },

  async deleteTask(id: number | string) {
    const targetId = Number(id);
    try {
      const db = getDb();
      if (db?.delete) {
        await db.delete(userTasks).where(eq(userTasks.taskId, targetId));
        await db.delete(tasks).where(eq(tasks.id, targetId));
      }
    } catch (e) {
      console.warn('Failed deleting task from DB, memoryStore fallback:', e);
    }
    memoryStore.tasks = memoryStore.tasks.filter(t => Number(t.id) !== targetId);
    memoryStore.userTasks = memoryStore.userTasks.filter(ut => Number(ut.taskId) !== targetId);
  },

  // Videos
  async getVideos() {
    try {
      const db = getDb();
      if (db?.select) {
        return await db.select().from(videos).orderBy(desc(videos.id));
      }
    } catch (e) {
      console.warn('DB getVideos failed, falling back to memoryStore', e);
    }
    return memoryStore.videos;
  },

  async createVideo(data: any) {
    try {
      const db = getDb();
      if (db?.insert) {
        const res = await db.insert(videos).values(data).returning();
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('DB createVideo failed, memoryStore fallback', e);
    }
    const maxId = memoryStore.videos.length > 0 
      ? Math.max(...memoryStore.videos.map(v => Number(v.id) || 0)) 
      : 0;
    const newVideo = {
      id: maxId + 1,
      title: data.title,
      videoUrl: data.videoUrl,
      reward: String(data.reward || '15.00'),
      duration: Number(data.duration || 20),
      status: data.status || 'active',
      createdAt: new Date(),
    };
    memoryStore.videos.push(newVideo);
    return newVideo;
  },

  async updateVideo(id: number | string, data: any) {
    const targetId = Number(id);
    try {
      const db = getDb();
      if (db?.update) {
        await db.update(videos).set(data).where(eq(videos.id, targetId));
      }
    } catch (e) {
      console.warn('DB updateVideo failed, memoryStore fallback', e);
    }
    const idx = memoryStore.videos.findIndex(v => Number(v.id) === targetId);
    if (idx !== -1) {
      memoryStore.videos[idx] = { ...memoryStore.videos[idx], ...data };
    }
  },

  async deleteVideo(id: number | string) {
    const targetId = Number(id);
    try {
      const db = getDb();
      if (db?.delete) {
        await db.delete(videos).where(eq(videos.id, targetId));
      }
    } catch (e) {
      console.warn('DB deleteVideo failed, memoryStore fallback', e);
    }
    memoryStore.videos = memoryStore.videos.filter(v => Number(v.id) !== targetId);
  },

  // Advertisements
  async getAds() {
    try {
      const db = getDb();
      if (db?.select) {
        return await db.select().from(advertisements);
      }
    } catch (e) {
      console.warn('DB getAds failed, falling back to memoryStore', e);
    }
    return memoryStore.advertisements;
  },

  async createAd(data: any) {
    const adData = {
      name: data.name || `${data.type} Unit`,
      type: data.type || 'Adsterra',
      content: data.content || '',
      imageUrl: data.imageUrl || null,
      title: data.title || null,
      description: data.description || null,
      destinationUrl: data.destinationUrl || null,
      buttonText: data.buttonText || null,
      sponsoredText: data.sponsoredText || null,
      status: data.status || 'active',
      location: data.location || 'task_modal',
      priority: Number(data.priority || 1),
      adRatio: data.adRatio || 'horizontal',
    };
    try {
      const db = getDb();
      if (db?.insert) {
        const res = await db.insert(advertisements).values(adData).returning();
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('Failed inserting ad into DB, memoryStore fallback:', e);
    }
    const maxId = memoryStore.advertisements.length > 0 
      ? Math.max(...memoryStore.advertisements.map(a => Number(a.id) || 0)) 
      : 0;
    const newAd = {
      id: maxId + 1,
      ...adData
    };
    memoryStore.advertisements.push(newAd);
    return newAd;
  },

  async updateAd(id: number | string, data: any) {
    const targetId = Number(id);
    const updateFields: any = {};
    if (data.name !== undefined) updateFields.name = data.name;
    if (data.type !== undefined) updateFields.type = data.type;
    if (data.content !== undefined) updateFields.content = data.content;
    if (data.imageUrl !== undefined) updateFields.imageUrl = data.imageUrl;
    if (data.title !== undefined) updateFields.title = data.title;
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.destinationUrl !== undefined) updateFields.destinationUrl = data.destinationUrl;
    if (data.buttonText !== undefined) updateFields.buttonText = data.buttonText;
    if (data.sponsoredText !== undefined) updateFields.sponsoredText = data.sponsoredText;
    if (data.status !== undefined) updateFields.status = data.status;
    if (data.location !== undefined) updateFields.location = data.location;
    if (data.priority !== undefined) updateFields.priority = Number(data.priority);
    if (data.adRatio !== undefined) updateFields.adRatio = data.adRatio;

    try {
      const db = getDb();
      if (db?.update) {
        await db.update(advertisements).set(updateFields).where(eq(advertisements.id, targetId));
      }
    } catch (e) {
      console.warn('Failed updating ad in DB, memoryStore fallback:', e);
    }
    const idx = memoryStore.advertisements.findIndex(a => Number(a.id) === targetId);
    if (idx !== -1) {
      memoryStore.advertisements[idx] = { ...memoryStore.advertisements[idx], ...updateFields };
    }
  },

  async deleteAd(id: number | string) {
    const targetId = Number(id);
    try {
      const db = getDb();
      if (db?.delete) {
        await db.delete(advertisements).where(eq(advertisements.id, targetId));
      }
    } catch (e) {
      console.warn('Failed deleting ad from DB, memoryStore fallback:', e);
    }
    memoryStore.advertisements = memoryStore.advertisements.filter(a => Number(a.id) !== targetId);
  },

  // Withdrawals
  async getWithdrawals() {
    try {
      const db = getDb();
      if (db?.select) {
        const rows = await db.select().from(withdrawals).orderBy(desc(withdrawals.id));
        return rows.map(r => ({
          ...r,
          accountNumber: r.accountDetails || (r as any).accountNumber || '',
          accountDetails: r.accountDetails || (r as any).accountNumber || '',
        }));
      }
    } catch (e) {
      console.warn('DB getWithdrawals failed, falling back to memoryStore', e);
    }
    return memoryStore.withdrawals.map(w => ({
      ...w,
      accountNumber: w.accountNumber || w.accountDetails || '',
      accountDetails: w.accountDetails || w.accountNumber || '',
    }));
  },

  async createWithdrawal(data: any) {
    const accDetails = String(data.accountDetails || data.accountNumber || '');
    const dbData = {
      userId: Number(data.userId),
      method: String(data.method || 'bKash'),
      accountDetails: accDetails,
      amount: String(data.amount || '0.00'),
      status: String(data.status || 'pending'),
    };
    try {
      const db = getDb();
      if (db?.insert) {
        const res = await db.insert(withdrawals).values(dbData).returning();
        if (res.length > 0) {
          return {
            ...res[0],
            accountNumber: res[0].accountDetails || accDetails,
            accountDetails: res[0].accountDetails || accDetails,
          };
        }
      }
    } catch (e) {
      console.warn('DB createWithdrawal failed, memoryStore fallback', e);
    }
    const maxId = memoryStore.withdrawals.length > 0
      ? Math.max(...memoryStore.withdrawals.map(w => Number(w.id) || 0))
      : 0;
    const newWithdrawal = {
      id: maxId + 1,
      userId: Number(data.userId),
      accountNumber: accDetails,
      accountDetails: accDetails,
      method: String(data.method || 'bKash'),
      amount: String(data.amount),
      status: 'pending',
      note: '',
      createdAt: new Date(),
    };
    memoryStore.withdrawals.push(newWithdrawal);
    return newWithdrawal;
  },

  async updateWithdrawalStatus(id: number, status: string, note: string = '') {
    try {
      const db = getDb();
      if (db?.update) {
        await db.update(withdrawals).set({ status, note }).where(eq(withdrawals.id, id));
      }
    } catch (e) {
      console.warn('DB updateWithdrawalStatus failed, memoryStore fallback', e);
    }
    const idx = memoryStore.withdrawals.findIndex(w => w.id === id);
    if (idx !== -1) {
      memoryStore.withdrawals[idx].status = status;
      memoryStore.withdrawals[idx].note = note;
    }
  },

  async deleteWithdrawal(id: number) {
    try {
      const db = getDb();
      if (db?.delete) {
        await db.delete(withdrawals).where(eq(withdrawals.id, id));
      }
    } catch (e) {
      console.warn('DB deleteWithdrawal failed, memoryStore fallback', e);
    }
    memoryStore.withdrawals = memoryStore.withdrawals.filter(w => w.id !== id);
  },

  // Settings
  async getSettings() {
    try {
      const db = getDb();
      if (db?.select) {
        return await db.select().from(settings);
      }
    } catch (e) {
      console.warn('DB getSettings failed, falling back to memoryStore', e);
    }
    return memoryStore.settings;
  },

  async updateSetting(key: string, value: string) {
    try {
      const db = getDb();
      if (db?.insert) {
        const existing = await db.select().from(settings).where(eq(settings.key, key));
        if (existing.length > 0) {
          await db.update(settings).set({ value }).where(eq(settings.key, key));
        } else {
          await db.insert(settings).values({ key, value });
        }
      }
    } catch (e) {
      console.warn('DB updateSetting failed, memoryStore fallback', e);
    }
    const idx = memoryStore.settings.findIndex(s => s.key === key);
    if (idx !== -1) {
      memoryStore.settings[idx].value = value;
    } else {
      memoryStore.settings.push({ id: memoryStore.settings.length + 1, key, value });
    }
  },

  // Premium Plans & Requests
  async getPremiumPlans() {
    try {
      const db = getDb();
      if (db?.select) {
        return await db.select().from(premiumPlans).orderBy(premiumPlans.price);
      }
    } catch (e) {
      console.warn('DB getPremiumPlans failed, falling back to memoryStore', e);
    }
    return memoryStore.premiumPlans;
  },

  async getPremiumRequests() {
    try {
      const db = getDb();
      if (db?.select) {
        return await db.select().from(premiumRequests).orderBy(desc(premiumRequests.id));
      }
    } catch (e) {
      console.warn('DB getPremiumRequests failed, falling back to memoryStore', e);
    }
    return memoryStore.premiumRequests;
  },

  async createPremiumRequest(data: any) {
    try {
      const db = getDb();
      if (db?.insert) {
        const res = await db.insert(premiumRequests).values(data).returning();
        if (res.length > 0) return res[0];
      }
    } catch (e) {
      console.warn('DB createPremiumRequest failed, memoryStore fallback', e);
    }
    const newReq = {
      id: memoryStore.premiumRequests.length + 1,
      userId: data.userId,
      method: data.method,
      senderNumber: data.senderNumber,
      transactionId: data.transactionId,
      amount: String(data.amount),
      planId: data.planId || null,
      screenshotUrl: data.screenshotUrl || null,
      status: 'pending',
      createdAt: new Date(),
    };
    memoryStore.premiumRequests.push(newReq);
    return newReq;
  },

  async updatePremiumRequestStatus(id: number, status: string) {
    try {
      const db = getDb();
      if (db?.update) {
        await db.update(premiumRequests).set({ status }).where(eq(premiumRequests.id, id));
      }
    } catch (e) {
      console.warn('DB updatePremiumRequestStatus failed, memoryStore fallback', e);
    }
    const target = memoryStore.premiumRequests.find(r => r.id === id);
    if (target) {
      target.status = status;
    }
  },

  // Notifications
  async getNotifications(userId?: number) {
    return memoryStore.notifications.filter(n => !n.userId || n.userId === userId);
  },

  async addNotification(data: any) {
    const newNotif = {
      id: memoryStore.notifications.length + 1,
      userId: data.userId || null,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      isRead: false,
      createdAt: new Date(),
    };
    memoryStore.notifications.push(newNotif);
    return newNotif;
  },

  // Transactions
  async getTransactions(userId: number) {
    return memoryStore.transactions.filter(t => t.userId === userId);
  },

  async addTransaction(data: any) {
    const newTx = {
      id: memoryStore.transactions.length + 1,
      userId: data.userId,
      type: data.type,
      amount: String(data.amount),
      description: data.description,
      createdAt: new Date(),
    };
    memoryStore.transactions.push(newTx);
    return newTx;
  },

  // User Tasks
  
  async createUserVideo(userId: number, videoId: number) {
    try {
      const db = getDb();
      if (db?.insert) {
        // Dynamic import / type check to prevent crash if table doesn't exist
        const { userVideos } = await import('./schema');
        await db.insert(userVideos).values({
          userId,
          videoId,
          completedAt: new Date(),
        });
        return;
      }
    } catch (e) {
      console.warn('DB createUserVideo failed, memoryStore fallback', e);
    }
    memoryStore.userVideos.push({
      id: memoryStore.userVideos.length + 1,
      userId,
      videoId,
      completedAt: new Date(),
    });
  },

  async isVideoCompletedInCurrentCycle(userId: number, videoId: number, cycleStart: Date): Promise<boolean> {
    try {
      const db = getDb();
      if (db?.select) {
        const { userVideos } = await import('./schema');
        const list = await db.select().from(userVideos).where(eq(userVideos.userId, userId));
        const recent = list.filter((uv: any) => new Date(uv.completedAt).getTime() > cycleStart.getTime() && uv.videoId === videoId);
        return recent.length > 0;
      }
    } catch (e) {
      console.warn('DB isVideoCompletedInCurrentCycle failed, memoryStore fallback', e);
    }
    const recent = memoryStore.userVideos.filter((uv: any) => 
      uv.userId === userId && uv.videoId === videoId && new Date(uv.completedAt).getTime() > cycleStart.getTime()
    );
    return recent.length > 0;
  },

  async createUserTask(userId: number, taskId: number) {
    try {
      const db = getDb();
      if (db?.insert) {
        await db.insert(userTasks).values({
          userId,
          taskId,
          completedAt: new Date(),
        });
        return;
      }
    } catch (e) {
      console.warn('DB createUserTask failed, memoryStore fallback', e);
    }
    memoryStore.userTasks.push({
      id: memoryStore.userTasks.length + 1,
      userId,
      taskId,
      completedAt: new Date(),
    });
  },

  async getCompletedTaskIdsInCycle(userId: number, cycleStart: Date): Promise<Set<number>> {
    const completedSet = new Set<number>();
    try {
      const db = getDb();
      if (db?.select) {
        const list = await db.select().from(userTasks).where(eq(userTasks.userId, userId));
        list.forEach(ut => {
          if (ut.completedAt && new Date(ut.completedAt) >= cycleStart) {
            completedSet.add(ut.taskId);
          }
        });
        return completedSet;
      }
    } catch (e) {
      console.warn('DB getCompletedTaskIdsInCycle failed, memoryStore fallback', e);
    }
    memoryStore.userTasks.forEach(ut => {
      if (ut.userId === userId && ut.completedAt && new Date(ut.completedAt) >= cycleStart) {
        completedSet.add(ut.taskId);
      }
    });
    return completedSet;
  },

  async isTaskCompletedInCurrentCycle(userId: number, taskId: number, cycleStart: Date): Promise<boolean> {
    try {
      const db = getDb();
      if (db?.select) {
        const list = await db.select().from(userTasks).where(eq(userTasks.userId, userId));
        return list.some(ut => ut.taskId === taskId && ut.completedAt && new Date(ut.completedAt) >= cycleStart);
      }
    } catch (e) {
      console.warn('DB isTaskCompletedInCurrentCycle failed, memoryStore fallback', e);
    }
    return memoryStore.userTasks.some(ut => ut.userId === userId && ut.taskId === taskId && ut.completedAt && new Date(ut.completedAt) >= cycleStart);
  }
};
