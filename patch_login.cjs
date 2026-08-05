const fs = require('fs');
let content = fs.readFileSync('src/components/Login.tsx', 'utf8');

const targetState = `  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();`;

const replacementState = `  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const navigate = useNavigate();`;

content = content.replace(targetState, replacementState);

const targetEffect = `    if (ref) {
      setReferralCode(ref.toUpperCase());
      setIsRegistering(true);
    }`;

const replacementEffect = `    if (ref) {
      setReferralCode(ref.toUpperCase());
      setIsRegistering(true);
    }
    
    fetchApi('/api/settings').then(res => {
      if (res.activeCampaign) {
        setActiveCampaign(res.activeCampaign);
      }
    }).catch(() => {});`;

content = content.replace(targetEffect, replacementEffect);

const targetRender = `          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {isRegistering ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            {isRegistering
              ? 'Join today and start earning rewards.'
              : 'Enter your details to access your account.'}
          </p>`;

const replacementRender = `          <h1 className="text-2xl font-black text-slate-800 tracking-tight">
            {isRegistering ? 'Create an Account' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 text-sm mt-1 mb-6">
            {isRegistering
              ? 'Join today and start earning rewards.'
              : 'Enter your details to access your account.'}
          </p>
          
          {isRegistering && activeCampaign && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider mb-2">🎁 Promotion Campaign</span>
                <h3 className="font-black text-lg mb-1">{activeCampaign.name}</h3>
                <p className="text-sm text-indigo-100 font-medium leading-tight">Create an account now to instantly receive <strong className="text-white text-base">৳{activeCampaign.bonusAmount}</strong> bonus cash!</p>
              </div>
            </div>
          )}`;

content = content.replace(targetRender, replacementRender);

fs.writeFileSync('src/components/Login.tsx', content);
