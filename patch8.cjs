const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "const { username, password, phoneNumber,\n      country: country || 'Bangladesh', referralCode: inputReferralCode, country } = req.body;",
  "const { username, password, phoneNumber, referralCode: inputReferralCode, country } = req.body;"
);

code = code.replace(
  "    const { status, isPremium, newPassword, phoneNumber,\n      country: country || 'Bangladesh', balance } = req.body;",
  "    const { status, isPremium, newPassword, phoneNumber, balance } = req.body;"
);

fs.writeFileSync('server.ts', code);
