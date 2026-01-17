"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, FileText } from "lucide-react"

export default function ConsentPage() {
  const router = useRouter()
  const [agreed, setAgreed] = useState(false)
  const [name, setName] = useState("")

  const handleContinue = () => {
    if (agreed) {
      if (name) {
        localStorage.setItem("participant_name", name)
      }
      router.push("/instructions")
    }
  }

  return (
    <AppShell>
      <div className="max-w-[700px] mx-auto px-6 py-12">
        <PageTitle title="Согласие на участие" subtitle="Перед началом тестирования ознакомьтесь с условиями участия" />

        <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[var(--cloud-purple)]/10">
                <h3 className="font-medium text-[var(--ink)] mb-2">Информация об исследовании</h3>
                <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
                  Данное исследование направлено на изучение межличностных отношений в классном коллективе. Участие
                  добровольное, все данные конфиденциальны и используются исключительно в научных целях. Вы можете
                  прекратить участие в любой момент.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[var(--ink)]">
                    ФИО или инициалы (необязательно)
                  </Label>
                  <Input
                    id="name"
                    placeholder="Например: Иванов И.И."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl border-[var(--border)] focus:border-[var(--cloud-purple)] focus:ring-[var(--cloud-purple)]"
                  />
                </div>

                <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--cloud-bg)]">
                  <Checkbox
                    id="consent"
                    checked={agreed}
                    onCheckedChange={(checked) => setAgreed(checked === true)}
                    className="mt-0.5 border-[var(--ink-secondary)] data-[state=checked]:bg-[var(--cloud-purple)] data-[state=checked]:border-[var(--cloud-purple)]"
                  />
                  <Label
                    htmlFor="consent"
                    className="text-sm text-[var(--ink-secondary)] leading-relaxed cursor-pointer"
                  >
                    Я даю согласие на участие в исследовании и обработку персональных данных в соответствии с{" "}
                    <Link href="/privacy" className="text-[var(--ink)] underline underline-offset-2">
                      политикой конфиденциальности
                    </Link>
                  </Label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={handleContinue}
                  disabled={!agreed}
                  className="gradient-btn text-[var(--ink)] font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                >
                  Продолжить
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Link href="/privacy" className="sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-[var(--border)] text-[var(--ink-secondary)] bg-transparent"
                  >
                    <FileText className="w-4 h-4 mr-2" />
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
