import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="relative px-3 sm:px-4 py-2 rounded-lg border-2 border-[#CFC3A7] dark:border-slate-600 bg-[#F7F4E9] dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:scale-105 transition-all duration-200 flex items-center gap-2"
      aria-label={t.common.theme}
      title={t.common.theme}
    >
      {theme === 'light' ? (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      ) : (
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )}
      <span className="hidden sm:inline text-xs sm:text-sm font-medium">
        {theme === 'light' ? t.common.dark : t.common.light}
      </span>
    </button>
  );
}

