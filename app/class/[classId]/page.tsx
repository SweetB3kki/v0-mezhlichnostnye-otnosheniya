import Link from "next/link"
import { cookies } from "next/headers"
import { ArrowLeft } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { StudentCard } from "@/components/student-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { isAdminAuthenticated } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

interface Props {
  params: { classId: string } | Promise<{ classId: string }>
}

export default async function ClassPage({ params }: Props) {
  const { classId } = await Promise.resolve(params)
  const cookieStore = await cookies()
  const isAdmin = isAdminAuthenticated(cookieStore)

  try {
    const cls = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        teacher: true,
        students: {
          orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            sessions: {
              orderBy: { submittedAt: "desc" },
              take: 1,
              select: { id: true },
            },
          },
        },
      },
    })

    if (!cls) {
      return (
        <AppShell>
          <div className="mx-auto max-w-[1200px] px-6 py-12">
            <Link href="/class">
              <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Все классы
              </Button>
            </Link>
            <PageTitle title="Класс не найден" />
          </div>
        </AppShell>
      )
    }

    return (
      <AppShell>
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <Link href="/class">
            <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Все классы
            </Button>
          </Link>

          <div className="mb-8">
            <PageTitle title={cls.name} subtitle={cls.teacher ? `Классный руководитель: ${cls.teacher}` : undefined} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {cls.students.map((student) => (
              <StudentCard
                key={student.id}
                student={{
                  id: student.id,
                  firstName: student.firstName,
                  lastName: student.lastName,
                  hasCompleted: student.sessions.length > 0,
                }}
                classId={classId}
                canRetake={isAdmin}
              />
            ))}
          </div>
        </div>
      </AppShell>
    )
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1200px] px-6 py-12">
          <Link href="/class">
            <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Все классы
            </Button>
          </Link>

          <PageTitle title="Класс временно недоступен" subtitle="Ошибка загрузки данных" />
          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-[var(--ink-secondary)]">
              Не удалось открыть состав класса. Попробуйте обновить страницу через несколько секунд.
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }
}
