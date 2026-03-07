import { NextResponse } from "next/server";
import { Prisma, ResponseKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type IncomingResponse = {
  kind: ResponseKind;
  key: string;
  answer: unknown;
};

type IncomingPayload = {
  classId?: string;
  studentId: string;
  type?: string;
  meta?: Record<string, unknown>;
  responses: IncomingResponse[];
};

function extractStartedAt(meta: IncomingPayload["meta"]): string | null {
  if (!meta || typeof meta !== "object") return null;
  const startedAt = meta.startedAt;
  return typeof startedAt === "string" && startedAt.trim().length > 0 ? startedAt : null;
}

function normalizeResponse(response: IncomingResponse): {
  kind: ResponseKind;
  questionKey: string;
  answer: Prisma.InputJsonValue;
} {
  if (!response.key || typeof response.key !== "string") {
    throw new Error("Invalid question key");
  }

  if (response.kind === "SOCIOMETRY") {
    if (!Array.isArray(response.answer)) {
      throw new Error(`Invalid SOCIOMETRY answer for ${response.key}`);
    }
    return {
      kind: "SOCIOMETRY",
      questionKey: response.key,
      answer: response.answer.map((value) => String(value)),
    };
  }

  if (response.kind === "FIRO") {
    const value = typeof response.answer === "number" ? response.answer : Number(response.answer);
    if (!Number.isFinite(value) || value < 1 || value > 6) {
      throw new Error(`Invalid FIRO answer for ${response.key}`);
    }
    return {
      kind: "FIRO",
      questionKey: response.key,
      answer: value,
    };
  }

  throw new Error(`Invalid response kind for ${response.key}`);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingPayload;

    if (!body?.studentId || !Array.isArray(body.responses)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (body.responses.length > 200) {
      return NextResponse.json({ error: "Too many responses" }, { status: 400 });
    }

    const [student, cls] = await Promise.all([
      prisma.student.findUnique({
        where: { id: body.studentId },
        select: { id: true, classId: true },
      }),
      body.classId
        ? prisma.class.findUnique({
            where: { id: body.classId },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    if (body.classId && !cls) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }
    if (body.classId && student.classId && student.classId !== body.classId) {
      return NextResponse.json(
        { error: "Student does not belong to provided class" },
        { status: 400 },
      );
    }

    const normalizedResponses = body.responses.map(normalizeResponse);
    const startedAt = extractStartedAt(body.meta);

    const sessionId = await prisma.$transaction(
      async (tx) => {
        if (startedAt) {
          const existing = await tx.testSession.findFirst({
            where: {
              studentId: body.studentId,
              meta: {
                path: ["startedAt"],
                equals: startedAt,
              },
            },
            orderBy: { submittedAt: "desc" },
            select: { id: true },
          });

          if (existing) {
            return existing.id;
          }
        }

        const session = await tx.testSession.create({
          data: {
            studentId: body.studentId,
            classId: body.classId ?? student.classId ?? null,
            meta: body.meta && typeof body.meta === "object" ? (body.meta as Prisma.InputJsonValue) : undefined,
          },
          select: { id: true },
        });

        if (normalizedResponses.length > 0) {
          await tx.response.createMany({
            data: normalizedResponses.map((response) => ({
              sessionId: session.id,
              kind: response.kind,
              questionKey: response.questionKey,
              answer: response.answer,
            })),
          });
        }

        return session.id;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );

    return NextResponse.json({ ok: true, sessionId });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.startsWith("Invalid") ? 400 : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
