'use client'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { MenuList } from './menu-list'
import { Logo } from './logo'
import { useMenu } from '@/hooks/useMenu'

export const Sidebar = ({
  isCollapsed,
}: {
  isCollapsed: boolean
}) => {
  const { staticMenus, noteMenus } = useMenu()

  return (
    <div className="flex flex-col h-screen p-4 gap-2">
      <Logo isCollapsed={isCollapsed} />

      <Separator />

      <MenuList isCollapsed={isCollapsed} menus={staticMenus} />

      <Separator />

      <Button
        variant="outline"
        className={cn(
          'text-sm',
          isCollapsed
            ? 'p-0 justify-center items-center'
            : 'justify-start'
        )}>
        <Plus
          className={(cn(isCollapsed ? 'mr-0' : 'mr-2'), 'min-w-4')}
          size={16}
        />
        {isCollapsed ? '' : 'Add new note'}
      </Button>

      <MenuList isCollapsed={isCollapsed} menus={noteMenus} />
    </div>
  )
}
