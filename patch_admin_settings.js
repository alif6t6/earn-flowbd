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

fs.writeFileSync('src/components/admin/AdminSettings.tsx', content);
