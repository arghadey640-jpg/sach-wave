import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  const [accentColor, setAccentColor] = useState(() => {
    return localStorage.getItem('accentColor') || 'purple'
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor)
  }, [accentColor])

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const colors = {
    purple: { primary: '#5b21b6', light: '#7c3aed', dark: '#4c1d95' },
    blue: { primary: '#1d4ed8', light: '#3b82f6', dark: '#1e40af' },
    pink: { primary: '#be185d', light: '#ec4899', dark: '#9d174d' },
    green: { primary: '#047857', light: '#10b981', dark: '#065f46' },
    orange: { primary: '#c2410c', light: '#f97316', dark: '#9a3412' }
  }

  const value = {
    isDarkMode,
    toggleDarkMode,
    accentColor,
    setAccentColor,
    colors: colors[accentColor] || colors.purple
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
