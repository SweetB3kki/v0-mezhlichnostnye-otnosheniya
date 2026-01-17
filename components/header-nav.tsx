"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, BarChart3, Settings, Download, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Главная", icon: Home },
  { href: "/class", label: "Классы", icon: Users },
  { href: "/results", label: "Результаты", icon: BarChart3 },
  { href: "/admin", label: "Админ", icon: Settings },
  { href: "/export", label: "Экспорт", icon: Download },
]

export function HeaderNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/80 backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-btn flex items-center justify-center">
            <Users className="w-4 h-4 text-[var(--ink)]" />
          </div>
          <span className="font-semibold text-[var(--ink)] tracking-tight hidden sm:inline">
            Межличностные отношения
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--cloud-purple)]/20 text-[var(--ink)]"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink)] hover:bg-[var(--cloud-purple)]/10",
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
