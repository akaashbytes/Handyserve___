import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect,
  useCallback 
} from 'react';
const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light';
    }
    const storedTheme = window.localStorage.getItem('hs_theme');
    const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hs_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => 
      t === 'light' ? 'dark' : 'light'
    );
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider 
      value={{ theme, toggleTheme, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error(
      'useTheme must be used inside ThemeProvider'
    );
  }
  return ctx;
};