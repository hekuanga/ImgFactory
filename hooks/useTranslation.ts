import { useTheme } from '../contexts/ThemeContext';
import { zh } from '../locales/zh';
import { en } from '../locales/en';

const translations = {
  zh,
  en,
};

export function useTranslation() {
  const { language } = useTheme();
  const t = translations[language];

  return { t, language };
}

