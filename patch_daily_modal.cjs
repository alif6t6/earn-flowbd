const fs = require('fs');
let content = fs.readFileSync('src/components/common/DailyCheckInModal.tsx', 'utf8');

content = content.replace(/className=\{\\\`/g, "className={`");
content = content.replace(/ mb-1 \\\$\{/g, " mb-1 ${");
content = content.replace(/className=\{\\\`font-black \\\$\{/g, "className={`font-black ${");
content = content.replace(/\\\\}/g, "}"); // just in case

fs.writeFileSync('src/components/common/DailyCheckInModal.tsx', content);
