import { type NextRequest, NextResponse } from "next/server";
import { Prisma, ResponseKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

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

const SUBMIT_RETRY_DELAYS_MS = [120, 240, 480];

function extractStartedAt(meta: unknown): string | null {
  if (!meta || typeof meta !== "object") return null;
  const startedAt = (meta as { startedAt?: unknown }).startedAt;
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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableTransactionError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2034"
  ) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("write conflict") ||
    message.includes("deadlock") ||
    message.includes("Unable to start a transaction")
  );
}

async function submitWithRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= SUBMIT_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableTransactionError(error) || attempt === SUBMIT_RETRY_DELAYS_MS.length) {
        throw error;
      }
      await sleep(SUBMIT_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = isAdminAuthenticated(req.cookies);
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

    if (startedAt) {
      const sameAttempt = await prisma.testSession.findFirst({
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
      if (sameAttempt) {
        return NextResponse.json({ ok: true, sessionId: sameAttempt.id });
      }
    }

    if (!isAdmin) {
      const existingSubmission = await prisma.testSession.findFirst({
        where: { studentId: body.studentId },
        select: { id: true },
      });
      if (existingSubmission) {
        return NextResponse.json({ error: "Test already submitted" }, { status: 409 });
      }
    }

    const sessionId = await submitWithRetry(async () =>
      prisma.$transaction(async (tx) => {
        const session = await tx.testSession.create({
          data: {
            studentId: body.studentId,
            classId: body.classId ?? student.classId ?? null,
            meta:
              body.meta && typeof body.meta === "object"
                ? (body.meta as Prisma.InputJsonValue)
                : undefined,
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
      }),
    );

    return NextResponse.json({ ok: true, sessionId });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Internal server error";
    const status =
      message === "Test already submitted" ? 409 : message.startsWith("Invalid") ? 400 : 500;
    return NextResponse.json(
      { error: message },
      { status },
    );
  }
}
