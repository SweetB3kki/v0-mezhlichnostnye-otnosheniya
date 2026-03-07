"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  firoGeneralInstruction,
  firoQuestionSections,
  type QuestionItem,
  type QuestionOption,
  type QuestionSection,
} from "@/lib/test-data"
import { cn } from "@/lib/utils"
import { ArrowLeft, Send, Loader2 } from "lucide-react"

interface FiroTestProps {
  answers: Record<string, number>
  onAnswersChange: (answers: Record<string, number>) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

export function FiroTest({ answers, onAnswersChange, onBack, onSubmit, isSubmitting }: FiroTestProps) {
  const allQuestions = useMemo(
    () => firoQuestionSections.flatMap((section) => section.questions),
    [],
  )
  const questionKeys = useMemo(() => new Set(allQuestions.map((question) => question.key)), [allQuestions])

  const answeredCount = Object.entries(answers).reduce((count, [key, value]) => {
    if (!questionKeys.has(key)) return count
    if (value < 1 || value > 6) return count
    return count + 1
  }, 0)

  const totalQuestions = allQuestions.length
  const progress = totalQuestions === 0 ? 0 : (answeredCount / totalQuestions) * 100
  const allAnswered = answeredCount === totalQuestions

  const setAnswer = (questionKey: string, value: number) => {
    onAnswersChange({
      ...answers,
      [questionKey]: value,
    })
  }

  const answeredInSection = (section: QuestionSection): number => {
    return section.questions.reduce((count, question) => {
      const value = answers[question.key]
      return value >= 1 && value <= 6 ? count + 1 : count
    }, 0)
  }

  const renderQuestion = (question: QuestionItem, options: QuestionOption[]) => (
    <Card key={question.key} className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-6">
        <p className="text-base leading-7 text-[var(--ink)] mb-4">
          <span className="text-sm text-[var(--ink-secondary)]">{question.number}.</span> {question.text}
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((option) => (
            <button
              key={`${question.key}_${option.value}`}
              onClick={() => setAnswer(question.key, option.value)}
              className={cn(
                "px-4 py-3 rounded-xl text-sm leading-5 text-left font-medium transition-all",
                answers[question.key] === option.value
                  ? "gradient-btn text-[var(--ink)]"
                  : "bg-[var(--cloud-bg)] text-[var(--ink-secondary)] hover:bg-[var(--cloud-purple)]/20",
              )}
              aria-pressed={answers[question.key] === option.value}
            >
              {option.value}. {option.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-[var(--ink)] mb-2">ОМО/FIRO</h2>
        <p className="text-[var(--ink-secondary)] text-base leading-7 mb-4">
          Отвечайте на каждое утверждение отдельно. Следите за инструкцией текущего блока.
        </p>

        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-[var(--ink-secondary)] mb-1">
            <span>Прогресс</span>
            <span>
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <Card className="border-0 bg-[var(--cloud-purple)]/10">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[var(--ink)] text-base mb-2">{firoGeneralInstruction.title}</h3>
          <p className="text-sm leading-6 text-[var(--ink-secondary)]">{firoGeneralInstruction.description}</p>
        </CardContent>
      </Card>

      {firoQuestionSections.map((section) => (
        <div key={section.id} className="space-y-4">
          <Card className="border-0 bg-[var(--cloud-bg)]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-[var(--ink)] text-base">{section.title}</h3>
                <span className="text-sm text-[var(--ink-secondary)]">
                  {answeredInSection(section)}/{section.questions.length}
                </span>
              </div>

              <p className="text-base leading-7 text-[var(--ink-secondary)] whitespace-pre-line">{section.description}</p>
            </CardContent>
          </Card>

          {section.questions.map((question) => renderQuestion(question, section.options))}
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="rounded-xl border-[var(--border)] bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <Button
          onClick={onSubmit}
          disabled={!allAnswered || isSubmitting}
          className="gradient-btn text-[var(--ink)] rounded-xl px-8 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Отправка...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Отправить
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
