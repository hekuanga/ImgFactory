import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'en';
type Theme = 'light' | 'dark';

interface ThemeContextType {
  language: Language;
  theme: Theme;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // 在 SSR 时使用默认值，客户端时从 localStorage 读取
  const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'zh';
    const saved = localStorage.getItem('language') as Language;
    return (saved === 'zh' || saved === 'en') ? saved : 'zh';
  };
  
  const getInitialTheme = (): Theme => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem('theme') as Theme;
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 读取设置（仅在客户端）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const savedLanguage = localStorage.getItem('language') as Language;
    const savedTheme = localStorage.getItem('theme') as Theme;
    
    if (savedLanguage === 'zh' || savedLanguage === 'en') {
      setLanguageState(savedLanguage);
    }
    
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
    }
    
    setMounted(true);
  }, []);

  // 应用主题到 document
  useEffect(() => {
    if (mounted) {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  const toggleLanguage = () => {
    const newLanguage = language === 'zh' ? 'en' : 'zh';
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        language,
        theme,
        toggleLanguage,
        toggleTheme,
        setLanguage,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  // 在 SSR 时，如果 context 是 undefined，返回默认值而不是抛出错误
  if (context === undefined) {
    // 检查是否在服务端环境
    if (typeof window === 'undefined') {
      // SSR 时返回默认值
      return {
        language: 'zh' as Language,
        theme: 'light' as Theme,
        toggleLanguage: () => {},
        toggleTheme: () => {},
        setLanguage: () => {},
        setTheme: () => {},
      };
    }
    // 客户端环境但不在 Provider 内，抛出错误
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

