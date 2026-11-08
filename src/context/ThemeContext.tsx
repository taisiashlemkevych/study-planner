import { useEffect, useState, type ReactNode } from 'react';
import type { Theme } from './ThemeContextValue';
import { ThemeContext } from './ThemeContextValue';

interface ThemeProviderProps {
  children: ReactNode;
}

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem('study-planner-theme');

  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem('study-planner-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === 'light' ? 'dark' : 'light'
    );
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
