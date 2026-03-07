import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ExportRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  classId: string | null;
  className: string | null;
  submittedAt: string | null;
  sociometryResponses: number;
  firoResponses: number;
  firoSum: number;
  firoAvg: number;
};

function csvEscape(value: string | number | null): string {
  const text = value == null ? "" : String(value);
  if (!/[",\n]/.test(text)) return text;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const classId = searchParams.get("classId");
  const format = searchParams.get("format") ?? "csv";

  if (!classId) {
    return NextResponse.json({ error: "classId is required" }, { status: 400 });
  }

  const where = classId === "all" ? {} : { classId };
  const students = await prisma.student.findMany({
    where,
    orderBy: [{ classId: "asc" }, { lastName: "asc" }, { firstName: "asc" }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      classId: true,
      class: { select: { name: true } },
      sessions: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: {
          submittedAt: true,
          responses: {
            select: {
              kind: true,
              answer: true,
            },
          },
        },
      },
    },
  });

  const rows: ExportRow[] = students.map((student) => {
    const latestSession = student.sessions[0] ?? null;
    const responses = latestSession?.responses ?? [];
    const sociometryResponses = responses.filter((response) => response.kind === "SOCIOMETRY").length;
    const firoValues = responses
      .filter((response) => response.kind === "FIRO")
      .map((response) => {
        const value = typeof response.answer === "number" ? response.answer : Number(response.answer);
        return Number.isFinite(value) ? value : 0;
      });

    const firoSum = firoValues.reduce((sum, value) => sum + value, 0);
    const firoCount = firoValues.length;

    return {
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      classId: student.classId ?? null,
      className: student.class?.name ?? null,
      submittedAt: latestSession ? latestSession.submittedAt.toISOString() : null,
      sociometryResponses,
      firoResponses: firoCount,
      firoSum,
      firoAvg: firoCount === 0 ? 0 : firoSum / firoCount,
    };
  });

  if (format === "json") {
    return NextResponse.json(rows);
  }

  const headers = [
    "studentId",
    "firstName",
    "lastName",
    "classId",
    "className",
    "submittedAt",
    "sociometryResponses",
    "firoResponses",
    "firoSum",
    "firoAvg",
  ];

  const csvRows = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.studentId,
        row.firstName,
        row.lastName,
        row.classId,
        row.className,
        row.submittedAt,
        row.sociometryResponses,
        row.firoResponses,
        row.firoSum,
        row.firoAvg.toFixed(2),
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  const csv = csvRows.join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=results_${classId}.csv`,
    },
  });
}

