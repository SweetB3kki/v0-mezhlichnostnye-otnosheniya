import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface SociometryTableProps {
  students: Array<{ id: string; firstName: string; lastName: string }>
  classId: string
}

export function SociometryTable({ students, classId }: SociometryTableProps) {
  // Demo data - status assignment
  const getStatus = (index: number) => {
    if (index < 2)
      return { label: "Звезда", variant: "default" as const, color: "bg-[var(--cloud-purple)] text-[var(--ink)]" }
    if (index < 10)
      return {
        label: "Предпочитаемый",
        variant: "secondary" as const,
        color: "bg-[var(--cloud-pink)] text-[var(--ink)]",
      }
    if (index < 17)
      return {
        label: "Пренебрегаемый",
        variant: "outline" as const,
        color: "bg-[var(--cloud-bg)] text-[var(--ink-secondary)]",
      }
    return { label: "Изолированный", variant: "outline" as const, color: "bg-gray-100 text-[var(--ink-secondary)]" }
  }

  const getChoices = (index: number) => {
    if (index < 2) return Math.floor(Math.random() * 3) + 5
    if (index < 10) return Math.floor(Math.random() * 3) + 2
    if (index < 17) return Math.floor(Math.random() * 2) + 1
    return 0
  }

  return (
    <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[var(--cloud-bg)]">
                <TableHead className="text-[var(--ink)]">Учащийся</TableHead>
                <TableHead className="text-[var(--ink)] text-center">Получено выборов</TableHead>
                <TableHead className="text-[var(--ink)] text-center">Взаимных выборов</TableHead>
                <TableHead className="text-[var(--ink)]">Статус</TableHead>
                <TableHead className="text-[var(--ink)]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student, index) => {
                const status = getStatus(index)
                const choices = getChoices(index)
                const mutual = Math.max(0, Math.floor(choices * 0.4))

                return (
                  <TableRow key={student.id} className="hover:bg-[var(--cloud-bg)]/50">
                    <TableCell className="font-medium text-[var(--ink)]">
                      {student.lastName} {student.firstName}
                    </TableCell>
                    <TableCell className="text-center text-[var(--ink-secondary)]">{choices}</TableCell>
                    <TableCell className="text-center text-[var(--ink-secondary)]">{mutual}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
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
  )
}
