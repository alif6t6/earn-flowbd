import 'dotenv/config';
import { dbStore } from './src/db/store';
import { getDb } from './src/db/index';

async function run() {
  console.log("DB URL:", process.env.DATABASE_URL ? "set" : "not set");
  console.log("DB instance:", getDb() ? "exists" : "null");
  try {
    const newAd = await dbStore.createAd({ name: 'Test Ad', type: 'Task Advertisement', content: 'test', location: 'task_modal' });
    console.log("Created Ad ID:", newAd.id);
    const ads = await dbStore.getAds();
    console.log("Ads count:", ads.length);
    await dbStore.deleteAd(newAd.id);
    const adsAfter = await dbStore.getAds();
    console.log("Ads count after delete:", adsAfter.length);
  } catch (e) {
    console.error(e);
  }
}
run();
