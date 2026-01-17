import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, User, ArrowLeft } from "lucide-react"

interface Props {
  searchParams: Promise<{ classId?: string; studentId?: string }>
}

export default async function TestCompletePage({ searchParams }: Props) {
  const { classId, studentId } = await searchParams

  return (
    <AppShell>
      <div className="max-w-[600px] mx-auto px-6 py-16">
        <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 rounded-full gradient-btn flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[var(--ink)]" />
            </div>

            <h1 className="text-2xl font-semibold text-[var(--ink)] mb-2">Тест завершён!</h1>

            <p className="text-[var(--ink-secondary)] mb-8">
              Спасибо за участие в исследовании. Ваши ответы успешно сохранены.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {studentId && (
                <Link href={`/student/${studentId}/results`}>
                  <Button className="gradient-btn text-[var(--ink)] rounded-xl w-full sm:w-auto">
                    <User className="w-4 h-4 mr-2" />
                    Мои результаты
                  </Button>
                </Link>
              )}

              {classId && (
                <Link href={`/class/${classId}`}>
                  <Button
                    variant="outline"
                    className="rounded-xl border-[var(--border)] w-full sm:w-auto bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться к классу
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
