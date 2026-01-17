import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { firoScaleDescriptions } from "@/lib/test-data"

export function FiroProfilePanel() {
  // Demo scores
  const scores = {
    Ie: 6,
    Iw: 7,
    Ce: 4,
    Cw: 3,
    Ae: 5,
    Aw: 6,
  }

  const getInterpretation = (score: number) => {
    if (score <= 1) return { level: "Очень низкий", color: "text-red-500" }
    if (score <= 3) return { level: "Низкий", color: "text-orange-500" }
    if (score <= 5) return { level: "Средний", color: "text-[var(--ink)]" }
    if (score <= 7) return { level: "Высокий", color: "text-green-500" }
    return { level: "Очень высокий", color: "text-green-600" }
  }

  const renderScaleCard = (
    title: string,
    expressed: { key: keyof typeof scores; score: number },
    wanted: { key: keyof typeof scores; score: number },
    bgColor: string,
  ) => (
    <Card className={`cloud-shadow border-0 ${bgColor}`}>
      <CardContent className="p-6">
        <h4 className="font-semibold text-[var(--ink)] mb-4">{title}</h4>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-[var(--ink-secondary)]">
                {firoScaleDescriptions[expressed.key].name.split(" (")[0]}
              </span>
              <span className={`text-sm font-medium ${getInterpretation(expressed.score).color}`}>
                {expressed.score} - {getInterpretation(expressed.score).level}
              </span>
            </div>
            <Progress value={(expressed.score / 9) * 100} className="h-2" />
            <p className="text-xs text-[var(--ink-secondary)] mt-1">
              {firoScaleDescriptions[expressed.key].description}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-[var(--ink-secondary)]">
                {firoScaleDescriptions[wanted.key].name.split(" (")[0]}
              </span>
              <span className={`text-sm font-medium ${getInterpretation(wanted.score).color}`}>
                {wanted.score} - {getInterpretation(wanted.score).level}
              </span>
            </div>
            <Progress value={(wanted.score / 9) * 100} className="h-2" />
            <p className="text-xs text-[var(--ink-secondary)] mt-1">{firoScaleDescriptions[wanted.key].description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-[var(--ink)]">Профиль ОМО/FIRO</h3>

      <div className="grid md:grid-cols-3 gap-4">
        {renderScaleCard(
          "Включение (Inclusion)",
          { key: "Ie", score: scores.Ie },
          { key: "Iw", score: scores.Iw },
          "bg-[var(--cloud-purple)]/10",
        )}

        {renderScaleCard(
          "Контроль (Control)",
          { key: "Ce", score: scores.Ce },
          { key: "Cw", score: scores.Cw },
          "bg-[var(--cloud-pink)]/20",
        )}

        {renderScaleCard(
          "Аффект (Affection)",
          { key: "Ae", score: scores.Ae },
          { key: "Aw", score: scores.Aw },
          "bg-[var(--cloud-bg)]",
        )}
      </div>

      <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <h4 className="font-semibold text-[var(--ink)] mb-2">Интерпретация результатов</h4>
          <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
            Данный профиль показывает высокую потребность в социальном включении и эмоциональной близости. Учащийся
            стремится быть частью группы и устанавливать тёплые отношения с окружающими. Средний уровень контроля
            указывает на сбалансированное отношение к лидерству и ответственности.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
