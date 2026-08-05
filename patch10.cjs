const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminPromos.tsx', 'utf8');

code = code.replace(
  "{promo.status}",
  `{promo.status === 'active' && promo.expiresAt && new Date(promo.expiresAt) < new Date() ? 'Expired' : promo.status}`
);

code = code.replace(
  "promo.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'",
  "promo.status === 'active' && promo.expiresAt && new Date(promo.expiresAt) < new Date() ? 'bg-rose-100 text-rose-700' : promo.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'"
);

fs.writeFileSync('src/components/admin/AdminPromos.tsx', code);
