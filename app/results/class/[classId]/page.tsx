import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { PageTitle } from "@/components/page-title"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SociogramPreview } from "@/components/sociogram-preview"
import { FiroClassResults } from "@/components/firo-class-results"
import { SociometryTable } from "@/components/sociometry-table"
import { getClassById, getStudentsForClass } from "@/lib/demo-data"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ classId: string }>
}

export default async function ClassResultsPage({ params }: Props) {
  const { classId } = await params
  const classData = getClassById(classId)
  const students = getStudentsForClass(classId)

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <Link href="/results">
          <Button variant="ghost" className="mb-4 text-[var(--ink-secondary)] hover:text-[var(--ink)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Все результаты
          </Button>
        </Link>

        <PageTitle
          title={`Результаты класса ${classData?.name || classId.toUpperCase()}`}
          subtitle={`${students.length} учащихся`}
        />

        <Tabs defaultValue="sociometry" className="space-y-6">
          <TabsList className="bg-[var(--cloud-bg)] p-1 rounded-xl">
            <TabsTrigger
              value="sociometry"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Социометрия
            </TabsTrigger>
            <TabsTrigger value="firo" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
              ОМО/FIRO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sociometry" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[var(--ink)] mb-4">Социограмма</h3>
                  <SociogramPreview students={students} classId={classId} />
                </CardContent>
              </Card>

              <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-[var(--ink)] mb-4">Статусы учащихся</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[var(--cloud-purple)]/10">
                      <div className="text-2xl font-semibold text-[var(--ink)]">2</div>
                      <div className="text-xs text-[var(--ink-secondary)]">Звёзды</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cloud-pink)]/20">
                      <div className="text-2xl font-semibold text-[var(--ink)]">8</div>
                      <div className="text-xs text-[var(--ink-secondary)]">Предпочитаемые</div>
                    </div>
                    <div className="p-4 rounded-xl bg-[var(--cloud-bg)]">
                      <div className="text-2xl font-semibold text-[var(--ink)]">7</div>
                      <div className="text-xs text-[var(--ink-secondary)]">Пренебрегаемые</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-100">
                      <div className="text-2xl font-semibold text-[var(--ink)]">3</div>
                      <div className="text-xs text-[var(--ink-secondary)]">Изолированные</div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl bg-[var(--cloud-purple)]/10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--ink-secondary)]">Индекс сплочённости</span>
                      <span className="text-lg font-semibold text-[var(--ink)]">0.65</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <SociometryTable students={students} classId={classId} />
          </TabsContent>

          <TabsContent value="firo">
            <FiroClassResults students={students} classId={classId} />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
