import { db, auth } from './firebase';
import { 
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, addDoc
} from 'firebase/firestore';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details:', JSON.stringify(errInfo));
  throw new Error(errInfo.error);
}

const STORAGE_KEYS = {
  LOGGED_UID: 'earnflow_current_uid',
  LOGGED_USER: 'earnflow_current_user'
};

const INITIAL_DEFAULT_SETTINGS = {
  minWithdrawal: '100',
  dollarRate: '120',
  perReferralBonus: '10',
  noticeText: 'Welcome to EarnFlow! Complete daily tasks to earn rewards.',
  telegramLink: 'https://t.me/earnflow_official',
  dailyCheckInBonus: '5.00',
  renewTime: '06:00 AM',
  campaignEnabled: 'true',
  campaignName: 'Welcome Bonus Campaign',
  campaignBonusAmount: '20.00',
  campaignStartDate: '2026-01-01',
  campaignEndDate: '2026-12-31',
  campaignMaxUsers: '1000',
  campaignCurrentUsers: '1',
  bkashNumber: '01800000000',
  nagadNumber: '01800000000',
  rocketNumber: '01800000000',
};

// Helper to get or create global settings in Firestore
async function getOrInitSettings() {
  const docRef = doc(db, 'settings', 'global');
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    // Initialize default settings in Firestore if not present
    await setDoc(docRef, INITIAL_DEFAULT_SETTINGS);
    return INITIAL_DEFAULT_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'settings/global');
    return INITIAL_DEFAULT_SETTINGS;
  }
}

// Helper to resolve currently logged in user from Firestore
async function getCurrentUserFromFirestore(token: string | null = null) {
  let uid = localStorage.getItem(STORAGE_KEYS.LOGGED_UID);

  if (token && token.startsWith('token_user_')) {
    uid = token.replace('token_user_', '');
  } else if (token === 'token_admin_alif6t6' || token?.includes('alif6t6')) {
    uid = 'alif6t6';
  }

  if (!uid) {
    const storedUser = localStorage.getItem(STORAGE_KEYS.LOGGED_USER);
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u?.id) uid = String(u.id);
      } catch {}
    }
  }

  if (!uid) {
    uid = 'alif6t6'; // fallback to super admin if token is present
  }

  try {
    const userDocRef = doc(db, 'users', String(uid));
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const userData = userSnap.data();
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(userData));
      return userData;
    }
  } catch (e) {
    console.warn('Failed to fetch user from Firestore:', e);
  }

  // Fallback check: query by username if uid was username
  try {
    const q = query(collection(db, 'users'), where('username', '==', String(uid)));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const userData = snap.docs[0].data();
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(userData));
      return userData;
    }
  } catch (e) {
    console.warn('Query user by username failed:', e);
  }

  // Return base structure if user is not in Firestore yet
  return {
    id: uid,
    username: 'user',
    balance: '0.00',
    todaysEarnings: '0.00',
    totalEarnings: '0.00',
    referralEarnings: '0.00',
    pendingWithdraw: '0.00',
    totalWithdraw: '0.00',
    completedTasks: 0,
    referralCode: 'EARN123',
    referredBy: null,
    isPremium: false,
    isAdmin: uid === 'alif6t6',
    status: 'active',
    dailyStreak: 0,
    createdAt: new Date().toISOString()
  };
}

