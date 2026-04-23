"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { TestStepper } from "@/components/test-stepper"
import { SociometryTest } from "@/components/sociometry-test"
import { FiroTest } from "@/components/firo-test"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { submitTest } from "@/lib/api"
import { ArrowLeft, User, Users } from "lucide-react"
import Link from "next/link"

type ApiClass = { id: string; name: string; teacher?: string | null }
type ApiStudent = { id: string; firstName: string; lastName: string; classId?: string | null; hasCompleted?: boolean }
type ParticipantsWithClassPayload = { class: ApiClass; students: ApiStudent[] }
type AuthPayload = { authenticated?: boolean }

export default function TestPage() {
  const routeParams = useParams<{ classId: string; studentId: string }>()
  const classId = Array.isArray(routeParams.classId) ? routeParams.classId[0] : routeParams.classId
  const studentId = Array.isArray(routeParams.studentId) ? routeParams.studentId[0] : routeParams.studentId
  const router = useRouter()

  const [classData, setClassData] = useState<ApiClass | null>(null)
  const [student, setStudent] = useState<ApiStudent | null>(null)
  const [classmates, setClassmates] = useState<Array<{ id: string; firstName: string; lastName: string }>>([])
  const [isAdminUser, setIsAdminUser] = useState(false)
  const [alreadyCompleted, setAlreadyCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [sociometryAnswers, setSociometryAnswers] = useState<Record<string, string[]>>({})
  const [firoAnswers, setFiroAnswers] = useState<Record<string, number>>({})
  const [startTime] = useState(new Date().toISOString())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load class + students from API (DB)
  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setLoadError(null)

      try {
        const [contextRes, authRes] = await Promise.all([
          fetch(`/api/groups/${classId}/participants?withClass=1`, { cache: "no-store" }),
          fetch("/api/admin/auth", { cache: "no-store" }),
        ])

        if (!contextRes.ok) throw new Error(`Failed to load test context (HTTP ${contextRes.status})`)
        if (!authRes.ok) throw new Error(`Failed to check auth (HTTP ${authRes.status})`)

        const payload = (await contextRes.json()) as ParticipantsWithClassPayload
        const authPayload = (await authRes.json()) as AuthPayload
        const adminAuthenticated = Boolean(authPayload.authenticated)
        if (!payload || !payload.class || !Array.isArray(payload.students)) {
          throw new Error("Invalid test context response")
        }
        const students = payload.students
        const c = payload.class
        const s = students.find((x) => x.id === studentId) ?? null

        if (!s) throw new Error("Student not found in DB")

        if (cancelled) return

        setClassData(c)
        setStudent(s)
        setIsAdminUser(adminAuthenticated)
        setAlreadyCompleted(Boolean(s.hasCompleted) && !adminAuthenticated)
        setClassmates(
          students
            .filter((x) => x.id !== studentId)
            .map((x) => ({ id: x.id, firstName: x.firstName, lastName: x.lastName }))
        )
      } catch (e) {
        if (cancelled) return
        setLoadError(e instanceof Error ? e.message : "Load error")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [classId, studentId])

  // Load saved progress
  useEffect(() => {
    const storageKey = `test_progress_${classId}_${studentId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        if (data.sociometryAnswers) setSociometryAnswers(data.sociometryAnswers)
        if (data.firoAnswers) setFiroAnswers(data.firoAnswers)
        if (typeof data.currentStep === "number") setCurrentStep(data.currentStep)
      } catch {}
    }
  }, [classId, studentId])

  // Save progress
  useEffect(() => {
    const storageKey = `test_progress_${classId}_${studentId}`
    localStorage.setItem(
      storageKey,
      JSON.stringify({ sociometryAnswers, firoAnswers, currentStep })
    )
  }, [sociometryAnswers, firoAnswers, currentStep, classId, studentId])

  // Ensure each step starts from the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [currentStep])

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const endTime = new Date()
    const startDate = new Date(startTime)
    const durationSeconds = Math.floor((endTime.getTime() - startDate.getTime()) / 1000)

    const payload = {
      studentId,
      classId,
      type: "COMBINED" as const,
      meta: { durationSeconds, startedAt: startTime },
      responses: [
        ...Object.entries(sociometryAnswers).map(([key, answer]) => ({
          kind: "SOCIOMETRY" as const,
          key,
          answer,
        })),
        ...Object.entries(firoAnswers).map(([key, answer]) => ({
          kind: "FIRO" as const,
          key,
          answer,
        })),
      ],
    }

    const result = await submitTest(payload)

    if (result.success) {
      localStorage.removeItem(`test_progress_${classId}_${studentId}`)
      router.push(`/test/complete?classId=${classId}&studentId=${studentId}`)
    } else {
      if (result.error === "Test already submitted") {
        setAlreadyCompleted(true)
      }
      setIsSubmitting(false)
      alert(result.error || "Ошибка при отправке. Попробуйте ещё раз.")
    }
  }

  const steps = [
    { id: "sociometry", label: "Социометрия" },
    { id: "firo", label: "ОМО/FIRO" },
  ]

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-[900px] mx-auto px-6 py-12 text-[var(--ink-secondary)]">Загрузка…</div>
      </AppShell>
    )
  }

  if (loadError || !classData || !student) {
    return (
      <AppShell>
        <div className="max-w-[900px] mx-auto px-6 py-12">
          <div className="text-[var(--ink)] font-semibold mb-2">Ошибка загрузки данных</div>
          <div className="text-[var(--ink-secondary)] mb-6">{loadError || "Unknown error"}</div>
          <Link href={`/class/${classId}`}>
            <Button variant="outline">Назад</Button>
          </Link>
        </div>
      </AppShell>
    )
  }

  if (alreadyCompleted && !isAdminUser) {
    return (
      <AppShell>
        <div className="max-w-[900px] mx-auto px-6 py-12">
          <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 space-y-3">
              <div className="text-[var(--ink)] font-semibold">Тест уже пройден</div>
              <div className="text-[var(--ink-secondary)]">
                Повторное прохождение для этого ученика заблокировано, чтобы сохранить корректность результатов.
              </div>
              <Link href={`/class/${classId}`}>
                <Button variant="outline" className="rounded-xl border-[var(--border)] bg-transparent mt-2">
                  Вернуться к классу
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-[900px] mx-auto px-6 py-8">
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
                  <span className="text-sm text-[var(--ink)]">Класс {classData.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--cloud-pink)]/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-[var(--ink)]" />
                  </div>
                  <span className="text-sm text-[var(--ink)]">
                    {student.lastName} {student.firstName}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <TestStepper steps={steps} currentStep={currentStep} />

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
