import type { ReactNode } from "react"
import { HeaderNav } from "./header-nav"

interface AppShellProps {
  children: ReactNode
  showNav?: boolean
}

export function AppShell({ children, showNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[var(--cloud-bg)]">
      {/* Background blobs */}
      <div className="cloud-blob cloud-blob-purple w-[500px] h-[500px] -top-64 -left-64 fixed" />
      <div className="cloud-blob cloud-blob-pink w-[400px] h-[400px] top-1/3 -right-48 fixed" />
      <div className="cloud-blob cloud-blob-purple w-[300px] h-[300px] bottom-0 left-1/4 fixed" />

      {showNav && <HeaderNav />}

      <main className="relative z-10">{children}</main>
    </div>
  )
}
