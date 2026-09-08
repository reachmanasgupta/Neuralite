import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// GLOBAL LANGUAGES LIST (India + World)
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  // Indian Languages
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  { code: 'ur', name: 'اردو (Urdu)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', name: 'മലയാളം (Malayalam)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  // Global Languages
  { code: 'es', name: 'Español (Spanish)' },
  { code: 'fr', name: 'Français (French)' },
  { code: 'de', name: 'Deutsch (German)' },
  { code: 'ar', name: 'العربية (Arabic)' },
  { code: 'zh-CN', name: '中文 (Chinese)' },
  { code: 'ja', name: '日本語 (Japanese)' },
  { code: 'ru', name: 'Русский (Russian)' }
];

export default function Navbar() {
  const { t } = useTranslation();
  const [theme, setTheme] = useState('light');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [currentLang, setCurrentLang] = useState('en'); 

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem('token');
  
  let userRole = 'patient'; 
  const userString = localStorage.getItem('user');
  if (userString) {
    try {
      const userObj = JSON.parse(userString);
      userRole = userObj.role;
    } catch (error) {
      console.error("Error parsing user data", error);
    }
  }

  const dashboardRoute = userRole === 'doctor' ? '/doctor-dashboard' : '/dashboard';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);

    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      const foundLang = SUPPORTED_LANGUAGES.find(l => l.code === match[1]);
      if(foundLang) setCurrentLang(match[1]);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleLanguageChange = (e) => {
    const targetLang = e.target.value;
    document.cookie = `googtrans=/en/${targetLang}; path=/`;

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = targetLang;
      select.dispatchEvent(new Event('change'));
      setCurrentLang(targetLang);
    } else {
      window.location.reload();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav 
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/85 dark:bg-[#030712]/85 backdrop-blur-md border-b border-slate-200 dark:border-white/5 shadow-sm py-3' 
          : 'bg-white dark:bg-[#030712] border-b border-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex justify-between items-center">
        
        {/* LOGO */}
        <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <span className="text-white font-black text-lg leading-none">N</span>
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Neuralite
          </span>
        </Link>
        
        <div className="flex items-center gap-3 md:gap-6">
          
          <div id="google_translate_element" className="opacity-0 absolute pointer-events-none z-[-1]"></div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center space-x-6">
            {!token ? (
              <Link to="/" className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400'}`}>
                {t('home')}
              </Link>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to={dashboardRoute} className={`text-sm font-semibold transition-colors ${location.pathname === dashboardRoute ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400'}`}>
                  {t('dashboard')}
                </Link>
                {userRole === 'patient' && (
                  <Link to="/profile" className={`text-sm font-semibold transition-colors ${location.pathname === '/profile' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400'}`}>
                    Profile
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center space-x-4 border-r border-slate-200 dark:border-slate-800 pr-6 pl-2">
              
              {/* --- PREMIUM GLOBAL LANGUAGE DROPDOWN (Protected from Translation) --- */}
              <div className="notranslate relative flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#0b1221] hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all group cursor-pointer">
                <svg className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                <select 
                  value={currentLang}
                  onChange={handleLanguageChange}
                  className="bg-transparent appearance-none outline-none cursor-pointer pr-6 text-xs font-bold text-slate-700 dark:text-slate-300 w-full"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code} className="text-slate-900 bg-white font-medium">
                      {lang.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2.5 pointer-events-none text-slate-400 group-hover:text-cyan-500 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <button 
                onClick={toggleTheme} 
                className="p-1.5 text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Toggle Dark Mode"
              >
                {theme === 'light' ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                )}
              </button>
            </div>

            {!token ? (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Login</Link>
                <Link to="/register" className="group inline-flex items-center justify-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                  Register
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            ) : (
              <button onClick={handleLogout} className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 transition-colors px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">Logout</button>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="md:hidden flex items-center gap-3">
            <button onClick={toggleTheme} className="p-1.5 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              {theme === 'light' ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1.5 text-slate-900 dark:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#030712] border-b border-slate-200 dark:border-slate-800 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0 border-transparent'}`}>
        <div className="flex flex-col px-6 py-6 space-y-5">
          {!token ? (
            <Link to="/" onClick={closeMobileMenu} className="text-base font-semibold text-slate-900 dark:text-white">Home</Link>
          ) : (
            <>
              <Link to={dashboardRoute} onClick={closeMobileMenu} className="text-base font-semibold text-slate-900 dark:text-white">Dashboard</Link>
              {userRole === 'patient' && (
                <Link to="/profile" onClick={closeMobileMenu} className="text-base font-semibold text-slate-900 dark:text-white">Profile</Link>
              )}
            </>
          )}

          <div className="w-full h-px bg-slate-100 dark:bg-slate-800"></div>

          {/* MOBILE GLOBAL LANGUAGE DROPDOWN (Protected from Translation) */}
          <div className="flex flex-col gap-2 notranslate">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Language</span>
            <div className="relative">
              <select 
                value={currentLang}
                onChange={(e) => { handleLanguageChange(e); closeMobileMenu(); }}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200 font-bold appearance-none transition-colors shadow-sm cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>

          {!token ? (
            <div className="flex flex-col space-y-3 pt-2">
              <Link to="/login" onClick={closeMobileMenu} className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl">Login</Link>
              <Link to="/register" onClick={closeMobileMenu} className="w-full py-2.5 text-center text-sm font-bold text-white bg-slate-900 dark:bg-cyan-600 rounded-xl shadow-md">Register</Link>
            </div>
          ) : (
            <div className="pt-2">
              <button onClick={handleLogout} className="w-full py-2.5 text-center text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl">Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}