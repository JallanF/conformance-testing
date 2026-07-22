// =============================================================================
// WHAT: Top navigation bar — Level 1 navigation
// ROLE: Provides navigation between the application's feature areas (Orders,
//       Warehousing). Displays the current user in a dropdown menu that holds
//       the theme switcher and sign-out.
//
// NAVIGATION LEVELS (this application):
//   Level 1 (here): Navigation between feature areas — Orders | Warehousing
//   Level 2:        Navigation within a page — implemented by PageTabs.tsx
//                   Used on OrderDetailsPage (Order Info | Line Items | Workflow)
//
// ARCHITECTURE NOTE:
//   TopNav reads AuthContext AND ThemeContext (both Application State)
//   directly via their hooks. This is one of the few places outside page
//   orchestration hooks where Application State is read — justified because
//   TopNav is application infrastructure, not a Business Component.
//
//   NavLink from React Router supplies an { isActive } flag; the className
//   function selects the active classes from it (the data chooses the class —
//   cc27 / Styling). This is standard React Router behaviour.
//
//   The user menu is the ui/dropdown-menu vendor-zone component (Base UI Menu
//   underneath). Composition uses Base UI's render prop: the Trigger renders
//   AS the ghost Button rather than wrapping it — one element, no nested
//   buttons. The theme switcher is a menu radio group bound to useTheme().
//
// SEE ALSO:
//   shared/technical-components/PageTabs.tsx — Level 2 navigation (within-page tabs)
//   app/ProtectedRoute.tsx — renders TopNav as part of the layout
//   app/ThemeProvider.tsx  — the theme preference this menu writes
// =============================================================================

import { NavLink, useNavigate } from 'react-router'
import { ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useAuth } from '@/shared/utility-hooks/useAuth'
import { useTheme } from '@/shared/utility-hooks/useTheme'
import type { ThemePreference } from '@/app/ThemeProvider'

export function TopNav() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Shared classes for the Level 1 links; the active state adds emphasis.
  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    cn(
      'rounded-md px-4 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-muted text-foreground'
        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
    )

  return (
    <nav className="flex h-14 shrink-0 items-center gap-6 border-b bg-background px-6">
      {/* Brand */}
      <span className="text-lg font-bold tracking-tight">FreightOS</span>

      {/* PATTERN: Level 1 navigation links */}
      <div className="flex flex-1 gap-1">
        <NavLink to="/orders" className={navLinkClassName}>
          Orders
        </NavLink>
        <NavLink to="/warehousing" className={navLinkClassName}>
          Warehousing
        </NavLink>
      </div>

      {/* User menu: theme switcher + sign out.
          Base UI composition — the Trigger renders AS the Button (render prop). */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="sm" />}>
          {user?.name}
          <Badge variant="secondary" className="uppercase">{user?.role}</Badge>
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {/* GroupLabel is a GROUP part in Base UI — it must live INSIDE the
              RadioGroup (or a Group), which provides its context. */}
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as ThemePreference)}
          >
            <DropdownMenuLabel>Theme</DropdownMenuLabel>
            <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  )
}
