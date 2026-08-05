const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldStart = code.indexOf('    const promoCode = memoryStore.promoCodes.find');
if (oldStart !== -1) {
  const nextAppPost = code.indexOf('app.post(', oldStart);
  if (nextAppPost !== -1) {
     code = code.substring(0, oldStart) + code.substring(nextAppPost);
  }
}
fs.writeFileSync('server.ts', code);
