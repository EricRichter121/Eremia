import {
  useLayoutEffect,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { ThemeContext } from './ThemeContext'
import {
  DEFAULT_THEME_ID,
  getTheme,
  resolveThemeId,
  themes,
  type ThemeId,
} from './themes'

const THEME_COOKIE_NAME = 'eremia-theme'
const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

interface ThemeProviderProps {
  children: ReactNode
  initialThemeId?: string
}

function readThemeCookie(): ThemeId {
  const cookiePrefix = `${THEME_COOKIE_NAME}=`
  const themeCookie = document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(cookiePrefix))

  if (!themeCookie) return DEFAULT_THEME_ID

  return resolveThemeId(themeCookie.slice(cookiePrefix.length))
}

function writeThemeCookie(themeId: ThemeId): void {
  const secureAttribute =
    window.location.protocol === 'https:' ? '; Secure' : ''

  document.cookie =
    `${THEME_COOKIE_NAME}=${themeId}; Max-Age=${THEME_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secureAttribute}`
}

export function ThemeProvider({
  children,
  initialThemeId,
}: ThemeProviderProps) {
  const [themeId, setThemeId] = useState(() =>
    initialThemeId === undefined
      ? readThemeCookie()
      : resolveThemeId(initialThemeId),
  )
  const theme = getTheme(themeId)

  useLayoutEffect(() => {
    const root = document.documentElement
    root.dataset.theme = themeId

    Object.entries(theme.tokens).forEach(([token, value]) => {
      root.style.setProperty(`--color-${token}`, value)
    })
    Object.entries(theme.shape).forEach(([token, value]) => {
      root.style.setProperty(`--shape-${token}`, value)
    })
  }, [theme, themeId])

  const setTheme = useCallback((nextThemeId: string) => {
    const resolvedThemeId = resolveThemeId(nextThemeId)
    writeThemeCookie(resolvedThemeId)
    setThemeId(resolvedThemeId)
  }, [])

  const value = useMemo(
    () => ({
      themeId,
      theme,
      availableThemes: themes,
      setTheme,
    }),
    [setTheme, theme, themeId],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
