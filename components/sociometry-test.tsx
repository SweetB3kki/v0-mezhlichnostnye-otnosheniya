"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { sociometryQuestions } from "@/lib/test-data"
import { cn } from "@/lib/utils"
import { ArrowRight, Check } from "lucide-react"

interface SociometryTestProps {
  classmates: Array<{ id: string; firstName: string; lastName: string }>
  answers: Record<string, string[]>
  onAnswersChange: (answers: Record<string, string[]>) => void
  onNext: () => void
}

export function SociometryTest({ classmates, answers, onAnswersChange, onNext }: SociometryTestProps) {
  const toggleSelection = (questionId: string, studentId: string, maxSelections: number) => {
    const current = answers[questionId] || []

    if (current.includes(studentId)) {
      onAnswersChange({
        ...answers,
        [questionId]: current.filter((id) => id !== studentId),
      })
    } else if (current.length < maxSelections) {
      onAnswersChange({
        ...answers,
        [questionId]: [...current, studentId],
      })
    }
  }

  const allQuestionsAnswered = sociometryQuestions.every((q) => (answers[q.id]?.length || 0) > 0)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[var(--ink)] mb-2">Социометрия</h2>
        <p className="text-[var(--ink-secondary)]">Выберите одноклассников, которых вы бы выбрали в каждой ситуации</p>
      </div>

      {sociometryQuestions.map((question, qIndex) => {
        const selectedIds = answers[question.id] || []

        return (
          <Card key={question.id} className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <span className="text-xs text-[var(--ink-secondary)] mb-1 block">Вопрос {qIndex + 1}</span>
                  <h3 className="font-medium text-[var(--ink)]">{question.text}</h3>
                </div>
                <Badge variant="secondary" className="shrink-0 bg-[var(--cloud-purple)]/20 text-[var(--ink)]">
                  {selectedIds.length}/{question.maxSelections}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2">
                {classmates.map((student) => {
                  const isSelected = selectedIds.includes(student.id)
                  const isDisabled = !isSelected && selectedIds.length >= question.maxSelections

                  return (
                    <button
                      key={student.id}
                      onClick={() => toggleSelection(question.id, student.id, question.maxSelections)}
                      disabled={isDisabled}
                      className={cn(
                        "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                        isSelected
                          ? "gradient-btn text-[var(--ink)]"
                          : isDisabled
                            ? "bg-[var(--cloud-bg)] text-[var(--ink-secondary)]/50 cursor-not-allowed"
                            : "bg-[var(--cloud-bg)] text-[var(--ink-secondary)] hover:bg-[var(--cloud-purple)]/20 hover:text-[var(--ink)]",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {isSelected && <Check className="w-3 h-3" />}
                        {student.lastName} {student.firstName[0]}.
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!allQuestionsAnswered}
          className="gradient-btn text-[var(--ink)] rounded-xl px-8 disabled:opacity-50"
        >
          Далее
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
