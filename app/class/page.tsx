import Link from "next/link"
import { ChevronRight, Users } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function ClassListPage() {
  try {
    const classes = await prisma.class.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        name: true,
        teacher: true,
        _count: { select: { students: true } },
      },
    })

    return (
      <AppShell>
        <div className="mx-auto max-w-[1000px] px-6 py-12">
          <PageTitle
            title="Выбор класса"
            subtitle="Выберите класс для прохождения тестирования"
          />

          {classes.length === 0 ? (
            <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
              <CardContent className="p-6 text-[var(--ink-secondary)]">
                Классы пока не добавлены. Обратитесь к администратору.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {classes.map((classItem) => (
                <Link key={classItem.id} href={`/class/${classItem.id}`}>
                  <Card className="cloud-shadow group h-full cursor-pointer border-0 bg-white/90 backdrop-blur-sm transition-colors hover:bg-white">
                    <CardContent className="p-6">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="gradient-btn flex h-12 w-12 items-center justify-center rounded-2xl">
                          <span className="text-lg font-semibold text-[var(--ink)]">
                            {classItem.name.slice(0, 2)}
                          </span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[var(--ink-secondary)] transition-colors group-hover:text-[var(--ink)]" />
                      </div>

                      <h3 className="mb-1 font-semibold text-[var(--ink)]">Класс {classItem.name}</h3>

                      {classItem.teacher && (
                        <p className="mb-2 text-sm text-[var(--ink-secondary)]">{classItem.teacher}</p>
                      )}

                      <div className="flex items-center gap-1 text-xs text-[var(--ink-secondary)]">
                        <Users className="h-3 w-3" />
                        <span>{classItem._count.students} учащихся</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    )
  } catch {
    return (
      <AppShell>
        <div className="mx-auto max-w-[1000px] px-6 py-12">
          <PageTitle title="Выбор класса" subtitle="Временная ошибка загрузки" />
          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-[var(--ink-secondary)]">
              Не удалось загрузить список классов. Попробуйте обновить страницу через несколько
              секунд.
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }
}
