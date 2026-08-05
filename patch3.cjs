const fs = require('fs');
let code = fs.readFileSync('src/components/admin/AdminPromos.tsx', 'utf8');

code = code.replace(
  "expiresAt: ''",
  "expiresAt: '',\n    promotionTag: '',\n    countryRestriction: 'both',\n    newUsersOnly: false"
);

code = code.replace(
  "expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : ''",
  "expiresAt: promo.expiresAt ? new Date(promo.expiresAt).toISOString().slice(0, 16) : '',\n                                    promotionTag: promo.promotionTag || '',\n                                    countryRestriction: promo.countryRestriction || 'both',\n                                    newUsersOnly: promo.newUsersOnly || false"
);

const newFields = `
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Promotion Tag</label>
                      <input 
                        type="text"
                        placeholder="e.g. SUMMER SALE"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.promotionTag}
                        onChange={(e) => setFormData({...formData, promotionTag: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Country Restriction</label>
                      <select
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={formData.countryRestriction}
                        onChange={(e) => setFormData({...formData, countryRestriction: e.target.value})}
                      >
                        <option value="both">Both (All)</option>
                        <option value="bangladesh">Bangladesh Only</option>
                        <option value="india">India Only</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                      <input 
                        type="checkbox"
                        checked={formData.newUsersOnly}
                        onChange={(e) => setFormData({...formData, newUsersOnly: e.target.checked})}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 bg-white border-slate-300"
                      />
                      <span className="text-sm font-bold text-slate-700">New Users Only</span>
                    </label>
                  </div>
`;

code = code.replace(
  "                  <div className=\"grid grid-cols-2 gap-4\">\n                    <div>\n                      <label className=\"block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2\">Start Date (Optional)</label>",
  newFields + "\n                  <div className=\"grid grid-cols-2 gap-4\">\n                    <div>\n                      <label className=\"block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2\">Start Date (Optional)</label>"
);

fs.writeFileSync('src/components/admin/AdminPromos.tsx', code);
