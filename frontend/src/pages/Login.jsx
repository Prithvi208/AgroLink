import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wheat, Mail, Lock, LogIn, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const LANG_LABELS = { en: 'English', hi: 'हिंदी', mr: 'मराठी' };

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t, lang, changeLang } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agro-50 to-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Wheat className="h-12 w-12 text-agro-600" />
            <h1 className="text-4xl font-bold text-agro-800">{t('app.name')}</h1>
          </div>
          <p className="text-gray-600">{t('app.tagline')}</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Globe className="h-4 w-4 text-gray-500" />
            {Object.entries(LANG_LABELS).map(([code, label]) => (
              <button key={code} onClick={() => changeLang(code)}
                className={`text-sm px-3 py-1 rounded-lg transition ${lang === code ? 'bg-agro-100 text-agro-700 font-semibold' : 'bg-white border text-gray-600'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('login.title')}</h2>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none"
                  placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-agro-500 focus:border-transparent outline-none"
                  placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-agro-600 text-white py-3 rounded-xl font-semibold hover:bg-agro-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
              <LogIn className="h-5 w-5" />
              {loading ? t('login.signingIn') : t('login.submit')}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            {t('login.noAccount')}{' '}
            <Link to="/register" className="text-agro-600 font-semibold hover:underline">{t('login.signUp')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
