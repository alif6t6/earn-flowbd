const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminPromos.tsx', 'utf8');

code = code.replace(
  '<th className="p-4 text-left font-bold text-slate-500">Reward</th>',
  '<th className="p-4 text-left font-bold text-slate-500">Reward</th>\n                        <th className="p-4 text-left font-bold text-slate-500">Tag / Settings</th>'
);

code = code.replace(
  '<td className="p-4 font-bold text-emerald-600">৳{promo.rewardAmount}</td>',
  `<td className="p-4 font-bold text-emerald-600">৳{promo.rewardAmount}</td>
                          <td className="p-4 text-sm text-slate-600">
                            {promo.promotionTag && <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold mr-2 mb-1">{promo.promotionTag}</span>}
                            {promo.newUsersOnly && <span className="inline-block px-2 py-1 bg-rose-50 text-rose-700 rounded text-xs font-bold mr-2 mb-1">New Users</span>}
                            {promo.countryRestriction !== 'both' && <span className="inline-block px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-bold capitalize mb-1">{promo.countryRestriction}</span>}
                          </td>`
);

fs.writeFileSync('src/components/admin/AdminPromos.tsx', code);
