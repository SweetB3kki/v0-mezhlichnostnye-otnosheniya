"use client"

interface SociogramPreviewProps {
  students: Array<{ id: string; firstName: string; lastName: string }>
  classId: string
}

export function SociogramPreview({ students }: SociogramPreviewProps) {
  // Demo data - in production this would come from actual test results
  const centerX = 200
  const centerY = 200
  const rings = [60, 100, 140, 180]

  // Distribute students across rings based on demo statuses
  const getStudentPosition = (index: number, total: number, ring: number) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2
    const radius = rings[ring]
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    }
  }

  // Demo distribution
  const stars = students.slice(0, 2)
  const preferred = students.slice(2, 10)
  const neglected = students.slice(10, 17)
  const isolated = students.slice(17, 20)

  return (
    <div className="aspect-square w-full max-w-[400px] mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        {/* Background circles */}
        {rings.map((r, i) => (
          <circle
            key={i}
            cx={centerX}
            cy={centerY}
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth="1"
            strokeDasharray={i === 3 ? "4 4" : "0"}
          />
        ))}

        {/* Zone labels */}
        <text x={centerX} y={30} textAnchor="middle" className="text-[10px] fill-[var(--ink-secondary)]">
          I - Звёзды
        </text>
        <text x={centerX} y={50} textAnchor="middle" className="text-[10px] fill-[var(--ink-secondary)]">
          II - Предпочитаемые
        </text>
        <text x={centerX} y={70} textAnchor="middle" className="text-[10px] fill-[var(--ink-secondary)]">
          III - Пренебрегаемые
        </text>
        <text x={centerX} y={90} textAnchor="middle" className="text-[10px] fill-[var(--ink-secondary)]">
          IV - Изолированные
        </text>

        {/* Stars (ring 0) */}
        {stars.map((student, i) => {
          const pos = getStudentPosition(i, stars.length, 0)
          return (
            <g key={student.id}>
              <circle cx={pos.x} cy={pos.y} r="12" fill="var(--cloud-purple)" className="drop-shadow-sm" />
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" className="text-[8px] fill-[var(--ink)] font-medium">
                {student.lastName.slice(0, 3)}
              </text>
            </g>
          )
        })}

        {/* Preferred (ring 1) */}
        {preferred.map((student, i) => {
          const pos = getStudentPosition(i, preferred.length, 1)
          return (
            <g key={student.id}>
              <circle cx={pos.x} cy={pos.y} r="10" fill="var(--cloud-pink)" className="drop-shadow-sm" />
              <text x={pos.x} y={pos.y + 3} textAnchor="middle" className="text-[7px] fill-[var(--ink)]">
                {student.lastName.slice(0, 3)}
              </text>
            </g>
          )
        })}

        {/* Neglected (ring 2) */}
        {neglected.map((student, i) => {
          const pos = getStudentPosition(i, neglected.length, 2)
          return (
            <g key={student.id}>
              <circle cx={pos.x} cy={pos.y} r="8" fill="var(--cloud-bg)" stroke="var(--border)" strokeWidth="1" />
              <text x={pos.x} y={pos.y + 3} textAnchor="middle" className="text-[6px] fill-[var(--ink-secondary)]">
                {student.lastName.slice(0, 3)}
              </text>
            </g>
          )
        })}

        {/* Isolated (ring 3) */}
        {isolated.map((student, i) => {
          const pos = getStudentPosition(i, isolated.length, 3)
          return (
            <g key={student.id}>
              <circle cx={pos.x} cy={pos.y} r="6" fill="#E5E5E5" stroke="var(--border)" strokeWidth="1" />
              <text x={pos.x} y={pos.y + 2} textAnchor="middle" className="text-[5px] fill-[var(--ink-secondary)]">
                {student.lastName.slice(0, 2)}
              </text>
            </g>
          )
        })}

        {/* Demo connections */}
        <line
          x1={getStudentPosition(0, stars.length, 0).x}
          y1={getStudentPosition(0, stars.length, 0).y}
          x2={getStudentPosition(0, preferred.length, 1).x}
          y2={getStudentPosition(0, preferred.length, 1).y}
          stroke="var(--cloud-purple)"
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1={getStudentPosition(1, stars.length, 0).x}
          y1={getStudentPosition(1, stars.length, 0).y}
          x2={getStudentPosition(2, preferred.length, 1).x}
          y2={getStudentPosition(2, preferred.length, 1).y}
          stroke="var(--cloud-purple)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
    </div>
  )
}
