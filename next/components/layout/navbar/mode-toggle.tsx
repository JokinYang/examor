'use client'

import * as React from 'react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div>
      {theme === 'dark' ? (
        <Button onClick={toggleTheme} size="icon" variant="ghost">
          <MoonIcon size={16} className="fill-current" />
        </Button>
      ) : (
        <Button onClick={toggleTheme} size="icon" variant="ghost">
          <SunIcon size={16} className="fill-current" />
        </Button>
      )}
    </div>
  )
}
