import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateSociometryMetrics } from "@/lib/sociometry";
import { calculateFiroProfile, FIRO_SCALE_ORDER } from "@/lib/firo";
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
                  questionKey: true,
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
    const firoResponses: Array<{ questionKey: string; value: number }> = [];
    for (const response of responses) {
      if (response.kind === "SOCIOMETRY") {
        sociometryResponseCount += 1;
        continue;
      }
      if (response.kind === "FIRO") {
        const num = typeof response.answer === "number" ? response.answer : Number(response.answer);
        if (Number.isFinite(num)) {
          firoResponses.push({
            questionKey: response.questionKey,
            value: num,
          });
        }
      }
    }
    const firoProfile = calculateFiroProfile(firoResponses);

    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      submittedAt: latest ? latest.submittedAt.toISOString() : null,
      sociometryResponseCount,
      firoResponseCount: firoProfile.count,
      inDegree: sociometry.inDegree[student.id] ?? 0,
      outDegree: sociometry.outDegree[student.id] ?? 0,
      mutualChoices: sociometry.mutualChoicesByStudent[student.id] ?? 0,
      status: sociometry.statusByStudent[student.id],
      firoSum: firoProfile.sum,
      firoAvg: firoProfile.avg,
      firoCount: firoProfile.count,
      firoScales: {
        Ie: { score: firoProfile.scales.Ie.score, level: firoProfile.scales.Ie.level },
        Iw: { score: firoProfile.scales.Iw.score, level: firoProfile.scales.Iw.level },
        Ce: { score: firoProfile.scales.Ce.score, level: firoProfile.scales.Ce.level },
        Cw: { score: firoProfile.scales.Cw.score, level: firoProfile.scales.Cw.level },
        Ae: { score: firoProfile.scales.Ae.score, level: firoProfile.scales.Ae.level },
        Aw: { score: firoProfile.scales.Aw.score, level: firoProfile.scales.Aw.level },
      },
    };
  });

  const respondentStudents = students.filter((student) => student.firoCount > 0);
  const respondentCount = respondentStudents.length;
  const scaleAverages = FIRO_SCALE_ORDER.reduce(
    (acc, scale) => {
      acc[scale] =
        respondentCount === 0
          ? 0
          : respondentStudents.reduce((sum, student) => sum + student.firoScales[scale].score, 0) /
            respondentCount;
      return acc;
    },
    {} as Record<(typeof FIRO_SCALE_ORDER)[number], number>,
  );

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
    firo: {
      respondentCount,
      scaleAverages,
    },
  };

  return NextResponse.json(payload);
}
