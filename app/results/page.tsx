import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent } from "@/components/ui/card"
import { demoClasses } from "@/lib/demo-data"
import { Users, ChevronRight, BarChart3 } from "lucide-react"

export default function ResultsPage() {
  return (
    <AppShell>
      <div className="max-w-[1000px] mx-auto px-6 py-12">
        <PageTitle title="Результаты" subtitle="Выберите класс для просмотра результатов" />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {demoClasses.map((classItem) => (
            <Link key={classItem.id} href={`/results/class/${classItem.id}`}>
              <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--cloud-purple)]/20 flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-[var(--ink)]" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--ink-secondary)] group-hover:text-[var(--ink)] transition-colors" />
                  </div>

                  <h3 className="font-semibold text-[var(--ink)] mb-1">Класс {classItem.name}</h3>

                  <div className="flex items-center gap-1 text-xs text-[var(--ink-secondary)]">
                    <Users className="w-3 h-3" />
                    <span>{classItem.studentCount} учащихся</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
