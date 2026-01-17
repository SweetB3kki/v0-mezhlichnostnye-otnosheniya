import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Play } from "lucide-react"

interface StudentCardProps {
  student: {
    id: string
    firstName: string
    lastName: string
  }
  classId: string
}

export function StudentCard({ student, classId }: StudentCardProps) {
  return (
    <Card className="cloud-shadow border-0 bg-white/90 backdrop-blur-sm hover:bg-white transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--cloud-purple)]/20 flex items-center justify-center">
            <User className="w-5 h-5 text-[var(--ink)]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[var(--ink)] text-sm truncate">{student.lastName}</p>
            <p className="text-xs text-[var(--ink-secondary)] truncate">{student.firstName}</p>
          </div>
        </div>

        <Link href={`/class/${classId}/student/${student.id}/test`}>
          <Button size="sm" className="w-full gradient-btn text-[var(--ink)] rounded-lg text-xs">
            <Play className="w-3 h-3 mr-1" />
            Пройти тест
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
