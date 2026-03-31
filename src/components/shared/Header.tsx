import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { Separator } from '@/components/ui/separator'

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold">Panel de administración</h1>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="text-xs">AC</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}