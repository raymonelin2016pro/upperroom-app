import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const { i18n } = useTranslation();
  // Force re-render on language change
  const [lang, setLang] = useState(i18n.language);

  useEffect(() => {
    const handleLangChange = (lng: string) => {
      setLang(lng);
    };
    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n]);

  const toggleLanguage = async (e: React.MouseEvent) => {
    e.preventDefault();
    const currentLang = i18n.language;
    const newLang = currentLang?.startsWith('zh') ? 'en' : 'zh';
    
    console.log(`Switching from ${currentLang} to ${newLang}`);
    await i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      className={`p-2 rounded-full transition-all duration-200 flex items-center gap-2 ${
        dark 
          ? 'text-white/80 hover:text-white hover:bg-white/10' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      } ${className}`}
      title={lang?.startsWith('zh') ? "Switch to English" : "切换到中文"}
    >
      <Globe className="w-5 h-5" />
      <span className="text-sm font-medium">
        {lang?.startsWith('zh') ? 'EN' : '中'}
      </span>
    </button>
  );
}
