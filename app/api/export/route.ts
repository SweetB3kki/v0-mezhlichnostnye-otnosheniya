import { type NextRequest, NextResponse } from "next/server"
import { getStudentsForClass, demoClasses } from "@/lib/demo-data"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const classId = searchParams.get("classId")
  const format = searchParams.get("format") || "csv"

  // Demo data - in production this would come from database
  let students: Array<{ id: string; firstName: string; lastName: string; classId?: string }> = []

  if (classId === "all") {
    demoClasses.forEach((cls) => {
      const classStudents = getStudentsForClass(cls.id).map((s) => ({
        ...s,
        classId: cls.id,
      }))
      students = [...students, ...classStudents]
    })
  } else if (classId) {
    students = getStudentsForClass(classId).map((s) => ({
      ...s,
      classId,
    }))
  }

  // Generate demo results
  const results = students.map((student) => ({
    studentId: student.id,
    firstName: student.firstName,
    lastName: student.lastName,
    classId: student.classId,
    sociometry: {
      status: ["Звезда", "Предпочитаемый", "Пренебрегаемый", "Изолированный"][Math.floor(Math.random() * 4)],
      choices: Math.floor(Math.random() * 8),
      mutual: Math.floor(Math.random() * 4),
    },
    firo: {
      Ie: Math.floor(Math.random() * 9),
      Iw: Math.floor(Math.random() * 9),
      Ce: Math.floor(Math.random() * 9),
      Cw: Math.floor(Math.random() * 9),
      Ae: Math.floor(Math.random() * 9),
      Aw: Math.floor(Math.random() * 9),
    },
  }))

  if (format === "json") {
    return NextResponse.json(results)
  }

  // CSV format
  const headers = [
    "studentId",
    "firstName",
    "lastName",
    "classId",
    "sociometry_status",
    "sociometry_choices",
    "sociometry_mutual",
    "Ie",
    "Iw",
    "Ce",
    "Cw",
    "Ae",
    "Aw",
  ]

  const csvRows = [
    headers.join(","),
    ...results.map((r) =>
      [
        r.studentId,
        r.firstName,
        r.lastName,
        r.classId,
        r.sociometry.status,
        r.sociometry.choices,
        r.sociometry.mutual,
        r.firo.Ie,
        r.firo.Iw,
        r.firo.Ce,
        r.firo.Cw,
        r.firo.Ae,
        r.firo.Aw,
      ].join(","),
    ),
  ]

  const csv = csvRows.join("\n")

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=results_${classId}.csv`,
    },
  })
}
