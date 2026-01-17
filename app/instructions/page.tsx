import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, Users, ClipboardList, CheckCircle } from "lucide-react"

export default function InstructionsPage() {
  return (
    <AppShell>
      <div className="max-w-[800px] mx-auto px-6 py-12">
        <PageTitle title="Инструкция" subtitle="Ознакомьтесь с порядком прохождения тестирования" />

        <div className="space-y-6">
          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--cloud-purple)]/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[var(--ink)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ink)]">Время прохождения</h3>
                  <p className="text-sm text-[var(--ink-secondary)]">Примерно 15-20 минут</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--cloud-purple)]/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[var(--ink)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ink)] mb-2">Этап 1: Социометрия</h3>
                  <ul className="text-sm text-[var(--ink-secondary)] space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--cloud-purple)] mt-0.5 shrink-0" />
                      Вам будут предложены вопросы о выборе одноклассников
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--cloud-purple)] mt-0.5 shrink-0" />
                      На каждый вопрос нужно выбрать до 3 человек
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--cloud-purple)] mt-0.5 shrink-0" />
                      Отвечайте искренне — ваши ответы конфиденциальны
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[var(--cloud-pink)]/30 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5 text-[var(--ink)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--ink)] mb-2">Этап 2: ОМО/FIRO</h3>
                  <ul className="text-sm text-[var(--ink-secondary)] space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--cloud-pink)] mt-0.5 shrink-0" />
                      54 утверждения о взаимоотношениях с людьми
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--cloud-pink)] mt-0.5 shrink-0" />
                      Оцените каждое по шкале от 1 (никогда) до 6 (всегда)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[var(--cloud-pink)] mt-0.5 shrink-0" />
                      Выбирайте первый ответ, который приходит в голову
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-2xl bg-[var(--cloud-purple)]/10">
            <p className="text-sm text-[var(--ink-secondary)] text-center">
              Ваш прогресс автоматически сохраняется. Вы можете вернуться к тесту позже.
            </p>
          </div>

          <Link href="/class" className="block">
            <Button className="w-full gradient-btn text-[var(--ink)] font-medium rounded-xl py-6">
              Перейти к выбору класса
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
