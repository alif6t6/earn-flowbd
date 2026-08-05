const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace the hardcoded DAILY_REWARDS definition
// We will replace it with a helper function instead that reads from settings
const search = `const DAILY_REWARDS: Record<number, number> = {
  1: 2,
  2: 4,
  3: 8,
  4: 10,
  5: 15,
  6: 20,
  7: 20,
  8: 30,
};`;

// Oh wait, DAILY_REWARDS might be used.
content = content.replace(search, "");

// In daily checkin GET
const getDailyCheckin = `app.get('/api/user/daily-checkin', requireAuth, async (req: AuthRequest, res) => {
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
`;

content = content.replace(
  `app.get('/api/user/daily-checkin', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settingsList = await dbStore.getSettings();
    const settingsMap = settingsList.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';`,
  getDailyCheckin
);


// In daily checkin POST
const postDailyCheckin = `app.post('/api/user/daily-checkin/claim', requireAuth, async (req: AuthRequest, res) => {
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

    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';`;

content = content.replace(
  `app.post('/api/user/daily-checkin/claim', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await dbStore.getUserById(req.user!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const settingsList = await dbStore.getSettings();
    const settingsMap = settingsList.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
    const renewTimeStr = settingsMap.taskAutoRenewTime || '06:00';`,
  postDailyCheckin
);

fs.writeFileSync('server.ts', content);
