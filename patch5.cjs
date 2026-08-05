const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

if (!code.includes("import { getDb }")) {
  code = code.replace(
    "import { memoryStore } from './src/db/index';",
    "import { memoryStore, getDb } from './src/db/index';\nimport { promoCodes, userPromoCodes } from './src/db/schema.ts';\nimport { eq, desc } from 'drizzle-orm';"
  );
  fs.writeFileSync('server.ts', code);
}
