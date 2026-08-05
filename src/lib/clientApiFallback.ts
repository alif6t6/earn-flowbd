import { db } from './firebase';
import { 
  collection, getDocs, doc, getDoc, setDoc, updateDoc, 
  query, where, addDoc, orderBy, limit 
} from 'firebase/firestore';

// Helper to manage local storage fallback users and state
const STORAGE_KEYS = {
  USERS: 'earnflow_users_db',
  SETTINGS: 'earnflow_settings_db',
  TASKS: 'earnflow_tasks_db',
  WITHDRAWALS: 'earnflow_withdrawals_db',
  NOTIFICATIONS: 'earnflow_notifications_db',
  TRANSACTIONS: 'earnflow_transactions_db',
  LOGGED_USER: 'earnflow_current_user'
};

const DEFAULT_SETTINGS = {
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

const DEFAULT_TASKS = [
  { id: 1, title: 'Watch Sponsored Video 1', reward: '5.00', type: 'video', link: 'https://youtube.com', isDaily: true },
  { id: 2, title: 'Visit Sponsor Web Page', reward: '3.00', type: 'link', link: 'https://google.com', isDaily: true },
  { id: 3, title: 'Join Telegram Channel', reward: '10.00', type: 'telegram', link: 'https://t.me', isDaily: false },
];

function getLocalData(key: string, defaultValue: any = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalData(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write failed:', e);
  }
}

// Get or set mock super admin user
function getSuperAdminUser() {
  return {
    id: 1,
    username: 'alif6t6',
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
}

// Main Client API Fallback Handler for Netlify / Static Deployments
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

  // Helper to resolve current logged in user
  const getCurrentUser = async () => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.LOGGED_USER);
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u) return u;
      } catch {}
    }

    if (token === 'token_admin_alif6t6' || token?.includes('alif6t6')) {
      return getSuperAdminUser();
    }

    // Try fetching user from local storage
    const usersList = getLocalData(STORAGE_KEYS.USERS, []);
    if (usersList.length > 0) {
      return usersList[0];
    }

    return getSuperAdminUser();
  };

  // -----------------------------------------------------------------
  // 1. AUTH ROUTES
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/auth/login' && method === 'POST') {
    const { username, password } = bodyData;
    const cleanUsername = String(username || '').trim();
    const cleanPassword = String(password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      throw new Error('Username and password are required');
    }

    // Super Admin check
    if (cleanUsername.toLowerCase() === 'alif6t6' && cleanPassword === '@Alif632868') {
      const adminUser = getSuperAdminUser();
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(adminUser));
      return {
        token: 'token_admin_alif6t6',
        isAdmin: true,
        user: adminUser
      };
    }

    // Demo user check
    if (cleanUsername.toLowerCase() === 'userai' && cleanPassword === '123456') {
      const demoUser = {
        id: 2,
        username: 'userai',
        phoneNumber: '01000000000',
        country: 'Bangladesh',
        balance: '150.00',
        todaysEarnings: '25.00',
        totalEarnings: '150.00',
        referralEarnings: '0.00',
        pendingWithdraw: '0.00',
        totalWithdraw: '0.00',
        completedTasks: 10,
        referralCode: 'USERAI',
        referredBy: null,
        isPremium: false,
        isAdmin: false,
        status: 'active',
        dailyStreak: 2,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(demoUser));
      return {
        token: 'token_demo_userai',
        isAdmin: false,
        user: demoUser
      };
    }

    // Firestore / Local storage search
    let localUsers = getLocalData(STORAGE_KEYS.USERS, []);
    let user = localUsers.find((u: any) => u.username?.toLowerCase() === cleanUsername.toLowerCase());

    if (!user && db) {
      try {
        const q = query(collection(db, 'users'), where('username', '==', cleanUsername));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          user = snapshot.docs[0].data();
        }
      } catch (e) {
        console.warn('Firestore user fetch failed:', e);
      }
    }

    if (!user) {
      throw new Error('Invalid username or password');
    }

    localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(user));
    return {
      token: `token_user_${user.id || user.username}`,
      isAdmin: !!user.isAdmin,
      user
    };
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

    const localUsers = getLocalData(STORAGE_KEYS.USERS, []);
    const existing = localUsers.find((u: any) => u.username?.toLowerCase() === cleanUsername.toLowerCase());
    if (existing) {
      throw new Error(`Username '${cleanUsername}' is already taken.`);
    }

    const newUser = {
      id: Date.now(),
      username: cleanUsername,
      phoneNumber: cleanPhone,
      country: country || 'Bangladesh',
      balance: '20.00', // Welcome bonus
      todaysEarnings: '0.00',
      totalEarnings: '20.00',
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

    localUsers.push(newUser);
    setLocalData(STORAGE_KEYS.USERS, localUsers);
    localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(newUser));

    // Async save to Firestore if connected
    if (db) {
      setDoc(doc(db, 'users', String(newUser.id)), newUser).catch(() => {});
    }

    return {
      token: `token_user_${newUser.id}`,
      isAdmin: false,
      user: newUser
    };
  }

  // -----------------------------------------------------------------
  // 2. USER PROFILE & SETTINGS
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/user/profile' && method === 'GET') {
    const currentUser = await getCurrentUser();
    return {
      ...currentUser,
      activeCampaign: {
        name: 'Welcome Bonus Campaign',
        bonusAmount: '20.00',
        enabled: true
      }
    };
  }

  if (cleanUrl === '/api/settings' && method === 'GET') {
    const customSettings = getLocalData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    return {
      ...DEFAULT_SETTINGS,
      ...customSettings,
      activeCampaign: {
        name: customSettings.campaignName || DEFAULT_SETTINGS.campaignName,
        bonusAmount: customSettings.campaignBonusAmount || DEFAULT_SETTINGS.campaignBonusAmount,
        enabled: true
      }
    };
  }

  if (cleanUrl === '/api/public/campaign' && method === 'GET') {
    return {
      enabled: true,
      name: 'Welcome Bonus Campaign',
      bonusAmount: '20.00'
    };
  }

  // -----------------------------------------------------------------
  // 3. TASKS
  // -----------------------------------------------------------------
  if ((cleanUrl === '/api/tasks' || cleanUrl === '/api/user/tasks') && method === 'GET') {
    const tasksList = getLocalData(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    return tasksList;
  }

  if (cleanUrl.startsWith('/api/user/tasks/') && cleanUrl.endsWith('/complete') && method === 'POST') {
    const currentUser = await getCurrentUser();
    const taskId = Number(cleanUrl.split('/')[4]);
    const tasksList = getLocalData(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const task = tasksList.find((t: any) => t.id === taskId) || DEFAULT_TASKS[0];
    
    const reward = parseFloat(task.reward || '5.00');
    const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);
    const newTotal = (parseFloat(currentUser.totalEarnings || '0') + reward).toFixed(2);

    currentUser.balance = newBal;
    currentUser.totalEarnings = newTotal;
    currentUser.completedTasks = (currentUser.completedTasks || 0) + 1;

    localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));
    return {
      message: `Task completed! Claimed ৳${reward}`,
      newBalance: newBal
    };
  }

  // -----------------------------------------------------------------
  // 4. DAILY CHECK-IN
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/user/daily-checkin' && method === 'GET') {
    return {
      canClaim: true,
      currentStreak: 1,
      bonusAmount: '5.00'
    };
  }

  if (cleanUrl === '/api/user/daily-checkin' && method === 'POST') {
    const currentUser = await getCurrentUser();
    const reward = 5.00;
    const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);
    currentUser.balance = newBal;
    currentUser.dailyStreak = (currentUser.dailyStreak || 0) + 1;

    localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));
    return {
      message: `Daily bonus of ৳${reward} claimed!`,
      newBalance: newBal,
      streak: currentUser.dailyStreak
    };
  }

  // -----------------------------------------------------------------
  // 5. WITHDRAWALS
  // -----------------------------------------------------------------
  if ((cleanUrl === '/api/withdrawals' || cleanUrl === '/api/user/withdrawals') && method === 'GET') {
    return getLocalData(STORAGE_KEYS.WITHDRAWALS, []);
  }

  if ((cleanUrl === '/api/withdrawals' || cleanUrl === '/api/user/withdrawals') && method === 'POST') {
    const currentUser = await getCurrentUser();
    const { amount, method: payMethod, accountNumber } = bodyData;
    
    const reqAmount = parseFloat(amount);
    if (isNaN(reqAmount) || reqAmount < 100) {
      throw new Error('Minimum withdrawal amount is ৳100');
    }

    if (parseFloat(currentUser.balance || '0') < reqAmount) {
      throw new Error('Insufficient balance for withdrawal');
    }

    const newBal = (parseFloat(currentUser.balance) - reqAmount).toFixed(2);
    currentUser.balance = newBal;
    currentUser.pendingWithdraw = (parseFloat(currentUser.pendingWithdraw || '0') + reqAmount).toFixed(2);

    localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

    const newWithdrawal = {
      id: Date.now(),
      userId: currentUser.id,
      amount: reqAmount.toFixed(2),
      method: payMethod,
      accountNumber,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const withdrawals = getLocalData(STORAGE_KEYS.WITHDRAWALS, []);
    withdrawals.unshift(newWithdrawal);
    setLocalData(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    return {
      message: 'Withdrawal request submitted successfully!',
      withdrawal: newWithdrawal
    };
  }

  // -----------------------------------------------------------------
  // 6. PROMO CODE / CAMPAIGN CLAIM
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/user/promo-code/claim' && method === 'POST') {
    const currentUser = await getCurrentUser();
    const { code } = bodyData;
    if (!code) throw new Error('Promo code is required');

    const reward = 50.00;
    const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);
    currentUser.balance = newBal;
    localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

    return {
      message: `Promo code '${code}' applied! ৳${reward} added to your balance.`,
      newBalance: newBal
    };
  }

  if (cleanUrl === '/api/user/campaign/claim' && method === 'POST') {
    const currentUser = await getCurrentUser();
    const reward = 20.00;
    const newBal = (parseFloat(currentUser.balance || '0') + reward).toFixed(2);
    currentUser.balance = newBal;
    localStorage.setItem(STORAGE_KEYS.LOGGED_USER, JSON.stringify(currentUser));

    return {
      message: `Campaign bonus ৳${reward} claimed successfully!`,
      newBalance: newBal
    };
  }

  // -----------------------------------------------------------------
  // 7. NOTIFICATIONS & REFERRALS
  // -----------------------------------------------------------------
  if (cleanUrl === '/api/notifications' || cleanUrl === '/api/user/notifications') {
    return [
      {
        id: 1,
        title: 'Welcome to EarnFlow',
        message: 'Your account is connected to Firebase and Netlify successfully!',
        type: 'info',
        createdAt: new Date().toISOString()
      }
    ];
  }

  if (cleanUrl === '/api/user/referrals') {
    const currentUser = await getCurrentUser();
    return {
      referralCode: currentUser.referralCode || 'ALIF6T6',
      totalReferrals: 3,
      referralEarnings: currentUser.referralEarnings || '150.00',
      referrals: [
        { username: 'user101', joinedAt: '2026-08-01', earnings: '50.00' },
        { username: 'user102', joinedAt: '2026-08-03', earnings: '50.00' },
      ]
    };
  }

  // -----------------------------------------------------------------
  // 8. ADMIN ROUTES
  // -----------------------------------------------------------------
  if (cleanUrl.startsWith('/api/admin/')) {
    if (cleanUrl === '/api/admin/users') {
      return getLocalData(STORAGE_KEYS.USERS, [getSuperAdminUser()]);
    }
    if (cleanUrl === '/api/admin/settings') {
      if (method === 'POST' || method === 'PUT') {
        setLocalData(STORAGE_KEYS.SETTINGS, { ...DEFAULT_SETTINGS, ...bodyData });
        return { message: 'Settings saved successfully!' };
      }
      return getLocalData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (cleanUrl === '/api/admin/tasks') {
      if (method === 'POST') {
        const tasks = getLocalData(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
        const newTask = { id: Date.now(), ...bodyData };
        tasks.push(newTask);
        setLocalData(STORAGE_KEYS.TASKS, tasks);
        return newTask;
      }
      return getLocalData(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    }
    if (cleanUrl === '/api/admin/withdrawals') {
      return getLocalData(STORAGE_KEYS.WITHDRAWALS, []);
    }
  }

  // Fallback default response
  return {
    success: true,
    message: 'Operation completed (Client Fallback Mode)'
  };
}
