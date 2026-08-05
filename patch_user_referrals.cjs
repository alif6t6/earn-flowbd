const fs = require('fs');
let content = fs.readFileSync('src/components/UserReferrals.tsx', 'utf8');

const target = `<h2 className="text-xl font-black text-slate-800 mb-1">Invite Friends & Earn</h2>
            <p className="text-sm text-slate-500 font-medium">Earn {referralData.commissionRate}% commission on all their earnings for life.</p>`;

const replacement = `<h2 className="text-xl font-black text-slate-800 mb-1">Invite Friends & Earn</h2>
            <p className="text-sm text-slate-500 font-medium mb-4">Earn {referralData.commissionRate}% commission on all their earnings for life.</p>
            
            {profile?.activeCampaign && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20 mb-2 mt-4 flex items-center justify-between border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-400 text-amber-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">Active Campaign</span>
                  </div>
                  <h3 className="font-black text-lg">{profile.activeCampaign.name}</h3>
                  <p className="text-sm text-indigo-100 font-medium">New users who sign up with your code instantly get a <strong className="text-white">৳{profile.activeCampaign.bonusAmount}</strong> bonus!</p>
                </div>
                <div className="hidden md:flex w-12 h-12 rounded-full bg-white/20 items-center justify-center backdrop-blur-md relative z-10 shrink-0 ml-4 border border-white/20 shadow-inner">
                  <Gift className="text-amber-300" size={24} />
                </div>
              </div>
            )}`;

content = content.replace(target, replacement);

// And we can also show it on the Login page if we fetch it via an unauthenticated route, but let's just make sure users see it.
fs.writeFileSync('src/components/UserReferrals.tsx', content);
