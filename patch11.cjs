const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "  }\n});\n    }\napp.post",
  "  }\n});\napp.post"
);

fs.writeFileSync('server.ts', code);
