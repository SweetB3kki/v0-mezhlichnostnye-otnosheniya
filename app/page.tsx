import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Users, ClipboardList, BarChart3, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <AppShell>
      <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--cloud-purple)]/20 text-[var(--ink-secondary)] text-sm mb-6">
            <Shield className="w-4 h-4" />
            Исследование межличностных отношений
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[var(--ink)] tracking-tight mb-6 text-balance">
            Межличностные отношения у обучающихся средней школы
          </h1>

          <p className="text-lg md:text-xl text-[var(--ink-secondary)] max-w-2xl mx-auto mb-8">
            Пройдите диагностические методики для изучения межличностных отношений и коммуникативных навыков в классном
            коллективе
          </p>

          <Link href="/consent">
            <Button className="gradient-btn text-[var(--ink)] font-medium px-8 py-6 text-lg rounded-2xl hover:opacity-90 transition-opacity">
              Начать тестирование
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="cloud-shadow border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--cloud-purple)]/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[var(--ink)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">Социометрия Морено</h3>
              <p className="text-[var(--ink-secondary)] text-sm">
                Диагностика межличностных отношений в группе, выявление лидеров и социальных статусов
              </p>
            </CardContent>
          </Card>

          <Card className="cloud-shadow border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--cloud-pink)]/30 flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-[var(--ink)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">ОМО/FIRO Шутца</h3>
              <p className="text-[var(--ink-secondary)] text-sm">
                Опросник межличностных отношений для оценки потребностей во включении, контроле и аффекте
              </p>
            </CardContent>
          </Card>

          <Card className="cloud-shadow border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-[var(--cloud-purple)]/20 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[var(--ink)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">Аналитика результатов</h3>
              <p className="text-[var(--ink-secondary)] text-sm">
                Визуализация социограммы, статистика по классу и индивидуальные профили учащихся
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="cloud-shadow border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-[var(--ink)] mb-4">О методиках исследования</h2>
            <div className="grid md:grid-cols-2 gap-8 text-[var(--ink-secondary)]">
              <div>
                <h4 className="font-medium text-[var(--ink)] mb-2">Социометрия Дж. Морено</h4>
                <p className="text-sm leading-relaxed">
                  Метод диагностики межличностных отношений, позволяющий измерить степень сплочённости группы, выявить
                  лидеров и изолированных членов, обнаружить внутригрупповые образования.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-[var(--ink)] mb-2">ОМО/FIRO В. Шутца</h4>
                <p className="text-sm leading-relaxed">
                  Опросник оценивает три базовые межличностные потребности: включение (потребность быть среди людей),
                  контроль (влияние и ответственность), аффект (эмоциональная близость).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
