import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSociometryMetrics } from "@/lib/sociometry";
import type { StudentResultsApiResponse } from "@/lib/results-types";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type RouteContext = {
  params: { studentId: string } | Promise<{ studentId: string }>;
};

export async function GET(req: NextRequest, ctx: RouteContext) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await Promise.resolve(ctx.params);

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      classId: true,
      class: {
        select: {
          id: true,
          name: true,
          students: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
      sessions: {
        orderBy: { submittedAt: "desc" },
        take: 1,
        select: {
          id: true,
          submittedAt: true,
          meta: true,
          responses: {
            select: {
              kind: true,
              questionKey: true,
              answer: true,
            },
          },
        },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const lastSession = student.sessions[0] ?? null;
  const classmates = student.class?.students ?? [];
  const classmateById = new Map(classmates.map((s) => [s.id, s]));

  let sociometryInDegree = 0;
  let sociometryOutDegree = 0;
  let sociometryMutual = 0;
  let sociometryStatus: StudentResultsApiResponse["sociometry"]["status"] = "ISOLATED";

  if (student.classId) {
    const classStudents = await prisma.student.findMany({
      where: { classId: student.classId },
      select: {
        id: true,
        sessions: {
          orderBy: { submittedAt: "desc" },
          take: 1,
          select: {
            responses: {
              where: { kind: "SOCIOMETRY" },
              select: { answer: true },
            },
          },
        },
      },
    });

    const studentIds = classStudents.map((s) => s.id);
    const answersByStudent: Record<string, unknown[]> = {};

    for (const classStudent of classStudents) {
      const responses = classStudent.sessions[0]?.responses ?? [];
      const raw: unknown[] = [];
      for (const response of responses) {
        if (Array.isArray(response.answer)) {
          raw.push(...response.answer);
        }
      }
      answersByStudent[classStudent.id] = raw;
    }

    const metrics = calculateSociometryMetrics({ studentIds, answersByStudent });
    sociometryInDegree = metrics.inDegree[studentId] ?? 0;
    sociometryOutDegree = metrics.outDegree[studentId] ?? 0;
    sociometryMutual = metrics.mutualChoicesByStudent[studentId] ?? 0;
    sociometryStatus = metrics.statusByStudent[studentId] ?? "ISOLATED";
  }

  const sociometryAnswers: StudentResultsApiResponse["sociometry"]["answers"] = (lastSession?.responses ?? [])
    .filter((response) => response.kind === "SOCIOMETRY")
    .map((response) => {
      const selectedIds = Array.isArray(response.answer) ? response.answer.map((x) => String(x)) : [];
      const selectedStudents = selectedIds
        .map((id) => classmateById.get(id))
        .filter((x): x is { id: string; firstName: string; lastName: string } => Boolean(x))
        .map((x) => ({ id: x.id, firstName: x.firstName, lastName: x.lastName }));
      return {
        questionKey: response.questionKey,
        selectedStudents,
      };
    })
    .sort((a, b) => a.questionKey.localeCompare(b.questionKey));

  const firoResponses = (lastSession?.responses ?? [])
    .filter((response) => response.kind === "FIRO")
    .map((response) => {
      const num = typeof response.answer === "number" ? response.answer : Number(response.answer);
      return {
        questionKey: response.questionKey,
        value: Number.isFinite(num) ? num : 0,
      };
    })
    .sort((a, b) => a.questionKey.localeCompare(b.questionKey));

  const firoSum = firoResponses.reduce((sum, item) => sum + item.value, 0);
  const firoCount = firoResponses.length;
  const firoAvg = firoCount === 0 ? 0 : firoSum / firoCount;

  const payload: StudentResultsApiResponse = {
    student: {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      classId: student.classId ?? null,
      className: student.class?.name ?? null,
    },
    session: lastSession
      ? {
          id: lastSession.id,
          submittedAt: lastSession.submittedAt.toISOString(),
          meta: (lastSession.meta as Record<string, unknown> | null) ?? null,
        }
      : null,
    sociometry: {
      answers: sociometryAnswers,
      inDegree: sociometryInDegree,
      outDegree: sociometryOutDegree,
      mutualChoices: sociometryMutual,
      status: sociometryStatus,
    },
    firo: {
      responses: firoResponses,
      sum: firoSum,
      avg: firoAvg,
      count: firoCount,
    },
  };

  return NextResponse.json(payload);
}
