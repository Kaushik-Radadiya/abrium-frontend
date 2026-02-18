'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const THEME_STORAGE_KEY = 'abrium.ui.theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark'

    const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (isTheme(saved)) return saved
    return 'dark'
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const onToggle = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    applyTheme(nextTheme)
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
  }

  return (
    <button
      type='button'
      className='flex items-center rounded-full border border-[var(--border)] bg-[var(--panel)] w-10 h-10 justify-center'
      onClick={onToggle}
      aria-label='Toggle theme'
      title='Toggle theme'
    >
      <span aria-hidden='true'>{theme === 'dark' ? <Moon /> : <Sun />}</span>
    </button>
  )
}
