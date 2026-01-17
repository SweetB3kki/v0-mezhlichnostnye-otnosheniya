import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <Link href="/consent">
          <Button variant="ghost" className="mb-6 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к согласию
          </Button>
        </Link>

        <PageTitle title="Политика конфиденциальности" subtitle="Информация о сборе и обработке данных" />

        <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 space-y-6">
            <section>
              <h3 className="font-semibold text-[var(--ink)] mb-2">1. Сбор информации</h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                В рамках исследования собираются ответы на вопросы диагностических методик. Персональные данные (ФИО,
                инициалы) собираются только с согласия участника и используются исключительно для идентификации
                результатов.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[var(--ink)] mb-2">2. Использование данных</h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                Собранные данные используются в научно-исследовательских целях для изучения межличностных отношений в
                ученических коллективах. Данные обрабатываются в обезличенном виде при публикации результатов.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[var(--ink)] mb-2">3. Хранение данных</h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                Данные хранятся на защищённых серверах с ограниченным доступом. Срок хранения определяется целями
                исследования.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[var(--ink)] mb-2">4. Права участников</h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                Участники имеют право отозвать согласие на обработку данных, запросить удаление своих данных или
                получить информацию о собранных данных.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[var(--ink)] mb-2">5. Контакты</h3>
              <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                По вопросам обработки персональных данных обращайтесь к руководителю исследования или классному
                руководителю.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
