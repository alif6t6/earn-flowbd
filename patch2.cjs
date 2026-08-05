const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

code = code.replace(
  "const [referralCode, setReferralCode] = useState('');\n  const [error",
  "const [referralCode, setReferralCode] = useState('');\n  const [country, setCountry] = useState('Bangladesh');\n  const [error"
);

code = code.replace(
  "const bodyData = isRegistering ? { username, password, phoneNumber, referralCode } : { username, password };",
  "const bodyData = isRegistering ? { username, password, phoneNumber, referralCode, country } : { username, password };"
);

code = code.replace(
  `<div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>`,
  `<div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>`
);

fs.writeFileSync('src/components/Login.tsx', code);
