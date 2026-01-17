"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { TestStepper } from "@/components/test-stepper"
import { SociometryTest } from "@/components/sociometry-test"
import { FiroTest } from "@/components/firo-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getClassById, getStudentById, getStudentsForClass } from "@/lib/demo-data"
import { submitTest } from "@/lib/api"
import { ArrowLeft, User, Users } from "lucide-react"
import Link from "next/link"

interface Props {
  params: Promise<{ classId: string; studentId: string }>
}

export default function TestPage({ params }: Props) {
  const { classId, studentId } = use(params)
  const router = useRouter()

  const classData = getClassById(classId)
  const student = getStudentById(classId, studentId)
  const classmates = getStudentsForClass(classId).filter((s) => s.id !== studentId)

  const [currentStep, setCurrentStep] = useState(0)
  const [sociometryAnswers, setSociometryAnswers] = useState<Record<string, string[]>>({})
  const [firoAnswers, setFiroAnswers] = useState<Record<string, number>>({})
  const [startTime] = useState(new Date().toISOString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load saved progress
  useEffect(() => {
    const storageKey = `test_progress_${classId}_${studentId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.sociometryAnswers) setSociometryAnswers(data.sociometryAnswers)
        if (data.firoAnswers) setFiroAnswers(data.firoAnswers)
        if (data.currentStep) setCurrentStep(data.currentStep)
      } catch {
        // Ignore parse errors
      }
    }
  }, [classId, studentId])

  // Save progress
  useEffect(() => {
    const storageKey = `test_progress_${classId}_${studentId}`
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        sociometryAnswers,
        firoAnswers,
        currentStep,
      }),
    )
  }, [sociometryAnswers, firoAnswers, currentStep, classId, studentId])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const endTime = new Date()
    const startDate = new Date(startTime)
    const durationSeconds = Math.floor((endTime.getTime() - startDate.getTime()) / 1000)

    // Prepare sociometry responses
    const sociometryResponses = Object.entries(sociometryAnswers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }))

    // Prepare FIRO responses
    const firoResponses = Object.entries(firoAnswers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }))

    const payload = {
      studentId,
      classId,
      responses: [...sociometryResponses, ...firoResponses],
      meta: {
        durationSeconds,
        startedAt: startTime,
      },
      type: "COMBINED" as const,
    }

    const result = await submitTest(payload)

    if (result.success) {
      // Clear saved progress
      localStorage.removeItem(`test_progress_${classId}_${studentId}`)
      router.push(`/test/complete?classId=${classId}&studentId=${studentId}`)
    } else {
      setIsSubmitting(false)
      alert("Ошибка при отправке. Попробуйте ещё раз.")
    }
  }

  const steps = [
    { id: "sociometry", label: "Социометрия" },
    { id: "firo", label: "ОМО/FIRO" },
  ]

  return (
    <AppShell>
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/class/${classId}`}>
            <Button variant="ghost" size="sm" className="text-[var(--ink-secondary)] hover:text-[var(--ink)] mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Назад к классу
            </Button>
          </Link>

          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--cloud-purple)]/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-[var(--ink)]" />
                  </div>
                  <span className="text-sm text-[var(--ink)]">Класс {classData?.name || classId.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--cloud-pink)]/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--ink)]" />
                  </div>
                  <span className="text-sm text-[var(--ink)]">
                    {student?.lastName} {student?.firstName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stepper */}
        <TestStepper steps={steps} currentStep={currentStep} />

        {/* Test Content */}
        <div className="mt-6">
          {currentStep === 0 && (
            <SociometryTest
              classmates={classmates}
              answers={sociometryAnswers}
              onAnswersChange={setSociometryAnswers}
              onNext={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 1 && (
            <FiroTest
              answers={firoAnswers}
              onAnswersChange={setFiroAnswers}
              onBack={() => setCurrentStep(0)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>
    </AppShell>
  )
}
