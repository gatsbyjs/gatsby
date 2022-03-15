import * as React from 'react';
import * as styles from "./color-mode-button.css"

type ColorMode = 'dark' | 'light';
export const themeKey = 'using-vanilla-extract-pref';

interface ColorModeContextValues {
  colorMode: ColorMode | null;
  setColorMode: (colorMode: ColorMode) => void;
}

export const ColorModeContext = React.createContext<ColorModeContextValues>({
  colorMode: null,
  setColorMode: () => {},
});

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [colorMode, setColorMode] = React.useState<ColorMode | null>(null);

  React.useEffect(() => {
    setColorMode(
      document.documentElement.classList.contains('dark') ? 'dark' : 'light',
    );
  }, []);

  const setter = (c: ColorMode) => {
    setColorMode(c);

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(c);

    try {
      localStorage.setItem(themeKey, c);
    } catch (e) {}
  };

  return (
    <ColorModeContext.Provider
      value={{
        colorMode,
        setColorMode: setter,
      }}
    >
      {children}
    </ColorModeContext.Provider>
  );
}

export const ColorModeToggle = () => {
  const { colorMode, setColorMode } = React.useContext(ColorModeContext);
  const mode = colorMode === 'light' ? 'dark' : 'light'

  return (
    <button className={styles.root} onClick={() => setColorMode(mode)}>Set {mode} mode</button>
  );
};