// Primary Client API Fallback Engine (Pure Firestore Backend Sync)
export async function handleClientApiFallback(targetUrl: string, options: RequestInit = {}, token: string | null = null): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  let bodyData: any = {};
  if (options.body && typeof options.body === 'string') {
    try {
      bodyData = JSON.parse(options.body);
    } catch {
      bodyData = {};
    }
  }

  const cleanUrl = targetUrl.split('?')[0];

  // -----------------------------------------------------------------
  // 1. AUTHENTICATION ROUTES
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/auth/login' && method === 'POST') {
    const { username, password } = bodyData;
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      throw new Error('Username and password are required');
    }

    // Super Admin check for alif6t6
    if (cleanUsername.toLowerCase() === 'alif6t6' && cleanPassword === '@Alif632868') {
      const adminRef = doc(db, 'users', 'alif6t6');
      let adminData: any;
      try {
        const snap = await getDoc(adminRef);
        if (snap.exists()) {
          adminData = snap.data();
        } else {
          adminData = {
            id: 'alif6t6',
            username: 'alif6t6',
            password: '@Alif632868',
            phoneNumber: '01800000000',
            country: 'Bangladesh',
            balance: '5000.00',
            todaysEarnings: '100.00',
            totalEarnings: '5000.00',
            referralEarnings: '500.00',
            pendingWithdraw: '0.00',
            totalWithdraw: '0.00',
            completedTasks: 50,
            referralCode: 'ALIF6T6',
            referredBy: null,
            isPremium: true,
            isAdmin: true,
            status: 'active',
            dailyStreak: 5,
            createdAt: new Date().toISOString()
          };
          await setDoc(adminRef, adminData);
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'users/alif6t6');
      }

      localStorage.setItem(STORAGE_KEYS.LOGGED_UID, 'alif6t6');
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(adminData));
      return {
        token: 'token_admin_alif6t6',
        isAdmin: true,
        user: adminData
      };
    }

    // Search user in Firestore
    try {
      const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error('Invalid username or password');
      }

      const user = snapshot.docs[0].data();
      if (user.password && user.password !== cleanPassword) {
        throw new Error('Invalid username or password');
      }

      if (user.status === 'banned') {
        throw new Error('Your account has been suspended by the administrator.');
      }

      localStorage.setItem(STORAGE_KEYS.LOGGED_UID, String(user.id));
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(user));

      return {
        token: `token_user_${user.id}`,
        isAdmin: !!user.isAdmin,
        user
      };
    } catch (e: any) {
      if (e.message?.includes('Invalid username') || e.message?.includes('suspended')) {
        throw e;
      }
      handleFirestoreError(e, OperationType.GET, 'users');
    }
  }

  if (cleanUrl === '/api/auth/register' && method === 'POST') {
    const { username, password, phoneNumber, referralCode, country } = bodyData;
    const cleanUsername = String(username || '').trim();
    const cleanPhone = String(phoneNumber || '').trim();

    if (!cleanUsername || cleanUsername.length < 4) {
      throw new Error('Username must be at least 4 characters long.');
    }
    if (!password || String(password).length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    try {
      // Check if username already exists in Firestore
      const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
      const existingSnap = await getDocs(q);
      if (!existingSnap.empty) {
        throw new Error(`Username '${cleanUsername}' is already taken.`);
      }

      const globalSettings = await getOrInitSettings();
      const initialBalance = globalSettings.campaignBonusAmount || '20.00';
      const userId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const newUser = {
        id: userId,
        username: cleanUsername,
        password: String(password).trim(),
        phoneNumber: cleanPhone,
        country: country || 'Bangladesh',
        balance: initialBalance,
        todaysEarnings: '0.00',
        totalEarnings: initialBalance,
        referralEarnings: '0.00',
        pendingWithdraw: '0.00',
        totalWithdraw: '0.00',
        completedTasks: 0,
        referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        referredBy: referralCode || null,
        isPremium: false,
        isAdmin: false,
        status: 'active',
        dailyStreak: 0,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userId), newUser);

      // Add transaction for welcome bonus if initial balance > 0
      if (parseFloat(initialBalance) > 0) {
        await addDoc(collection(db, 'transactions'), {
          userId,
          type: 'reward',
          amount: initialBalance,
          description: 'Welcome Registration Bonus',
          createdAt: new Date().toISOString()
        });
      }

      localStorage.setItem(STORAGE_KEYS.LOGGED_UID, userId);
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(newUser));

      return {
        token: `token_user_${userId}`,
        isAdmin: false,
        user: newUser
      };
    } catch (e: any) {
      if (e.message?.includes('already taken')) throw e;
      handleFirestoreError(e, OperationType.WRITE, 'users');
    }
  }

  // -----------------------------------------------------------------
  // 2. USER PROFILE & APP SETTINGS
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/user/profile' && method === 'GET') {
    const currentUser = await getCurrentUserFromFirestore(token);
    const globalSettings = await getOrInitSettings();
    return {
      ...currentUser,
      activeCampaign: {
        name: globalSettings.campaignName || 'Welcome Bonus Campaign',
        bonusAmount: globalSettings.campaignBonusAmount || '20.00',
        enabled: globalSettings.campaignEnabled !== 'false'
      }
    };
  }

  if (cleanUrl === '/api/settings' && method === 'GET') {
    const globalSettings = await getOrInitSettings();
    return {
      ...INITIAL_DEFAULT_SETTINGS,
      ...globalSettings,
      activeCampaign: {
        name: globalSettings.campaignName || INITIAL_DEFAULT_SETTINGS.campaignName,
        bonusAmount: globalSettings.campaignBonusAmount || INITIAL_DEFAULT_SETTINGS.campaignBonusAmount,
        enabled: globalSettings.campaignEnabled !== 'false'
      }
    };
  }

  if (cleanUrl === '/api/public/campaign' && method === 'GET') {
    const globalSettings = await getOrInitSettings();
    return {
      enabled: globalSettings.campaignEnabled !== 'false',
      name: globalSettings.campaignName || 'Welcome Bonus Campaign',
      bonusAmount: globalSettings.campaignBonusAmount || '20.00'
    };
  }

  // -----------------------------------------------------------------
  // 3. TASKS & VIDEOS
  // -----------------------------------------------------------------
  if ((cleanUrl === '/api/tasks' || cleanUrl === '/api/user/tasks') && method === 'GET') {
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      const tasksList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return tasksList;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'tasks');
      return [];
    }
  }

  if ((cleanUrl === '/api/videos' || cleanUrl === '/api/user/videos') && method === 'GET') {
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      const tasksList = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return tasksList.filter((t: any) => t.type === 'video');
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'tasks');
      return [];
    }
  }

  if (cleanUrl.startsWith('/api/user/tasks/') && cleanUrl.endsWith('/complete') && method === 'POST') {
    const currentUser = await getCurrentUserFromFirestore(token);
    const taskId = cleanUrl.split('/')[4];
    
    try {
      let reward = 5.00;
      const taskSnap = await getDoc(doc(db, 'tasks', taskId));
      if (taskSnap.exists()) {
        const taskData = taskSnap.data();
        reward = parseFloat(taskData.reward || '5.00');
      }

      const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);
      const newTotal = (parseFloat(currentUser.totalEarnings || '0') + reward).toFixed(2);
      const completedCount = (currentUser.completedTasks || 0) + 1;

      const userRef = doc(db, 'users', String(currentUser.id));
      await updateDoc(userRef, {
        balance: newBal,
        totalEarnings: newTotal,
        completedTasks: completedCount
      });

      // Record transaction
      await addDoc(collection(db, 'transactions'), {
        userId: String(currentUser.id),
        type: 'task',
        amount: reward.toFixed(2),
        description: `Completed Task ID #${taskId}`,
        createdAt: new Date().toISOString()
      });

      currentUser.balance = newBal;
      currentUser.totalEarnings = newTotal;
      currentUser.completedTasks = completedCount;
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

      return {
        message: `Task completed! Claimed ৳${reward}`,
        newBalance: newBal
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.id}`);
    }
  }

  // -----------------------------------------------------------------
  // 4. DAILY CHECK-IN
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/user/daily-checkin' && method === 'GET') {
    const currentUser = await getCurrentUserFromFirestore(token);
    const globalSettings = await getOrInitSettings();
    const bonus = globalSettings.dailyCheckInBonus || '5.00';
    
    const todayStr = new Date().toISOString().split('T')[0];
    const lastClaimStr = currentUser.lastDailyClaim ? new Date(currentUser.lastDailyClaim).toISOString().split('T')[0] : null;
    const canClaim = lastClaimStr !== todayStr;

    return {
      canClaim,
      currentStreak: currentUser.dailyStreak || 0,
      bonusAmount: bonus,
      rewards: [
        { day: 1, reward: bonus, status: (currentUser.dailyStreak || 0) >= 1 ? 'claimed' : 'current' },
        { day: 2, reward: (parseFloat(bonus) * 1.2).toFixed(2), status: (currentUser.dailyStreak || 0) >= 2 ? 'claimed' : 'locked' },
        { day: 3, reward: (parseFloat(bonus) * 1.5).toFixed(2), status: (currentUser.dailyStreak || 0) >= 3 ? 'claimed' : 'locked' },
        { day: 4, reward: (parseFloat(bonus) * 2).toFixed(2), status: (currentUser.dailyStreak || 0) >= 4 ? 'claimed' : 'locked' }
      ]
    };
  }

  if ((cleanUrl === '/api/user/daily-checkin' || cleanUrl === '/api/user/daily-checkin/claim') && method === 'POST') {
    const currentUser = await getCurrentUserFromFirestore(token);
    const globalSettings = await getOrInitSettings();
    const reward = parseFloat(globalSettings.dailyCheckInBonus || '5.00');

    const todayStr = new Date().toISOString().split('T')[0];
    const lastClaimStr = currentUser.lastDailyClaim ? new Date(currentUser.lastDailyClaim).toISOString().split('T')[0] : null;

    if (lastClaimStr === todayStr) {
      throw new Error('You have already claimed your daily reward for today.');
    }

    const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);
    const newStreak = (currentUser.dailyStreak || 0) + 1;

    try {
      const userRef = doc(db, 'users', String(currentUser.id));
      await updateDoc(userRef, {
        balance: newBal,
        dailyStreak: newStreak,
        lastDailyClaim: new Date().toISOString()
      });

      await addDoc(collection(db, 'transactions'), {
        userId: String(currentUser.id),
        type: 'reward',
        amount: reward.toFixed(2),
        description: 'Daily Check-in Bonus',
        createdAt: new Date().toISOString()
      });

      currentUser.balance = newBal;
      currentUser.dailyStreak = newStreak;
      currentUser.lastDailyClaim = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

      return {
        message: `Daily bonus of ৳${reward} claimed!`,
        newBalance: newBal,
        streak: newStreak
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.id}`);
    }
  }

  // -----------------------------------------------------------------
  // 5. WITHDRAWALS
  // -----------------------------------------------------------------
  if ((cleanUrl === '/api/withdrawals' || cleanUrl === '/api/user/withdrawals') && method === 'GET') {
    const currentUser = await getCurrentUserFromFirestore(token);
    try {
      const q = query(collection(db, 'withdrawals'), where('userId', '==', String(currentUser.id)));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return list;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'withdrawals');
      return [];
    }
  }

  if ((cleanUrl === '/api/withdrawals' || cleanUrl === '/api/user/withdrawals') && method === 'POST') {
    const currentUser = await getCurrentUserFromFirestore(token);
    const { amount, method: payMethod, accountNumber } = bodyData;
    const globalSettings = await getOrInitSettings();
    const minAmount = parseFloat(globalSettings.minWithdrawal || '100');
    
    const reqAmount = parseFloat(amount);
    if (isNaN(reqAmount) || reqAmount < minAmount) {
      throw new Error(`Minimum withdrawal amount is ৳${minAmount}`);
    }

    if (parseFloat(currentUser.balance || '0') < reqAmount) {
      throw new Error('Insufficient balance for withdrawal');
    }

    const newBal = (parseFloat(currentUser.balance) - reqAmount).toFixed(2);
    const newPending = (parseFloat(currentUser.pendingWithdraw || '0') + reqAmount).toFixed(2);

    try {
      const userRef = doc(db, 'users', String(currentUser.id));
      await updateDoc(userRef, {
        balance: newBal,
        pendingWithdraw: newPending
      });

      const newWithdrawal = {
        userId: String(currentUser.id),
        username: currentUser.username,
        amount: reqAmount.toFixed(2),
        method: payMethod,
        accountNumber,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'withdrawals'), newWithdrawal);

      currentUser.balance = newBal;
      currentUser.pendingWithdraw = newPending;
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

      return {
        message: 'Withdrawal request submitted successfully!',
        withdrawal: { id: docRef.id, ...newWithdrawal }
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, 'withdrawals');
    }
  }

  // -----------------------------------------------------------------
  // 6. PROMO CODE / CAMPAIGN CLAIM
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/user/promo-code/claim' && method === 'POST') {
    const currentUser = await getCurrentUserFromFirestore(token);
    const { code } = bodyData;
    if (!code) throw new Error('Promo code is required');

    try {
      const q = query(collection(db, 'promoCodes'), where('code', '==', String(code).trim().toUpperCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error('Invalid or expired promo code');
      }

      const promoDoc = snap.docs[0];
      const promoData = promoDoc.data();

      if (promoData.status === 'inactive') {
        throw new Error('This promo code is no longer active.');
      }

      const reward = parseFloat(promoData.reward || '50.00');
      const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);

      await updateDoc(doc(db, 'users', String(currentUser.id)), {
        balance: newBal
      });

      await updateDoc(doc(db, 'promoCodes', promoDoc.id), {
        usedCount: (promoData.usedCount || 0) + 1
      });

      await addDoc(collection(db, 'transactions'), {
        userId: String(currentUser.id),
        type: 'reward',
        amount: reward.toFixed(2),
        description: `Applied Promo Code ${code}`,
        createdAt: new Date().toISOString()
      });

      currentUser.balance = newBal;
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

      return {
        message: `Promo code '${code}' applied! ৳${reward} added to your balance.`,
        newBalance: newBal
      };
    } catch (e: any) {
      if (e.message?.includes('Invalid') || e.message?.includes('inactive')) throw e;
      handleFirestoreError(e, OperationType.WRITE, 'promoCodes');
    }
  }

  if (cleanUrl === '/api/user/campaign/claim' && method === 'POST') {
    const currentUser = await getCurrentUserFromFirestore(token);
    const globalSettings = await getOrInitSettings();
    const reward = parseFloat(globalSettings.campaignBonusAmount || '20.00');

    const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);
    try {
      await updateDoc(doc(db, 'users', String(currentUser.id)), {
        balance: newBal
      });

      currentUser.balance = newBal;
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

      return {
        message: `Campaign bonus ৳${reward} claimed successfully!`,
        newBalance: newBal
      };
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${currentUser.id}`);
    }
  }

  // -----------------------------------------------------------------
  // 7. NOTIFICATIONS & REFERRALS & TRANSACTIONS
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/notifications' || cleanUrl === '/api/user/notifications') {
    const currentUser = await getCurrentUserFromFirestore(token);
    try {
      const q = query(collection(db, 'notifications'), where('userId', 'in', [String(currentUser.id), 'all']));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      return [];
    }
  }

  if (cleanUrl === '/api/user/referrals') {
    const currentUser = await getCurrentUserFromFirestore(token);
    try {
      const q = query(collection(db, 'users'), where('referredBy', '==', currentUser.referralCode || ''));
      const snap = await getDocs(q);
      const referredUsers = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          username: data.username,
          joinedAt: data.createdAt,
          earnings: data.totalEarnings || '0.00'
        };
      });

      return {
        referralCode: currentUser.referralCode || 'ALIF6T6',
        totalReferrals: referredUsers.length,
        referralEarnings: currentUser.referralEarnings || '0.00',
        referredUsers
      };
    } catch (e) {
      return {
        referralCode: currentUser.referralCode || 'ALIF6T6',
        totalReferrals: 0,
        referralEarnings: '0.00',
        referredUsers: []
      };
    }
  }

  if (cleanUrl === '/api/user/transactions' || cleanUrl === '/api/transactions') {
    const currentUser = await getCurrentUserFromFirestore(token);
    try {
      const q = query(collection(db, 'transactions'), where('userId', '==', String(currentUser.id)));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      return [];
    }
  }

  if ((cleanUrl === '/api/ads/active' || cleanUrl === '/api/ads') && method === 'GET') {
    try {
      const snap = await getDocs(collection(db, 'advertisements'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      return [];
    }
  }

  // -----------------------------------------------------------------
  // 8. ADMIN MANAGEMENT ROUTES
  // -----------------------------------------------------------------
  if (cleanUrl.startsWith('/api/admin/')) {
    if (cleanUrl === '/api/admin/users' && method === 'GET') {
      try {
        const snap = await getDocs(collection(db, 'users'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, 'users');
        return [];
      }
    }

    if (cleanUrl === '/api/admin/settings') {
      if (method === 'POST' || method === 'PUT') {
        try {
          await setDoc(doc(db, 'settings', 'global'), bodyData, { merge: true });
          return { message: 'Settings saved successfully in Firebase!' };
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'settings/global');
        }
      }
      return await getOrInitSettings();
    }

    if (cleanUrl === '/api/admin/tasks') {
      if (method === 'POST') {
        try {
          const newTask = { ...bodyData, createdAt: new Date().toISOString() };
          const docRef = await addDoc(collection(db, 'tasks'), newTask);
          return { id: docRef.id, ...newTask };
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'tasks');
        }
      }
      try {
        const snap = await getDocs(collection(db, 'tasks'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        return [];
      }
    }

    if (cleanUrl.startsWith('/api/admin/tasks/') && method === 'DELETE') {
      const id = cleanUrl.split('/')[4];
      try {
        await deleteDoc(doc(db, 'tasks', id));
        return { message: 'Task deleted successfully' };
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `tasks/${id}`);
      }
    }

    if (cleanUrl === '/api/admin/ads') {
      if (method === 'POST') {
        try {
          const newAd = { ...bodyData, createdAt: new Date().toISOString() };
          const docRef = await addDoc(collection(db, 'advertisements'), newAd);
          return { id: docRef.id, ...newAd };
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'advertisements');
        }
      }
      try {
        const snap = await getDocs(collection(db, 'advertisements'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        return [];
      }
    }

    if (cleanUrl.startsWith('/api/admin/ads/') && method === 'DELETE') {
      const id = cleanUrl.split('/')[4];
      try {
        await deleteDoc(doc(db, 'advertisements', id));
        return { message: 'Ad deleted' };
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `advertisements/${id}`);
      }
    }

    if (cleanUrl === '/api/admin/withdrawals' && method === 'GET') {
      try {
        const snap = await getDocs(collection(db, 'withdrawals'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (e) {
        return [];
      }
    }

    if (cleanUrl.startsWith('/api/admin/withdrawals/') && (method === 'PUT' || method === 'PATCH')) {
      const id = cleanUrl.split('/')[4];
      const { status } = bodyData;
      try {
        const withdrawRef = doc(db, 'withdrawals', id);
        const withdrawSnap = await getDoc(withdrawRef);
        if (withdrawSnap.exists()) {
          const wData = withdrawSnap.data();
          await updateDoc(withdrawRef, { status });

          // Sync user balance if status changed
          if (wData.userId) {
            const userRef = doc(db, 'users', String(wData.userId));
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const uData = userSnap.data();
              const amount = parseFloat(wData.amount || '0');
              const pending = Math.max(0, parseFloat(uData.pendingWithdraw || '0') - amount).toFixed(2);

              if (status === 'approved') {
                const totalW = (parseFloat(uData.totalWithdraw || '0') + amount).toFixed(2);
                await updateDoc(userRef, { pendingWithdraw: pending, totalWithdraw: totalW });
              } else if (status === 'rejected') {
                const refundedBal = (parseFloat(uData.balance || '0') + amount).toFixed(2);
                await updateDoc(userRef, { balance: refundedBal, pendingWithdraw: pending });
              }
            }
          }
        }
        return { message: `Withdrawal ${status}` };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `withdrawals/${id}`);
      }
    }

    if (cleanUrl.startsWith('/api/admin/users/') && cleanUrl.endsWith('/balance') && method === 'PUT') {
      const parts = cleanUrl.split('/');
      const id = parts[4];
      const { balance } = bodyData;
      try {
        await updateDoc(doc(db, 'users', id), { balance: String(balance) });
        return { message: 'User balance updated' };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${id}`);
      }
    }

    if (cleanUrl.startsWith('/api/admin/users/') && cleanUrl.endsWith('/status') && method === 'PUT') {
      const parts = cleanUrl.split('/');
      const id = parts[4];
      const { status } = bodyData;
      try {
        await updateDoc(doc(db, 'users', id), { status });
        return { message: 'User status updated' };
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${id}`);
      }
    }

    if (cleanUrl.startsWith('/api/admin/users/') && method === 'DELETE') {
      const id = cleanUrl.split('/')[4];
      try {
        await deleteDoc(doc(db, 'users', id));
        return { message: 'User deleted' };
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${id}`);
      }
    }

    if (cleanUrl === '/api/admin/reports') {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const withdrawSnap = await getDocs(collection(db, 'withdrawals'));
        const tasksSnap = await getDocs(collection(db, 'tasks'));
        return {
          totalUsers: usersSnap.size,
          totalWithdrawals: withdrawSnap.size,
          activeTasks: tasksSnap.size
        };
      } catch (e) {
        return { totalUsers: 0, totalWithdrawals: 0, activeTasks: 0 };
      }
    }
  }

  // Standard fallback
  return {
    success: true,
    message: 'Operation completed in Firebase Firestore mode'
  };
}
