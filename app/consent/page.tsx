"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, FileText } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function ConsentPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)

  const handleContinue = () => {
    if (agreed) {
      router.push("/instructions")
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-[700px] px-6 py-12">
        <PageTitle
          title="Согласие на участие"
          subtitle="Перед началом тестирования ознакомьтесь с условиями участия"
        />

        <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="rounded-2xl bg-[var(--cloud-purple)]/10 p-4">
                <h3 className="mb-2 font-medium text-[var(--ink)]">Информация об исследовании</h3>
                <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
                  Данное исследование направлено на изучение межличностных отношений в классном
                  коллективе. Участие добровольное, все данные конфиденциальны и используются
                  исключительно в научных целях. Вы можете прекратить участие в любой момент.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl bg-[var(--cloud-bg)] p-4">
                  <Checkbox
                    id="consent"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                    className="mt-0.5 border-[var(--ink-secondary)] data-[state=checked]:border-[var(--cloud-purple)] data-[state=checked]:bg-[var(--cloud-purple)]"
                  />
                  <Label
                    htmlFor="consent"
                    className="cursor-pointer text-sm leading-relaxed text-[var(--ink-secondary)]"
                  >
                    Я даю согласие на участие в исследовании и обработку персональных данных в
                    соответствии с{" "}
                    <Link href="/privacy" className="text-[var(--ink)] underline underline-offset-2">
                      политикой конфиденциальности
                    </Link>
                  </Label>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  onClick={handleContinue}
                  disabled={!agreed}
                  className="gradient-btn flex-1 rounded-xl font-medium text-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Продолжить
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Link href="/privacy" className="sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-[var(--border)] bg-transparent text-[var(--ink-secondary)]"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Политика конфиденциальности
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
