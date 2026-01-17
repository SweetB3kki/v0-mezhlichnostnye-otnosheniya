"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { firoQuestions, firoAnswerOptions, firoScaleDescriptions } from "@/lib/test-data"
import { cn } from "@/lib/utils"
import { ArrowLeft, Send, Loader2 } from "lucide-react"

interface FiroTestProps {
  answers: Record<string, number>
  onAnswersChange: (answers: Record<string, number>) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const scaleGroups = ["Ie", "Iw", "Ce", "Cw", "Ae", "Aw"] as const

export function FiroTest({ answers, onAnswersChange, onBack, onSubmit, isSubmitting }: FiroTestProps) {
  const [activeTab, setActiveTab] = useState<string>("all")

  const setAnswer = (questionId: string, value: number) => {
    onAnswersChange({
      ...answers,
      [questionId]: value,
    })
  }

  const answeredCount = Object.keys(answers).length
  const totalQuestions = firoQuestions.length
  const progress = (answeredCount / totalQuestions) * 100
  const allAnswered = answeredCount === totalQuestions

  const getQuestionsForScale = (scale: string) => {
    return firoQuestions.filter((q) => q.scale === scale)
  }

  const renderQuestion = (question: (typeof firoQuestions)[0]) => (
    <Card key={question.id} className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
      <CardContent className="p-4">
        <p className="text-sm text-[var(--ink)] mb-3">
          <span className="text-[var(--ink-secondary)]">{question.number}.</span> {question.text}
        </p>

        <div className="flex flex-wrap gap-2">
          {firoAnswerOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setAnswer(question.id, option.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                answers[question.id] === option.value
                  ? "gradient-btn text-[var(--ink)]"
                  : "bg-[var(--cloud-bg)] text-[var(--ink-secondary)] hover:bg-[var(--cloud-purple)]/20",
              )}
            >
              {option.value}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-semibold text-[var(--ink)] mb-2">ОМО/FIRO</h2>
        <p className="text-[var(--ink-secondary)] text-sm mb-4">
          Оцените каждое утверждение по шкале от 1 (никогда) до 6 (всегда)
        </p>

        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-xs text-[var(--ink-secondary)] mb-1">
            <span>Прогресс</span>
            <span>
              {answeredCount}/{totalQuestions}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 justify-center text-xs text-[var(--ink-secondary)] mb-4">
        {firoAnswerOptions.map((opt) => (
          <span key={opt.value} className="px-2 py-1 bg-[var(--cloud-bg)] rounded-lg">
            {opt.label}
          </span>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex-wrap h-auto gap-1 bg-[var(--cloud-bg)] p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs"
          >
            Все ({totalQuestions})
          </TabsTrigger>
          {scaleGroups.map((scale) => {
            const scaleQuestions = getQuestionsForScale(scale)
            const answeredInScale = scaleQuestions.filter((q) => answers[q.id]).length
            return (
              <TabsTrigger
                key={scale}
                value={scale}
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs"
              >
                {scale} ({answeredInScale}/{scaleQuestions.length})
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="all" className="mt-4 space-y-3">
          {firoQuestions.map(renderQuestion)}
        </TabsContent>

        {scaleGroups.map((scale) => (
          <TabsContent key={scale} value={scale} className="mt-4 space-y-3">
            <Card className="border-0 bg-[var(--cloud-purple)]/10">
              <CardContent className="p-4">
                <h4 className="font-medium text-[var(--ink)] text-sm">{firoScaleDescriptions[scale].name}</h4>
                <p className="text-xs text-[var(--ink-secondary)] mt-1">{firoScaleDescriptions[scale].description}</p>
              </CardContent>
            </Card>
            {getQuestionsForScale(scale).map(renderQuestion)}
          </TabsContent>
        ))}
      </Tabs>

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
