import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleLanguage}
      className="relative px-3 sm:px-4 py-2 rounded-lg border-2 border-[#CFC3A7] dark:border-slate-600 bg-[#F7F4E9] dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:scale-105 transition-all duration-200 flex items-center gap-2"
      aria-label={t.common.language}
      title={t.common.language}
    >
      <span className="text-xs sm:text-sm font-medium">
        {language === 'zh' ? 'EN' : '中'}
      </span>
    </button>
  );
}

