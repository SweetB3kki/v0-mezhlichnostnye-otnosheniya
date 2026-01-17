import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface FiroClassResultsProps {
  students: Array<{ id: string; firstName: string; lastName: string }>
  classId: string
}

export function FiroClassResults({ students }: FiroClassResultsProps) {
  // Demo data generator
  const getScores = () => ({
    Ie: Math.floor(Math.random() * 9),
    Iw: Math.floor(Math.random() * 9),
    Ce: Math.floor(Math.random() * 9),
    Cw: Math.floor(Math.random() * 9),
    Ae: Math.floor(Math.random() * 9),
    Aw: Math.floor(Math.random() * 9),
  })

  // Calculate averages (demo)
  const avgScores = {
    Ie: 4.5,
    Iw: 5.2,
    Ce: 3.8,
    Cw: 4.1,
    Ae: 5.0,
    Aw: 4.8,
  }

  return (
    <div className="space-y-6">
      {/* Group Profile */}
      <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-[var(--ink)] mb-4">Групповой профиль ОМО</h3>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[var(--ink)]">Включение (I)</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--ink-secondary)]">Ie (выраженное)</span>
                    <span className="text-[var(--ink)]">{avgScores.Ie}</span>
                  </div>
                  <Progress value={(avgScores.Ie / 9) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--ink-secondary)]">Iw (требуемое)</span>
                    <span className="text-[var(--ink)]">{avgScores.Iw}</span>
                  </div>
                  <Progress value={(avgScores.Iw / 9) * 100} className="h-2" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[var(--ink)]">Контроль (C)</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--ink-secondary)]">Ce (выраженный)</span>
                    <span className="text-[var(--ink)]">{avgScores.Ce}</span>
                  </div>
                  <Progress value={(avgScores.Ce / 9) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--ink-secondary)]">Cw (требуемый)</span>
                    <span className="text-[var(--ink)]">{avgScores.Cw}</span>
                  </div>
                  <Progress value={(avgScores.Cw / 9) * 100} className="h-2" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-[var(--ink)]">Аффект (A)</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--ink-secondary)]">Ae (выраженный)</span>
                    <span className="text-[var(--ink)]">{avgScores.Ae}</span>
                  </div>
                  <Progress value={(avgScores.Ae / 9) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--ink-secondary)]">Aw (требуемый)</span>
                    <span className="text-[var(--ink)]">{avgScores.Aw}</span>
                  </div>
                  <Progress value={(avgScores.Aw / 9) * 100} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Results Table */}
      <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[var(--cloud-bg)]">
                  <TableHead className="text-[var(--ink)]">Учащийся</TableHead>
                  <TableHead className="text-[var(--ink)] text-center">Ie</TableHead>
                  <TableHead className="text-[var(--ink)] text-center">Iw</TableHead>
                  <TableHead className="text-[var(--ink)] text-center">Ce</TableHead>
                  <TableHead className="text-[var(--ink)] text-center">Cw</TableHead>
                  <TableHead className="text-[var(--ink)] text-center">Ae</TableHead>
                  <TableHead className="text-[var(--ink)] text-center">Aw</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const scores = getScores()
                  return (
                    <TableRow key={student.id} className="hover:bg-[var(--cloud-bg)]/50">
                      <TableCell className="font-medium text-[var(--ink)]">
                        {student.lastName} {student.firstName}
                      </TableCell>
                      <TableCell className="text-center text-[var(--ink-secondary)]">{scores.Ie}</TableCell>
                      <TableCell className="text-center text-[var(--ink-secondary)]">{scores.Iw}</TableCell>
                      <TableCell className="text-center text-[var(--ink-secondary)]">{scores.Ce}</TableCell>
                      <TableCell className="text-center text-[var(--ink-secondary)]">{scores.Cw}</TableCell>
                      <TableCell className="text-center text-[var(--ink-secondary)]">{scores.Ae}</TableCell>
                      <TableCell className="text-center text-[var(--ink-secondary)]">{scores.Aw}</TableCell>
                      <TableCell>
                        <Link
                          href={`/student/${student.id}/results`}
                          className="text-sm text-[var(--cloud-purple)] hover:underline"
                        >
                          Подробнее
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
