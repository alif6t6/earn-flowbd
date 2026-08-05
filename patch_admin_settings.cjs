const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminSettings.tsx', 'utf8');

// Add 'dailyCheckIn' to the type
content = content.replace(
  "useState<'general' | 'content' | 'pages'>('general');",
  "useState<'general' | 'content' | 'pages' | 'checkin'>('general');"
);

// Add default form states
content = content.replace(
  "taskAutoRenewTime: '06:00',",
  "taskAutoRenewTime: '06:00',\n    dailyCheckInEnabled: 'true',\n    dailyRewards: JSON.stringify({1:2, 2:4, 3:8, 4:10, 5:15, 6:20, 7:20, 8:30}),"
);

// Add checkin tab button
const tabButton = `
          <button
            type="button"
            onClick={() => setActiveTab('checkin')}
            className={\`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 \${
              activeTab === 'checkin' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }\`}
          >
            <Gift size={15} /> Daily Check-in
          </button>
`;
content = content.replace(
  "          </button>\n        </div>",
  "          </button>\n" + tabButton + "        </div>"
);

// Add Gift to imports
content = content.replace(
  "import { Settings, Globe, Link as LinkIcon, Image as ImageIcon, Layout, FileText, Share2, HelpCircle, FileKey, Shield, AlertCircle, Eye, Phone } from 'lucide-react';",
  "import { Settings, Globe, Link as LinkIcon, Image as ImageIcon, Layout, FileText, Share2, HelpCircle, FileKey, Shield, AlertCircle, Eye, Phone, Gift } from 'lucide-react';"
);

// Add checkin panel
const checkinPanel = `
            {activeTab === 'checkin' && (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 gap-4">
                  <div>
                    <h2 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Gift size={18} className="text-indigo-600" /> Daily Check-in Rewards
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Configure daily consecutive rewards for active users.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={form.dailyCheckInEnabled === 'true'}
                      onChange={(e) => setForm({...form, dailyCheckInEnabled: e.target.checked ? 'true' : 'false'})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(day => {
                    let rewardsObj: Record<string, number> = {};
                    try {
                      rewardsObj = JSON.parse(form.dailyRewards);
                    } catch(e) {}
                    return (
                      <div key={day}>
                        <label className="block text-slate-700 uppercase mb-1 text-xs font-bold">Day {day} Reward (৳)</label>
                        <input
                          type="number"
                          required
                          step="0.01"
                          min="0"
                          value={rewardsObj[day] || 0}
                          onChange={(e) => {
                            const newObj = { ...rewardsObj, [day]: Number(e.target.value) };
                            setForm({ ...form, dailyRewards: JSON.stringify(newObj) });
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-semibold"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
`;

content = content.replace(
  "          </form>\n        )}\n      </div>\n    </div>\n  );\n}\n",
  checkinPanel + "\n          </form>\n        )}\n      </div>\n    </div>\n  );\n}\n"
);

fs.writeFileSync('src/components/admin/AdminSettings.tsx', content);
