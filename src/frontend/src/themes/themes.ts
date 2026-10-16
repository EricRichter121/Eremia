export interface ThemeTokens {
  background: string
  surface: string
  'surface-elevated': string
  'text-primary': string
  'text-secondary': string
  'accent-primary': string
  'accent-secondary': string
  border: string
  success: string
  warning: string
  error: string
  focus: string
}

export interface ThemeDefinition {
  name: string
  tokens: ThemeTokens
  shape: {
    small: string
    medium: string
    large: string
    button: string
    input: string
    card: string
    dialog: string
    control: string
  }
}

export const themes = {
  'deep-space': {
    name: 'Deep Space',
    tokens: {
      background: '#090D14',
      surface: '#111824',
      'surface-elevated': '#192333',
      'text-primary': '#E7EDF5',
      'text-secondary': '#8A96A8',
      'accent-primary': '#8AB4D8',
      'accent-secondary': '#9B9BCB',
      border: '#263244',
      success: '#82B79A',
      warning: '#D2B175',
      error: '#D98A8A',
      focus: '#8AB4D8',
    },
    shape: {
      small: '6px',
      medium: '9px',
      large: '12px',
      button: '6px',
      input: '6px',
      card: '9px',
      dialog: '12px',
      control: '6px',
    },
  },
  'arctic': {
    name: 'Arctic',
    tokens: {
      background: '#F5F5F5', 
      surface: '#FFFFFF',
      'surface-elevated': '#E5E5E5',
      'text-primary': '#333333',
      'text-secondary': '#666666',
      'accent-primary': '#007AFF',
      'accent-secondary': '#5856D6',
      border: '#CCCCCC',
      success: '#34C759',
      warning: '#FF9500',
      error: '#FF3B30',
      focus: '#007AFF',
    },
    shape: {
      small: '2px',
      medium: '4px',
      large: '8px',
      button: '0',
      input: '1px',
      card: '0',
      dialog: '2px',
      control: '4px',
    },
  },
} as const satisfies Record<string, ThemeDefinition>

export type ThemeId = keyof typeof themes

export const DEFAULT_THEME_ID: ThemeId = 'deep-space'

export function resolveThemeId(themeId: string): ThemeId {
  return Object.hasOwn(themes, themeId)
    ? (themeId as ThemeId)
    : DEFAULT_THEME_ID
}

export function getTheme(themeId: string): (typeof themes)[ThemeId] {
  return themes[resolveThemeId(themeId)]
}
