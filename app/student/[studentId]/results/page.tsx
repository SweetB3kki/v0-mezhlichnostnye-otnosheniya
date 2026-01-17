import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FiroProfilePanel } from "@/components/firo-profile-panel"
import { ArrowLeft, User, Star } from "lucide-react"

interface Props {
  params: Promise<{ studentId: string }>
}

export default async function StudentResultsPage({ params }: Props) {
  const { studentId } = await params

  // Demo data
  const student = {
    id: studentId,
    firstName: "Александр",
    lastName: "Иванов",
    className: "7А",
  }

  const sociometryStatus = {
    label: "Звезда",
    description: "Высокий социометрический статус. Пользуется авторитетом и симпатией большинства одноклассников.",
    choices: 7,
    mutual: 3,
  }

  return (
    <AppShell>
      <div className="max-w-[900px] mx-auto px-6 py-12">
        <Link href="/results">
          <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все результаты
          </Button>
        </Link>

        <PageTitle title={`${student.lastName} ${student.firstName}`} subtitle={`Класс ${student.className}`} />

        <div className="space-y-6">
          {/* Student Profile Card */}
          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center">
                  <User className="w-8 h-8 text-[var(--ink)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[var(--ink)]">
                    {student.lastName} {student.firstName}
                  </h2>
                  <p className="text-[var(--ink-secondary)]">Класс {student.className}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sociometry Results */}
          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[var(--ink)] mb-4">Социометрический статус</h3>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--cloud-purple)]/20 flex items-center justify-center">
                  <Star className="w-6 h-6 text-[var(--ink)]" />
                </div>
                <div>
                  <Badge className="bg-[var(--cloud-purple)] text-[var(--ink)]">{sociometryStatus.label}</Badge>
                  <p className="text-sm text-[var(--ink-secondary)] mt-1">{sociometryStatus.description}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                  <div className="text-2xl font-semibold text-[var(--ink)]">{sociometryStatus.choices}</div>
                  <div className="text-xs text-[var(--ink-secondary)]">Получено выборов</div>
                </div>
                <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                  <div className="text-2xl font-semibold text-[var(--ink)]">{sociometryStatus.mutual}</div>
                  <div className="text-xs text-[var(--ink-secondary)]">Взаимных выборов</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FIRO Results */}
          <FiroProfilePanel />
        </div>
      </div>
    </AppShell>
  )
}
