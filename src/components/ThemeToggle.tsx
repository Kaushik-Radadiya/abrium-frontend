'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppTheme } from '@/components/AppThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useAppTheme()

  return (
    <Button
      variant="icon"
      size="none"
      className='w-10 h-10 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--panel)]'
      onClick={toggleTheme}
      aria-label='Toggle theme'
      title='Toggle theme'
    >
      <span aria-hidden='true'>{theme === 'dark' ? <Moon /> : <Sun />}</span>
    </Button>
  )
}
