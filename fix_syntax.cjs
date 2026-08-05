const fs = require('fs');
let content = fs.readFileSync('src/components/common/DailyCheckInModal.tsx', 'utf8');

// replace all escaped backticks
content = content.replace(/\\\`/g, "\`");
content = content.replace(/\\\\\`/g, "\`");

// replace escaped dollar signs
content = content.replace(/\\\$/g, "$");

// write back
fs.writeFileSync('src/components/common/DailyCheckInModal.tsx', content);
