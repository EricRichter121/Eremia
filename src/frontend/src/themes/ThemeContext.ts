import { createContext, useContext } from 'react'

import { themes, type ThemeId } from './themes'

interface ThemeContextValue {
  themeId: ThemeId
  theme: (typeof themes)[ThemeId]
  availableThemes: typeof themes
  setTheme: (themeId: string) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
