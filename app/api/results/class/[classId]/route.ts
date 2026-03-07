import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSociometryMetrics } from "@/lib/sociometry";
import type { ClassResultsApiResponse } from "@/lib/results-types";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type RouteContext = {
  params: { classId: string } | Promise<{ classId: string }>;
};

export async function GET(req: NextRequest, ctx: RouteContext) {
  if (!isAdminAuthenticated(req.cookies)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { classId } = await Promise.resolve(ctx.params);

  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: {
      id: true,
      name: true,
      teacher: true,
      students: {
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        select: {
          id: true,
          firstName: true,
          lastName: true,
          sessions: {
            orderBy: { submittedAt: "desc" },
            take: 1,
            select: {
              id: true,
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
      },
    },
  });

  if (!cls) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const studentIds = cls.students.map((student) => student.id);
  const answersByStudent: Record<string, unknown[]> = {};

  for (const student of cls.students) {
    const latest = student.sessions[0] ?? null;
    const sociometryAnswers: unknown[] = [];
    if (latest) {
      for (const response of latest.responses) {
        if (response.kind !== "SOCIOMETRY") continue;
        if (!Array.isArray(response.answer)) continue;
        sociometryAnswers.push(...response.answer);
      }
    }
    answersByStudent[student.id] = sociometryAnswers;
  }

  const sociometry = calculateSociometryMetrics({
    studentIds,
    answersByStudent,
  });

  const students: ClassResultsApiResponse["students"] = cls.students.map((student) => {
    const latest = student.sessions[0] ?? null;
    const responses = latest?.responses ?? [];
    let sociometryResponseCount = 0;
    let firoCount = 0;
    let firoSum = 0;
    for (const response of responses) {
      if (response.kind === "SOCIOMETRY") {
        sociometryResponseCount += 1;
        continue;
      }
      if (response.kind === "FIRO") {
        firoCount += 1;
        const num = typeof response.answer === "number" ? response.answer : Number(response.answer);
        if (Number.isFinite(num)) firoSum += num;
      }
    }

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      submittedAt: latest ? latest.submittedAt.toISOString() : null,
      sociometryResponseCount,
      firoResponseCount: firoCount,
      inDegree: sociometry.inDegree[student.id] ?? 0,
      outDegree: sociometry.outDegree[student.id] ?? 0,
      mutualChoices: sociometry.mutualChoicesByStudent[student.id] ?? 0,
      status: sociometry.statusByStudent[student.id],
      firoSum,
      firoAvg: firoCount === 0 ? 0 : firoSum / firoCount,
      firoCount,
    };
  });

  const payload: ClassResultsApiResponse = {
    class: {
      id: cls.id,
      name: cls.name,
      teacher: cls.teacher ?? null,
      studentCount: cls.students.length,
    },
    students,
    sociometry: {
      totalChoices: sociometry.totalChoices,
      mutualChoices: sociometry.mutualChoices,
      cohesion: sociometry.cohesion,
      statusCounts: sociometry.statusCounts,
      mutualPairs: sociometry.mutualPairs,
      edges: sociometry.directedEdges,
    },
  };

  return NextResponse.json(payload);
}
